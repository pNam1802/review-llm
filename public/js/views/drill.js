import { state, gradeDrillAnswer } from '../store.js';
import { completeDrill, checkRecognize, checkCloze, needsLLM } from '../drills.js';
import { md } from '../md.js';
import { esc, toast } from '../ui.js';

const PHASE_LABEL = {
  now: 'Luyện ngay — khi còn nóng',
  session: 'Luyện lại cuối buổi',
  next: 'Khởi động — ý còn hụt buổi trước',
};

/**
 * Một thẻ luyện tập nhỏ. Tự quản lý trạng thái làm bài -> chấm -> xem kết quả.
 * onDone() được gọi khi học viên bấm tiếp tục.
 */
export function renderDrillCard(drill, { onDone, phase = 'now', index = 1, total = 1, onSkip }) {
  const root = document.createElement('div');
  root.className = 'study fade-in';
  let result = null;
  let busy = false;

  const useLLM = () => state.data.settings.useLLM && state.health.hasKey;

  function paint() {
    root.innerHTML = `
      <div class="study__top">
        <span class="badge badge--accent">🎯 ${PHASE_LABEL[phase]}</span>
        <span class="grow"></span>
        <span class="tiny muted">${index}/${total}</span>
        ${onSkip ? '<button class="btn btn--ghost btn--sm" data-act="skip">Bỏ qua</button>' : ''}
      </div>

      <article class="qcard drill">
        <header class="qcard__head">
          <span class="badge">Câu ${drill.qid}</span>
          <span class="badge">${esc(drill.question.topicName)}</span>
          <span class="grow"></span>
          <span class="badge">${esc(drill.title)}</span>
        </header>

        <div class="qcard__body">
          <p class="drill__q">${esc(drill.question.q)}</p>
          <div class="drill__prompt md">${md(drill.prompt)}</div>
          ${body()}
        </div>

        <div class="qcard__foot">
          ${result ? resultBlock() : `
            <div class="row">
              <button class="btn btn--primary" data-act="submit">Kiểm tra ${drill.type === 'recognize' ? '' : '<span class="kbd">Ctrl↵</span>'}</button>
              <span class="grow"></span>
              <span class="tiny muted">${esc(drill.why)}</span>
            </div>`}
        </div>
      </article>`;
    const first = root.querySelector('textarea, input[type="text"]');
    if (first && !result) first.focus();
  }

  function body() {
    if (drill.type === 'recognize') {
      return `<div class="opts">${drill.options
        .map((o, i) => `
          <label class="opt${result ? (o.correct ? ' opt--right' : '') : ''}">
            <input type="checkbox" value="${i}" ${result ? 'disabled' : ''}>
            <span>${esc(o.text)}</span>
          </label>`)
        .join('')}</div>`;
    }
    if (drill.type === 'cloze') {
      let html = esc(drill.masked);
      drill.answers.forEach((_, i) => {
        html = html.replace(
          `___${i + 1}___`,
          `<input type="text" class="blank" data-blank="${i}" placeholder="${i + 1}" ${result ? 'disabled' : ''} autocomplete="off">`,
        );
      });
      return `<div class="cloze">${html}</div>`;
    }
    return `<textarea class="answer-area" id="drillAns" rows="4"
      placeholder="${drill.type === 'skeleton' ? 'Mỗi dòng một ý, 3–5 từ…' : 'Viết bằng lời của bạn…'}"
      ${result ? 'disabled' : ''}></textarea>`;
  }

  function resultBlock() {
    const good = result.ok;
    return `
      <div class="callout ${good ? 'callout--ok' : 'callout--trap'}">
        <div class="callout__label">${good ? '✓ Đạt' : '↻ Chưa đạt — sẽ gặp lại'} · ${result.score}/100</div>
        ${esc(result.feedback || '')}
        ${result.hint ? `<div class="small" style="margin-top:8px"><b>Mẹo nhớ:</b> ${esc(result.hint)}</div>` : ''}
      </div>
      ${result.detail ? `<div class="small dim" style="margin-top:10px">${result.detail
        .map((d) => `${d.ok ? '✓' : '✗'} <b>${esc(d.want)}</b>${d.ok ? '' : ` — bạn viết “${esc(d.got || '…')}”`}`)
        .join(' · ')}</div>` : ''}
      ${drill.point && !good ? `<div class="callout" style="margin-top:10px"><div class="callout__label">Ý đầy đủ</div>${esc(drill.point.text)}</div>` : ''}
      ${drill.type === 'skeleton' && result.matched ? `<div class="small dim" style="margin-top:10px">
          ${drill.question.points.map((p, i) => {
            const pid = p.id || 'p' + (i + 1);
            const hit = result.matched.includes(pid);
            return `<div>${hit ? '✓' : '✗'} ${esc(p.text.slice(0, 70))}${p.text.length > 70 ? '…' : ''}</div>`;
          }).join('')}
        </div>` : ''}
      <div class="row" style="margin-top:14px">
        <button class="btn btn--primary" data-act="next">Tiếp tục <span class="kbd">↵</span></button>
      </div>`;
  }

  async function submit() {
    if (busy || result) return;
    busy = true;

    if (drill.type === 'recognize') {
      const picked = [...root.querySelectorAll('.opt input:checked')].map((el) => Number(el.value));
      result = checkRecognize(drill, picked);
    } else if (drill.type === 'cloze') {
      const inputs = [...root.querySelectorAll('.blank')].map((el) => el.value);
      result = checkCloze(drill, inputs);
    } else {
      const text = root.querySelector('#drillAns')?.value || '';
      if (!useLLM()) {
        // Không có LLM: không chấm được câu tự viết, chuyển sang tự đối chiếu.
        result = {
          score: 60, ok: true, selfCheck: true,
          feedback: 'Chưa bật chấm bằng LLM nên bạn tự đối chiếu với ý đầy đủ bên dưới rồi tự đánh giá.',
        };
      } else {
        const foot = root.querySelector('.qcard__foot');
        if (foot) foot.innerHTML = '<div class="row"><span class="spinner"></span><span class="dim">Đang chấm ý này…</span></div>';
        try {
          const r = await gradeDrillAnswer(drill.qid, drill.pid, drill.type, text);
          result = { ...r, ok: r.ok ?? r.score >= 60 };
        } catch (err) {
          toast(`Không chấm được bài luyện (${err.message}).`, 4200);
          result = { score: 60, ok: true, selfCheck: true, feedback: 'Không gọi được LLM. Bạn tự đối chiếu với ý đầy đủ bên dưới.' };
        }
      }
    }
    busy = false;
    paint();
  }

  function finish() {
    completeDrill(drill.qid, drill.pid, Boolean(result?.ok));
    onDone();
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    if (t.dataset.act === 'submit') submit();
    if (t.dataset.act === 'next') finish();
    if (t.dataset.act === 'skip' && onSkip) onSkip();
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !result) {
      e.preventDefault();
      submit();
    } else if (e.key === 'Enter' && result && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      finish();
    }
  });

  paint();
  return root;
}
