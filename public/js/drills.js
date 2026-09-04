// Bài luyện nhỏ cho những ý còn hụt.
//
// Ý tưởng nền: với câu tự luận dài, đích đến KHÔNG phải thuộc lòng mà là
// dựng lại được KHUNG XƯƠNG. Rubric của mỗi câu chính là khung đó, nên bài
// luyện được xây thẳng trên từng ý của rubric:
//   - chỉ luyện đúng ý bị hụt, không bắt viết lại cả bài (tránh nản, tránh phí)
//   - chia nhỏ rồi ghép dần: nhận ra -> điền khuyết -> tự viết một ý -> giảng lại
//   - mỗi lần luyện lại bỏ bớt một tầng giàn giáo (fading)
//   - rải theo ba nhịp: ngay lúc còn nóng -> cuối buổi -> buổi sau
import { state, save } from './store.js';
import { normalize } from './srs.js';

export const MIN = 60 * 1000;
export const DAY = 24 * 60 * MIN;

export const NGUONG_LUYEN = 80; // dưới ngưỡng này thì mở phần luyện tập

export const pk = (qid, pid) => `${qid}:${pid}`;
export const pidOf = (pt, i) => pt.id || 'p' + (i + 1);

const emptyStat = () => ({ h: 0, p: 0, m: 0, last: null, t: 0, d: 0 });

export const getStat = (qid, pid) => state.data.pointStats?.[pk(qid, pid)] || emptyStat();
function setStat(qid, pid, st) {
  state.data.pointStats = state.data.pointStats || {};
  state.data.pointStats[pk(qid, pid)] = st;
}

/* ------------------------------------------------------- ghi nhận kết quả */
/**
 * Cập nhật thống kê từng ý sau khi chấm cả câu, rồi xếp lịch luyện cho ý còn hụt.
 * Trả về danh sách ý yếu (đã sắp theo mức độ cần luyện).
 */
export function recordGrade(question, gradePoints, overall) {
  const weak = [];
  question.points.forEach((pt, i) => {
    const pid = pidOf(pt, i);
    const st = { ...getStat(question.id, pid) };
    const status = gradePoints?.[i]?.status || 'miss';
    if (status === 'hit') st.h += 1;
    else if (status === 'partial') st.p += 1;
    else st.m += 1;
    st.last = status;
    st.t = Date.now();
    setStat(question.id, pid, st);
    if (status !== 'hit') weak.push({ idx: i, pid, point: pt, status, st });
  });

  // Ý bị hụt nhiều lần thì vẫn luyện kể cả khi tổng điểm đã cao.
  const dai = question.points.length >= 5;
  const canLuyen = overall < NGUONG_LUYEN || weak.some((w) => w.st.m >= 2);
  if (!canLuyen || !weak.length) return [];

  // miss nặng hơn partial; ý hụt nhiều lần được ưu tiên
  weak.sort((a, b) => (b.st.m * 2 + (b.status === 'miss' ? 3 : 1)) - (a.st.m * 2 + (a.status === 'miss' ? 3 : 1)));
  const chon = weak.slice(0, dai ? 2 : 1); // câu dài luyện 2 ý, câu ngắn 1 ý

  state.data.drills = state.data.drills || [];
  for (const w of chon) queueDrill(question.id, w.pid, 'now');
  // Câu dài mà hụt từ 2 ý trở lên: luyện khung xương trước đã
  if (dai && weak.length >= 2) queueDrill(question.id, '__skeleton__', 'now');
  return chon;
}

function queueDrill(qid, pid, stage, due = Date.now()) {
  state.data.drills = state.data.drills || [];
  const found = state.data.drills.find((d) => d.qid === qid && d.pid === pid);
  if (found) {
    found.stage = stage;
    found.due = due;
    return found;
  }
  const d = { qid, pid, stage, due, tries: 0 };
  state.data.drills.push(d);
  return d;
}

/** Lấy các bài luyện đang chờ ở một nhịp nhất định. */
export function pendingDrills(stage, now = Date.now(), limit = 6) {
  return (state.data.drills || [])
    .filter((d) => d.stage === stage && d.due <= now)
    .sort((a, b) => a.due - b.due)
    .slice(0, limit);
}

export const countPending = (stage, now = Date.now()) =>
  (state.data.drills || []).filter((d) => d.stage === stage && d.due <= now).length;

/**
 * Ghi kết quả một lần luyện và đẩy sang nhịp tiếp theo.
 *   đạt  : now -> cuối buổi -> buổi sau -> xong (bỏ khỏi hàng đợi)
 *   chưa : giữ nguyên nhịp, hẹn lại sau vài phút
 */
export function completeDrill(qid, pid, passed) {
  state.data.drills = state.data.drills || [];
  const d = state.data.drills.find((x) => x.qid === qid && x.pid === pid);
  if (pid !== '__skeleton__') {
    const st = { ...getStat(qid, pid) };
    st.d = (st.d || 0) + 1;
    if (passed) st.h += 1;
    setStat(qid, pid, st);
  }
  if (!d) return;
  d.tries += 1;
  if (!passed) {
    d.due = Date.now() + 3 * MIN; // chưa đạt: gặp lại ngay trong buổi
    save();
    return;
  }
  if (d.stage === 'now') {
    d.stage = 'session';
    d.due = Date.now() + 6 * MIN; // đủ xa để không còn nằm trong trí nhớ tạm
  } else if (d.stage === 'session') {
    d.stage = 'next';
    d.due = Date.now() + DAY;
  } else {
    state.data.drills = state.data.drills.filter((x) => x !== d); // đã ngấm
  }
  save();
}

/* ------------------------------------------------------- chọn kiểu bài luyện */
/**
 * Bậc thang giàn giáo: mỗi lần luyện lại ý đó thì bớt trợ giúp đi một tầng.
 * 0 lần: nhận ra   1 lần: điền khuyết   2 lần: tự viết   3+: giảng lại
 */
export function pickType(question, pid) {
  if (pid === '__skeleton__') return 'skeleton';
  const st = getStat(question.id, pid);
  const d = st.d || 0;
  if (d === 0) return 'recognize';
  if (d === 1) return 'cloze';
  if (d === 2) return 'point';
  return 'teach';
}

export const needsLLM = (type) => ['point', 'teach', 'skeleton'].includes(type);

/* ------------------------------------------------------------ dựng bài luyện */
const STOP_RAW = `và của là các một những cho khi thì mà với được có không nên phải trong ra vào từ đến này đó nếu vì do như hoặc hay cũng chỉ rất nhiều ít theo về trên dưới sau trước bằng để nêu nói cần tại sao gì nào đâu bao nhiêu hãy ví dụ tức chính đang sẽ đã bị bởi nhưng còn nữa vẫn ai mình bạn thể việc cách phần nhất hơn cùng đều mỗi thêm làm dùng`;

const STOP = new Set(normalize(STOP_RAW).split(' '));

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Một số tiếng Việt viết không dấu trông y hệt từ tiếng Anh ("tin", "gian", "chia"),
// che chúng sẽ cắt đôi từ ghép ("thời ___", "thông ___"). Loại thẳng nhóm này.
const AM_TIET_VIET = new Set(`tin gian chia quy sinh thang trong dung cung cach phan tang giam mang thanh chinh khong hang danh nhanh minh tinh hinh binh thong xuong luong tuong phuong ngan chung dan can lam ban tren duoi ngay nam thoi tien hoc gap gia cao thap muc noi loi cau tra bam sat`.split(/\s+/));

// "context", "top-k", "max_tokens", "P95", "0.9", "60%"… - che một chỗ là đủ nghĩa,
// và không có nguy cơ cắt đôi từ ghép tiếng Việt như "chứng ___ minh".
const isTerm = (w) => {
  if (/^\d[\d.,%]*$/.test(w)) return true;                    // số: 1.200 · 60% · 0..1
  if (!/^[A-Za-z][A-Za-z0-9_@.%-]*$/.test(w)) return false;   // có dấu tiếng Việt -> bỏ
  if (AM_TIET_VIET.has(w.toLowerCase())) return false;
  return w.length >= 5                                        // context, claim, token…
    || /[0-9_@.%-]/.test(w)                                   // top-k, max_tokens, P95
    || /[A-Z]/.test(w.slice(1));                              // RAG, TTFT, ReAct
};

/**
 * Chọn 2–3 chỗ "chịu lực" để che đi — CHỈ che thuật ngữ và con số.
 * Tiếng Việt không tách từ được bằng khoảng trắng (một "từ" thường gồm 2 tiếng),
 * nên che bừa sẽ tạo ra những chỗ trống vô nghĩa. Ý nào không đủ thuật ngữ để che
 * thì trả về rỗng, và bài luyện tự chuyển sang kiểu "tự viết lại một ý".
 */
export function pickBlanks(text, max = 3) {
  const parts = text.split(/(\s+)/); // giữ cả khoảng trắng để ghép lại nguyên dạng
  const head = (w) => (w.match(/^[\p{L}\p{N}_@.%-]+/u) || [''])[0]; // cắt tại dấu câu đầu tiên
  const cand = [];

  for (let i = 0; i < parts.length; i += 2) {
    const w = head(parts[i]);
    if (!w || !isTerm(w)) continue;
    if (STOP.has(normalize(w))) continue;
    cand.push({ i, w, score: w.length + (/[A-Za-z]/.test(w) ? 6 : 0) });
  }
  if (cand.length < 2) return { masked: text, answers: [] }; // ít quá thì không bõ

  cand.sort((a, b) => b.score - a.score);
  const chosen = [];
  for (const c of cand) {
    if (chosen.length >= max) break;
    if (chosen.every((x) => x.w.toLowerCase() !== c.w.toLowerCase() && Math.abs(x.i - c.i) > 2)) chosen.push(c);
  }
  chosen.sort((a, b) => a.i - b.i);

  const answers = chosen.map((c) => c.w);
  // thay từ cuối lên đầu để chỉ số không bị lệch; giữ nguyên dấu câu đi kèm
  [...chosen].reverse().forEach((c) => {
    const n = chosen.indexOf(c) + 1;
    parts[c.i] = parts[c.i].replace(c.w, `___${n}___`);
  });
  return { masked: parts.join(''), answers };
}

/** Dựng một bài luyện hoàn chỉnh để giao diện hiển thị. */
export function buildDrill(question, pid, allQuestions) {
  const type = pickType(question, pid);
  if (type === 'skeleton') {
    return {
      type, qid: question.id, pid, question,
      title: 'Dựng lại khung xương',
      prompt: `Câu này cần **${question.points.length} ý**. Hãy gọi tên từng ý bằng 3–5 từ, mỗi ý một dòng — chưa cần viết đầy đủ.`,
      why: 'Với câu dài, nhớ được khung quan trọng hơn nhớ câu chữ. Có khung rồi thì phần diễn đạt tự bật ra.',
    };
  }

  const idx = question.points.findIndex((pt, i) => pidOf(pt, i) === pid);
  const point = question.points[idx];
  if (!point) return null;

  if (type === 'recognize') {
    const sameQ = question.points.filter((_, i) => i !== idx);
    const dung = [point, ...(sameQ.length ? [sameQ[Math.floor(Math.random() * sameQ.length)]] : [])];
    // Mồi nhiễu lấy từ câu khác, ưu tiên cùng chủ đề để buộc phân biệt cho kỹ
    const pool = allQuestions
      .filter((q) => q.id !== question.id)
      .sort((a, b) => (a.topic === question.topic ? -1 : 1) - (b.topic === question.topic ? -1 : 1))
      .flatMap((q) => q.points.map((p) => ({ ...p, from: q.id })));
    const nhieu = shuffle(pool.slice(0, 40)).slice(0, 3);
    const options = shuffle([
      ...dung.map((p) => ({ text: p.text, correct: true })),
      ...nhieu.map((p) => ({ text: p.text, correct: false })),
    ]);
    return {
      type, qid: question.id, pid, question, point, idx,
      title: 'Nhận ra ý đúng',
      prompt: 'Ý nào dưới đây thuộc đáp án của câu này? (chọn tất cả ý đúng)',
      options,
      why: 'Bước dễ nhất: chỉ cần nhận ra, chưa cần tự nghĩ ra. Các lựa chọn sai lấy từ câu khác cùng chủ đề để bạn tập phân biệt.',
    };
  }

  if (type === 'cloze') {
    const { masked, answers } = pickBlanks(point.text);
    if (!answers.length) return buildDrillOfType(question, pid, 'point');
    return {
      type, qid: question.id, pid, question, point, idx,
      title: 'Điền từ chịu lực',
      prompt: 'Điền các từ còn thiếu trong ý này:',
      masked, answers,
      why: 'Câu đã có sẵn, bạn chỉ phải lôi ra đúng những từ mang nghĩa. Vẫn là nhớ lại chủ động, nhưng nhẹ hơn viết cả ý.',
    };
  }

  if (type === 'point') {
    const cue = point.text.split(/[\s:,–—-]+/).slice(0, 3).join(' ');
    return {
      type, qid: question.id, pid, question, point, idx,
      title: 'Tự viết lại một ý',
      prompt: `Ý này bắt đầu bằng **“${cue}…”**. Viết đầy đủ ý đó bằng lời của bạn, 1–2 câu.`,
      why: 'Viết một ý là việc làm được ngay; viết cả bài thì không. Nhớ từng viên gạch trước, ghép lại sau.',
    };
  }

  return {
    type: 'teach', qid: question.id, pid, question, point, idx,
    title: 'Giảng lại cho người mới',
    prompt: 'Giải thích ý này cho một người mới vào nghề trong 2 câu, kèm **một ví dụ của riêng bạn**.',
    why: 'Giảng được cho người khác là mức hiểu sâu nhất. Ví dụ tự nghĩ ra sẽ neo ý này vào trí nhớ của riêng bạn.',
  };
}

/** Ép dựng một kiểu cụ thể (dùng khi kiểu mặc định không khả thi). */
function buildDrillOfType(question, pid, type) {
  const idx = question.points.findIndex((pt, i) => pidOf(pt, i) === pid);
  const point = question.points[idx];
  const cue = point.text.split(/[\s:,–—-]+/).slice(0, 3).join(' ');
  return {
    type, qid: question.id, pid, question, point, idx,
    title: 'Tự viết lại một ý',
    prompt: `Ý này bắt đầu bằng **“${cue}…”**. Viết đầy đủ ý đó bằng lời của bạn, 1–2 câu.`,
    why: 'Viết một ý là việc làm được ngay; viết cả bài thì không.',
  };
}

/* ------------------------------------------------------- chấm phần offline */
export function checkRecognize(drill, selectedIdx) {
  const chosen = new Set(selectedIdx);
  let dung = 0;
  let sai = 0;
  drill.options.forEach((o, i) => {
    if (o.correct && chosen.has(i)) dung += 1;
    if (!o.correct && chosen.has(i)) sai += 1;
  });
  const tong = drill.options.filter((o) => o.correct).length;
  const score = Math.max(0, Math.round(((dung - sai) / tong) * 100));
  return {
    score,
    ok: score >= 60,
    feedback: sai
      ? `Bạn chọn đúng ${dung}/${tong} ý, nhưng chọn nhầm ${sai} ý của câu khác.`
      : `Chọn đúng ${dung}/${tong} ý.`,
  };
}

export function checkCloze(drill, inputs) {
  let dung = 0;
  const detail = drill.answers.map((ans, i) => {
    const got = normalize(inputs[i] || '');
    const want = normalize(ans);
    const ok = got === want || (got.length >= 4 && (want.startsWith(got) || got.startsWith(want)));
    if (ok) dung += 1;
    return { want: ans, got: inputs[i] || '', ok };
  });
  const score = Math.round((dung / drill.answers.length) * 100);
  return { score, ok: score >= 60, feedback: `Đúng ${dung}/${drill.answers.length} từ.`, detail };
}

/* ------------------------------------------- phân loại ý để rút ra thói quen */
const KINDS = [
  { id: 'khac-phuc', label: 'Cách khắc phục / cải thiện', re: /cải thiện|khắc phục|cách sửa|giải pháp|xử lý|cách làm|hướng sửa|nên làm/i },
  { id: 'danh-doi', label: 'Đánh đổi / hạn chế / chi phí', re: /đánh đổi|hạn chế|nhược điểm|rủi ro|chi phí|cái giá|tốn|nhược|mặt trái/i },
  { id: 'co-che', label: 'Cơ chế / cách tính', re: /cách tính|công thức|cơ chế|quy trình|các bước|tính bằng|chia|nhân|tỉ lệ/i },
  { id: 'dieu-kien', label: 'Khi nào dùng / điều kiện', re: /khi nào|điều kiện|chỉ dùng|áp dụng khi|hợp với|nên dùng|phù hợp/i },
  { id: 'phan-biet', label: 'Phân biệt / ranh giới', re: /phân biệt|khác|không phải|ranh giới|≠|thay vì|nhầm/i },
  { id: 'vi-du', label: 'Ví dụ / minh họa cụ thể', re: /ví dụ|minh họa|nêu được ví dụ|cụ thể/i },
  { id: 'thuc-hanh', label: 'Lưu ý triển khai thực tế', re: /production|triển khai|thực tế|vận hành|lưu ý|thực hành/i },
];
const KIND_DEFAULT = { id: 'dinh-nghia', label: 'Định nghĩa / bản chất' };

export function classifyPoint(text) {
  return KINDS.find((k) => k.re.test(text)) || KIND_DEFAULT;
}

/** Thống kê: bạn hay bỏ sót loại ý nào? */
export function missedKinds(questions) {
  const acc = new Map();
  for (const q of questions) {
    q.points.forEach((pt, i) => {
      const st = getStat(q.id, pidOf(pt, i));
      if (!st.t) return;
      const k = classifyPoint(pt.text);
      const cur = acc.get(k.id) || { ...k, seen: 0, missed: 0 };
      cur.seen += st.h + st.p + st.m;
      cur.missed += st.m + st.p * 0.5;
      acc.set(k.id, cur);
    });
  }
  return [...acc.values()]
    .filter((k) => k.seen >= 3)
    .map((k) => ({ ...k, rate: k.missed / k.seen }))
    .sort((a, b) => b.rate - a.rate);
}
