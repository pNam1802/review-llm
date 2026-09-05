import { boot, state, save } from './store.js';
import { overview } from './metrics.js';
import { $, toast } from './ui.js';
import { renderHome } from './views/home.js';
import { renderStudy } from './views/study.js';
import { renderLibrary, renderQuestion } from './views/library.js';
import { renderStats } from './views/stats.js';
import { renderSettings } from './views/settings.js';
import { renderQuiz } from './views/quiz.js';
import { toggleNotes, paintNotes, wireNotes, isOpen } from './views/notes.js';

const NAV = [
  { id: 'home', icon: '🏠', label: 'Trang chủ' },
  { id: 'study', icon: '🎯', label: 'Ôn tập' },
  { id: 'quiz', icon: '🎲', label: 'Đổi món' },
  { id: 'library', icon: '📚', label: 'Thư viện' },
  { id: 'stats', icon: '📈', label: 'Tiến độ' },
  { id: 'settings', icon: '⚙️', label: 'Cài đặt' },
];

let route = 'home';
let routeArgs = {};

/* ------------------------------------------------------------- giao diện */
function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === 'auto') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', mode);
  state.data.settings.theme = mode;
}
function cycleTheme() {
  const order = ['auto', 'light', 'dark'];
  const next = order[(order.indexOf(state.data.settings.theme || 'auto') + 1) % order.length];
  applyTheme(next);
  save();
  toast({ auto: 'Giao diện: theo hệ thống', light: 'Giao diện: sáng', dark: 'Giao diện: tối' }[next], 1400);
}

/* --------------------------------------------------------------- router */
function go(name, args = {}) {
  route = name;
  routeArgs = args;
  const hash = name === 'question' ? `#question/${args.id}` : `#${name}`;
  if (location.hash !== hash) history.pushState({ name, args }, '', hash);
  render();
}

function fromHash() {
  const h = location.hash.replace(/^#/, '');
  if (!h) return { name: 'home', args: {} };
  const [name, arg] = h.split('/');
  if (name === 'question') return { name: 'question', args: { id: Number(arg) } };
  if (NAV.some((n) => n.id === name) || name === 'exam') return { name, args: {} };
  return { name: 'home', args: {} };
}

function render() {
  const main = $('#main');
  main.innerHTML = '';
  let view;
  switch (route) {
    case 'study': view = renderStudy(go, routeArgs); break;
    case 'exam': view = renderStudy(go, { ...routeArgs, mode: 'exam', count: routeArgs.count || 10 }); break;
    case 'quiz': view = renderQuiz(go, routeArgs); break;
    case 'question': view = renderQuestion(go, routeArgs); break;
    case 'library': view = renderLibrary(go, routeArgs); break;
    case 'stats': view = renderStats(go); break;
    case 'settings': view = renderSettings(go, applyTheme); break;
    default: view = renderHome(go);
  }
  // sổ tay cần biết đang xem câu nào để gắn ghi chú vào đúng chỗ
  if (route === 'question') state.ui.qid = Number(routeArgs.id) || null;
  else if (route !== 'study' && route !== 'quiz' && route !== 'exam') state.ui.qid = null;

  main.append(view);
  main.scrollTo?.(0, 0);
  window.scrollTo(0, 0);
  paintNav();
  paintNotes();
  document.title = `${{ home: 'Trang chủ', study: 'Ôn tập', exam: 'Thi thử', library: 'Thư viện', stats: 'Tiến độ', settings: 'Cài đặt', quiz: 'Đổi món', question: 'Câu ' + (routeArgs.id ?? '') }[route] || ''} · Ôn tập AI Engineering`;
}

function paintNav() {
  const o = overview();
  $('#navLinks').innerHTML = NAV.map((n) => {
    const active = n.id === route || (route === 'exam' && n.id === 'study') || (route === 'question' && n.id === 'library');
    const badge = n.id === 'study' && o.due > 0 ? `<span class="badge badge--accent">${o.due}</span>` : '';
    return `<button class="navlink" data-nav="${n.id}" ${active ? 'aria-current="page"' : ''}>
      <span class="ico">${n.icon}</span><span>${n.label}</span>${badge}</button>`;
  }).join('');

  $('#apiStatus').innerHTML = state.health.hasKey
    ? `<b>Chấm bài:</b> ${state.health.provider === 'openai' ? 'OpenAI' : 'Claude'}<br><span class="mono tiny">${state.health.model}</span>`
    : '<b>Chấm bài:</b> tự chấm<br>thêm API key trong .env để chấm theo ngữ nghĩa';
}

/* ----------------------------------------------------------------- khởi động */
(async function init() {
  try {
    await boot();
  } catch (err) {
    $('#main').innerHTML = `<div class="empty"><div class="empty__icon">⚠️</div>
      <h2>Không nạp được nội dung</h2><p class="dim">${err.message}</p>
      <p class="small muted">Hãy chắc chắn bạn đang mở qua server: <code>npm start</code> rồi vào http://localhost:5173</p></div>`;
    return;
  }

  applyTheme(state.data.settings.theme || 'auto');

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) go(nav.dataset.nav);
    if (e.target.closest('#themeBtn')) cycleTheme();
    if (e.target.closest('#notesBtn') || e.target.closest('#notesFab')) toggleNotes();
  });

  wireNotes(go);

  window.addEventListener('popstate', () => {
    const r = fromHash();
    route = r.name;
    routeArgs = r.args;
    render();
  });

  document.addEventListener('keydown', (e) => {
    const typing = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
    if (e.key === 't' && !typing && !e.ctrlKey && !e.metaKey) cycleTheme();
    if (e.key === 'n' && !typing && !e.ctrlKey && !e.metaKey) toggleNotes();
    if (e.key === 'Escape' && isOpen()) return toggleNotes(false);
    if (e.key === 'Escape' && (route === 'study' || route === 'exam')) go('home');
    if (!typing && ['1', '2', '3', '4'].includes(e.key)) {
      const btn = document.querySelectorAll('.rate__btn')[Number(e.key) - 1];
      if (btn) btn.click();
    }
  });

  const r = fromHash();
  route = r.name;
  routeArgs = r.args;
  render();
})();
