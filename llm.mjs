// Lớp gọi LLM cho việc chấm bài và trợ giảng.
// Hỗ trợ cả OpenAI lẫn Anthropic - tự nhận diện theo key có trong .env.
//   OPENAI_API_KEY     -> dùng OpenAI
//   ANTHROPIC_API_KEY  -> dùng Anthropic
// Muốn ép cụ thể: LLM_PROVIDER=openai | anthropic

/** Key thật hay chỉ là chỗ trống trong file mẫu (sk-..., sk-ant-...)? */
const realKey = (v) => Boolean(v && v.trim().length > 20 && !v.trim().endsWith('...'));

const HAS_OPENAI = realKey(process.env.OPENAI_API_KEY);
const HAS_ANTHROPIC = realKey(process.env.ANTHROPIC_API_KEY);

export const PROVIDER =
  (HAS_OPENAI || HAS_ANTHROPIC ? process.env.LLM_PROVIDER : null) ||
  (HAS_OPENAI ? 'openai' : HAS_ANTHROPIC ? 'anthropic' : null);

const ENV_MODEL = process.env.GRADER_MODEL || '';
const EFFORT = process.env.GRADER_EFFORT || 'medium';

// Thứ tự ưu tiên khi tự chọn model (lấy cái mạnh nhất mà key thật sự dùng được).
const OPENAI_PREFERRED = [
  'gpt-5.2', 'gpt-5.1', 'gpt-5', 'gpt-5-mini',
  'o4', 'o3', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4o', 'gpt-4o-mini',
];
const OPENAI_FALLBACK = 'gpt-4o-mini';
const ANTHROPIC_DEFAULT = 'claude-opus-5';

/* ------------------------------------------------------------------ client */
let client = null;
let sdkError = null;
let resolvedModel = ENV_MODEL || (PROVIDER === 'anthropic' ? ANTHROPIC_DEFAULT : '');

export const state = () => ({
  provider: PROVIDER,
  hasKey: Boolean(PROVIDER),
  model: resolvedModel || '(tự chọn khi chấm lần đầu)',
  effort: EFFORT,
  sdkError: sdkError ? String(sdkError.message || sdkError) : null,
});

async function getClient() {
  if (client) return client;
  if (!PROVIDER) throw new Error('CHUA_CO_KEY');
  try {
    if (PROVIDER === 'openai') {
      const { default: OpenAI } = await import('openai');
      client = new OpenAI();
    } else {
      const { default: Anthropic } = await import('@anthropic-ai/sdk');
      client = new Anthropic();
    }
  } catch (err) {
    sdkError = err;
    throw new Error('CHUA_CAI_SDK');
  }
  return client;
}

/** Với OpenAI: hỏi API xem key này dùng được model nào rồi chọn cái tốt nhất. */
export async function resolveModel() {
  if (resolvedModel) return resolvedModel;
  if (PROVIDER !== 'openai') {
    resolvedModel = ANTHROPIC_DEFAULT;
    return resolvedModel;
  }
  try {
    const c = await getClient();
    const list = await c.models.list();
    const ids = new Set(list.data.map((m) => m.id));
    resolvedModel =
      OPENAI_PREFERRED.find((m) => ids.has(m)) ||
      // không khớp tên chính xác thì lấy bản mới nhất cùng họ
      OPENAI_PREFERRED.map((m) => [...ids].find((id) => id.startsWith(m))).find(Boolean) ||
      OPENAI_FALLBACK;
  } catch {
    resolvedModel = OPENAI_FALLBACK; // không list được (mạng, quyền) - cứ dùng mặc định an toàn
  }
  return resolvedModel;
}

/* ------------------------------------------------------------------ schema */
// Chấm theo HIỂU, không theo độ đầy đủ.
//
// Nền tảng: thang SOLO (Biggs & Collis) xếp hạng CẤU TRÚC của câu trả lời chứ
// không đếm số ý — theo thang đó, "liệt kê đủ 5 ý rời rạc" (multi-structural)
// đứng THẤP HƠN "nêu 3 ý nhưng nối được quan hệ nhân quả" (relational).
// Cộng thêm các mặt của "hiểu" trong Understanding by Design: giải thích được
// cơ chế, thấy quan hệ và đánh đổi, chuyển được sang tình huống mới.
//
// LLM chỉ xếp MỨC và chấm 4 TRỤC; điểm số do code tính (scoreFromRubric) để
// mọi bài đều quy về cùng một thước.
export { LEVELS, LEVEL_LABEL, scoreFromRubric, ratingFromScore } from './public/js/rubric.js';
import { LEVELS, scoreFromRubric, ratingFromScore, levelFromAxes } from './public/js/rubric.js';

export const GRADE_SCHEMA = {
  type: 'object',
  properties: {
    // Bắt trích dẫn TRƯỚC khi cho điểm. Thứ tự trường cũng là thứ tự model sinh ra,
    // nên phải tìm bằng chứng trong bài rồi mới được chấm - cách chống "chấm hào phóng"
    // hiệu quả nhất với model nhỏ.
    why_evidence: { type: 'string', description: 'Trich NGUYEN VAN doan hoc vien giai thich VI SAO (co "vi", "nen", "dan toi", "neu...thi"). Chuoi rong neu bai chi liet ke.' },
    link_evidence: { type: 'string', description: 'Trich NGUYEN VAN doan hoc vien noi hai y voi nhau hoac neu danh doi. Chuoi rong neu khong co.' },
    apply_evidence: { type: 'string', description: 'Trich NGUYEN VAN vi du cu the / tinh huong / ranh gioi "khi nao khong dung". Chuoi rong neu khong co.' },
    axes: {
      type: 'object',
      description: 'Cham tung truc thang 0-4 (0 khong co, 2 tam duoc, 4 rat tot)',
      properties: {
        correct: { type: 'integer', description: 'Dung ban chat, khong noi sai kien thuc' },
        why: { type: 'integer', description: 'Giai thich duoc CO CHE / li do, khong chi neu ten' },
        link: { type: 'integer', description: 'Noi cac y voi nhau, thay quan he nhan qua va danh doi' },
        apply: { type: 'integer', description: 'Van dung: khi nao dung / khong dung, vi du cu the, tinh huong moi' },
      },
      required: ['correct', 'why', 'link', 'apply'],
      additionalProperties: false,
    },
    strengths: { type: 'array', description: '1-3 dieu hoc vien lam TOT, noi cu the (tieng Viet)', items: { type: 'string' } },
    gaps: { type: 'array', description: '1-3 cho hieu CHUA TOI (khong phai "thieu y"), tieng Viet', items: { type: 'string' } },
    misconceptions: { type: 'array', description: 'Nhung cho hoc vien hieu SAI. Rong neu khong co.', items: { type: 'string' } },
    points: {
      type: 'array',
      description: 'THAM KHAO: hoc vien co cham toi tung y trong dan bai khong. KHONG dung de tru diem.',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['hit', 'partial', 'miss'] },
          evidence: { type: 'string', description: 'Trich cau chu cua hoc vien, chuoi rong neu miss' },
          note: { type: 'string', description: 'Mot cau ngan, hoac chuoi rong' },
        },
        required: ['id', 'status', 'evidence', 'note'],
        additionalProperties: false,
      },
    },
    feedback: { type: 'string', description: 'Nhan xet 2-4 cau bang tieng Viet, giong mentor' },
    next_question: { type: 'string', description: 'MOT cau hoi dao sau de keo hoc vien len mot muc' },
  },
  required: ['why_evidence', 'link_evidence', 'apply_evidence', 'axes', 'strengths', 'gaps', 'misconceptions', 'points', 'feedback', 'next_question'],
  additionalProperties: false,
};

const GRADER_SYSTEM = `Ban la giam khao cham bai tu luan mon AI Engineering, cham bang TIENG VIET.

MUC TIEU: do muc do HIEU va BIET AP DUNG, KHONG do do thuoc bai.
Hoc vien nay khong hoc de tra bai. TUYET DOI khong bat ho phai liet ke du moi y trong dan bai.

QUY TAC QUAN TRONG NHAT:
1. Mot cau tra loi NGAN nhung noi dung BAN CHAT va LI DO thi TOT HON mot cau tra loi liet ke
   du moi y ma roi rac, khong giai thich duoc vi sao. Cham theo dung tinh than do.
2. KHONG ha muc chi vi thieu y. Chi ha muc khi y thieu la y COT LOI khien cau tra loi sai ban chat.
   Cac y con lai chi ghi nhan trong truong "points" de tham khao, khong dung de tru diem.
3. Dien dat khac dap an mau, dung tu dong nghia, tieng Anh lan tieng Viet, viet tat quen thuoc
   trong nganh ("sim" = similarity, "ctx" = context) => van tinh la dung.
4. Hoc vien dua VI DU CUA RIENG HO, cach dien giai rieng, hoac goc nhin khac ma van dung
   => CONG diem cho truc "apply", tuyet doi khong coi la lac de.
5. Chi ghi "misconceptions" khi hoc vien noi mot dieu SAI ve ban chat - khong phai khi ho noi thieu.

VIEC CUA BAN CHI LA CHAM 4 TRUC. Khong phai xep hang, khong phai cho diem -
he thong tu suy ra muc va diem tu 4 truc nay.

CHAM 4 TRUC, moi truc 0-4 (0 khong co gi, 2 co nhung so sai, 3 lam duoc, 4 rat tot):
- correct : dung ban chat, khong noi sai.
- why     : giai thich duoc co che / li do, khong chi neu ten khai niem.
- link    : noi cac y voi nhau, thay quan he va danh doi.
- apply   : biet dung khi nao / khong dung khi nao, co vi du hoac tinh huong cu the.

DAU HIEU NHAN BIET (rat quan trong - dung nham LIET KE voi GIAI THICH):
- Chi la LIET KE (=> level "roi-rac", why <= 2, link <= 2): cac cau noi tiep nhau, moi cau mot y,
  noi CAI GI chu khong noi VI SAO. Dau hieu: "A la ... . B la ... . Cach tinh: ... . Cach cai thien: ..."
  Du co du 5/5 y va dung het thi VAN chi la "roi-rac".
- Co GIAI THICH (=> why >= 3): tra loi duoc "vi sao lai the", neu duoc co che, dieu kien, he qua.
  Dau hieu ngon ngu: "vi", "nen", "do do", "dan toi", "neu ... thi ...", "nho vay", "boi vi".
- Co NOI KET (=> link >= 3): dat hai y canh nhau va noi ro QUAN HE giua chung, hoac neu danh doi,
  hoac chi ra mot y kia se sai neu thieu y nay. Dau hieu: "trong khi do", "nhung", "phai doc cung",
  "danh doi", "nguoc lai", "keo theo".
- Co VAN DUNG (=> apply >= 3): tinh huong cu the, con so, vi du rieng, hoac neu duoc khi nao KHONG dung.

VI DU DOI CHIEU (cung mot cau hoi ve Faithfulness):
[Bai X] "Faithfulness la do trung thanh voi context. Cach tinh: tach thanh claim, dem ti le claim
duoc context chung minh, 0 den 1. Do la metric do hallucination. Phan biet voi dung su that.
Cach cai thien: giam temperature, ep citation."
=> DU Y nhung chi liet ke, khong cau nao noi VI SAO. axes: correct 4, why 2, link 1, apply 1.

[Bai Y] "Faithfulness xem cau tra loi co bam vao context khong, chu khong do dung sai that -
nen neu tai lieu lay ve da cu thi model chep dung theo do van duoc 1.0 ma nguoi dung van nhan tin sai.
Vi vay phai doc no cung context recall."
=> IT Y HON nhung noi duoc co che va hau qua, noi hai metric voi nhau.
   axes: correct 4, why 4, link 4, apply 2.

Bai Y phai duoc diem CAO HON bai X ve why/link. Do la tinh than cham cua he thong nay.

CACH LAM BAT BUOC - trich dan TRUOC, cham SAU:
1. Truoc tien dien why_evidence / link_evidence / apply_evidence bang cach TRICH NGUYEN VAN
   tu bai lam. Neu bai khong co doan nao nhu vay thi de CHUOI RONG - tuyet doi khong bia.
2. Sau do moi cham truc, va phai TON TRONG dieu vua trich:
   - khong trich duoc gi cho mot truc => truc do toi da 3 (van co the la 3 neu y do the hien ro rang
     trong bai du khong trich duoc mot cau gon).
   Trich duoc that => cho 3 hoac 4 thoai mai.
Bai liet ke du y nhung khong giai thich duoc gi van la ket qua CHAP NHAN DUOC, khong phai that bai -
hay noi ro dieu do trong feedback de hoc vien khong nan.

"next_question": dat MOT cau hoi dao sau vua tam de keo hoc vien len mot muc,
vi du "Neu tai lieu lay ve bi cu thi metric nao van dep ma cau tra loi van sai?".

Bai bo trong / "khong nho" / vo nghia => tat ca truc = 0.

Giong dieu: thang than, cu the, ton trong. Khen dung cho lam duoc (strengths), chi ro cho hieu
chua toi (gaps). Khong sao rong, khong giang giai dai dong.`;

const COACH_SYSTEM = `Ban la gia su AI Engineering, tra loi bang TIENG VIET, ngan gon (toi da 250 tu), dung vi du cu the.
Ban dang giup hoc vien dao sau MOT cau hoi on tap. Bam sat ngu canh cau hoi va dap an mau duoc cung cap.
Neu hoc vien hoi lac de, tra loi ngan roi keo ve trong tam.
Uu tien giai thich CO CHE ("vi sao no hoat dong nhu vay") thay vi liet ke dinh nghia.
Dung markdown don gian (dam, gach dau dong, code inline).`;

/* ------------------------------------------------ chấm bài luyện (drill) */
export const DRILL_SCHEMA = {
  type: 'object',
  properties: {
    score: { type: 'integer', description: 'Diem 0-100 cho rieng y nay' },
    ok: { type: 'boolean', description: 'Da neu duoc y chinh hay chua' },
    feedback: { type: 'string', description: 'Nhan xet 1-2 cau bang tieng Viet, chi ro thieu gi' },
    hint: { type: 'string', description: 'Mot goi y ngan giup lan sau nho ra y nay, hoac chuoi rong' },
  },
  required: ['score', 'ok', 'feedback', 'hint'],
  additionalProperties: false,
};

export const SKELETON_SCHEMA = {
  type: 'object',
  properties: {
    matched: { type: 'array', description: 'Danh sach id cac y ma hoc vien da goi ten duoc', items: { type: 'string' } },
    score: { type: 'integer', description: 'Diem 0-100 theo ti le y goi ten duoc' },
    feedback: { type: 'string', description: 'Nhan xet 1-2 cau bang tieng Viet' },
    hint: { type: 'string', description: 'Goi y ngan de nho khung bai nay, hoac chuoi rong' },
  },
  required: ['matched', 'score', 'feedback', 'hint'],
  additionalProperties: false,
};

const DRILL_SYSTEM = `Ban cham mot BAI LUYEN NHO bang TIENG VIET. Hoc vien chi dang luyen MOT y nho, khong phai ca cau tra loi.

NGUYEN TAC:
1. Cham theo NGU NGHIA, khong theo cau chu. Dung tu dong nghia / tieng Anh / viet tat quen thuoc van tinh la dung.
2. Vi day la bai luyen nho, hay ROI RAI: neu hoc vien nam duoc y chinh thi ok = true, du dien dat vung ve hay thieu chi tiet phu.
3. ok = false chi khi hoc vien khong neu duoc y, hoac hieu SAI ban chat.
4. feedback ngan gon, khich le, chi ro con thieu gi. Khong giang giai dai dong.
5. hint: mot meo ngan de lan sau nho ra y nay (mot hinh anh, mot tu khoa neo). De chuoi rong neu khong can.
6. Bo trong / vo nghia => score 0, ok false.`;

const DRILL_MODE_INSTRUCTION = {
  point: 'Hoc vien duoc yeu cau viet lai DUNG MOT y trong dap an bang loi cua minh.',
  why: 'Hoc vien duoc yeu cau giai thich VI SAO y nay lai nhu vay, va dieu gi hong neu bo y nay di. Cham theo CO CHE va LI DO, khong doi ho nhac lai noi dung y. Neu ho neu duoc mot he qua dung thi da la ok.',
  misconception: 'Hoc vien duoc dua mot NHAN DINH SAI va phai chi ra sai o dau roi sua lai. ok = true khi ho chi dung duoc cho sai, du dien dat vung ve. ok = false neu ho dong y voi nhan dinh sai do.',
  teach: 'Hoc vien duoc yeu cau giai thich y nay cho nguoi moi vao nghe, kem mot vi du cua rieng ho. Cham them ve do de hieu va do dung cua vi du.',
  skeleton: 'Hoc vien duoc yeu cau goi ten TAT CA cac y cua cau hoi bang cum tu ngan (khong can viet day du). Chi can goi dung ten/chu de cua y la tinh la matched, khong doi giai thich.',
};

function buildGradePrompt(q, userAnswer) {
  const rubric = q.points.map((p, i) => `[${p.id || 'p' + (i + 1)}] (trong so ${p.w || 1}) ${p.text}`).join('\n');
  return `## Cau hoi
${q.q}

## Rubric - cac y can co
${rubric}

## Dap an mau (de tham chieu, KHONG bat hoc vien viet giong)
${q.answer}

## Bai lam cua hoc vien
<bai_lam>
${userAnswer}
</bai_lam>

Cham bai lam tren. Nho: do HIEU chu khong do do day du.
Tra ve JSON dung schema. Truong "points" phai co dung ${q.points.length} phan tu, id lay dung tu rubric.`;
}

/* ------------------------------------------------------------------ tiện ích */
/** Bóc JSON ra khỏi câu trả lời kể cả khi model bọc trong ```json hoặc thêm lời dẫn. */
export function extractJSON(text) {
  const fenced = String(text).match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : String(text);
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('Model khong tra ve JSON.');
  return JSON.parse(raw.slice(start, end + 1));
}

const RETRYABLE_SHAPE = (err) => [400, 404, 422].includes(err?.status);

/**
 * Gọi theo thang bậc: thử shape mới nhất trước, gặp lỗi "sai tham số" thì lùi dần.
 * Nhờ vậy chạy được với nhiều phiên bản API/model khác nhau mà người dùng không phải sửa gì.
 */
async function ladder(attempts) {
  let lastErr;
  for (const attempt of attempts) {
    try {
      return await attempt();
    } catch (err) {
      if (String(err?.message) === 'MODEL_TU_CHOI') throw err;
      if (!RETRYABLE_SHAPE(err)) throw err; // 401 / 429 / 5xx: thử lại vô ích
      lastErr = err;
    }
  }
  throw lastErr;
}

/* ------------------------------------------------------------------ OpenAI */
async function openaiGrade(q, userAnswer) {
  const c = await getClient();
  const model = await resolveModel();
  const messages = [
    { role: 'system', content: GRADER_SYSTEM },
    { role: 'user', content: buildGradePrompt(q, userAnswer) },
  ];

  const res = await ladder([
    // 1) Structured Outputs (chuẩn nhất): model bị ràng buộc trả đúng schema
    () => c.chat.completions.create({
      temperature: 0,   // chấm bài phải tất định: cùng bài làm phải ra cùng kết quả
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'grade', strict: true, schema: GRADE_SCHEMA },
      },
    }),
    // 2) JSON mode: chỉ đảm bảo là JSON hợp lệ, schema mô tả trong prompt
    () => c.chat.completions.create({
      temperature: 0,   // chấm bài phải tất định: cùng bài làm phải ra cùng kết quả
      model,
      messages: [
        { role: 'system', content: GRADER_SYSTEM + '\n\nCHI tra ve MOT object JSON dung schema sau:\n' + JSON.stringify(GRADE_SCHEMA) },
        messages[1],
      ],
      response_format: { type: 'json_object' },
    }),
    // 3) Không có chế độ JSON: ép bằng prompt rồi tự bóc
    () => c.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: GRADER_SYSTEM + '\n\nCHI tra ve MOT object JSON dung schema sau, khong them chu nao khac:\n' + JSON.stringify(GRADE_SCHEMA) },
        messages[1],
      ],
    }),
  ]);

  const parsed = extractJSON(res.choices?.[0]?.message?.content ?? '');
  parsed.usage = {
    input: res.usage?.prompt_tokens ?? 0,
    output: res.usage?.completion_tokens ?? 0,
    model: res.model || model,
  };
  return parsed;
}

async function openaiCoach(messages) {
  const c = await getClient();
  const model = await resolveModel();
  const res = await c.chat.completions.create({ model, messages });
  return res.choices?.[0]?.message?.content ?? '';
}

/* --------------------------------------------------------------- Anthropic */
async function anthropicCall(base, extras) {
  const c = await getClient();
  const res = await ladder(
    extras.map((extra) => () => (extra.beta === false
      ? c.messages.create({ ...base, ...extra.body })
      : c.beta.messages.create({ ...base, ...extra.body }))),
  );
  if (res.stop_reason === 'refusal') throw new Error('MODEL_TU_CHOI');
  return res;
}

const textOf = (res) => res.content.filter((b) => b.type === 'text').map((b) => b.text).join('');

async function anthropicGrade(q, userAnswer) {
  const model = await resolveModel();
  const base = {
    model,
    max_tokens: 8000,
    system: GRADER_SYSTEM,
    messages: [{ role: 'user', content: buildGradePrompt(q, userAnswer) }],
  };
  const format = { type: 'json_schema', schema: GRADE_SCHEMA };
  const res = await anthropicCall(base, [
    { body: { output_config: { effort: EFFORT, format }, betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' } },
    { body: { output_config: { effort: EFFORT, format } } },
    { body: { output_config: { format } } },
    { body: { output_format: format } },
    { beta: false, body: { system: base.system + '\n\nCHI tra ve MOT object JSON dung schema sau:\n' + JSON.stringify(GRADE_SCHEMA) } },
  ]);
  const parsed = extractJSON(textOf(res));
  parsed.usage = {
    input: res.usage?.input_tokens ?? 0,
    output: res.usage?.output_tokens ?? 0,
    model: res.model || model,
  };
  return parsed;
}

async function anthropicCoach(system, messages) {
  const model = await resolveModel();
  const base = { model, max_tokens: 4000, system, messages };
  const res = await anthropicCall(base, [
    { body: { output_config: { effort: 'medium' } } },
    { beta: false, body: {} },
  ]);
  return textOf(res);
}

/* ----------------------------------------------------- chấm bài luyện nhỏ */
function buildDrillPrompt(q, point, mode, answer) {
  const head = `## Cau hoi goc\n${q.q}\n\n## Kieu bai luyen\n${DRILL_MODE_INSTRUCTION[mode] || DRILL_MODE_INSTRUCTION.point}`;
  if (mode === 'skeleton') {
    const list = q.points.map((p, i) => `[${p.id || 'p' + (i + 1)}] ${p.text}`).join('\n');
    return `${head}\n\n## Cac y cua dap an (dap an chuan)\n${list}\n\n## Hoc vien goi ten cac y\n<bai_lam>\n${answer}\n</bai_lam>\n\nTra ve JSON. "matched" chi chua id cua nhung y hoc vien goi ten duoc (du chi bang vai tu). score = ti le matched tren ${q.points.length} y, thang 100.`;
  }
  return `${head}\n\n## Y dang luyen (dap an chuan cho rieng y nay)\n${point.text}\n\n## Bai lam cua hoc vien\n<bai_lam>\n${answer}\n</bai_lam>\n\nCham rieng y nay. Tra ve JSON dung schema.`;
}

async function openaiJSON(system, prompt, schema, name) {
  const c = await getClient();
  const model = await resolveModel();
  const messages = [{ role: 'system', content: system }, { role: 'user', content: prompt }];
  const res = await ladder([
    () => c.chat.completions.create({
      temperature: 0,   // chấm bài phải tất định: cùng bài làm phải ra cùng kết quả
      model, messages,
      response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } },
    }),
    () => c.chat.completions.create({
      temperature: 0,   // chấm bài phải tất định: cùng bài làm phải ra cùng kết quả
      model,
      messages: [{ role: 'system', content: system + '\n\nCHI tra ve MOT object JSON dung schema:\n' + JSON.stringify(schema) }, messages[1]],
      response_format: { type: 'json_object' },
    }),
    () => c.chat.completions.create({
      model,
      messages: [{ role: 'system', content: system + '\n\nCHI tra ve MOT object JSON dung schema, khong them chu nao khac:\n' + JSON.stringify(schema) }, messages[1]],
    }),
  ]);
  const out = extractJSON(res.choices?.[0]?.message?.content ?? '');
  out.usage = { input: res.usage?.prompt_tokens ?? 0, output: res.usage?.completion_tokens ?? 0, model: res.model || model };
  return out;
}

async function anthropicJSON(system, prompt, schema) {
  const model = await resolveModel();
  const base = { model, max_tokens: 2000, system, messages: [{ role: 'user', content: prompt }] };
  const format = { type: 'json_schema', schema };
  const res = await anthropicCall(base, [
    { body: { output_config: { effort: 'low', format } } },
    { body: { output_config: { format } } },
    { body: { output_format: format } },
    { beta: false, body: { system: system + '\n\nCHI tra ve MOT object JSON dung schema:\n' + JSON.stringify(schema) } },
  ]);
  const out = extractJSON(textOf(res));
  out.usage = { input: res.usage?.input_tokens ?? 0, output: res.usage?.output_tokens ?? 0, model: res.model || model };
  return out;
}

/** Chấm một bài luyện nhỏ: mode = point | teach | skeleton. */
export async function gradeDrill(q, point, mode, answer) {
  if (!PROVIDER) throw new Error('CHUA_CO_KEY');
  const schema = mode === 'skeleton' ? SKELETON_SCHEMA : DRILL_SCHEMA;
  const prompt = buildDrillPrompt(q, point, mode, answer);
  return PROVIDER === 'openai'
    ? openaiJSON(DRILL_SYSTEM, prompt, schema, mode === 'skeleton' ? 'skeleton' : 'drill')
    : anthropicJSON(DRILL_SYSTEM, prompt, schema);
}

/* ------------------------------------------------------------------ export */
export async function grade(q, userAnswer) {
  if (!PROVIDER) throw new Error('CHUA_CO_KEY');
  const g = PROVIDER === 'openai' ? await openaiGrade(q, userAnswer) : await anthropicGrade(q, userAnswer);
  // Mức, điểm và mức đánh giá đều do code quyết định. LLM chỉ chấm 4 trục -
  // một việc dễ hơn nhiều nên ổn định hơn nhiều.
  g.level = levelFromAxes(g.axes, g.misconceptions || []);
  g.overall = scoreFromRubric(g);
  g.suggested_rating = ratingFromScore(g.overall);
  return g;
}

export async function coach(q, question, history = []) {
  if (!PROVIDER) throw new Error('CHUA_CO_KEY');
  const context = `## Cau on tap\n${q.q}\n\n## Dap an mau\n${q.answer}`;
  const turns = history.slice(-8).map((t) => ({
    role: t.role === 'user' ? 'user' : 'assistant',
    content: String(t.content).slice(0, 4000),
  }));

  if (PROVIDER === 'openai') {
    return openaiCoach([
      { role: 'system', content: COACH_SYSTEM + '\n\n' + context },
      ...turns,
      { role: 'user', content: question },
    ]);
  }
  const messages = [
    { role: 'user', content: `${context}\n\n(Ghi nho ngu canh tren cho ca cuoc hoi dap.)\n\n## Hoc vien hoi\n${turns.length ? '(xem cac luot sau)' : question}` },
    ...turns,
  ];
  if (turns.length) messages.push({ role: 'user', content: question });
  return anthropicCoach(COACH_SYSTEM, messages);
}

export function errorPayload(err) {
  const msg = String(err?.message || err);
  if (msg === 'CHUA_CO_KEY') {
    return { code: 'no_key', message: 'Chua co API key. Tao file .env tu .env.example, dien OPENAI_API_KEY hoac ANTHROPIC_API_KEY roi khoi dong lai server. Trong luc do ban van tu cham duoc.' };
  }
  if (msg === 'CHUA_CAI_SDK') {
    return { code: 'no_sdk', message: `Chua cai SDK cho ${PROVIDER}. Chay: npm install` };
  }
  if (msg === 'MODEL_TU_CHOI') return { code: 'refusal', message: 'Model tu choi cham cau nay. Ban tu cham giup nhe.' };
  if (err?.status === 401) return { code: 'auth', message: 'API key khong hop le (401). Kiem tra lai key trong .env.' };
  if (err?.status === 403) return { code: 'auth', message: 'Key khong co quyen goi model nay (403).' };
  if (err?.status === 404) {
    return { code: 'model', message: `Model "${resolvedModel}" khong dung duoc voi key nay. Dat GRADER_MODEL trong .env thanh model ban co quyen roi khoi dong lai.` };
  }
  if (err?.status === 429) return { code: 'rate_limit', message: 'Bi rate limit hoac het quota (429). Doi mot chut roi cham lai.' };
  if (err?.status >= 500) return { code: 'server', message: 'Loi phia API (' + err.status + '). Thu lai sau.' };
  if (err?.status === 400) return { code: 'bad_request', message: 'API tu choi yeu cau (400): ' + msg.slice(0, 200) };
  return { code: 'unknown', message: msg.slice(0, 300) };
}
