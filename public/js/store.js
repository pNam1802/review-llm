// Trạng thái học tập: nạp nội dung, lưu tiến độ (server + localStorage), gọi API.
import { newCard } from './srs.js';

const LS_KEY = 'onai.progress.v1';

export const state = {
  topics: [],
  questions: [],
  byId: new Map(),
  health: { hasKey: false, model: '', effort: '' },
  data: null,
};

const defaults = () => ({
  version: 1,
  createdAt: new Date().toISOString(),
  settings: {
    maxNew: 8,
    maxReview: 40,
    askConfidence: true,   // bước tự đoán trước khi trả lời (judgment of learning)
    useLLM: true,          // chấm bằng LLM nếu server có API key
    theme: 'auto',
    showTimer: true,
  },
  cards: {},               // id -> card
  days: {},                // 'YYYY-MM-DD' -> { reviews, correct, minutes, newCards }
  attempts: [],            // lịch sử làm bài (rút gọn), dùng cho thống kê & hiệu chỉnh
  streak: { current: 0, best: 0, last: null },
  pointStats: {},          // 'câu:ý' -> { h, p, m, last, t, d } - theo dõi từng Ý một
  drills: [],              // hàng đợi bài luyện: { qid, pid, stage, due, tries }
});

/* ------------------------------------------------------------------ nạp */
export async function boot() {
  const [content, health, saved] = await Promise.all([
    fetch('/api/content').then((r) => r.json()),
    fetch('/api/health').then((r) => r.json()).catch(() => ({ hasKey: false })),
    fetch('/api/state').then((r) => r.json()).catch(() => null),
  ]);

  state.topics = content.topics;
  state.questions = content.questions;
  state.byId = new Map(content.questions.map((q) => [q.id, q]));
  state.health = health;

  let data = saved && !saved.empty ? saved : null;
  if (!data) {
    try {
      const local = localStorage.getItem(LS_KEY);
      if (local) data = JSON.parse(local);
    } catch { /* bỏ qua */ }
  }
  state.data = migrate(data || defaults());
  return state;
}

function migrate(d) {
  const base = defaults();
  const out = { ...base, ...d };
  out.settings = { ...base.settings, ...(d.settings || {}) };
  out.cards = d.cards || {};
  out.days = d.days || {};
  out.attempts = d.attempts || [];
  out.streak = { ...base.streak, ...(d.streak || {}) };
  out.pointStats = d.pointStats || {};
  out.drills = d.drills || [];
  return out;
}

/* ------------------------------------------------------------------ lưu */
let saveTimer = null;
let pending = false;

export function save({ immediate = false } = {}) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(state.data));
  } catch { /* localStorage đầy hoặc bị chặn - vẫn còn bản trên server */ }

  pending = true;
  clearTimeout(saveTimer);
  const doSave = async () => {
    if (!pending) return;
    pending = false;
    try {
      await fetch('/api/state', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(state.data),
      });
    } catch { /* offline - localStorage đã giữ bản sao */ }
  };
  if (immediate) return doSave();
  saveTimer = setTimeout(doSave, 900);
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (!pending) return;
    try {
      navigator.sendBeacon('/api/state', new Blob([JSON.stringify(state.data)], { type: 'application/json' }));
    } catch { /* bỏ qua */ }
  });
}

/* ------------------------------------------------------------------ thẻ */
export const getCard = (id) => state.data.cards[id] || newCard(id);
export const setCard = (card) => {
  state.data.cards[card.id] = card;
};

export const today = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

export function logAttempt({ questionId, score, rating, seconds, confidence, isNew, offline }) {
  const key = today();
  const day = state.data.days[key] || { reviews: 0, correct: 0, seconds: 0, newCards: 0 };
  day.reviews += 1;
  if (score >= 70) day.correct += 1;
  day.seconds += Math.round(seconds || 0);
  if (isNew) day.newCards += 1;
  state.data.days[key] = day;

  state.data.attempts.push({
    t: Date.now(),
    q: questionId,
    s: score,
    r: rating,
    sec: Math.round(seconds || 0),
    c: confidence ?? null,
    o: offline ? 1 : 0,
  });
  if (state.data.attempts.length > 4000) state.data.attempts.splice(0, 1000);

  updateStreak(key);
}

function updateStreak(key) {
  const st = state.data.streak;
  if (st.last === key) return;
  const y = new Date(Date.now() - 86400000);
  st.current = st.last === today(y) ? st.current + 1 : 1;
  st.last = key;
  st.best = Math.max(st.best || 0, st.current);
}

/* ------------------------------------------------------------------ API */
export async function gradeAnswer(questionId, answer) {
  const res = await fetch('/api/grade', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ questionId, answer }),
  });
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.message || 'Lỗi chấm bài'), { code: body.code });
  return body;
}

export async function gradeDrillAnswer(questionId, pointId, mode, answer) {
  const res = await fetch('/api/drill-grade', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ questionId, pointId, mode, answer }),
  });
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.message || 'Lỗi chấm bài luyện'), { code: body.code });
  return body;
}

export async function askCoach(questionId, question, history) {
  const res = await fetch('/api/coach', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ questionId, question, history }),
  });
  const body = await res.json();
  if (!res.ok) throw Object.assign(new Error(body.message || 'Lỗi gọi trợ giảng'), { code: body.code });
  return body.answer;
}

export function exportData() {
  return JSON.stringify(state.data, null, 2);
}

export function importData(json) {
  const parsed = JSON.parse(json);
  state.data = migrate(parsed);
  return save({ immediate: true });
}

export function resetProgress() {
  state.data = defaults();
  return save({ immediate: true });
}
