import { state } from '../store.js';
import { overview, topicProgress, weakSpots, calibration } from '../metrics.js';
import { heatmap, forecast, masteryBar, pct, esc, fmtDuration } from '../ui.js';
import { missedKinds, pidOf, classifyPoint } from '../drills.js';

export function renderStats(go) {
  const o = overview();
  const topics = topicProgress();
  const weak = weakSpots();
  const cal = calibration();
  const kinds = missedKinds(state.questions);
  const soY = (state.data.drills || []).length;
  const totalSeconds = Object.values(state.data.days).reduce((s, d) => s + (d.seconds || 0), 0);
  const totalReviews = Object.values(state.data.days).reduce((s, d) => s + (d.reviews || 0), 0);

  const root = document.createElement('div');
  root.className = 'wrap wrap--wide fade-in';
  root.innerHTML = `
    <div class="page-head">
      <h1>Tiến độ</h1>
      <p>Số liệu ở đây để bạn điều chỉnh cách học, không phải để chấm điểm bản thân.
         Quan trọng nhất là <b>đường cong đi lên đều</b>, không phải điểm của một buổi.</p>
    </div>

    <div class="grid grid--4">
      ${stat('Thành thạo', `${o.mastered}/${o.total}`, `${pct(o.avgMastery)}% trung bình`)}
      ${stat('Đã gặp', `${o.seen}`, `${o.fresh} câu chưa học`)}
      ${stat('Tổng lượt ôn', `${totalReviews}`, fmtDuration(totalSeconds))}
      ${stat('Chuỗi ngày', `${o.streak}`, `kỷ lục ${o.bestStreak}`)}
    </div>

    <div class="grid grid--2" style="margin-top:16px">
      <section class="card">
        <div class="card__title">Lịch ôn 14 ngày tới</div>
        ${forecast(state.data.cards)}
        <p class="tiny muted" style="margin-top:10px">
          Khoảng cách giãn dần là chủ ý: mỗi lần nhớ lại thành công, kiến thức được giữ lâu hơn nên lần ôn sau đẩy xa hơn.
        </p>
      </section>

      <section class="card">
        <div class="card__title">Thói quen học</div>
        ${heatmap(state.data.days)}
        <p class="tiny muted" style="margin-top:10px">
          Học 20 phút mỗi ngày hiệu quả hơn nhiều so với 3 giờ vào cuối tuần — trí nhớ được củng cố qua các lần ngủ.
        </p>
      </section>
    </div>

    <section class="card" style="margin-top:16px">
      <div class="card__title">Thành thạo theo chủ đề</div>
      ${topics
        .slice()
        .sort((a, b) => a.mastery - b.mastery)
        .map((t) => `
          <div class="topic-row" style="cursor:default">
            <span class="topic-row__emoji">${t.emoji}</span>
            <span class="grow"><span class="topic-row__name">${esc(t.name)}</span>
              <span class="topic-row__meta"> · ${t.seen}/${t.count} câu đã gặp</span></span>
            <span class="topic-row__bar">${masteryBar(t.mastery)}</span>
            <span class="tiny muted" style="width:38px;text-align:right">${pct(t.mastery)}%</span>
          </div>`)
        .join('')}
      <p class="tiny muted" style="margin-top:8px">Chủ đề yếu nhất nằm trên cùng — nên dành thời gian cho nó trước.</p>
    </section>

    ${cal ? `
    <section class="card" style="margin-top:16px">
      <div class="card__title">Bạn tự đánh giá có chuẩn không?</div>
      <div class="grid grid--3">
        ${cal.buckets.map((b) => {
          const real = Math.round(b.sum / b.n);
          const gap = b.expect - real;
          return `<div class="stat">
            <div class="stat__label">Khi bạn nói “${b.label}”</div>
            <div class="stat__value">${real}</div>
            <div class="stat__meta">${b.n} lần · ${gap > 20 ? 'tự tin quá mức' : gap < -20 ? 'khiêm tốn quá' : 'khá sát'}</div>
          </div>`;
        }).join('')}
      </div>
      <p class="small dim" style="margin-top:12px">
        ${cal.gap > 15
          ? '<b>Bạn đang tự tin hơn thực tế.</b> Đây là “ảo giác thông thạo”: đọc thấy quen nên tưởng đã nhớ. Cách chữa là tăng phần tự viết ra trước khi xem đáp án, và đừng bỏ qua bước dự đoán.'
          : cal.gap < -15
            ? '<b>Bạn đánh giá thấp bản thân.</b> Hãy mạnh dạn viết ra thay vì bấm “chịu” — bạn nhớ nhiều hơn mình nghĩ.'
            : '<b>Khả năng tự đánh giá của bạn khá chuẩn.</b> Đây là dấu hiệu tốt: bạn biết mình đang nắm gì và thiếu gì.'}
      </p>
    </section>` : ''}

    ${kinds.length ? `
    <section class="card" style="margin-top:16px">
      <div class="card__title">Bạn hay bỏ sót loại ý nào?
        <span class="tiny muted" style="font-weight:400">— thói quen tư duy, sửa một lần đúng cho cả trăm câu</span></div>
      ${kinds.slice(0, 6).map((k) => `
        <div class="topic-row" style="cursor:default">
          <span class="grow"><span class="topic-row__name">${esc(k.label)}</span>
            <span class="topic-row__meta"> · gặp ${k.seen} lượt</span></span>
          <span class="topic-row__bar">
            <div class="bar"><div class="bar__fill" style="width:${Math.max(3, pct(k.rate))}%;background:${k.rate > 0.4 ? 'var(--bad)' : k.rate > 0.2 ? 'var(--warn)' : 'var(--good)'}"></div></div>
          </span>
          <span class="tiny muted" style="width:52px;text-align:right">hụt ${pct(k.rate)}%</span>
        </div>`).join('')}
      <div class="callout callout--why" style="margin-top:12px">
        <div class="callout__label">Đọc bảng này thế nào</div>
        Nhóm ở trên cùng là loại ý bạn hay quên nhất. Lần sau khi trả lời bất kỳ câu nào, hãy tự hỏi thêm một nhịp:
        <i>“${esc(kinds[0].label.toLowerCase())} — mình đã nói chưa?”</i> Chỉ một câu tự hỏi đó thường kéo điểm lên đáng kể.
      </div>
    </section>` : ''}

    ${soY ? `
    <section class="card" style="margin-top:16px">
      <div class="card__title">Ý đang luyện dở <span class="tiny muted" style="font-weight:400">— ${soY} ý trong hàng đợi</span></div>
      ${(state.data.drills || []).slice(0, 8).map((d) => {
        const q = state.byId.get(d.qid);
        if (!q) return '';
        const i = q.points.findIndex((pt, n) => pidOf(pt, n) === d.pid);
        const pt = q.points[i];
        const nhip = { now: 'luyện ngay', session: 'cuối buổi', next: 'buổi sau' }[d.stage] || d.stage;
        return `<button class="qrow" data-id="${q.id}">
          <span class="qrow__id">${q.id}</span>
          <span class="grow">
            <span class="qrow__q">${pt ? esc(pt.text) : 'Khung xương cả câu'}</span>
            <span class="qrow__meta"><span class="badge">${esc(q.topicName)}</span>
              <span class="badge badge--accent">${nhip}</span>
              ${pt ? `<span class="badge">${esc(classifyPoint(pt.text).label)}</span>` : ''}</span>
          </span>
        </button>`;
      }).join('')}
    </section>` : ''}

    ${weak.length ? `
    <section class="card" style="margin-top:16px">
      <div class="card__title">Câu hay quên <span class="tiny muted" style="font-weight:400">— cần đổi cách học, không chỉ ôn thêm</span></div>
      ${weak.map((w) => `
        <button class="qrow" data-id="${w.q.id}">
          <span class="qrow__id">${w.q.id}</span>
          <span class="grow"><span class="qrow__q">${esc(w.q.q)}</span>
            <span class="qrow__meta"><span class="badge">${w.q.topicName}</span>
              <span class="badge badge--bad">quên ${w.card.lapses} lần</span>
              ${w.card.lastScore != null ? `<span class="badge">điểm gần nhất ${w.card.lastScore}</span>` : ''}</span>
          </span>
        </button>`).join('')}
      <div class="callout callout--why" style="margin-top:12px">
        <div class="callout__label">Với những câu này</div>
        Ôn lặp lại thường không đủ. Hãy thử: tự giải thích cơ chế bằng lời của mình, nối nó với một câu bạn đã thuộc,
        hoặc dùng phần “Hỏi thêm” để đào sâu tới khi bạn thấy nó <i>hợp lý</i> chứ không chỉ <i>quen mặt</i>.
      </div>
      <div class="row" style="margin-top:12px">
        <button class="btn btn--primary btn--sm" data-drill="1">Luyện riêng ${weak.length} câu này</button>
      </div>
    </section>` : ''}
  `;

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-id], [data-drill]');
    if (!t) return;
    if (t.dataset.drill) return go('study', { mode: 'single', ids: weak.map((w) => w.q.id) });
    go('question', { id: Number(t.dataset.id) });
  });
  return root;
}

const stat = (label, value, meta) => `
  <div class="stat">
    <div class="stat__label">${label}</div>
    <div class="stat__value">${value}</div>
    <div class="stat__meta">${meta}</div>
  </div>`;
