// Thước chấm dùng chung cho cả server (llm.mjs) lẫn giao diện, để hai bên
// không bao giờ lệch nhau.
//
// Triết lý: đo HIỂU, không đo độ đầy đủ.
// - Thang SOLO (Biggs & Collis) xếp hạng CẤU TRÚC câu trả lời: "liệt kê đủ ý
//   nhưng rời rạc" đứng THẤP HƠN "nêu ít ý hơn nhưng nối được quan hệ".
// - Bốn trục lấy từ các mặt của "hiểu" trong Understanding by Design:
//   đúng bản chất · giải thích được cơ chế · nối được các ý · vận dụng được.
//
// LLM chỉ xếp mức và chấm trục; điểm số do hàm dưới đây tính, nên mọi bài đều
// được đo bằng cùng một thước.

export const LEVELS = ['lac', 'roi-rac', 'ket-noi', 'van-dung'];

// "Rời rạc" vẫn là một bài ĐÚNG - chỉ là chưa nói được vì sao. Nó phải nằm ở
// vùng "được", không phải vùng trượt; nếu không thì lại thành một kiểu khắt khe khác.
export const BASE_BY_LEVEL = { lac: 15, 'roi-rac': 66, 'ket-noi': 80, 'van-dung': 93 };

export const LEVEL_LABEL = {
  lac: {
    name: 'Chưa trúng',
    desc: 'Câu trả lời chưa đúng trọng tâm, hoặc sai ở chỗ cốt lõi.',
    tone: 'bad',
  },
  'roi-rac': {
    name: 'Rời rạc',
    desc: 'Các ý đúng, nhưng còn đứng riêng lẻ — chưa nối vào nhau và chưa nói được vì sao. Đây là mức "nhớ".',
    tone: 'warn',
  },
  'ket-noi': {
    name: 'Kết nối',
    desc: 'Bạn nối được các ý và giải thích được lý do. Đây đã là hiểu thật.',
    tone: 'accent',
  },
  'van-dung': {
    name: 'Vận dụng',
    desc: 'Bạn dùng được kiến thức vào tình huống cụ thể và nêu được ranh giới của nó. Mức cao nhất.',
    tone: 'good',
  },
};

export const AXES = [
  { id: 'correct', label: 'Đúng bản chất', hint: 'không nói sai kiến thức' },
  { id: 'why', label: 'Nói được vì sao', hint: 'giải thích cơ chế, không chỉ nêu tên' },
  { id: 'link', label: 'Nối các ý', hint: 'thấy quan hệ và đánh đổi' },
  { id: 'apply', label: 'Vận dụng', hint: 'ví dụ cụ thể, biết khi nào không dùng' },
];

/**
 * Mức được SUY RA TỪ CÁC TRỤC, không hỏi lại model.
 * Model chỉ phải làm một việc dễ và ổn định là chấm 4 trục; việc xếp mức là
 * quy tắc thuần túy nên không dao động giữa các lần chấm.
 */
export function levelFromAxes(axes, misconceptions = []) {
  const a = axes || {};
  const n = (x) => Number(x) || 0;
  if (n(a.correct) <= 1) return 'lac';                       // sai bản chất
  if (n(a.correct) <= 2 && misconceptions.length) return 'lac';
  if (n(a.apply) >= 3) return 'van-dung';                    // dùng được vào tình huống
  if (n(a.why) >= 3 || n(a.link) >= 3) return 'ket-noi';     // nói được vì sao / nối được ý
  return 'roi-rac';                                          // đúng nhưng mới là liệt kê
}

/**
 * Điểm tính từ mức + độ sâu. Chủ ý:
 *   đủ ý mà rời rạc  ≈ 60-70   (đúng rồi, nhưng mới là nhớ)
 *   nối được, có lý do ≈ 78-88
 *   vận dụng được     ≈ 90-100
 * Sai bản chất bị chặn cứng — không cứu được bằng cách kể thêm ý.
 */
export function scoreFromRubric(g) {
  if (!g || !g.axes) return 0;
  const a = g.axes;
  const base = BASE_BY_LEVEL[g.level] ?? 66;
  const depth = (Number(a.why) || 0) + (Number(a.link) || 0) + (Number(a.apply) || 0); // 0..12
  let score = base + (depth - 6) * 2.5;
  const correct = Number(a.correct) || 0;
  if (correct <= 1) score = Math.min(score, 45);
  if (correct === 0) score = Math.min(score, 25);
  if ((g.misconceptions || []).length) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Ngưỡng rộng rãi: "rời rạc nhưng đúng" đã là Được, "kết nối" là Được chắc,
 * chỉ khi vận dụng được mới là Dễ. Không có bậc nào phạt việc trả lời ngắn.
 */
export const ratingFromScore = (s) => (s < 42 ? 'again' : s < 60 ? 'hard' : s < 86 ? 'good' : 'easy');

/** Mức tiếp theo cần nhắm tới, để nói cho người học biết đích ở đâu. */
export const nextLevel = (level) => {
  const i = LEVELS.indexOf(level);
  return i >= 0 && i < LEVELS.length - 1 ? LEVELS[i + 1] : null;
};
