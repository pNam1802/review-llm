import { state, save, logAttempt } from '../store.js';
import { buildMixedSet, checkExercise, EX_META, EX_TYPES } from '../exercises.js';
import { md } from '../md.js';
import { esc, toast } from '../ui.js';

/**
 * Chế độ "Đổi món": trộn nhiều dạng bài tập ngắn.
 *
 * Đây là bài BỔ SUNG cho phần tự luận, không thay thế. Nhận ra (trắc nghiệm,
 * nối cặp) dễ hơn nhớ lại (tự viết), nên nếu chỉ làm dạng này thì cảm giác
 * "đã thuộc" sẽ đến sớm hơn thực tế. Giá trị của chúng nằm ở chỗ khác: buộc
 * phân biệt các khái niệm dễ lẫn, và đánh thẳng vào hiểu lầm.
 */
export function renderQuiz(go, opts = {}) {
  const root = document.createElement('div');
  root.className = 'wrap fade-in';

  const seenIds = new Set(
    Object.values(state.data.cards).filter((c) => c.stage !== 'new').map((c) => c.id),
  );
  const items = buildMixedSet(state.questions, {
    count: opts.count || 10,
    seen: seenIds.size >= 8 ? (id) => seenIds.has(id) : null,
    types: opts.types || EX_TYPES,
  });

  let index = 0;
  let result = null;
  let response = null;
  const startedAt = Date.now();
  const log = [];

  const item = () => items[index];

  function paint() {
    root.innerHTML = '';
    if (!items.length) {
      root.innerHTML = '<div class="empty card"><div class="empty__icon">🤔</div><h2>Chưa dựng được bài tập</h2></div>';
      return;
    }
    if (index >= items.length) return root.append(summary());
    root.append(card());
    root.querySelector('input[type="text"], .opt input')?.focus();
  }

  function card() {
    const it = item();
    const meta = EX_META[it.type];
    const el = document.createElement('div');
    el.className = 'study fade-in';
    el.innerHTML = `
      <div class="study__top">
        <button class="btn btn--ghost btn--sm" data-act="quit">← Thoát</button>
        <div class="progress"><div class="progress__fill" style="width:${(index / items.length) * 100}%"></div></div>
        <span class="tiny muted" style="white-space:nowrap">${index + 1}/${items.length}</span>
      </div>

      <article class="qcard drill">
        <header class="qcard__head">
          <span class="badge badge--accent">${meta.icon} ${meta.name}</span>
          <span class="badge">Câu ${it.qid}</span>
          <span class="badge">${esc(it.question.topicName)}</span>
          <span class="grow"></span>
          <span class="tiny muted">${meta.do}</span>
        </header>
        <div class="qcard__body">
          <div class="drill__prompt md">${md(it.prompt)}</div>
          ${body(it)}
        </div>
        <div class="qcard__foot">
          ${result ? resultBlock(it) : `<div class="row">
            <button class="btn btn--primary" data-act="check">Kiểm tra <span class="kbd">↵</span></button>
            <span class="grow"></span>
            <span class="tiny muted">${esc(it.why)}</span>
          </div>`}
        </div>
      </article>`;
    return el;
  }

  function body(it) {
    if (it.type === 'tf') {
      return `<div class="callout" style="font-size:16px;line-height:1.6;margin-bottom:16px">${esc(it.statement)}</div>
        <div class="jol" style="grid-template-columns:1fr 1fr">
          <button class="jol__btn${result && response === true ? ' jol__btn--picked' : ''}" data-tf="1" ${result ? 'disabled' : ''}><b>Đúng</b></button>
          <button class="jol__btn${result && response === false ? ' jol__btn--picked' : ''}" data-tf="0" ${result ? 'disabled' : ''}><b>Sai</b></button>
        </div>`;
    }
    if (it.type === 'mcq') {
      return `<div class="opts">${it.options
        .map((o, i) => `<label class="opt${result && o.correct ? ' opt--right' : ''}${result && response === i && !o.correct ? ' opt--wrong' : ''}">
            <input type="radio" name="mcq" value="${i}" ${result ? 'disabled' : ''} ${response === i ? 'checked' : ''}>
            <span>${esc(o.text)}</span></label>`)
        .join('')}</div>`;
    }
    if (it.type === 'cloze') {
      let html = esc(it.masked);
      it.answers.forEach((_, i) => {
        html = html.replace(`___${i + 1}___`, `<input type="text" class="blank" data-blank="${i}" placeholder="${i + 1}" ${result ? 'disabled' : ''} autocomplete="off">`);
      });
      return `<p class="tiny muted">Ngữ cảnh: ${esc(it.context)}</p><div class="cloze">${html}</div>`;
    }
    if (it.type === 'match') {
      return `<div class="match">${it.left
        .map((l) => `<div class="match__row">
            <span class="match__left">${esc(l.text)}</span>
            <select class="match__sel" data-left="${l.id}" ${result ? 'disabled' : ''}>
              <option value="">— chọn —</option>
              ${it.right.map((r) => `<option value="${r.id}" ${response?.[l.id] === r.id ? 'selected' : ''}>${esc(r.text)}</option>`).join('')}
            </select>
          </div>`)
        .join('')}</div>`;
    }
    if (it.type === 'order') {
      const cur = response || it.items;
      return `<p class="tiny muted" style="margin-bottom:8px">Dùng nút ▲▼ để đưa các bước về đúng thứ tự.</p>
        <ol class="order">${cur
          .map((x, i) => `<li class="order__item${result ? (x === it.answer[i] ? ' order__item--right' : ' order__item--wrong') : ''}">
              <span class="grow">${esc(x)}</span>
              ${result ? '' : `<button class="btn btn--ghost btn--sm" data-move="${i}" data-dir="-1" ${i === 0 ? 'disabled' : ''}>▲</button>
              <button class="btn btn--ghost btn--sm" data-move="${i}" data-dir="1" ${i === cur.length - 1 ? 'disabled' : ''}>▼</button>`}
            </li>`)
          .join('')}</ol>`;
    }
    return '';
  }

  function resultBlock(it) {
    return `
      <div class="callout ${result.ok ? 'callout--ok' : 'callout--trap'}">
        <div class="callout__label">${result.ok ? '✓ Đúng' : '✗ Chưa đúng'} · ${result.score}/100</div>
        ${esc(result.feedback || '')}
      </div>
      ${result.detail ? `<div class="small dim" style="margin-top:10px">${result.detail
        .map((d) => `${d.ok ? '✓' : '✗'} ${esc(d.want)}`).join(' · ')}</div>` : ''}
      <div class="row" style="margin-top:14px">
        <button class="btn btn--primary" data-act="next">${index + 1 >= items.length ? 'Xem kết quả' : 'Câu tiếp'} <span class="kbd">↵</span></button>
        <button class="btn btn--ghost btn--sm" data-act="open">Mở câu ${it.qid} trong thư viện</button>
      </div>`;
  }

  function check() {
    const it = item();
    if (it.type === 'cloze') response = [...root.querySelectorAll('.blank')].map((el) => el.value);
    if (it.type === 'mcq') {
      const picked = root.querySelector('input[name="mcq"]:checked');
      if (!picked) return toast('Chọn một phương án đã nhé.', 1600);
      response = Number(picked.value);
    }
    if (it.type === 'match') {
      response = {};
      for (const sel of root.querySelectorAll('.match__sel')) response[Number(sel.dataset.left)] = Number(sel.value);
    }
    if (it.type === 'order') response = response || it.items;
    if (it.type === 'tf' && response === null) return toast('Chọn Đúng hoặc Sai đã nhé.', 1600);

    result = checkExercise(it, response);
    log.push({ type: it.type, qid: it.qid, score: result.score });
    // Bài tập ngắn cũng là một lần nhớ lại - vẫn ghi vào nhật ký học,
    // nhưng KHÔNG đụng vào lịch ôn của thẻ (nhận ra dễ hơn nhớ lại nhiều).
    logAttempt({ questionId: it.qid, score: result.score, rating: 'quiz', seconds: 0, isNew: false, kind: 'quiz' });
    save();
    paint();
  }

  function next() {
    index += 1;
    result = null;
    response = null;
    paint();
  }

  function summary() {
    const d = document.createElement('div');
    d.className = 'fade-in';
    const diem = log.length ? Math.round(log.reduce((s, x) => s + x.score, 0) / log.length) : 0;
    const theoDang = {};
    for (const l of log) {
      theoDang[l.type] = theoDang[l.type] || { n: 0, s: 0 };
      theoDang[l.type].n += 1;
      theoDang[l.type].s += l.score;
    }
    d.innerHTML = `
      <section class="card card--pad-lg center">
        <div style="font-size:40px">${diem >= 80 ? '🎯' : diem >= 55 ? '💪' : '🌱'}</div>
        <h1 style="margin:8px 0 4px">${diem}/100</h1>
        <p class="dim">${log.length} bài · ${Math.max(1, Math.round((Date.now() - startedAt) / 60000))} phút</p>
        <div class="row" style="justify-content:center;margin-top:18px">
          <button class="btn btn--primary" data-act="again">Bộ khác</button>
          <button class="btn" data-act="study">Sang phần tự luận</button>
          <button class="btn btn--ghost" data-act="quit">Về trang chủ</button>
        </div>
      </section>
      <section class="card" style="margin-top:16px">
        <div class="card__title">Theo từng dạng</div>
        ${Object.entries(theoDang).map(([t, v]) => `
          <div class="topic-row" style="cursor:default">
            <span class="topic-row__emoji">${EX_META[t].icon}</span>
            <span class="grow"><span class="topic-row__name">${EX_META[t].name}</span>
              <span class="topic-row__meta"> · ${v.n} bài · ${EX_META[t].do}</span></span>
            <span class="badge badge--${v.s / v.n >= 80 ? 'good' : v.s / v.n >= 50 ? 'warn' : 'bad'}">${Math.round(v.s / v.n)}</span>
          </div>`).join('')}
        <div class="callout callout--why" style="margin-top:12px">
          <div class="callout__label">Nhớ điều này</div>
          Làm đúng trắc nghiệm dễ hơn tự viết ra rất nhiều. Nếu chỉ luyện dạng này, bạn sẽ thấy
          "đã thuộc" sớm hơn thực tế. Hãy dùng nó để đổi món và luyện phân biệt —
          phần tự luận mới là chỗ đo được bạn có thật sự dùng được kiến thức hay không.
        </div>
      </section>`;
    return d;
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act], [data-tf], [data-move]');
    if (!t) return;
    if (t.dataset.tf != null) {
      response = t.dataset.tf === '1';
      return check();
    }
    if (t.dataset.move != null) {
      const i = Number(t.dataset.move);
      const dir = Number(t.dataset.dir);
      const arr = [...(response || item().items)];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      response = arr;
      return paint();
    }
    switch (t.dataset.act) {
      case 'check': return check();
      case 'next': return next();
      case 'quit': return go('home');
      case 'again': return go('quiz');
      case 'study': return go('study');
      case 'open': return go('question', { id: item().qid });
      default: break;
    }
  });

  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (result) next();
    else check();
  });

  paint();
  return root;
}
