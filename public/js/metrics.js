// Các số liệu suy ra từ tiến độ - dùng chung cho trang chủ và trang thống kê.
import { state, getCard, today } from './store.js';
import { mastery, isLeech, DAY } from './srs.js';

export function overview(now = Date.now()) {
  const cards = state.data.cards;
  let due = 0, learning = 0, review = 0, fresh = 0, masteredCount = 0, sumMastery = 0;

  for (const q of state.questions) {
    const c = cards[q.id];
    if (!c || c.stage === 'new') { fresh++; continue; }
    if (c.stage === 'review') review++;
    else learning++;
    if (c.due <= now) due++;
    const m = mastery(c);
    sumMastery += m;
    if (m >= 0.7) masteredCount++;
  }

  const total = state.questions.length;
  const seen = total - fresh;
  const dayRec = state.data.days[today()] || { reviews: 0, correct: 0, seconds: 0, newCards: 0 };

  return {
    total, seen, fresh, due, learning, review,
    mastered: masteredCount,
    avgMastery: total ? sumMastery / total : 0,
    todayReviews: dayRec.reviews,
    todayCorrect: dayRec.correct,
    todaySeconds: dayRec.seconds,
    todayNew: dayRec.newCards,
    streak: state.data.streak.current || 0,
    bestStreak: state.data.streak.best || 0,
    accuracy7: accuracyOver(7),
    accuracyAll: accuracyOver(3650),
  };
}

/** Chỉ tính bài TỰ LUẬN: bài trắc nghiệm dễ hơn nhiều, trộn vào sẽ làm đẹp số ảo. */
export function accuracyOver(days) {
  const from = Date.now() - days * DAY;
  const rows = state.data.attempts.filter((a) => a.t >= from && (a.k || 'essay') === 'essay');
  if (!rows.length) return null;
  return rows.reduce((s, a) => s + a.s, 0) / rows.length / 100;
}

export function topicProgress() {
  return state.topics.map((t) => {
    const qs = state.questions.filter((q) => q.topic === t.id);
    let sum = 0, seen = 0, due = 0;
    const now = Date.now();
    for (const q of qs) {
      const c = state.data.cards[q.id];
      if (c && c.stage !== 'new') {
        seen++;
        if (c.due <= now) due++;
      }
      sum += mastery(c);
    }
    return { ...t, count: qs.length, seen, due, mastery: qs.length ? sum / qs.length : 0 };
  });
}

/** Câu hay quên: nhiều lần "again" hoặc điểm gần đây thấp. */
export function weakSpots(limit = 8) {
  const rows = [];
  for (const q of state.questions) {
    const c = state.data.cards[q.id];
    if (!c || c.stage === 'new') continue;
    const score = (c.lapses || 0) * 30 + (100 - (c.lastScore ?? 100)) * 0.7;
    if (score > 25) rows.push({ q, card: c, score, leech: isLeech(c) });
  }
  return rows.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Hiệu chỉnh nhận thức (metacognitive calibration):
 * so mức tự tin trước khi trả lời với điểm thực tế.
 * Chênh lệch dương = tự tin quá mức (ảo giác thông thạo) - dấu hiệu cần đổi cách học.
 */
export function calibration() {
  const rows = state.data.attempts.filter((a) => a.c != null);
  if (rows.length < 5) return null;
  const buckets = [
    { key: 1, label: 'Quên rồi', expect: 20, n: 0, sum: 0 },
    { key: 2, label: 'Mang máng', expect: 55, n: 0, sum: 0 },
    { key: 3, label: 'Chắc chắn', expect: 90, n: 0, sum: 0 },
  ];
  for (const a of rows) {
    const b = buckets.find((x) => x.key === a.c);
    if (b) { b.n++; b.sum += a.s; }
  }
  const used = buckets.filter((b) => b.n > 0);
  const gap = used.reduce((s, b) => s + (b.expect - b.sum / b.n) * b.n, 0) / rows.length;
  return { buckets: used, gap, n: rows.length };
}

export const cardOf = getCard;
