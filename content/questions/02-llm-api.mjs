export default {
  id: 'llm-api',
  name: 'LLM / API',
  short: 'LLM API',
  emoji: '🎛️',
  blurb: 'Các tham số điều khiển sinh văn bản và hợp đồng đầu ra (Output Contract).',
  questions: [
    {
      id: 6,
      q: '`temperature` dùng để làm gì?',
      type: 'concept',
      diff: 1,
      answer: `\`temperature\` điều khiển **độ ngẫu nhiên / sáng tạo** khi model chọn token tiếp theo.

**Cơ chế:** ở mỗi bước, model tạo ra một vector logits rồi đưa qua softmax để ra xác suất. Temperature chia logits trước softmax: \`p = softmax(logits / T)\`.

- \`T → 0\`: phân phối nhọn lại, token xác suất cao nhất gần như luôn thắng ⇒ **gần tất định**, lặp lại, an toàn.
- \`T = 1\`: giữ nguyên phân phối gốc của model.
- \`T > 1\`: phân phối bẹt ra, token hiếm có cơ hội ⇒ đa dạng, sáng tạo, dễ lệch và dễ bịa.

**Chọn giá trị theo việc:**

| Việc | T gợi ý |
|---|---|
| Trích xuất dữ liệu, phân loại, trả JSON | 0 – 0.2 |
| Q&A trên tài liệu (RAG), agent gọi tool | 0 – 0.3 |
| Chatbot chăm sóc khách hàng | 0.3 – 0.7 |
| Viết marketing, brainstorm | 0.7 – 1.0 |

**Lưu ý production:** \`T = 0\` **không đảm bảo output giống hệt nhau 100%** (còn phụ thuộc batching, phần cứng, phiên bản model). Muốn ổn định thật thì ràng buộc bằng schema + validate, chứ đừng chỉ dựa vào temperature. Một số model mới (dòng suy luận) đã bỏ tham số sampling — khi đó điều khiển bằng \`effort\` / structured output thay thế.`,
      points: [
        { id: 'p1', w: 3, text: 'Điều khiển độ ngẫu nhiên / sáng tạo khi chọn token tiếp theo' },
        { id: 'p2', w: 2, text: 'Cơ chế: chia logits trước softmax — T thấp làm phân phối nhọn (tất định hơn), T cao làm bẹt (đa dạng hơn)' },
        { id: 'p3', w: 2, text: 'Gắn được giá trị với use case: thấp cho trích xuất/JSON/RAG, cao cho sáng tạo' },
        { id: 'p4', w: 1, text: 'Lưu ý T=0 vẫn không đảm bảo tất định tuyệt đối / cần schema để ổn định đầu ra' },
      ],
      why: 'Temperature là núm vặn ảnh hưởng trực tiếp tới tỉ lệ hallucination trong RAG. Nhiều hệ thống "hay bịa" chỉ vì để mặc định 1.0 cho một tác vụ trích xuất.',
      traps: ['Nói "temperature điều khiển độ dài" — nhầm với max_tokens.', 'Nói "T=0 là hoàn toàn tất định".'],
      hook: 'Nhiệt độ cao ⇒ phân tử chạy loạn ⇒ chữ nghĩa cũng chạy loạn.',
      related: [7, 8],
    },
    {
      id: 7,
      q: '`max_tokens` dùng để làm gì?',
      type: 'concept',
      diff: 1,
      answer: `\`max_tokens\` là **trần số token model được phép sinh ra trong một câu trả lời**.

**Ba vai trò:**
1. **Chặn chi phí** — output tính tiền theo token, và thường đắt gấp 4–5 lần input.
2. **Chặn thời gian** — mỗi token là một bước sinh; trần thấp ⇒ latency có giới hạn trên.
3. **Bảo vệ context window** — input + output phải nằm gọn trong cửa sổ ngữ cảnh.

**Điều cần nhớ nhất:** đây là **cắt cứng, không phải hướng dẫn**. Khi chạm trần, câu trả lời bị **cắt giữa chừng** (\`stop_reason = "max_tokens"\`), JSON đứt ngang ⇒ parse lỗi. Model **không biết** trần này để tự viết ngắn lại — muốn ngắn thì phải nói trong prompt.

**Thực hành:**
- Luôn kiểm tra \`stop_reason\` trước khi parse output.
- Đặt trần rộng rãi cho tác vụ mở (một câu trả lời bị cắt phải gọi lại = tốn gấp đôi), đặt chặt cho tác vụ ngắn như phân loại.
- Với output rất dài thì dùng **streaming** để tránh timeout HTTP.`,
      points: [
        { id: 'p1', w: 3, text: 'Giới hạn số token tối đa model sinh ra trong một response' },
        { id: 'p2', w: 2, text: 'Mục đích: kiểm soát chi phí, latency và giữ trong context window' },
        { id: 'p3', w: 3, text: 'Là cắt cứng: chạm trần thì output bị truncate giữa chừng (JSON hỏng) — cần kiểm tra stop_reason' },
        { id: 'p4', w: 1, text: 'Không phải là chỉ dẫn cho model viết ngắn; muốn ngắn phải yêu cầu trong prompt' },
      ],
      why: 'Lỗi production kinh điển: JSON parse error ngẫu nhiên vì output chạm max_tokens ở những câu trả lời dài, và không ai kiểm tra stop_reason.',
      traps: ['Nghĩ model sẽ tự tóm tắt cho vừa trần.', 'Đặt trần quá thấp để tiết kiệm rồi phải retry — tốn hơn.'],
      hook: 'max_tokens là cái kéo, không phải lời nhắc.',
      related: [6, 55],
    },
    {
      id: 8,
      q: '`top_p` dùng để làm gì?',
      type: 'concept',
      diff: 2,
      answer: `\`top_p\` (**nucleus sampling**) giới hạn **tập token được phép chọn**: sắp xếp token theo xác suất giảm dần, cộng dồn cho tới khi đạt \`p\`, rồi chỉ lấy mẫu trong nhóm đó (phần "hạt nhân"), bỏ hết đuôi còn lại.

- \`top_p = 1.0\`: không cắt, cả từ điển đều có cơ hội.
- \`top_p = 0.9\`: chỉ giữ nhóm token nhỏ nhất có tổng xác suất ≥ 0.9 ⇒ loại các token rất hiếm — chính là các token gây "lạc trôi".
- \`top_p = 0.1\`: gần như chỉ còn token dẫn đầu ⇒ rất bảo thủ.

**Khác temperature:** temperature **đổi hình dạng** phân phối (bẹt hay nhọn), top_p **cắt bớt đuôi** phân phối. Temperature vặn to có thể lôi cả token rác lên; top_p luôn dọn sạch đuôi rác dù T bằng bao nhiêu.

**Thực hành:** khuyến nghị chung là **chỉ vặn một trong hai**, để cái còn lại ở mặc định — vặn cả hai làm hiệu ứng khó đoán và khó tái lập khi debug. (Họ hàng: \`top_k\` = giữ đúng k token đầu, cắt theo số lượng thay vì theo khối xác suất.)`,
      points: [
        { id: 'p1', w: 3, text: 'Nucleus sampling: chỉ lấy mẫu trong nhóm token có xác suất cộng dồn đạt ngưỡng p, cắt bỏ phần đuôi' },
        { id: 'p2', w: 2, text: 'p nhỏ ⇒ tập chọn hẹp, an toàn/bảo thủ; p = 1 ⇒ không cắt gì' },
        { id: 'p3', w: 3, text: 'Phân biệt với temperature: temperature đổi hình dạng phân phối, top_p cắt đuôi phân phối' },
        { id: 'p4', w: 1, text: 'Khuyến nghị chỉ điều chỉnh một trong hai để giữ hành vi dễ đoán' },
      ],
      why: 'Nhiều nhóm vặn cả temperature lẫn top_p rồi không hiểu vì sao chất lượng dao động giữa các lần deploy. Hiểu rõ hai núm này khác nhau ở đâu là điều kiện để tuning có kỷ luật.',
      traps: ['Coi top_p và temperature là hai cách gọi của cùng một thứ.'],
      hook: 'Temperature = vặn đèn sáng/tối. top_p = cắt bớt rìa bức ảnh.',
      related: [6],
    },
    {
      id: 9,
      q: 'Output Contract là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Output Contract** là **cam kết về hình dạng đầu ra** giữa LLM và phần còn lại của hệ thống: đầu ra phải theo đúng một lược đồ (schema) đã định trước, để code phía sau parse được mà không cần đoán.

**Một Output Contract đầy đủ gồm:**
1. **Schema**: các trường, kiểu dữ liệu, trường bắt buộc, enum cho các giá trị hợp lệ (\`"intent": "refund" | "shipping" | "other"\`).
2. **Cách ép**: structured output / JSON schema mode của API, hoặc tool calling với \`strict\`, hoặc tối thiểu là prompt + ví dụ.
3. **Validate phía server**: parse và kiểm tra lại bằng schema (Zod / Pydantic / JSON Schema) — không tin tưởng mù quáng.
4. **Xử lý khi vi phạm**: retry có sửa lỗi, hạ cấp về giá trị mặc định, hoặc chuyển cho người.
5. **Đường thoát hợp lệ**: có trường như \`"cannot_answer": true\` hoặc \`confidence\` để model *không bị ép bịa* khi thiếu dữ liệu.

**Ví dụ:**
\`\`\`json
{
  "intent": "refund",
  "confidence": 0.86,
  "entities": { "order_id": "DH123", "amount": 250000 },
  "needs_human": false,
  "citations": ["policy_refund_v3#p2"]
}
\`\`\`
Contract biến một đầu ra "văn xuôi tự do" thành một **API có thể lập trình được**.`,
      points: [
        { id: 'p1', w: 3, text: 'Là cam kết/quy ước về định dạng và cấu trúc đầu ra của LLM (schema JSON: trường, kiểu, enum, bắt buộc)' },
        { id: 'p2', w: 2, text: 'Được ép bằng structured output / JSON schema / tool calling, không chỉ bằng lời dặn trong prompt' },
        { id: 'p3', w: 2, text: 'Phải validate lại phía hệ thống và có xử lý khi vi phạm (retry / fallback / chuyển người)' },
        { id: 'p4', w: 2, text: 'Nên có đường thoát hợp lệ (cannot_answer / confidence / needs_human) để model không bị ép bịa' },
      ],
      why: 'Output Contract là ranh giới biến LLM từ "trình diễn" thành "thành phần phần mềm". Không có nó thì mọi tích hợp phía sau đều là regex mong manh.',
      traps: ['Chỉ nói "bắt model trả JSON" mà quên bước validate và xử lý vi phạm.'],
      hook: 'Contract = interface. LLM cũng phải implement interface như mọi service khác.',
      related: [10, 50],
    },
    {
      id: 10,
      q: 'Tại sao production AI system cần Output Contract?',
      type: 'concept',
      diff: 2,
      answer: `Vì LLM là **thành phần không tất định** nằm giữa một hệ thống tất định. Contract là lớp biến sự bất định đó thành thứ kiểm soát được.

**Sáu lý do:**
1. **Tích hợp được**: hệ thống hạ nguồn (DB, CRM, thanh toán) cần trường có kiểu, không đọc được văn xuôi.
2. **Không vỡ khi model đổi**: nâng cấp model/prompt mà schema giữ nguyên thì code phía sau không phải viết lại. Contract chính là chỗ để đặt **versioning**.
3. **Phát hiện lỗi sớm và rõ ràng**: vi phạm schema là một lỗi *bắt được ngay tại biên*, thay vì một chuỗi rác đi sâu vào hệ thống rồi mới nổ ở nơi khác.
4. **Chạy được trong CI/CD**: có schema mới viết được test tự động và AI evaluation — không có schema thì không có cách chấm máy.
5. **An toàn**: enum giới hạn hành động model được phép đề xuất; trường \`needs_human\`, \`confidence\`, \`citations\` là nơi cài guardrail và bắt buộc dẫn nguồn.
6. **Đo được**: có trường cố định mới log và tính được metric (tỉ lệ intent nào, tỉ lệ escalate, độ phủ citation).

Nói ngắn: **không có Output Contract thì không có test, không có monitoring, không có rollback** — tức là không có production.`,
      points: [
        { id: 'p1', w: 3, text: 'LLM không tất định; contract làm cho đầu ra dự đoán được để hệ thống hạ nguồn parse và tích hợp' },
        { id: 'p2', w: 2, text: 'Bắt lỗi sớm ngay tại biên (validate) thay vì để dữ liệu rác lan vào hệ thống' },
        { id: 'p3', w: 2, text: 'Là điều kiện để test tự động / AI evaluation trong CI-CD và để đo lường, monitoring' },
        { id: 'p4', w: 2, text: 'An toàn và ổn định khi thay model/prompt: enum giới hạn hành động, có versioning, có trường guardrail (confidence, needs_human, citations)' },
      ],
      why: 'Câu này kiểm tra tư duy "AI là một service phải tuân thủ hợp đồng như mọi service khác" — dấu hiệu rõ nhất phân biệt người làm demo với người làm production.',
      traps: ['Chỉ nói "để dễ parse" — thiếu góc nhìn test, monitoring, an toàn và versioning.'],
      hook: 'Không schema ⇒ không test ⇒ không production.',
      related: [9, 111],
    },
  ],
};
