import { state } from '../store.js';
import { overview, topicProgress } from '../metrics.js';
import { masteryBar, pct, esc, fmtDuration } from '../ui.js';

export function renderHome(go) {
  const o = overview();
  const topics = topicProgress();
  const hasDue = o.due > 0 || o.fresh > 0;
  const plan = Math.min(o.due, state.data.settings.maxReview) + Math.min(o.fresh, state.data.settings.maxNew);

  const el = document.createElement('div');
  el.className = 'wrap fade-in';
  el.innerHTML = `
    <section class="hero">
      <div class="hero__eyebrow">Buổi học hôm nay</div>
      <h1 class="hero__title">${hasDue ? `${plan} câu đang chờ bạn` : 'Hôm nay bạn đã ôn xong'}</h1>
      <p class="hero__sub">${
        hasDue
          ? `${o.due} câu tới hạn ôn lại · ${Math.min(o.fresh, state.data.settings.maxNew)} câu mới. Cứ viết ra những gì bạn nhớ được — chính nỗ lực nhớ lại mới tạo ra trí nhớ, không phải việc đọc lại.`
          : `Không còn câu nào tới hạn. Bạn có thể học thêm câu mới, hoặc để bộ nhớ nghỉ — giấc ngủ là lúc kiến thức được củng cố.`
      }</p>
      <div class="hero__cta">
        <button class="btn btn--primary btn--lg" data-go="study">${hasDue ? 'Bắt đầu ôn' : 'Học thêm câu mới'}</button>
        <button class="btn btn--lg" data-go="exam">Thi thử</button>
        <button class="btn btn--lg btn--ghost" data-go="library">Xem thư viện</button>
      </div>
    </section>

    <div class="grid grid--4" style="margin-top:18px">
      ${stat('Đã thành thạo', `${o.mastered}`, `trên ${o.total} câu`)}
      ${stat('Chuỗi ngày học', `${o.streak}`, o.bestStreak ? `kỷ lục ${o.bestStreak} ngày` : 'bắt đầu hôm nay')}
      ${stat('Điểm 7 ngày', o.accuracy7 == null ? '—' : `${pct(o.accuracy7)}%`, 'trung bình bài tự luận')}
      ${stat('Hôm nay', `${o.todayReviews}`, o.todaySeconds ? `lượt ôn · ${fmtDuration(o.todaySeconds)}` : 'lượt ôn')}
    </div>

    <section class="card" style="margin-top:18px">
      <div class="row row--between" style="margin-bottom:6px">
        <div class="card__title" style="margin:0">Tiến độ theo chủ đề</div>
        <span class="tiny muted">${o.seen}/${o.total} câu đã gặp · thành thạo trung bình ${pct(o.avgMastery)}%</span>
      </div>
      ${topics.map(topicRow).join('')}
    </section>

    <section class="card" style="margin-top:18px">
      <div class="card__title">Cách hệ thống này giúp bạn nhớ lâu</div>
      <div class="grid grid--2">
        ${why('🎯', 'Nhớ lại chủ động', 'Bạn phải tự viết câu trả lời trước khi thấy đáp án. Việc lục lại trí nhớ tạo dấu vết bền hơn nhiều so với đọc lại — đây là hiệu ứng kiểm tra (testing effect).')}
        ${why('📅', 'Lặp lại ngắt quãng', 'Mỗi câu được hẹn ôn đúng lúc bạn sắp quên. Ôn quá sớm thì lãng phí, quá muộn thì phải học lại từ đầu.')}
        ${why('🔀', 'Xen kẽ chủ đề', 'Các câu được trộn giữa nhiều chủ đề thay vì học dồn một mảng. Khó hơn lúc học, nhưng nhớ chắc và biết áp dụng đúng lúc hơn.')}
        ${why('🧭', 'Tự đoán trước', 'Trước khi trả lời, bạn ước lượng mình nhớ tới đâu. Đối chiếu với điểm thật giúp phát hiện "ảo giác thông thạo" — tưởng hiểu mà chưa hiểu.')}
        ${why('🩺', 'Phản hồi theo từng ý', 'Điểm số kèm danh sách ý đã nêu / còn thiếu, thay vì chỉ đúng-sai. Bạn biết chính xác chỗ nào cần bổ sung.')}
        ${why('🔗', 'Giải thích cơ chế', 'Mỗi đáp án đều có phần "vì sao quan trọng" và bẫy thường gặp — kiến thức được nối vào một mạng lưới ý nghĩa thì khó rơi rụng hơn kiến thức rời rạc.')}
      </div>
    </section>
  `;

  el.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-go]');
    if (btn) go(btn.dataset.go, btn.dataset.arg ? { topic: btn.dataset.arg } : undefined);
  });
  return el;
}

const stat = (label, value, meta) => `
  <div class="stat">
    <div class="stat__label">${label}</div>
    <div class="stat__value">${value}</div>
    <div class="stat__meta">${meta}</div>
  </div>`;

const why = (icon, title, body) => `
  <div style="display:flex;gap:11px">
    <div style="font-size:19px;line-height:1.3">${icon}</div>
    <div>
      <b style="font-size:14.5px">${title}</b>
      <p class="small dim" style="margin:3px 0 0">${body}</p>
    </div>
  </div>`;

const topicRow = (t) => `
  <button class="topic-row" data-go="study" data-arg="${t.id}" title="Ôn chủ đề ${esc(t.name)}">
    <span class="topic-row__emoji">${t.emoji}</span>
    <span class="grow">
      <span class="topic-row__name">${esc(t.name)}</span>
      <span class="topic-row__meta"> · ${t.count} câu${t.due ? ` · <b style="color:var(--accent)">${t.due} tới hạn</b>` : ''}</span>
      <div class="topic-row__meta">${esc(t.blurb)}</div>
    </span>
    <span class="topic-row__bar">${masteryBar(t.mastery)}</span>
    <span class="tiny muted" style="width:38px;text-align:right">${pct(t.mastery)}%</span>
  </button>`;
