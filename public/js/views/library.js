import { state, getCard } from '../store.js';
import { mastery } from '../srs.js';
import { md } from '../md.js';
import { esc, masteryBar, pct, relTime } from '../ui.js';
import { normalize } from '../srs.js';
import { toggleNotes } from './notes.js';
import { notesFor } from '../store.js';

const dotColor = (m, seen) =>
  !seen ? 'var(--surface-3)' : m >= 0.75 ? 'var(--seq-5)' : m >= 0.5 ? 'var(--seq-4)' : m >= 0.25 ? 'var(--seq-3)' : 'var(--seq-2)';

export function renderLibrary(go, opts = {}) {
  const root = document.createElement('div');
  root.className = 'wrap wrap--wide fade-in';
  let query = opts.q || '';
  let topic = opts.topic || 'all';
  let onlyWeak = false;

  function list() {
    const nq = normalize(query);
    return state.questions.filter((q) => {
      if (topic !== 'all' && q.topic !== topic) return false;
      if (onlyWeak) {
        const c = getCard(q.id);
        if (c.stage === 'new' || (c.lapses || 0) < 2) return false;
      }
      if (!nq) return true;
      return normalize(`${q.id} ${q.q} ${q.answer} ${q.topicName} ${q.hook || ''}`).includes(nq);
    });
  }

  function paint() {
    const items = list();
    root.innerHTML = `
      <div class="page-head">
        <h1>Thư viện 120 câu</h1>
        <p>Đọc để tra cứu và nối các ý lại với nhau. Nhưng nhớ: <b>đọc lại tạo cảm giác quen thuộc, không tạo trí nhớ</b> —
           phần học thật nằm ở màn hình ôn tập, nơi bạn phải tự viết ra.</p>
      </div>

      <div class="stack">
        <input class="search" id="q" placeholder="Tìm theo từ khóa, số câu, nội dung đáp án…" value="${esc(query)}">
        <div class="row">
          <button class="chip" data-topic="all" aria-pressed="${topic === 'all'}">Tất cả (${state.questions.length})</button>
          ${state.topics.map((t) => `<button class="chip" data-topic="${t.id}" aria-pressed="${topic === t.id}">${t.emoji} ${esc(t.short || t.name)} (${t.count})</button>`).join('')}
          <span class="grow"></span>
          <button class="chip" data-weak="1" aria-pressed="${onlyWeak}">⚠️ Câu hay quên</button>
        </div>
      </div>

      <section class="card" style="margin-top:16px">
        ${items.length ? items.map(row).join('') : '<div class="empty">Không có câu nào khớp.</div>'}
      </section>`;

    const input = root.querySelector('#q');
    input.addEventListener('input', (e) => {
      query = e.target.value;
      const items2 = list();
      root.querySelector('.card').innerHTML = items2.length ? items2.map(row).join('') : '<div class="empty">Không có câu nào khớp.</div>';
    });
  }

  const row = (q) => {
    const c = getCard(q.id);
    const seen = c.stage !== 'new';
    const m = mastery(c);
    return `
      <button class="qrow" data-id="${q.id}">
        <span class="dot" style="background:${dotColor(m, seen)}" title="${seen ? `thành thạo ${pct(m)}%` : 'chưa học'}"></span>
        <span class="qrow__id">${q.id}</span>
        <span class="grow">
          <span class="qrow__q">${esc(q.q)}</span>
          <span class="qrow__meta">
            <span class="badge">${q.topicName}</span>
            ${seen ? `<span class="badge">${c.due <= Date.now() ? 'tới hạn' : 'ôn ' + relTime(c.due)}</span>` : '<span class="badge badge--accent">chưa học</span>'}
            ${c.lapses >= 4 ? '<span class="badge badge--bad">hay quên</span>' : ''}
          </span>
        </span>
      </button>`;
  };

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-id], [data-topic], [data-weak]');
    if (!t) return;
    if (t.dataset.id) return go('question', { id: Number(t.dataset.id) });
    if (t.dataset.topic) topic = t.dataset.topic;
    if (t.dataset.weak) onlyWeak = !onlyWeak;
    paint();
  });

  paint();
  return root;
}

/* --------------------------------------------------------- một câu hỏi */
export function renderQuestion(go, { id }) {
  const q = state.byId.get(Number(id));
  const root = document.createElement('div');
  root.className = 'wrap wrap--read fade-in';
  if (!q) {
    root.innerHTML = '<div class="empty">Không tìm thấy câu hỏi.</div>';
    return root;
  }
  const c = getCard(q.id);
  const idx = state.questions.findIndex((x) => x.id === q.id);
  const prev = state.questions[idx - 1];
  const next = state.questions[idx + 1];

  root.innerHTML = `
    <div class="row" style="margin-bottom:14px">
      <button class="btn btn--ghost btn--sm" data-go="library">← Thư viện</button>
      <span class="grow"></span>
      ${prev ? `<button class="btn btn--sm btn--ghost" data-id="${prev.id}">← ${prev.id}</button>` : ''}
      ${next ? `<button class="btn btn--sm btn--ghost" data-id="${next.id}">${next.id} →</button>` : ''}
    </div>

    <article class="card card--pad-lg">
      <div class="row" style="margin-bottom:12px">
        <span class="badge">${q.topicName}</span>
        <span class="badge">Câu ${q.id}</span>
        <span class="badge">${'●'.repeat(q.diff || 1)}${'○'.repeat(3 - (q.diff || 1))}</span>
        ${c.stage !== 'new' ? `<span class="badge">ôn lại ${relTime(c.due)}</span>` : '<span class="badge badge--accent">chưa học</span>'}
        <span class="grow"></span>
        <span>${masteryBar(mastery(c), 70)}</span>
      </div>
      <h1 style="font-size:22px;line-height:1.4">${md(q.q).replace(/^<p>|<\/p>$/g, '')}</h1>

      <div class="row" style="margin:16px 0 4px">
        <button class="btn btn--primary" data-test="1">Tự kiểm tra câu này</button>
        <button class="btn" data-note="1">📝 Sổ tay${notesFor(q.id).length ? ` (${notesFor(q.id).length})` : ''}</button>
        <span class="tiny muted">Thử viết đáp án trước khi đọc — hiệu quả hơn nhiều so với đọc thẳng.</span>
      </div>
    </article>

    <details class="reveal" style="margin-top:14px">
      <summary>Các ý cần có (${q.points.length} ý)</summary>
      <div class="reveal__body">
        <div class="rubric">
          ${q.points.map((p) => `<div class="rubric__item"><span class="rubric__mark">•</span>
            <span class="rubric__text">${esc(p.text)} <span class="tiny muted">(trọng số ${p.w || 1})</span></span></div>`).join('')}
        </div>
      </div>
    </details>

    <details class="reveal" style="margin-top:14px">
      <summary>Đáp án mẫu</summary>
      <div class="reveal__body md">${md(q.answer)}</div>
    </details>

    <section class="card" style="margin-top:14px">
      <div class="callout callout--why"><div class="callout__label">Vì sao quan trọng</div>${esc(q.why)}</div>
      ${q.traps?.length ? `<div class="callout callout--trap" style="margin-top:10px"><div class="callout__label">Bẫy thường gặp</div><ul>${q.traps.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
      ${q.hook ? `<div class="callout callout--hook" style="margin-top:10px"><div class="callout__label">Neo trí nhớ</div>${esc(q.hook)}</div>` : ''}
      ${q.visual ? `<pre class="md" style="margin-top:10px"><code>${esc(q.visual)}</code></pre>` : ''}
      ${q.related?.length ? `<div class="row" style="margin-top:12px"><span class="tiny muted">Câu liên quan:</span>${q.related.map((r) => `<button class="chip" data-id="${r}">Câu ${r}</button>`).join('')}</div>` : ''}
    </section>

    ${c.history?.length ? `<section class="card" style="margin-top:14px">
      <div class="card__title">Lịch sử ôn</div>
      <div class="row">${c.history.slice(-12).map((h) => `<span class="badge badge--${h.s >= 85 ? 'good' : h.s >= 65 ? 'accent' : h.s >= 45 ? 'warn' : 'bad'}" title="${new Date(h.t).toLocaleString('vi-VN')}">${h.s ?? '–'}</span>`).join('')}</div>
      <p class="tiny muted" style="margin-top:8px">Đã ôn ${c.reps} lần · quên lại ${c.lapses || 0} lần · khoảng cách hiện tại ${c.interval || 0} ngày</p>
    </section>` : ''}
  `;

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go], [data-id], [data-test], [data-note]');
    if (!t) return;
    if (t.dataset.note) return toggleNotes(true, { qid: q.id });
    if (t.dataset.test) return go('study', { mode: 'single', ids: [q.id] });
    if (t.dataset.id) return go('question', { id: Number(t.dataset.id) });
    if (t.dataset.go) return go(t.dataset.go);
  });
  return root;
}
