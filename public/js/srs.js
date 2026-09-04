// Lịch lặp lại ngắt quãng (spaced repetition) + chấm nháp khi không có LLM.
//
// Cơ sở khoa học:
// - Hiệu ứng kiểm tra (testing effect): cố nhớ lại tạo trí nhớ bền hơn đọc lại.
// - Đường cong quên (Ebbinghaus): ôn ĐÚNG lúc sắp quên thì mỗi lần ôn kéo dài
//   trí nhớ hơn lần trước ⇒ khoảng cách giữa các lần ôn giãn dần.
// - Khó khăn hữu ích (desirable difficulty): ôn quá sớm thì dễ nhưng ít tác dụng.

export const MIN = 60 * 1000;
export const DAY = 24 * 60 * MIN;

const LEARN_STEPS = [10 * MIN, DAY]; // học lần đầu: nhắc lại sau 10 phút, rồi 1 ngày
const EASE_MIN = 1.3;
const EASE_MAX = 2.8;
const MAX_INTERVAL = 365;

export function newCard(id) {
  return {
    id,
    stage: 'new',      // new | learning | review | relearn
    step: 0,
    ease: 2.5,
    interval: 0,       // ngày
    due: 0,
    reps: 0,
    lapses: 0,
    lastScore: null,
    seen: 0,
    history: [],
  };
}

const fuzz = (days) => {
  const f = 1 + (Math.random() * 0.14 - 0.07); // ±7% để các thẻ không dồn cùng một ngày
  return Math.max(1, Math.round(days * f));
};
const clampEase = (e) => Math.min(EASE_MAX, Math.max(EASE_MIN, e));

/** Áp một lần đánh giá lên thẻ, trả về thẻ mới (không sửa thẻ cũ). */
export function review(card, rating, now = Date.now()) {
  const c = { ...card, history: [...(card.history || [])] };
  c.reps += 1;
  c.seen = (c.seen || 0) + 1;

  const graduate = (days) => {
    c.stage = 'review';
    c.step = 0;
    c.interval = fuzz(days);
    c.due = now + c.interval * DAY;
  };

  if (c.stage === 'new' || c.stage === 'learning') {
    c.stage = 'learning';
    if (rating === 'again') {
      c.step = 0;
      c.due = now + 5 * MIN;
    } else if (rating === 'hard') {
      c.due = now + 10 * MIN;
    } else if (rating === 'good') {
      c.step += 1;
      if (c.step >= LEARN_STEPS.length) graduate(1);
      else c.due = now + LEARN_STEPS[c.step];
    } else {
      graduate(4); // easy: tốt nghiệp ngay
    }
  } else if (c.stage === 'relearn') {
    if (rating === 'again') c.due = now + 5 * MIN;
    else if (rating === 'hard') c.due = now + 15 * MIN;
    else if (rating === 'good') graduate(Math.max(1, c.interval));
    else graduate(Math.max(2, c.interval * 1.5));
  } else {
    // review
    if (rating === 'again') {
      c.lapses += 1;
      c.ease = clampEase(c.ease - 0.2);
      c.stage = 'relearn';
      c.step = 0;
      c.interval = Math.max(1, Math.round(c.interval * 0.4));
      c.due = now + 10 * MIN;
    } else if (rating === 'hard') {
      c.ease = clampEase(c.ease - 0.15);
      graduate(Math.min(MAX_INTERVAL, Math.max(1, c.interval * 1.2)));
    } else if (rating === 'good') {
      graduate(Math.min(MAX_INTERVAL, Math.max(1, c.interval * c.ease)));
    } else {
      c.ease = clampEase(c.ease + 0.15);
      graduate(Math.min(MAX_INTERVAL, Math.max(4, c.interval * c.ease * 1.3)));
    }
  }
  return c;
}

/** Nhãn hiển thị cho từng nút đánh giá: lần ôn kế tiếp cách bao lâu. */
export function previewIntervals(card, now = Date.now()) {
  const fmt = (ms) => {
    const d = (ms - now) / DAY;
    if (d < 1 / 24) return `${Math.max(1, Math.round((ms - now) / MIN))} phút`;
    if (d < 1) return `${Math.round(((ms - now) / MIN / 60) * 10) / 10} giờ`;
    if (d < 30) return `${Math.round(d)} ngày`;
    if (d < 365) return `${Math.round(d / 30)} tháng`;
    return `${Math.round((d / 365) * 10) / 10} năm`;
  };
  const out = {};
  for (const r of ['again', 'hard', 'good', 'easy']) out[r] = fmt(review(card, r, now).due);
  return out;
}

/** Điểm thành thạo 0..1 của một thẻ - dùng cho biểu đồ và cho việc chọn thẻ. */
export function mastery(card) {
  if (!card || card.stage === 'new' || !card.reps) return 0;
  const byInterval = Math.min(1, Math.log2(1 + card.interval) / Math.log2(1 + 30)); // 30 ngày ≈ thành thạo
  const byScore = card.lastScore == null ? 0.5 : card.lastScore / 100;
  return Math.max(0, Math.min(1, 0.6 * byInterval + 0.4 * byScore));
}

export const isDue = (card, now = Date.now()) => card.stage !== 'new' && card.due <= now;
export const isLeech = (card) => (card.lapses || 0) >= 4;

/**
 * Xếp hàng đợi cho một buổi học.
 * - Thẻ đến hạn trước, thẻ mới sau (giới hạn theo cấu hình).
 * - Xen kẽ chủ đề (interleaving): tránh hai câu cùng chủ đề đứng liền nhau.
 */
export function buildQueue(questions, cards, opts = {}) {
  const now = opts.now ?? Date.now();
  const maxNew = opts.maxNew ?? 8;
  const maxReview = opts.maxReview ?? 40;
  const topicFilter = opts.topic || null;

  const pool = topicFilter ? questions.filter((q) => q.topic === topicFilter) : questions;

  const due = [];
  const fresh = [];
  for (const q of pool) {
    const c = cards[q.id] || newCard(q.id);
    if (c.stage === 'new') fresh.push(q);
    else if (c.due <= now) due.push({ q, due: c.due });
  }
  due.sort((a, b) => a.due - b.due);

  const picked = [...due.slice(0, maxReview).map((d) => d.q), ...fresh.slice(0, maxNew)];
  return interleave(picked);
}

/** Xáo sao cho các câu cùng chủ đề không dính liền nhau (khó hơn ⇒ nhớ tốt hơn). */
export function interleave(items) {
  const rest = [...items];
  // xáo nhẹ trước để không luôn theo thứ tự số
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  const out = [];
  while (rest.length) {
    let idx = rest.findIndex((x) => !out.length || x.topic !== out[out.length - 1].topic);
    if (idx === -1) idx = 0;
    out.push(rest.splice(idx, 1)[0]);
  }
  return out;
}

/* ------------------------------------------------------------------ *
 * Chấm nháp không cần LLM: so khớp từ khóa của từng ý trong rubric.
 * Chỉ dùng để GỢI Ý cho người học tự chấm, không thay được chấm ngữ nghĩa.
 * ------------------------------------------------------------------ */

const STOP = new Set(`và của là các một những cho khi thì mà với được có không nên phải trong ra vào từ đến này đó nếu vì do như hoặc hay cũng chỉ rất nhiều ít theo về trên dưới sau trước bằng để nêu được nói cần tại sao gì nào đâu bao nhiêu hãy ví dụ vd tức chính đang sẽ đã bị bởi nhưng còn nữa vẫn ai
the and for with that this from you your are was not but can will has have how what when why which where all any our its into out over under more less than then them they` .split(/\s+/));

export function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const keywords = (text) => {
  const words = normalize(text).split(' ').filter((w) => w.length > 2 && !STOP.has(w));
  return [...new Set(words)];
};

/** Chấm nháp: trả về cấu trúc giống kết quả của LLM để giao diện dùng chung. */
export function localGrade(question, answer) {
  const ansWords = new Set(normalize(answer).split(' '));
  const ansText = ' ' + normalize(answer) + ' ';
  let total = 0;
  let earned = 0;

  const points = question.points.map((p, i) => {
    const kws = keywords(p.text);
    const w = p.w || 1;
    total += w;
    let hits = 0;
    for (const k of kws) {
      if (ansWords.has(k) || ansText.includes(' ' + k + ' ')) hits++;
    }
    const ratio = kws.length ? hits / kws.length : 0;
    let status = 'miss';
    if (ratio >= 0.45) status = 'hit';
    else if (ratio >= 0.2) status = 'partial';
    earned += status === 'hit' ? w : status === 'partial' ? w / 2 : 0;
    return {
      id: p.id || 'p' + (i + 1),
      status,
      evidence: '',
      note: `Khớp ${hits}/${kws.length} từ khóa của ý này (ước lượng máy móc, bạn tự soát lại).`,
    };
  });

  const overall = Math.round((earned / (total || 1)) * 100);
  return {
    overall,
    verdict: overall >= 90 ? 'excellent' : overall >= 70 ? 'good' : overall >= 50 ? 'partial' : overall > 0 ? 'weak' : 'blank',
    points,
    misconceptions: [],
    missing_summary: 'Đây là ước lượng theo từ khóa, không hiểu ngữ nghĩa. Hãy đọc đáp án mẫu và tự soát từng ý.',
    feedback: 'Chưa bật chấm bằng LLM nên hệ thống chỉ so khớp từ khóa. Bạn hãy tự đánh dấu từng ý bên dưới cho chính xác.',
    upgrade: 'Đọc kỹ phần "Vì sao quan trọng" rồi thử diễn đạt lại đáp án bằng lời của mình.',
    suggested_rating: overall < 50 ? 'again' : overall < 70 ? 'hard' : overall < 90 ? 'good' : 'easy',
    offline: true,
  };
}

/** Tính lại điểm khi người học tự sửa trạng thái từng ý. */
export function scoreFromPoints(question, points) {
  let total = 0;
  let earned = 0;
  question.points.forEach((p, i) => {
    const w = p.w || 1;
    total += w;
    const st = points[i]?.status;
    earned += st === 'hit' ? w : st === 'partial' ? w / 2 : 0;
  });
  return Math.round((earned / (total || 1)) * 100);
}

export const ratingFromScore = (s) => (s < 50 ? 'again' : s < 70 ? 'hard' : s < 90 ? 'good' : 'easy');
