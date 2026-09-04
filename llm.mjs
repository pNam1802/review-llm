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
export const GRADE_SCHEMA = {
  type: 'object',
  properties: {
    overall: { type: 'integer', description: 'Diem tong 0-100' },
    verdict: { type: 'string', enum: ['excellent', 'good', 'partial', 'weak', 'blank'] },
    points: {
      type: 'array',
      description: 'Danh gia tung y trong rubric, dung thu tu da cho',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          status: { type: 'string', enum: ['hit', 'partial', 'miss'] },
          evidence: { type: 'string', description: 'Trich cau chu cua hoc vien chung minh, chuoi rong neu miss' },
          note: { type: 'string', description: 'Mot cau ngan giai thich vi sao cham nhu vay' },
        },
        required: ['id', 'status', 'evidence', 'note'],
        additionalProperties: false,
      },
    },
    misconceptions: {
      type: 'array',
      description: 'Nhung cho hoc vien hieu SAI (khong phai thieu). Rong neu khong co.',
      items: { type: 'string' },
    },
    missing_summary: { type: 'string', description: 'Tom tat nhung y con thieu, 1-2 cau, tieng Viet' },
    feedback: { type: 'string', description: 'Nhan xet 2-4 cau bang tieng Viet, giong mot mentor' },
    upgrade: { type: 'string', description: 'Mot cau goi y de lan sau tra loi tot hon' },
    suggested_rating: { type: 'string', enum: ['again', 'hard', 'good', 'easy'] },
  },
  required: ['overall', 'verdict', 'points', 'misconceptions', 'missing_summary', 'feedback', 'upgrade', 'suggested_rating'],
  additionalProperties: false,
};

const GRADER_SYSTEM = `Ban la giam khao cham bai tu luan cho ky thi AI Engineering, cham bang TIENG VIET.

NGUYEN TAC CHAM:
1. Cham theo NGU NGHIA, khong cham theo cau chu. Hoc vien dien dat khac dap an mau, dung tu dong nghia, dung tieng Anh thay tieng Viet (hoac nguoc lai), viet tat quen thuoc trong nganh (vd "sim" = similarity, "ctx" = context) => van tinh la DUNG neu y dung.
2. Moi y trong rubric cham doc lap: "hit" = neu duoc y do (du ngan gon), "partial" = dung huong nhung thieu chinh xac / thieu ve, "miss" = khong nhac den.
3. KHONG tru diem vi hoc vien viet ngan, khong doi hoc vien viet lai y het dap an mau. Ngan gon ma dung y = diem toi da.
4. KHONG cho diem cho y ma hoc vien chi nhac ten thuat ngu nhung dung SAI ban chat.
5. Neu hoc vien viet dung nhung THUA (lac de) thi khong tru diem, tru khi phan thua the hien hieu sai -> ghi vao misconceptions.
6. Cau tra loi bo trong / "khong nho" / vo nghia => overall = 0, verdict = "blank".
7. overall tinh tu trong so cac y: hit = du trong so, partial = mot nua trong so, miss = 0; quy ve thang 100 va lam tron.
8. suggested_rating theo overall: <50 -> again, 50-69 -> hard, 70-89 -> good, >=90 -> easy.

Giong dieu: thang than, cu the, khong sao rong. Chi ra chinh xac y nao thieu va cau nao trong bai hoc vien lien quan.`;

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

Cham bai lam tren theo rubric. Tra ve JSON dung schema. Truong "points" phai co dung ${q.points.length} phan tu, id lay dung tu rubric.`;
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
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'grade', strict: true, schema: GRADE_SCHEMA },
      },
    }),
    // 2) JSON mode: chỉ đảm bảo là JSON hợp lệ, schema mô tả trong prompt
    () => c.chat.completions.create({
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
      model, messages,
      response_format: { type: 'json_schema', json_schema: { name, strict: true, schema } },
    }),
    () => c.chat.completions.create({
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
  return PROVIDER === 'openai' ? openaiGrade(q, userAnswer) : anthropicGrade(q, userAnswer);
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
