export default {
  id: 'production-api',
  name: 'Production / REST API',
  short: 'REST API',
  emoji: '🌐',
  blurb: 'Đưa agent ra thành một API thật: auth, rate limit, streaming, timeout, versioning.',
  questions: [
    {
      id: 51,
      q: 'Khi thiết kế REST API cho AI Agent cần quan tâm những vấn đề gì?',
      type: 'design',
      diff: 3,
      answer: `Ngoài mọi yêu cầu của một REST API thường, AI Agent có **ba đặc thù**: chậm (giây, không phải mili-giây), tốn tiền theo request, và **không tất định**.

**1. Bảo mật & truy cập**
- **Authentication** (API key / OAuth / JWT) và **Authorization** (user này được gọi tool nào, đọc dữ liệu của ai).
- Lọc quyền **ngay tại tầng retrieval** — không để RAG trả về tài liệu ngoài quyền.
- Chống prompt injection và rò rỉ system prompt; lọc PII ở cả input và output.

**2. Kiểm soát tài nguyên**
- **Rate limiting** (theo user/tenant/API key), **quota theo token hoặc theo chi phí**, không chỉ theo số request.
- **Timeout** ở mọi tầng + \`max_steps\`, trần token cho mỗi phiên.
- Hàng đợi / backpressure khi tải cao.

**3. Trải nghiệm với độ trễ lớn**
- **Streaming (SSE)** để có TTFT thấp.
- Với tác vụ dài: **async job** — \`202 Accepted\` + \`job_id\` + endpoint polling hoặc webhook.
- **Idempotency-Key** cho request tạo/ghi, tránh nhân đôi hành động khi client retry.

**4. Hợp đồng & phiên bản**
- **Output Contract** rõ ràng; mã lỗi có cấu trúc (\`error.code\`, \`message\`, \`request_id\`).
- **API versioning** (\`/v1/...\`) vì prompt/model/schema sẽ đổi.
- Quản lý **session/conversation state**: \`conversation_id\`, lịch sử lưu ở đâu, TTL bao lâu.

**5. Vận hành**
- **Observability**: \`request_id\` xuyên suốt, log trace từng bước agent, metric TTFT/P95/P99, cost/request, quality score.
- **Caching** (semantic cache) để giảm chi phí và độ trễ.
- **Graceful degradation**: model lỗi ⇒ fallback model/câu trả lời an toàn/chuyển người; health check; circuit breaker.
- Cost tracking theo user/tenant để biết ai đang tiêu bao nhiêu.`,
      points: [
        { id: 'p1', w: 3, text: 'Authentication + Authorization (bao gồm phân quyền tool và lọc quyền ở tầng dữ liệu/RAG)' },
        { id: 'p2', w: 3, text: 'Kiểm soát tài nguyên: rate limiting, quota theo token/chi phí, timeout, max_steps' },
        { id: 'p3', w: 3, text: 'Xử lý độ trễ lớn: streaming/SSE hoặc async job + job_id; idempotency cho request ghi' },
        { id: 'p4', w: 2, text: 'Versioning + output contract + mã lỗi có cấu trúc; quản lý session/conversation state' },
        { id: 'p5', w: 2, text: 'Observability (request_id, trace, metric, cost tracking), caching và graceful degradation/fallback' },
      ],
      why: 'Đây là câu tổng hợp hay được hỏi để đo "bạn đã từng đưa AI ra production chưa". Điểm nằm ở những thứ đặc thù của AI: streaming, cost, non-determinism, tool permission.',
      traps: ['Chỉ liệt kê kiến thức REST chung (CRUD, status code) mà không nêu đặc thù của AI Agent.'],
      hook: '5 nhóm: Ai được gọi – Gọi bao nhiêu – Chờ thế nào – Trả về cái gì – Nhìn thấy gì khi hỏng.',
      related: [52, 53, 54, 55, 56],
    },
    {
      id: 52,
      q: 'Authentication và Authorization khác nhau như thế nào?',
      type: 'concept',
      diff: 1,
      answer: `- **Authentication (AuthN) — "Bạn là ai?"** Xác minh danh tính: API key, JWT, OAuth token, username/password, SSO. Kết quả: hệ thống biết đây là user U123 (hoặc từ chối **401 Unauthorized**).
- **Authorization (AuthZ) — "Bạn được phép làm gì?"** Sau khi biết là ai, kiểm tra quyền: được gọi endpoint nào, dùng tool nào, đọc dữ liệu của ai. Từ chối trả về **403 Forbidden**.

**Thứ tự bắt buộc:** AuthN trước, AuthZ sau. Đã xác thực không có nghĩa là được phép.

**Trong AI Agent, AuthZ có ba tầng riêng — đây mới là phần đáng nói:**
1. **Tầng endpoint**: user có được gọi \`/v1/chat\` không.
2. **Tầng tool**: agent thay mặt user này được gọi tool nào. Nhân viên CSKH có thể được gọi \`refund\` tới 500k; muốn hơn phải có người duyệt.
3. **Tầng dữ liệu (quan trọng nhất với RAG)**: retrieval **phải lọc theo quyền của user**. Nếu không, agent sẽ tóm tắt một cách rất trôi chảy đúng tài liệu mà người này không được đọc — và không log nào bắt được vì về mặt kỹ thuật hệ thống "chạy đúng".

**Ghi nhớ:** quyền phải được kiểm tra **ở phía server, theo từng request**, không dựa vào việc "prompt đã dặn agent đừng làm". Prompt là hướng dẫn, không phải cơ chế bảo mật.`,
      points: [
        { id: 'p1', w: 3, text: 'Authentication = xác minh danh tính (bạn là ai), Authorization = kiểm tra quyền (được làm gì)' },
        { id: 'p2', w: 2, text: 'AuthN diễn ra trước AuthZ; mã lỗi tương ứng 401 và 403' },
        { id: 'p3', w: 2, text: 'Nêu ví dụ cơ chế: API key/JWT/OAuth cho AuthN; role/scope/permission cho AuthZ' },
        { id: 'p4', w: 3, text: 'Áp dụng vào AI Agent: phân quyền theo tool và lọc dữ liệu theo quyền ở tầng retrieval; guardrail phải ở server chứ không dựa vào prompt' },
      ],
      why: 'Rò rỉ dữ liệu qua RAG là sự cố bảo mật phổ biến nhất của hệ thống AI doanh nghiệp, và nó luôn bắt nguồn từ việc bỏ quên AuthZ ở tầng dữ liệu.',
      traps: ['Dừng lại ở định nghĩa sách vở mà không nói tới phân quyền tool và lọc tài liệu theo quyền.'],
      hook: 'AuthN = kiểm tra thẻ ra vào. AuthZ = thẻ đó mở được những phòng nào.',
      related: [51, 94],
    },
    {
      id: 53,
      q: 'Rate Limiting là gì? Tại sao cần nó?',
      type: 'concept',
      diff: 1,
      answer: `**Rate limiting** là giới hạn **số request (hoặc lượng tài nguyên) một client được dùng trong một khoảng thời gian** — ví dụ 60 request/phút mỗi API key, 100k token/ngày mỗi tenant. Vượt ngưỡng ⇒ trả **429 Too Many Requests** kèm header \`Retry-After\`.

**Vì sao cần — với AI thì gấp bội:**
1. **Chi phí.** Mỗi request tốn tiền thật. Không có trần thì một script lỗi (hoặc một vòng lặp phía client) có thể đốt sạch ngân sách tháng trong một đêm.
2. **Bảo vệ hệ thống.** Model có throughput hữu hạn; quá tải làm P95/P99 tăng cho **tất cả** người dùng, không riêng kẻ lạm dụng.
3. **Công bằng giữa các tenant.** Một khách hàng không được chiếm hết tài nguyên của khách hàng khác (noisy neighbor).
4. **Chống lạm dụng**: scraping model, brute-force prompt injection, spam.
5. **Tôn trọng giới hạn của nhà cung cấp**: bản thân API model cũng có rate limit — hết hạn mức ở đó thì cả hệ thống dừng.

**Thiết kế thực tế:**
- Giới hạn **nhiều chiều**: request/phút, **token/phút**, chi phí/ngày, số phiên đồng thời. Với AI, **giới hạn theo token quan trọng hơn theo số request** — một request 100k token nặng gấp trăm lần một request 1k token.
- Thuật toán: token bucket (cho phép burst) hoặc sliding window.
- Phân **hạn mức theo gói dịch vụ**, và trả header \`X-RateLimit-Remaining\` để client tự điều tiết.
- Client cần **retry với exponential backoff + jitter**, không retry ngay lập tức.`,
      points: [
        { id: 'p1', w: 3, text: 'Giới hạn số request/tài nguyên mỗi client trong một đơn vị thời gian; vượt thì trả 429' },
        { id: 'p2', w: 3, text: 'Với AI: kiểm soát chi phí (mỗi request tốn tiền) và bảo vệ hệ thống khỏi quá tải' },
        { id: 'p3', w: 2, text: 'Đảm bảo công bằng giữa các user/tenant và chống lạm dụng; tránh vượt rate limit của nhà cung cấp model' },
        { id: 'p4', w: 2, text: 'Nêu cách làm: giới hạn theo token chứ không chỉ theo số request, token bucket/sliding window, phân hạn mức theo gói, client backoff' },
      ],
      why: 'Rate limit là cái van an toàn tài chính của hệ thống AI. Đây cũng là chỗ AI khác hẳn API thường: chi phí biến thiên theo độ dài, không theo số lần gọi.',
      traps: ['Chỉ nói "tránh spam" mà quên khía cạnh chi phí và giới hạn theo token.'],
      hook: 'Với AI, đếm token mới đúng, đếm request là đếm nhầm.',
      related: [51, 61],
    },
    {
      id: 54,
      q: 'Streaming response có tác dụng gì đối với AI Agent?',
      type: 'concept',
      diff: 2,
      answer: `**Streaming** = trả kết quả **từng phần ngay khi model sinh ra** (SSE / chunked / WebSocket), thay vì đợi sinh xong toàn bộ rồi mới trả một cục.

**Tác dụng:**
1. **Giảm cảm nhận chờ đợi — TTFT nhỏ.** Người dùng thấy chữ đầu tiên sau ~0.5s thay vì nhìn màn hình trống 8s. Tổng thời gian không đổi, nhưng trải nghiệm khác hẳn: người ta chịu đựng được sự chờ đợi *có tiến triển*.
2. **Tránh timeout.** Câu trả lời dài có thể vượt timeout của proxy/load balancer/HTTP client. Stream giữ kết nối "sống" bằng dữ liệu liên tục.
3. **Cho phép hủy sớm.** Người dùng thấy sai hướng ngay từ vài câu đầu ⇒ bấm dừng ⇒ **tiết kiệm token** không sinh nữa.
4. **Hiển thị tiến trình của agent.** Với ReAct nhiều bước, có thể stream trạng thái: "đang tra cứu đơn hàng…", "đang tính toán…" ⇒ minh bạch, giảm sốt ruột.
5. **Xử lý song song phía client**: bắt đầu render/định dạng khi phần sau còn đang sinh.

**Cái giá phải trả:**
- **Không validate được toàn bộ output trước khi hiển thị** — chữ đã lên màn hình rồi mới biết vi phạm guardrail. Với nội dung nhạy cảm, cần buffer một phần hoặc kiểm tra theo cửa sổ trượt.
- Khó áp dụng khi đầu ra phải là **JSON đúng schema** cho hệ thống khác dùng (đối tượng chưa đóng ngoặc thì chưa parse được).
- Xử lý lỗi giữa chừng phức tạp hơn (đã trả 200 rồi mới hỏng); cần cơ chế báo lỗi trong luồng và khả năng nối lại.
- Hạ tầng phải hỗ trợ: tắt buffering ở nginx/CDN, giữ kết nối lâu.`,
      points: [
        { id: 'p1', w: 3, text: 'Trả kết quả từng phần ngay khi sinh, giúp TTFT thấp và cải thiện trải nghiệm chờ đợi' },
        { id: 'p2', w: 2, text: 'Tránh timeout với câu trả lời dài và giữ kết nối sống' },
        { id: 'p3', w: 2, text: 'Cho phép người dùng dừng sớm (tiết kiệm token) và hiển thị tiến trình từng bước của agent' },
        { id: 'p4', w: 2, text: 'Nêu đánh đổi: khó validate/guardrail toàn bộ output trước khi hiển thị, khó với JSON schema, xử lý lỗi giữa luồng phức tạp hơn' },
      ],
      why: 'Streaming là cách rẻ nhất để cải thiện trải nghiệm AI mà không đụng tới chất lượng model. Nhưng nó phá vỡ mô hình "validate rồi mới trả" — biết đánh đổi này là dấu hiệu người đã làm thật.',
      traps: ['Nói "streaming làm hệ thống nhanh hơn" — nó không giảm tổng thời gian, chỉ giảm thời gian tới byte đầu tiên.'],
      hook: 'Streaming không rút ngắn bữa ăn, nó chỉ mang món khai vị ra sớm.',
      related: [58, 59],
    },
    {
      id: 55,
      q: 'Timeout dùng để làm gì?',
      type: 'concept',
      diff: 1,
      answer: `**Timeout** là **thời gian tối đa chờ một thao tác** trước khi hủy và trả lỗi. Nó bảo đảm hệ thống **thất bại nhanh và có kiểm soát** thay vì treo vô hạn.

**Vì sao cần:**
1. **Giải phóng tài nguyên**: mỗi request treo giữ một connection, một thread, một chỗ trong pool. Đủ nhiều request treo ⇒ hệ thống chết dù không có lỗi nào.
2. **Chặn lan truyền lỗi (cascading failure)**: dịch vụ phụ thuộc chậm không được kéo cả hệ thống chậm theo. Timeout + circuit breaker là cặp bài trùng.
3. **Đảm bảo trải nghiệm có giới hạn**: thà báo "hệ thống bận, thử lại" sau 15s còn hơn để người dùng chờ 3 phút.
4. **Chặn chi phí**: agent chạy vô tận là tiền chạy vô tận.

**Trong AI Agent, timeout phải đặt ở nhiều tầng:**

| Tầng | Ví dụ |
|---|---|
| Mỗi lời gọi tool | 3–10s (API bên ngoài) |
| Mỗi lời gọi LLM | 30–60s |
| Toàn bộ phiên agent | 60–120s, kèm \`max_steps\` |
| HTTP request từ client | dài hơn tổng trên một chút |

**Nguyên tắc:** timeout của tầng ngoài **phải lớn hơn** tổng timeout tầng trong, nếu không tầng ngoài cắt trước và bạn mất luôn thông tin lỗi thật. Khi timeout, đừng im lặng: **log, đếm metric, và trả lỗi có cấu trúc**; kèm retry có backoff cho thao tác *đọc* (idempotent), tuyệt đối cẩn thận với thao tác *ghi*.`,
      points: [
        { id: 'p1', w: 3, text: 'Giới hạn thời gian chờ tối đa cho một thao tác, tránh treo vô hạn — fail fast' },
        { id: 'p2', w: 2, text: 'Giải phóng tài nguyên (connection, thread, pool) và ngăn lỗi lan truyền toàn hệ thống' },
        { id: 'p3', w: 2, text: 'Đảm bảo trải nghiệm người dùng có giới hạn và chặn chi phí chạy vô tận' },
        { id: 'p4', w: 2, text: 'Với agent: đặt timeout nhiều tầng (tool, LLM call, cả phiên) kết hợp max_steps; tầng ngoài phải lớn hơn tổng tầng trong; có log/retry/fallback' },
      ],
      why: 'Agent gọi nhiều dịch vụ nối tiếp nhau, nên nó là nơi timeout dễ bị đặt sai tầng nhất — và hậu quả là hệ thống chết cả cụm khi một API bên ngoài chậm.',
      traps: ['Chỉ đặt một timeout ở tầng HTTP ngoài cùng.', 'Retry vô điều kiện sau timeout, kể cả với hành động ghi.'],
      hook: 'Thà chết nhanh còn hơn treo lâu.',
      related: [38, 51],
    },
    {
      id: 56,
      q: 'API Versioning là gì? Tại sao cần version API?',
      type: 'concept',
      diff: 2,
      answer: `**API Versioning** là gắn **phiên bản** cho hợp đồng API (\`/v1/chat\`, header \`API-Version: 2026-09-01\`), để có thể **thay đổi mà không phá vỡ client đang chạy**.

**Vì sao cần:**
1. **Backward compatibility.** Client (mobile app, đối tác tích hợp) không nâng cấp cùng lúc với server. Đổi schema đột ngột = ứng dụng của khách hàng vỡ.
2. **Cho phép breaking change có kiểm soát**: đổi tên trường, đổi kiểu, bỏ trường, đổi ngữ nghĩa ⇒ phát hành \`/v2\`, giữ \`/v1\` chạy song song trong thời gian chuyển tiếp (deprecation window) rồi mới tắt.
3. **Rollback an toàn**: có vấn đề ở v2 thì chuyển traffic về v1.
4. **Thử nghiệm**: chạy song song hai phiên bản để A/B test.

**Với AI Agent, versioning còn quan trọng hơn API thường** vì có nhiều thứ thay đổi ngầm mà client không thấy:
- **Model** đổi (nâng cấp, hoặc nhà cung cấp khai tử bản cũ) ⇒ hành vi và định dạng đầu ra đổi.
- **Prompt** đổi ⇒ giọng điệu, độ dài, cấu trúc đổi.
- **RAG/knowledge base** đổi ⇒ nội dung câu trả lời đổi.
- **Tool** thêm/bớt ⇒ khả năng của agent đổi.

⇒ Thực hành tốt: **version cả API lẫn "cấu hình AI"** (prompt version, model version, KB version) và **ghi chúng vào mỗi response/log** (\`"meta": {"prompt_v": "3.2", "model": "...", "kb_v": "2026-09"}\`). Nhờ vậy khi chất lượng tụt, bạn biết chính xác cái gì đã đổi — nếu không thì mọi cuộc điều tra đều là phỏng đoán.`,
      points: [
        { id: 'p1', w: 3, text: 'Gắn phiên bản cho API (ví dụ /v1/) để thay đổi mà không phá vỡ client đang dùng — backward compatibility' },
        { id: 'p2', w: 2, text: 'Cho phép breaking change có kiểm soát: v1 và v2 chạy song song, có thời gian deprecation, rollback được' },
        { id: 'p3', w: 3, text: 'Với AI: model/prompt/knowledge base thay đổi làm hành vi đổi dù endpoint không đổi ⇒ cần version cho cả cấu hình AI' },
        { id: 'p4', w: 1, text: 'Ghi version (prompt/model/KB) vào response và log để truy vết khi chất lượng thay đổi' },
      ],
      why: 'Trong hệ thống AI, "cùng một endpoint, hành vi khác đi" là chuyện xảy ra hằng tuần. Versioning là cách duy nhất để chuyện đó không thành sự cố.',
      traps: ['Chỉ nói về versioning REST thuần mà quên đặc thù prompt/model/KB của AI.'],
      hook: 'Endpoint giữ nguyên nhưng model đổi ⇒ vẫn là breaking change.',
      related: [57, 113],
    },
    {
      id: 57,
      q: 'API `/v1/chat` có ý nghĩa gì?',
      type: 'concept',
      diff: 1,
      answer: `Đọc theo hai phần:

- **\`/v1\`** — **phiên bản 1** của hợp đồng API. Báo cho client: cấu trúc request/response ở đường dẫn này ổn định; muốn thay đổi phá vỡ tương thích thì sẽ có \`/v2\`.
- **\`/chat\`** — **tài nguyên/khả năng**: endpoint hội thoại. Thường nhận \`POST\` với body chứa message của người dùng (+ \`conversation_id\`, tham số) và trả về câu trả lời của agent.

Ví dụ điển hình:
\`\`\`http
POST /v1/chat
Authorization: Bearer <token>
Idempotency-Key: 6f1c...
Content-Type: application/json

{ "message": "Đơn DH123 của tôi tới đâu rồi?",
  "conversation_id": "c_889", "stream": true }
\`\`\`
\`\`\`json
{ "reply": "Đơn DH123 đang ở kho Bình Dương, dự kiến giao 06/09.",
  "conversation_id": "c_889",
  "citations": ["order_db#DH123"],
  "meta": { "request_id": "req_01H...", "model": "...", "prompt_v": "3.2",
            "tokens": {"in": 1820, "out": 96}, "latency_ms": 2310 } }
\`\`\`

**Vì sao đặt tên như vậy là tốt:** version nằm ngay đầu đường dẫn (dễ định tuyến, dễ đọc log), tên tài nguyên là **danh từ mô tả khả năng** chứ không phải động từ (\`/v1/chat\` chứ không phải \`/v1/getChatAnswer\`), và nó tách bạch với các endpoint khác của cùng hệ thống: \`/v1/feedback\`, \`/v1/conversations/{id}\`, \`/v1/health\`.`,
      points: [
        { id: 'p1', w: 3, text: '/v1 = phiên bản 1 của API, cho phép nâng cấp lên v2 mà không phá client cũ' },
        { id: 'p2', w: 3, text: '/chat = endpoint/tài nguyên hội thoại, thường nhận POST message của user và trả câu trả lời của agent' },
        { id: 'p3', w: 2, text: 'Mô tả được request/response điển hình (message, conversation_id, reply, metadata)' },
        { id: 'p4', w: 1, text: 'Nêu quy ước đặt tên REST: version ở đầu path, tên tài nguyên là danh từ, tách bạch với các endpoint khác' },
      ],
      why: 'Câu dễ, nhưng trả lời đầy đủ (kể cả metadata trong response) cho thấy bạn nghĩ về API như một hợp đồng vận hành chứ không chỉ một URL.',
      traps: ['Chỉ nói "đây là API chat" mà bỏ qua ý nghĩa của /v1.'],
      hook: 'v1 = lời hứa về hình dạng. chat = việc nó làm.',
      related: [56, 51],
    },
  ],
};
