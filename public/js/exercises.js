// Sinh các dạng bài tập khác nhau TỪ CHÍNH nội dung 120 câu — không cần LLM,
// nên chạy tức thì và miễn phí.
//
// Vì sao cần nhiều dạng đề, không chỉ tự luận:
// - Mỗi dạng đo một thứ khác nhau. Tự luận đo khả năng TỰ TẠO RA câu trả lời;
//   trắc nghiệm và nối cặp đo khả năng PHÂN BIỆT những khái niệm dễ lẫn; đúng/sai
//   đánh thẳng vào hiểu lầm; sắp xếp đo hiểu về trình tự và nhân quả.
// - Nhận ra (recognition) dễ hơn nhớ lại (recall), nên các dạng này KHÔNG thay được
//   phần tự luận. Chúng là bài khởi động, bài đổi món, và là cách luyện phân biệt.
// - Mồi nhiễu (distractor) cố tình lấy từ CÂU KHÁC CÙNG CHỦ ĐỀ — đó mới là chỗ
//   người học hay lẫn, và phân biệt được chúng chính là hiểu.
import { pickBlanks, classifyPoint, pidOf } from './drills.js';
import { normalize } from './srs.js';

export const EX_TYPES = ['tf', 'mcq', 'match', 'cloze', 'order'];

export const EX_META = {
  tf: { name: 'Đúng hay Sai', icon: '⚖️', do: 'Bắt đúng chỗ hiểu lệch' },
  mcq: { name: 'Trắc nghiệm', icon: '🔘', do: 'Phân biệt khái niệm dễ lẫn' },
  match: { name: 'Nối cặp', icon: '🔗', do: 'Gắn khái niệm với ý nghĩa của nó' },
  cloze: { name: 'Điền từ', icon: '✏️', do: 'Nhớ lại thuật ngữ chịu lực' },
  order: { name: 'Sắp xếp', icon: '🔢', do: 'Hiểu trình tự và nhân quả' },
  scenario: { name: 'Tình huống', icon: '🧩', do: 'Dùng kiến thức vào ca thật' },
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const trim = (s, n = 110) => (s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s);

/* ------------------------------------------------------------- Đúng / Sai */
/**
 * Nguồn quý nhất: trường `traps` của mỗi câu — chúng vốn đã là những phát biểu
 * SAI mà người học hay mắc. Trộn với `points` (phát biểu ĐÚNG) là ra ngay một
 * bộ đúng/sai đánh trúng hiểu lầm thật, không phải câu hỏi mẹo.
 */
export function makeTF(questions) {
  const laSai = Math.random() < 0.5;
  const pool = questions.filter((q) => (laSai ? (q.traps || []).length : q.points.length));
  if (!pool.length) return null;
  const q = pick(pool);
  const cau = laSai ? pick(q.traps) : pick(q.points).text;
  return {
    type: 'tf',
    qid: q.id,
    question: q,
    prompt: 'Nhận định sau **đúng** hay **sai**?',
    statement: cau,
    answer: !laSai,
    explain: laSai
      ? `Sai. Đây là một bẫy thường gặp ở câu ${q.id} (${q.topicName}).`
      : `Đúng. Đây là một ý trong đáp án của câu ${q.id} (${q.topicName}).`,
    why: 'Hiểu sai nguy hiểm hơn hiểu thiếu vì bạn không biết mình đang sai. Dạng này đánh thẳng vào các bẫy phổ biến.',
  };
}

/* ------------------------------------------------------------ Trắc nghiệm */
/**
 * Hai kiểu:
 *  - "Ý nào KHÔNG thuộc câu này?"   -> buộc phân biệt với câu khác cùng chủ đề
 *  - "Ý nào là ý cốt lõi của câu?"  -> buộc nhận ra đâu là trọng tâm, đâu là phụ
 */
export function makeMCQ(questions) {
  const q = pick(questions.filter((x) => x.points.length >= 3));
  if (!q) return null;
  const cungChuDe = questions.filter((x) => x.topic === q.topic && x.id !== q.id);
  const khac = (cungChuDe.length ? cungChuDe : questions.filter((x) => x.id !== q.id))
    .flatMap((x) => x.points.map((p) => ({ text: p.text, from: x })));
  if (!khac.length) return null;

  if (Math.random() < 0.5) {
    // kiểu 1: tìm ý lạc
    const dung = shuffle(q.points).slice(0, 3).map((p) => ({ text: p.text, correct: false }));
    const lac = pick(khac);
    const options = shuffle([...dung, { text: lac.text, correct: true, from: lac.from }]);
    return {
      type: 'mcq',
      qid: q.id,
      question: q,
      prompt: `Trong các ý dưới đây, ý nào **KHÔNG** thuộc đáp án của câu:\n\n> ${q.q}`,
      options,
      explain: `Ý lạc là ý của câu ${lac.from.id} — "${trim(lac.from.q, 70)}". Ba ý còn lại đều thuộc câu ${q.id}.`,
      why: 'Nhận ra ý của câu khác nghĩa là bạn phân biệt được hai khái niệm gần nhau — thứ mà đọc lại nhiều lần không tạo ra được.',
    };
  }
  // kiểu 2: đâu là ý cốt lõi
  const cot = q.points.reduce((a, b) => ((b.w || 1) > (a.w || 1) ? b : a), q.points[0]);
  const nhieu = shuffle(khac).slice(0, 3).map((x) => ({ text: x.text, correct: false, from: x.from }));
  const options = shuffle([{ text: cot.text, correct: true }, ...nhieu]);
  return {
    type: 'mcq',
    qid: q.id,
    question: q,
    prompt: `Đâu là ý **cốt lõi** của câu:\n\n> ${q.q}`,
    options,
    explain: `Ý cốt lõi là ý có trọng số cao nhất trong dàn bài — thiếu nó thì câu trả lời sai bản chất, còn thiếu các ý khác chỉ là chưa đầy đủ.`,
    why: 'Biết đâu là trọng tâm quan trọng hơn nhớ hết mọi ý. Khi bí, bạn vẫn trả lời trúng phần cốt lõi.',
  };
}

/* --------------------------------------------------------------- Nối cặp */
/**
 * Nối "khái niệm" với "neo trí nhớ" của nó. Cả hai vế đều lấy trong CÙNG một
 * chủ đề nên các phương án đủ gần nhau để phải thực sự phân biệt.
 */
export function makeMatch(questions, topics) {
  const coHook = questions.filter((q) => q.hook);
  const theoChuDe = new Map();
  for (const q of coHook) {
    if (!theoChuDe.has(q.topic)) theoChuDe.set(q.topic, []);
    theoChuDe.get(q.topic).push(q);
  }
  const duocPhep = [...theoChuDe.values()].filter((arr) => arr.length >= 4);
  if (!duocPhep.length) return null;
  const nhom = shuffle(pick(duocPhep)).slice(0, 4);
  return {
    type: 'match',
    qid: nhom[0].id,
    question: nhom[0],
    prompt: 'Nối mỗi câu hỏi với **neo trí nhớ** đúng của nó:',
    left: nhom.map((q) => ({ id: q.id, text: trim(q.q, 90) })),
    right: shuffle(nhom.map((q) => ({ id: q.id, text: q.hook }))),
    explain: 'Neo trí nhớ là câu tóm gọn bản chất. Nối đúng nghĩa là bạn nắm được ý cốt lõi của cả nhóm khái niệm gần nhau.',
    why: 'Nối cặp buộc bạn so sánh nhiều khái niệm cùng lúc — cách nhanh nhất để lộ ra chỗ đang lẫn.',
  };
}

/* --------------------------------------------------------------- Điền từ */
export function makeCloze(questions) {
  for (let i = 0; i < 25; i++) {
    const q = pick(questions);
    const pt = pick(q.points);
    const { masked, answers } = pickBlanks(pt.text);
    if (answers.length >= 2) {
      return {
        type: 'cloze',
        qid: q.id,
        question: q,
        prompt: `Điền các thuật ngữ còn thiếu (một ý trong câu **${q.id}**):`,
        context: q.q,
        masked,
        answers,
        explain: `Ý đầy đủ: ${pt.text}`,
        why: 'Thuật ngữ là chỗ bám của cả câu trả lời. Nhớ đúng từ khóa thì phần diễn giải tự bật ra.',
      };
    }
  }
  return null;
}

/* ------------------------------------------------------------- Sắp xếp */
export function makeOrder(questions) {
  const coSequence = questions.filter((q) => Array.isArray(q.sequence) && q.sequence.length >= 3);
  if (!coSequence.length) return null;
  const q = pick(coSequence);
  const dung = q.sequence;
  let xao = shuffle(dung);
  if (xao.join() === dung.join()) xao = [...dung].reverse();
  return {
    type: 'order',
    qid: q.id,
    question: q,
    prompt: `Sắp xếp lại cho đúng thứ tự (câu **${q.id}**):\n\n> ${q.q}`,
    items: xao,
    answer: dung,
    explain: `Thứ tự đúng: ${dung.join(' → ')}`,
    why: 'Thứ tự trong các quy trình này không tùy tiện — mỗi bước tạo ra đầu vào cho bước sau. Sắp đúng nghĩa là hiểu quan hệ nhân quả.',
  };
}

/* ----------------------------------------------------------- trộn đề thi */
const MAKERS = { tf: makeTF, mcq: makeMCQ, match: makeMatch, cloze: makeCloze, order: makeOrder };

/**
 * Trộn một bộ bài tập nhiều dạng. Ưu tiên các câu người học ĐÃ GẶP
 * (ôn cái đã học hiệu quả hơn nhận thêm cái mới), nhưng vẫn chừa chỗ cho câu mới.
 */
export function buildMixedSet(questions, { count = 10, seen = null, types = EX_TYPES } = {}) {
  const daGap = seen ? questions.filter((q) => seen(q.id)) : [];
  const nguon = daGap.length >= 8 ? daGap : questions;
  const out = [];
  const dungRoi = new Set();
  let guard = 0;

  while (out.length < count && guard++ < count * 12) {
    const type = types[out.length % types.length];
    const item = MAKERS[type]?.(nguon, null);
    if (!item) continue;
    const key = `${item.type}:${item.qid}:${item.statement || item.masked || ''}`;
    if (dungRoi.has(key)) continue;
    dungRoi.add(key);
    out.push(item);
  }
  return out;
}

/* ------------------------------------------------------------- chấm điểm */
export function checkExercise(item, response) {
  switch (item.type) {
    case 'tf': {
      const ok = response === item.answer;
      return { ok, score: ok ? 100 : 0, feedback: item.explain };
    }
    case 'mcq': {
      const chon = item.options[response];
      const ok = Boolean(chon?.correct);
      return {
        ok,
        score: ok ? 100 : 0,
        feedback: ok ? item.explain : `Chưa đúng. ${item.explain}`,
      };
    }
    case 'cloze': {
      let dung = 0;
      const detail = item.answers.map((ans, i) => {
        const got = normalize(response?.[i] || '');
        const want = normalize(ans);
        const hit = got === want || (got.length >= 4 && (want.startsWith(got) || got.startsWith(want)));
        if (hit) dung += 1;
        return { want: ans, got: response?.[i] || '', ok: hit };
      });
      const score = Math.round((dung / item.answers.length) * 100);
      return { ok: score >= 60, score, feedback: `Đúng ${dung}/${item.answers.length} từ. ${item.explain}`, detail };
    }
    case 'match': {
      let dung = 0;
      const detail = item.left.map((l) => {
        const hit = response?.[l.id] === l.id;
        if (hit) dung += 1;
        return { want: l.text, ok: hit };
      });
      const score = Math.round((dung / item.left.length) * 100);
      return { ok: score >= 75, score, feedback: `Nối đúng ${dung}/${item.left.length} cặp.`, detail };
    }
    case 'order': {
      const dung = (response || []).filter((x, i) => x === item.answer[i]).length;
      const score = Math.round((dung / item.answer.length) * 100);
      return { ok: score === 100, score, feedback: score === 100 ? 'Đúng thứ tự.' : item.explain };
    }
    default:
      return { ok: false, score: 0, feedback: '' };
  }
}

export { classifyPoint, pidOf };
