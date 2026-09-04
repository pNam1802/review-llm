import { state, getCard, setCard, save, logAttempt, gradeAnswer, askCoach } from '../store.js';
import {
  buildQueue, review, previewIntervals, localGrade, scoreFromPoints, ratingFromScore, interleave,
} from '../srs.js';
import { recordGrade, pendingDrills, buildDrill } from '../drills.js';
import { renderDrillCard } from './drill.js';
import { md } from '../md.js';
import { scoreRing, esc, toast, relTime, fmtDuration } from '../ui.js';

const RATING_LABEL = {
  again: { b: 'Quên', s: 'chưa nhớ được' },
  hard: { b: 'Khó', s: 'nhớ chật vật' },
  good: { b: 'Được', s: 'nhớ đúng ý' },
  easy: { b: 'Dễ', s: 'nhớ ngay, đầy đủ' },
};

const VERDICT = {
  excellent: ['Xuất sắc', 'Bạn nêu gần như đủ mọi ý cần có.'],
  good: ['Tốt', 'Nắm được phần lõi, còn thiếu vài chi tiết.'],
  partial: ['Được một nửa', 'Đúng hướng nhưng thiếu khá nhiều ý quan trọng.'],
  weak: ['Còn yếu', 'Cần đọc lại đáp án mẫu và diễn đạt lại bằng lời của mình.'],
  blank: ['Chưa trả lời', 'Không sao — lần sau cứ viết những gì bạn nhớ được, dù ít.'],
};

export function renderStudy(go, opts = {}) {
  const root = document.createElement('div');
  root.className = 'wrap fade-in';

  const mode = opts.mode || 'study';
  let queue = [];

  if (mode === 'single') {
    queue = (opts.ids || []).map((id) => state.byId.get(id)).filter(Boolean);
  } else if (mode === 'exam') {
    const pool = opts.topic ? state.questions.filter((q) => q.topic === opts.topic) : state.questions;
    queue = interleave([...pool]).slice(0, opts.count || 10);
  } else {
    queue = buildQueue(state.questions, state.data.cards, {
      topic: opts.topic,
      maxNew: state.data.settings.maxNew,
      maxReview: state.data.settings.maxReview,
    });
    if (!queue.length && opts.topic) {
      // chủ đề không còn câu tới hạn: cho ôn lại các câu sắp tới hạn nhất
      queue = interleave(
        state.questions
          .filter((q) => q.topic === opts.topic)
          .sort((a, b) => getCard(a.id).due - getCard(b.id).due)
          .slice(0, 10),
      );
    }
  }

  const session = {
    mode,
    queue,
    index: 0,
    startedAt: Date.now(),
    results: [],   // { q, score, rating }
    answers: {},   // dành cho chế độ thi thử
  };

  let step = 'predict';
  let confidence = null;
  let grade = null;
  let questionStart = Date.now();
  let hintLevel = 0;
  let chat = [];

  // hàng đợi bài luyện của phiên hiện tại
  let activeDrills = [];
  let currentDrill = null;
  let drillPhase = 'now';
  let drillTotal = 0;
  let afterDrills = null;

  const current = () => session.queue[session.index];

  /** Chạy một loạt bài luyện rồi gọi tiếp `then`. */
  function startDrills(list, phase, then) {
    activeDrills = [...list];
    drillPhase = phase;
    drillTotal = list.length;
    afterDrills = then;
    nextDrill();
  }

  function nextDrill() {
    if (!activeDrills.length) {
      currentDrill = null;
      step = 'predict';
      const done = afterDrills;
      afterDrills = null;
      questionStart = Date.now();
      return done ? done() : paint();
    }
    const item = activeDrills.shift();
    const q = state.byId.get(item.qid);
    currentDrill = q ? buildDrill(q, item.pid, state.questions) : null;
    if (!currentDrill) return nextDrill();
    step = 'drill';
    paint();
  }

  function paint() {
    root.innerHTML = '';
    if (step === 'drill' && currentDrill) {
      return root.append(renderDrillCard(currentDrill, {
        phase: drillPhase,
        index: drillTotal - activeDrills.length,
        total: drillTotal,
        onDone: nextDrill,
        onSkip: () => {
          activeDrills = [];
          nextDrill();
        },
      }));
    }
    if (!session.queue.length) return root.append(emptyState(go, opts));
    if (session.index >= session.queue.length) return root.append(summary());
    root.append(card());
    const ta = root.querySelector('.answer-area');
    if (ta) ta.focus();
  }

  /* ------------------------------------------------------------ thẻ học */
  function card() {
    const q = current();
    const c = getCard(q.id);
    const el = document.createElement('div');
    el.className = 'study fade-in';
    const done = session.index;
    const total = session.queue.length;

    el.innerHTML = `
      <div class="study__top">
        <button class="btn btn--ghost btn--sm" data-act="quit">← Thoát</button>
        <div class="progress"><div class="progress__fill" style="width:${(done / total) * 100}%"></div></div>
        <span class="tiny muted" style="white-space:nowrap">${done + 1}/${total}</span>
      </div>

      <article class="qcard">
        <header class="qcard__head">
          <span class="badge">${q.topicName}</span>
          <span class="badge">Câu ${q.id}</span>
          <span class="badge">${'●'.repeat(q.diff || 1)}${'○'.repeat(3 - (q.diff || 1))} độ khó</span>
          ${c.stage === 'new' ? '<span class="badge badge--accent">câu mới</span>' : ''}
          ${c.lapses >= 4 ? '<span class="badge badge--bad">hay quên</span>' : ''}
          <span class="grow"></span>
          ${session.mode === 'exam' ? '<span class="badge badge--warn">Thi thử — chấm ở cuối</span>' : ''}
        </header>
        <div class="qcard__body">
          <h2 class="qcard__q">${md(q.q).replace(/^<p>|<\/p>$/g, '')}</h2>
        </div>
        <div class="qcard__foot" id="stepArea"></div>
      </article>
      <div id="feedbackArea"></div>
    `;

    const stepArea = el.querySelector('#stepArea');
    if (step === 'feedback') {
      stepArea.append(answerRecap(q));
    } else if (step === 'predict' && session.mode !== 'exam' && state.data.settings.askConfidence) {
      stepArea.append(predictStep());
    } else {
      if (step === 'predict') step = 'recall';
      stepArea.append(recallStep(q));
    }

    if (step === 'feedback' && grade) el.querySelector('#feedbackArea').append(feedbackBlock(q, grade));

    wire(el);
    return el;
  }

  function predictStep() {
    const d = document.createElement('div');
    d.innerHTML = `
      <p class="small dim" style="margin-bottom:10px">
        <b>Trước khi trả lời:</b> bạn nghĩ mình nhớ câu này tới đâu? (Đối chiếu dự đoán với điểm thật giúp bạn
        phát hiện lúc mình chỉ đang <i>thấy quen</i> chứ chưa thực sự nhớ.)
      </p>
      <div class="jol">
        <button class="jol__btn" data-conf="1"><b>Quên rồi</b><span>không nhớ gì</span></button>
        <button class="jol__btn" data-conf="2"><b>Mang máng</b><span>nhớ ý chính</span></button>
        <button class="jol__btn" data-conf="3"><b>Chắc chắn</b><span>trả lời được đầy đủ</span></button>
      </div>`;
    return d;
  }

  function recallStep(q) {
    const d = document.createElement('div');
    const hint = hintText(q);
    d.innerHTML = `
      <label class="small dim" for="ans" style="display:block;margin-bottom:8px">
        Viết câu trả lời bằng lời của bạn — không cần giống đáp án, chỉ cần đủ ý.
      </label>
      <textarea class="answer-area" id="ans" placeholder="Gõ những gì bạn nhớ được…">${esc(session.answers[q.id] || '')}</textarea>
      ${hint ? `<div class="callout callout--hook" style="margin-top:10px"><div class="callout__label">Gợi ý ${hintLevel}</div>${hint}</div>` : ''}
      <div class="row" style="margin-top:14px">
        <button class="btn btn--primary" data-act="submit">
          ${session.mode === 'exam' ? 'Câu tiếp theo' : 'Nộp bài & xem đáp án'} <span class="kbd">Ctrl↵</span>
        </button>
        ${session.mode !== 'exam' ? `<button class="btn" data-act="hint" ${hintLevel >= 2 ? 'disabled' : ''}>Gợi ý (${hintLevel}/2)</button>` : ''}
        ${session.mode !== 'exam' ? '<button class="btn btn--ghost" data-act="blank">Chịu, xem đáp án</button>' : ''}
        <span class="grow"></span>
        <span class="tiny muted" id="timer"></span>
      </div>`;
    return d;
  }

  function answerRecap(q) {
    const d = document.createElement('div');
    const text = (session.answers[q.id] || '').trim();
    d.innerHTML =
      '<div class="callout"><div class="callout__label">Bài làm của bạn' +
      (confidence ? ` · dự đoán: ${['', 'quên rồi', 'mang máng', 'chắc chắn'][confidence]}` : '') +
      '</div><div style="white-space:pre-wrap">' +
      (text ? esc(text) : '<i class="muted">Bạn bỏ trống câu này.</i>') +
      '</div></div>';
    return d;
  }

  function hintText(q) {
    if (hintLevel === 0) return '';
    if (hintLevel === 1) return `Đáp án đầy đủ cần <b>${q.points.length} ý</b>. Thử liệt kê đủ số ý đó trước khi nộp.`;
    return `Các ý cần có bắt đầu bằng: ${q.points.map((p) => `<b>${esc(p.text.split(/[\s:,–-]/).slice(0, 3).join(' '))}…</b>`).join(' · ')}`;
  }

  /* --------------------------------------------------------- phản hồi */
  function feedbackBlock(q, g) {
    const d = document.createElement('div');
    d.className = 'stack fade-in';
    d.style.marginTop = '16px';
    const [vTitle, vSub] = VERDICT[g.verdict] || VERDICT.partial;
    const c = getCard(q.id);
    const prev = previewIntervals(c);
    const suggested = g.suggested_rating || ratingFromScore(g.overall);

    d.innerHTML = `
      <section class="card">
        <div class="score">
          ${scoreRing(g.overall)}
          <div class="score__txt">
            <b>${vTitle}${g.offline ? ' · chấm nháp' : ''}</b>
            <p>${esc(g.feedback || vSub)}</p>
            ${confidence ? `<p class="tiny muted">Bạn dự đoán: <b>${['', 'Quên rồi', 'Mang máng', 'Chắc chắn'][confidence]}</b> — ${calibNote(confidence, g.overall)}</p>` : ''}
          </div>
        </div>
      </section>

      <section class="card">
        <div class="card__title">Từng ý trong đáp án <span class="tiny muted" style="font-weight:400">— bấm vào một ý để tự sửa đánh giá</span></div>
        <div class="rubric rubric--self" id="rubric">
          ${q.points.map((p, i) => rubricItem(p, g.points?.[i], i)).join('')}
        </div>
        ${g.missing_summary && g.verdict !== 'excellent' ? `<div class="callout" style="margin-top:12px"><div class="callout__label">Còn thiếu</div>${esc(g.missing_summary)}</div>` : ''}
        ${g.misconceptions?.length ? `<div class="callout callout--trap" style="margin-top:10px"><div class="callout__label">Chỗ đang hiểu sai</div><ul>${g.misconceptions.map((m) => `<li>${esc(m)}</li>`).join('')}</ul></div>` : ''}
        ${g.upgrade ? `<div class="callout callout--why" style="margin-top:10px"><div class="callout__label">Lần sau làm tốt hơn</div>${esc(g.upgrade)}</div>` : ''}
      </section>

      <details class="reveal" open>
        <summary>Đáp án mẫu</summary>
        <div class="reveal__body md">${md(q.answer)}</div>
      </details>

      <section class="card">
        <div class="callout callout--why"><div class="callout__label">Vì sao ý này quan trọng</div>${esc(q.why)}</div>
        ${q.traps?.length ? `<div class="callout callout--trap" style="margin-top:10px"><div class="callout__label">Bẫy thường gặp</div><ul>${q.traps.map((t) => `<li>${esc(t)}</li>`).join('')}</ul></div>` : ''}
        ${q.hook ? `<div class="callout callout--hook" style="margin-top:10px"><div class="callout__label">Neo trí nhớ</div>${esc(q.hook)}</div>` : ''}
        ${q.visual ? `<pre class="md" style="margin-top:10px"><code>${esc(q.visual)}</code></pre>` : ''}
        ${q.related?.length ? `<div class="row" style="margin-top:12px"><span class="tiny muted">Liên quan:</span>${q.related.map((r) => `<button class="chip" data-act="jump" data-id="${r}">Câu ${r}</button>`).join('')}</div>` : ''}
      </section>

      <details class="reveal" id="coachBox">
        <summary>💬 Hỏi thêm về câu này</summary>
        <div class="reveal__body">
          <div class="chat" id="chatLog"></div>
          <div class="row" style="margin-top:10px">
            <input class="search grow" id="coachInput" placeholder="Ví dụ: cho mình một ví dụ thực tế…">
            <button class="btn" data-act="coach">Hỏi</button>
          </div>
          <div class="row" style="margin-top:8px">
            ${['Giải thích lại đơn giản hơn', 'Cho một ví dụ thực tế', 'Câu này hay bị hỏi kiểu nào?'].map((s) => `<button class="chip" data-act="coach-quick" data-q="${esc(s)}">${s}</button>`).join('')}
          </div>
        </div>
      </details>

      <section class="card">
        <div class="card__title">Bạn nhớ câu này tới đâu? <span class="tiny muted" style="font-weight:400">— quyết định lần ôn kế tiếp</span></div>
        <div class="rate">
          ${['again', 'hard', 'good', 'easy'].map((r, i) => `
            <button class="rate__btn" data-rate="${r}" ${r === suggested ? 'data-suggest="1"' : ''}>
              <b>${RATING_LABEL[r].b}</b>
              <span>${prev[r]}</span>
              <span class="kbd" style="margin-top:4px;display:inline-block">${i + 1}</span>
            </button>`).join('')}
        </div>
      </section>`;
    return d;
  }

  const rubricItem = (p, res, i) => {
    const st = res?.status || 'miss';
    const mark = st === 'hit' ? '✓' : st === 'partial' ? '～' : '✗';
    return `
      <div class="rubric__item rubric__item--${st}" data-idx="${i}" role="button" tabindex="0"
           title="Bấm để đổi: đủ ý → một phần → thiếu">
        <span class="rubric__mark">${mark}</span>
        <span>
          <div class="rubric__text">${esc(p.text)}</div>
          ${res?.evidence ? `<div class="rubric__ev">“${esc(res.evidence)}”</div>` : ''}
          ${res?.note ? `<div class="rubric__note">${esc(res.note)}</div>` : ''}
        </span>
      </div>`;
  };

  const calibNote = (conf, score) => {
    const expect = [0, 20, 55, 90][conf];
    const gap = expect - score;
    if (gap > 25) return 'bạn tự tin hơn thực tế — dấu hiệu của “ảo giác thông thạo”, nên ôn lại kỹ.';
    if (gap < -25) return 'bạn nhớ tốt hơn mình nghĩ — cứ mạnh dạn viết ra.';
    return 'dự đoán khá sát thực tế, khả năng tự đánh giá tốt.';
  };

  /* ------------------------------------------------------------ hành vi */
  function wire(el) {
    el.addEventListener('click', async (e) => {
      const t = e.target.closest('[data-act], [data-conf], [data-rate], [data-idx]');
      if (!t) return;

      if (t.dataset.conf) {
        confidence = Number(t.dataset.conf);
        step = 'recall';
        questionStart = Date.now();
        return paint();
      }
      if (t.dataset.rate) return applyRating(t.dataset.rate);
      if (t.dataset.idx != null && step === 'feedback') return cycleRubric(Number(t.dataset.idx), el);

      switch (t.dataset.act) {
        case 'quit': return go('home');
        case 'hint': hintLevel = Math.min(2, hintLevel + 1); return paint();
        case 'blank': return submit('');
        case 'submit': return submit(el.querySelector('#ans')?.value ?? '');
        case 'jump': return go('question', { id: Number(t.dataset.id) });
        case 'coach': return doCoach(el, el.querySelector('#coachInput').value);
        case 'coach-quick': return doCoach(el, t.dataset.q);
        case 'next': return next();
        case 'restart': return go('study', opts);
        default: break;
      }
    });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && step === 'recall') {
        e.preventDefault();
        submit(el.querySelector('#ans')?.value ?? '');
      }
      if (e.target.id === 'coachInput' && e.key === 'Enter') {
        e.preventDefault();
        doCoach(el, e.target.value);
      }
    });

    // đồng hồ đo thời gian suy nghĩ (không tạo áp lực, chỉ để tự quan sát)
    const timer = el.querySelector('#timer');
    if (timer && state.data.settings.showTimer) {
      const tick = () => {
        if (!document.body.contains(timer)) return clearInterval(iv);
        timer.textContent = fmtDuration((Date.now() - questionStart) / 1000);
      };
      const iv = setInterval(tick, 1000);
      tick();
    }
  }

  async function submit(answer) {
    const q = current();
    session.answers[q.id] = answer;
    const seconds = (Date.now() - questionStart) / 1000;

    if (session.mode === 'exam') {
      session.results.push({ q, answer, seconds, confidence });
      return next();
    }

    // hiện trạng thái đang chấm
    const foot = root.querySelector('#stepArea');
    if (foot) {
      foot.innerHTML = `<div class="row"><span class="spinner"></span>
        <span class="dim">${useLLM() ? 'Đang chấm theo từng ý trong rubric…' : 'Đang đối chiếu với đáp án…'}</span></div>`;
    }

    grade = await gradeOne(q, answer);
    grade.seconds = seconds;
    step = 'feedback';
    paint();
    root.querySelector('#feedbackArea')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const useLLM = () => state.data.settings.useLLM && state.health.hasKey;

  async function gradeOne(q, answer) {
    if (!answer.trim()) return { ...localGrade(q, ''), overall: 0, verdict: 'blank', suggested_rating: 'again' };
    if (!useLLM()) return localGrade(q, answer);
    try {
      return await gradeAnswer(q.id, answer);
    } catch (err) {
      toast(`Không chấm được bằng LLM (${err.message}). Đang dùng chấm nháp — bạn tự soát lại nhé.`, 5200);
      return localGrade(q, answer);
    }
  }

  function cycleRubric(idx, el) {
    const order = ['hit', 'partial', 'miss'];
    const cur = grade.points[idx]?.status || 'miss';
    const nextStatus = order[(order.indexOf(cur) + 1) % order.length];
    grade.points[idx] = { ...(grade.points[idx] || {}), status: nextStatus };
    grade.overall = scoreFromPoints(current(), grade.points);
    grade.suggested_rating = ratingFromScore(grade.overall);
    grade.edited = true;
    paint();
    root.querySelector('#rubric')?.scrollIntoView({ block: 'center' });
  }

  async function doCoach(el, question) {
    const text = (question || '').trim();
    if (!text) return;
    const log = el.querySelector('#chatLog');
    const input = el.querySelector('#coachInput');
    if (input) input.value = '';
    chat.push({ role: 'user', content: text });
    log.insertAdjacentHTML('beforeend', `<div class="chat__msg chat__msg--user">${esc(text)}</div>`);
    log.insertAdjacentHTML('beforeend', '<div class="chat__msg chat__msg--ai" id="pending"><span class="spinner"></span></div>');
    try {
      const answer = await askCoach(current().id, text, chat.slice(0, -1));
      chat.push({ role: 'assistant', content: answer });
      el.querySelector('#pending').outerHTML = `<div class="chat__msg chat__msg--ai md">${md(answer)}</div>`;
    } catch (err) {
      el.querySelector('#pending').outerHTML = `<div class="chat__msg chat__msg--ai">⚠️ ${esc(err.message)}</div>`;
    }
  }

  function applyRating(rating) {
    const q = current();
    const card0 = getCard(q.id);
    const isNew = card0.stage === 'new';
    const updated = review(card0, rating);
    updated.lastScore = grade?.overall ?? null;
    updated.history = [...(updated.history || []), { t: Date.now(), r: rating, s: grade?.overall ?? null }].slice(-30);
    setCard(updated);
    logAttempt({
      questionId: q.id,
      score: grade?.overall ?? 0,
      rating,
      seconds: grade?.seconds ?? 0,
      confidence,
      isNew,
      offline: grade?.offline,
    });
    session.results.push({ q, score: grade?.overall ?? 0, rating });

    // Ghi nhận kết quả TỪNG Ý và xếp lịch luyện cho ý còn hụt
    if (grade?.points) recordGrade(q, grade.points, grade.overall ?? 0);
    save();
    toast(`Ôn lại ${relTime(updated.due)}`, 1500);

    const ngay = pendingDrills('now').filter((d) => d.qid === q.id);
    if (ngay.length && session.mode !== 'exam') return startDrills(ngay, 'now', next);
    next();
  }

  function next() {
    session.index += 1;
    step = 'predict';
    confidence = null;
    grade = null;
    hintLevel = 0;
    chat = [];
    questionStart = Date.now();
    if (session.index >= session.queue.length) {
      if (session.mode === 'exam') return finishExam();
      const cuoiBuoi = [...pendingDrills('session'), ...pendingDrills('now')];
      if (cuoiBuoi.length && !session.cooldownDone) {
        session.cooldownDone = true;
        return startDrills(cuoiBuoi, 'session', paint);
      }
    }
    paint();
  }

  /* ------------------------------------------------------------ thi thử */
  async function finishExam() {
    root.innerHTML = `<div class="card center" style="padding:44px">
      <div class="spinner" style="width:26px;height:26px"></div>
      <p style="margin-top:14px">Đang chấm ${session.results.length} câu…</p>
      <p class="small muted" id="examProg"></p></div>`;
    const graded = [];
    for (let i = 0; i < session.results.length; i++) {
      const r = session.results[i];
      const p = root.querySelector('#examProg');
      if (p) p.textContent = `Câu ${i + 1}/${session.results.length}`;
      // eslint-disable-next-line no-await-in-loop
      const g = await gradeOne(r.q, r.answer);
      graded.push({ ...r, grade: g });
      const card0 = getCard(r.q.id);
      const isNew = card0.stage === 'new';
      const rating = g.suggested_rating || ratingFromScore(g.overall);
      const updated = review(card0, rating);
      updated.lastScore = g.overall;
      setCard(updated);
      logAttempt({ questionId: r.q.id, score: g.overall, rating, seconds: r.seconds, confidence: r.confidence, isNew, offline: g.offline });
      if (g.points) recordGrade(r.q, g.points, g.overall);
    }
    save({ immediate: true });
    session.examResults = graded;
    session.index = session.queue.length;
    paint();
  }

  /* ------------------------------------------------------------ tổng kết */
  function summary() {
    const d = document.createElement('div');
    d.className = 'fade-in';
    const rows = session.examResults || session.results;
    const scores = rows.map((r) => r.grade?.overall ?? r.score ?? 0);
    const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const minutes = Math.round((Date.now() - session.startedAt) / 60000);

    d.innerHTML = `
      <section class="card card--pad-lg center">
        <div style="font-size:40px">${avg >= 85 ? '🎉' : avg >= 65 ? '💪' : '🌱'}</div>
        <h1 style="margin:8px 0 4px">Xong ${rows.length} câu</h1>
        <p class="dim">Điểm trung bình <b>${avg}</b> · ${minutes} phút · ${new Date().toLocaleDateString('vi-VN')}</p>
        <div class="row" style="justify-content:center;margin-top:18px">
          <button class="btn btn--primary" data-act="restart">Học tiếp</button>
          <button class="btn" data-act="quit">Về trang chủ</button>
        </div>
      </section>

      <section class="card" style="margin-top:16px">
        <div class="card__title">Chi tiết</div>
        ${rows.map((r) => {
          const s = r.grade?.overall ?? r.score ?? 0;
          const color = s >= 85 ? 'good' : s >= 65 ? 'accent' : s >= 45 ? 'warn' : 'bad';
          return `<button class="qrow" data-act="jump" data-id="${r.q.id}">
            <span class="qrow__id">${r.q.id}</span>
            <span class="grow"><span class="qrow__q">${esc(r.q.q)}</span>
              <span class="qrow__meta"><span class="badge">${r.q.topicName}</span>
              ${r.grade?.missing_summary && s < 90 ? `<span class="tiny muted">${esc(r.grade.missing_summary).slice(0, 110)}</span>` : ''}</span>
            </span>
            <span class="badge badge--${color}">${s}</span>
          </button>`;
        }).join('')}
      </section>

      <section class="card" style="margin-top:16px">
        <div class="callout callout--why">
          <div class="callout__label">Ghi nhớ</div>
          Đừng học lại ngay những câu vừa sai — hãy để hệ thống hẹn lịch. Khoảng nghỉ (và giấc ngủ đêm nay)
          chính là lúc não củng cố những gì bạn vừa cố nhớ lại.
        </div>
      </section>`;

    d.addEventListener('click', (e) => {
      const t = e.target.closest('[data-act]');
      if (!t) return;
      if (t.dataset.act === 'quit') go('home');
      if (t.dataset.act === 'restart') go('study', opts);
      if (t.dataset.act === 'jump') go('question', { id: Number(t.dataset.id) });
    });
    return d;
  }

  // Mở màn bằng những ý còn hụt từ buổi trước (nhịp thứ ba của lịch luyện)
  const khoiDong = session.mode === 'exam'
    ? []
    : [...pendingDrills('next'), ...pendingDrills('now')];
  if (khoiDong.length) startDrills(khoiDong, 'next', paint);
  else paint();

  return root;
}

function emptyState(go, opts) {
  const d = document.createElement('div');
  d.className = 'empty card';
  d.innerHTML = `
    <div class="empty__icon">🌙</div>
    <h2>Không còn câu nào tới hạn</h2>
    <p class="dim" style="max-width:46ch;margin:8px auto 0">
      Ôn thêm lúc này ít tác dụng hơn bạn nghĩ — trí nhớ cần khoảng nghỉ để bền lại.
      Bạn có thể tăng số câu mới mỗi ngày trong phần Cài đặt, hoặc thi thử để kiểm tra tổng thể.
    </p>
    <div class="row" style="justify-content:center;margin-top:18px">
      <button class="btn btn--primary" data-go="exam">Thi thử 10 câu</button>
      <button class="btn" data-go="library">Đọc thư viện</button>
      <button class="btn btn--ghost" data-go="home">Về trang chủ</button>
    </div>`;
  d.addEventListener('click', (e) => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go, t.dataset.go === 'exam' ? { ...opts, mode: 'exam', count: 10 } : undefined);
  });
  return d;
}
