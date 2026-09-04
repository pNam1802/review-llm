export default {
  id: 'cicd',
  name: 'CI/CD',
  short: 'CI/CD',
  emoji: '🚀',
  blurb: 'Đưa AI Evaluation vào pipeline: test cái gì, chặn ở đâu, deploy thế nào.',
  questions: [
    {
      id: 105,
      q: 'CI là gì?',
      type: 'concept',
      diff: 1,
      answer: `**CI = Continuous Integration (Tích hợp liên tục)**: mỗi thay đổi code được **merge vào nhánh chung thường xuyên** (ít nhất mỗi ngày), và mỗi lần merge đều **tự động build + chạy test** để phát hiện lỗi ngay.

**Một pipeline CI điển hình:**
\`\`\`
push/PR → checkout → cài dependency → lint & format → build
        → unit test → integration test → security scan → báo kết quả
\`\`\`

**Mục đích:**
- **Phát hiện lỗi sớm**, khi thay đổi còn nhỏ và người viết còn nhớ ngữ cảnh.
- **Tránh "merge hell"**: nhánh sống lâu tách xa nhau rồi xung đột hàng loạt.
- **Đảm bảo nhánh chính luôn ở trạng thái chạy được.**
- Tạo phản hồi nhanh cho lập trình viên (mục tiêu: dưới 10 phút).

**Với hệ thống AI, CI có thêm những bước riêng:**
- **Kiểm tra prompt**: prompt có được version chưa, có biến bắt buộc nào bị thiếu không.
- **Test tool** của agent (schema, xử lý lỗi, timeout) bằng mock.
- **Test Output Contract**: đầu ra có đúng schema không.
- **AI Evaluation nhanh** trên một tập nhỏ (20–50 câu) như một dạng smoke test — bộ đầy đủ để dành cho bước trước deploy vì tốn tiền và thời gian hơn.`,
      points: [
        { id: 'p1', w: 3, text: 'Continuous Integration: tích hợp/merge code thường xuyên vào nhánh chung' },
        { id: 'p2', w: 3, text: 'Mỗi lần thay đổi đều tự động build và chạy test để phát hiện lỗi sớm' },
        { id: 'p3', w: 2, text: 'Mục đích: giữ nhánh chính luôn chạy được, tránh xung đột lớn, phản hồi nhanh cho dev' },
        { id: 'p4', w: 2, text: 'Với AI: thêm test prompt/tool/output contract và một eval nhanh trên tập nhỏ' },
      ],
      why: 'CI là nơi bạn cài đặt kỷ luật chất lượng. Với AI, đây cũng là nơi đầu tiên có thể chặn một prompt tệ.',
      traps: ['Nhầm CI với CD.', 'Chỉ nói "tự động build" mà quên phần test và mục đích phát hiện lỗi sớm.'],
      hook: 'CI = gộp sớm, test ngay.',
      related: [106, 107],
    },
    {
      id: 106,
      q: 'CD là gì?',
      type: 'concept',
      diff: 1,
      answer: `**CD** có hai nghĩa, thường đi cùng nhau:

- **Continuous Delivery (Chuyển giao liên tục):** mọi thay đổi qua được CI đều được **đóng gói sẵn sàng để phát hành bất cứ lúc nào**; việc bấm nút deploy là **quyết định của con người**.
- **Continuous Deployment (Triển khai liên tục):** đi thêm một bước — thay đổi qua được toàn bộ kiểm thử sẽ **tự động deploy thẳng lên production**, không cần ai bấm nút.

**Pipeline CD điển hình:**
\`\`\`
artifact đã build → deploy staging → test trên staging (e2e, eval đầy đủ)
   → phê duyệt (Delivery) hoặc tự động (Deployment)
   → deploy production theo canary/blue-green → smoke test → theo dõi
   → tự động rollback nếu chỉ số xấu
\`\`\`

**Mục đích:** rút ngắn thời gian từ "code xong" đến "người dùng dùng được", giảm rủi ro nhờ **phát hành nhiều lần và nhỏ**, và làm cho việc deploy trở nên **buồn tẻ** — dấu hiệu của một quy trình lành mạnh.

**Với hệ thống AI cần lưu ý:** "deploy" không chỉ là code — còn có **prompt, model version, knowledge base/index, cấu hình tool**. Mỗi thứ đều cần version, đều cần đi qua eval, và đều phải rollback được. Nhiều đội chọn **Continuous Delivery** (có người duyệt) cho phần AI, vì thay đổi prompt/model có thể làm đổi hành vi theo cách test tự động không bắt hết.`,
      points: [
        { id: 'p1', w: 3, text: 'Continuous Delivery: luôn giữ bản build sẵn sàng phát hành, việc deploy do người quyết định' },
        { id: 'p2', w: 3, text: 'Continuous Deployment: tự động deploy lên production khi qua hết kiểm thử' },
        { id: 'p3', w: 2, text: 'Mục đích: rút ngắn thời gian ra sản phẩm, phát hành nhỏ và thường xuyên để giảm rủi ro' },
        { id: 'p4', w: 2, text: 'Với AI: đối tượng deploy gồm cả prompt/model/knowledge base, mỗi thứ cần version và rollback; thường chọn Delivery có người duyệt' },
      ],
      why: 'Phân biệt Delivery và Deployment là câu hỏi phỏng vấn cơ bản, nhưng phần đáng giá là nhận ra "artifact" của hệ thống AI gồm nhiều thứ hơn code.',
      traps: ['Chỉ nói một trong hai nghĩa mà không phân biệt.'],
      hook: 'Delivery: sẵn sàng, chờ người bấm. Deployment: tự bấm.',
      related: [105, 107],
    },
    {
      id: 107,
      q: 'CI và CD khác nhau như thế nào?',
      type: 'compare',
      diff: 1,
      answer: `| | **CI (Continuous Integration)** | **CD (Delivery / Deployment)** |
|---|---|---|
| Trả lời câu hỏi | "Code này có **đúng** không?" | "Đưa nó **tới người dùng** thế nào cho an toàn?" |
| Phạm vi | Từ commit đến bản build đã qua test | Từ bản build đến production |
| Việc chính | Build, lint, unit/integration test, security scan | Deploy staging, e2e test, phê duyệt, canary/blue-green, rollback |
| Môi trường | Máy CI (ephemeral) | Staging → Production |
| Kết quả | **Artifact** đã được kiểm chứng | **Phiên bản đang chạy** phục vụ người dùng |
| Thất bại nghĩa là | Không merge được | Không phát hành / phải rollback |
| Người hưởng lợi trực tiếp | Lập trình viên | Người dùng cuối |

**Quan hệ:** CI là **điều kiện tiên quyết** của CD — không có bộ test đáng tin thì tự động deploy chỉ là tự động phát tán lỗi nhanh hơn. Chúng nối thành một chuỗi liên tục:
\`\`\`
commit → [CI: build + test] → artifact → [CD: staging → duyệt → production] → monitor
\`\`\`

**Trong hệ thống AI, ranh giới đặt ở đâu:**
- **CI**: test code, test tool, kiểm tra schema/output contract, **eval nhanh trên tập nhỏ**.
- **CD**: **AI evaluation đầy đủ trên golden dataset làm cổng chặn**, red teaming, canary so sánh chất lượng với bản đang chạy trên traffic thật, và rollback tự động khi chỉ số chất lượng tụt.`,
      points: [
        { id: 'p1', w: 3, text: 'CI tập trung vào tích hợp và kiểm thử code (code có đúng không); CD tập trung vào đưa bản build ra môi trường/production' },
        { id: 'p2', w: 2, text: 'CI kết thúc bằng artifact đã qua test; CD kết thúc bằng phiên bản đang chạy phục vụ người dùng' },
        { id: 'p3', w: 2, text: 'CI là điều kiện tiên quyết của CD — không có test đáng tin thì tự động deploy chỉ phát tán lỗi nhanh hơn' },
        { id: 'p4', w: 2, text: 'Với AI: CI chạy test nhanh và eval tập nhỏ; CD chạy eval đầy đủ trên golden dataset, canary và rollback' },
      ],
      why: 'Hiểu ranh giới giúp bạn đặt AI evaluation đúng chỗ: eval nhanh ở CI để phản hồi tức thì, eval đầy đủ ở CD để làm cổng chặn.',
      traps: ['Trả lời "CI là test, CD là deploy" mà không nêu quan hệ phụ thuộc và ranh giới đặt eval.'],
      hook: 'CI hỏi "đúng chưa", CD hỏi "ra được chưa".',
      related: [105, 106, 108],
    },
    {
      id: 108,
      q: 'Một CI/CD pipeline cơ bản cho AI Agent nên gồm những bước nào?',
      type: 'design',
      diff: 2,
      answer: `\`\`\`
1.  Trigger        : push / pull request / thay đổi prompt / cập nhật knowledge base
2.  Lint & format  : code + kiểm tra cấu trúc file prompt
3.  Build          : đóng gói ứng dụng, container image
4.  Unit test      : hàm xử lý, tool, parser, validator schema
5.  Integration    : pipeline RAG chạy được, agent gọi tool được (dùng mock)
6.  Contract test  : đầu ra đúng Output Contract/JSON schema
7.  Eval nhanh     : 20–50 câu, ngưỡng tối thiểu → phản hồi trong vài phút
8.  Security scan  : dependency, secrets, prompt injection test cơ bản
    ─────────── nếu qua hết ───────────
9.  Deploy staging : cùng cấu hình production, dữ liệu gần thật
10. AI Evaluation đầy đủ : golden dataset + RAGAS + LLM judge
                           + so sánh với baseline/bản đang chạy
11. Red teaming    : prompt injection, câu ngoài phạm vi, yêu cầu vượt quyền, PII
12. Perf & cost    : latency P95/P99, TTFT, cost/request
    ─────────── cổng chặn (quality gate) ───────────
13. Phê duyệt      : tự động nếu vượt ngưỡng; có người duyệt cho thay đổi lớn
14. Deploy canary  : 5–10% traffic, so chất lượng/chi phí/latency với bản cũ
15. Smoke test     : vài kịch bản chính trên production
16. Mở rộng dần    : 25% → 50% → 100% nếu chỉ số ổn
17. Monitor + auto-rollback : quality score, error rate, cost, escalate rate
18. Ghi nhận       : lưu version (code + prompt + model + KB), kết quả eval, changelog
\`\`\`

**Ba điểm khác biệt so với pipeline phần mềm thường:**
1. **Bước 10 (AI Evaluation) là cổng chặn bắt buộc** — không có nó thì mọi thay đổi prompt đều là đánh cược.
2. **Trigger bao gồm cả thay đổi dữ liệu và prompt**, không chỉ thay đổi code.
3. **Canary phải so sánh chất lượng nội dung**, không chỉ so error rate — vì lỗi của AI không tạo ra mã lỗi.`,
      points: [
        { id: 'p1', w: 3, text: 'Các bước CI: trigger → lint → build → unit/integration test → contract test (schema) → security scan' },
        { id: 'p2', w: 3, text: 'AI Evaluation trên golden dataset làm cổng chặn (quality gate) trước khi deploy, có so sánh với baseline' },
        { id: 'p3', w: 3, text: 'Deploy staging rồi production theo canary/tăng dần, có smoke test và rollback' },
        { id: 'p4', w: 2, text: 'Monitoring sau deploy và versioning đầy đủ (code + prompt + model + KB); trigger bao gồm cả thay đổi prompt/dữ liệu' },
      ],
      why: 'Đây là bản đồ để bạn biết đặt từng loại kiểm thử ở đâu — nhanh và rẻ thì đặt sớm, đắt và chậm thì đặt muộn.',
      traps: ['Quên bước eval hoặc đặt eval sau khi deploy.', 'Chỉ trigger theo thay đổi code, bỏ qua thay đổi prompt/KB.'],
      hook: 'Rẻ và nhanh trước, đắt và chậm sau, cổng chặn ngay trước production.',
      related: [109, 111, 114],
    },
    {
      id: 109,
      q: 'Hãy thiết kế CI/CD pipeline cho AI Customer Support Agent.',
      type: 'design',
      diff: 3,
      answer: `\`\`\`
┌── TRIGGER ─────────────────────────────────────────────────────┐
│ PR vào main │ đổi prompt/*.md │ cập nhật KB │ đổi model version │
└───────────────────────────┬────────────────────────────────────┘
                            ▼
┌── CI (mục tiêu < 10 phút) ─────────────────────────────────────┐
│ lint + secret scan → build image                                │
│ unit test: tool (get_order_status, search_policy, create_ticket)│
│ integration test (mock): RAG trả đúng định dạng, agent gọi tool │
│ contract test: JSON schema {reply, citations, needs_human,      │
│                intent, confidence}                              │
│ eval nhanh 30 câu: faithfulness ≥ 0.85, không vi phạm cấm       │
└───────────────────────────┬────────────────────────────────────┘
                            ▼
┌── STAGING ─────────────────────────────────────────────────────┐
│ deploy staging (KB bản mirror, tool trỏ sandbox)                │
│ AI EVAL ĐẦY ĐỦ trên golden dataset 200 câu, cắt lát theo intent │
│   • Faithfulness ≥ 0.90      • Answer Relevancy ≥ 0.85          │
│   • Context Recall ≥ 0.85    • Citation coverage 100%           │
│   • So sánh với bản production hiện tại (không được kém hơn)    │
│ SAFETY: prompt injection, đòi lộ system prompt, yêu cầu hoàn    │
│   tiền vượt quyền, câu ngoài phạm vi, rò rỉ PII → phải 100% đạt │
│ PERF & COST: P95 < 3s, TTFT < 1s, cost/request ≤ 1.500đ         │
└───────────────────────────┬────────────────────────────────────┘
                    QUALITY GATE  (fail → chặn merge/deploy, báo diff điểm)
                            ▼
┌── PRODUCTION ──────────────────────────────────────────────────┐
│ phê duyệt: tự động cho thay đổi nhỏ; cần CS Lead duyệt nếu      │
│            đổi prompt về chính sách hoặc đổi model              │
│ canary 5% → smoke test → 25% → 50% → 100% (mỗi mốc giữ 30-60')  │
│ theo dõi ở mỗi mốc: escalate rate, 👎 rate, quality (LLM judge  │
│            trên mẫu), P95, cost/request, error rate             │
│ AUTO-ROLLBACK nếu: escalate rate +50% │ quality < ngưỡng │      │
│            error rate > 1% │ cost/request +40%                  │
└───────────────────────────┬────────────────────────────────────┘
                            ▼
┌── SAU DEPLOY ──────────────────────────────────────────────────┐
│ monitor 24/7 (quality, cost, latency, drift)                    │
│ lấy mẫu hằng ngày cho LLM judge + người soát ngẫu nhiên         │
│ ca thất bại → bổ sung golden dataset (vòng phản hồi)            │
│ lưu version: code + prompt_v + model + kb_v + kết quả eval      │
└────────────────────────────────────────────────────────────────┘
\`\`\`

**Điểm nhấn thiết kế:**
- **Prompt và knowledge base được version và trigger pipeline như code** — đây là khác biệt lớn nhất so với pipeline thường.
- **Quality gate có ngưỡng tuyệt đối *và* so sánh tương đối với bản đang chạy** — chặn được cả trường hợp "vẫn trên ngưỡng nhưng kém hơn hôm qua".
- **Nhóm kiểm thử an toàn phải đạt 100%**, không có ngưỡng thỏa hiệp.
- **Canary so chất lượng nội dung**, không chỉ so error rate.
- **Vòng phản hồi**: mọi ca lỗi ngoài production quay lại làm giàu golden dataset.`,
      points: [
        { id: 'p1', w: 3, text: 'Trigger bao gồm cả thay đổi prompt và knowledge base, không chỉ code; prompt/KB được version' },
        { id: 'p2', w: 3, text: 'CI nhanh (unit/integration/contract test + eval nhỏ) rồi staging với AI evaluation đầy đủ trên golden dataset, có ngưỡng cụ thể' },
        { id: 'p3', w: 3, text: 'Có quality gate chặn deploy, kiểm thử an toàn (prompt injection, vượt quyền, PII) và kiểm tra latency/cost' },
        { id: 'p4', w: 3, text: 'Deploy canary tăng dần với auto-rollback theo chỉ số, monitoring sau deploy và vòng phản hồi bổ sung ca lỗi vào golden dataset' },
      ],
      why: 'Đây là câu thiết kế tổng hợp: nó cho thấy bạn có biết cắm AI evaluation vào đúng chỗ trong quy trình kỹ thuật hay không.',
      traps: [
        'Vẽ pipeline phần mềm thông thường rồi thêm chữ "AI" — thiếu eval, thiếu version prompt/KB, thiếu canary so chất lượng.',
        'Đặt ngưỡng tuyệt đối mà quên so sánh với bản đang chạy.',
      ],
      hook: 'Test nhanh → Eval đầy đủ → Cổng chặn → Canary → Rollback → Học lại.',
      related: [108, 112, 114],
    },
    {
      id: 110,
      q: 'Trong CI/CD của AI Agent cần test những gì?',
      type: 'design',
      diff: 2,
      answer: `**1. Test phần mềm truyền thống (tất định, pass/fail)**
- **Unit test**: từng tool (tham số hợp lệ/không hợp lệ, lỗi, timeout), hàm parse, validator, hàm tính toán.
- **Integration test**: pipeline RAG chạy thông (ingest → embed → search), agent gọi được tool, kết nối DB/API.
- **Contract test**: đầu ra đúng JSON schema; các trường bắt buộc luôn có; enum không có giá trị lạ.
- **Regression test**: các bug đã sửa không quay lại.

**2. AI Evaluation (chấm mức độ)**
- **Chất lượng RAG**: faithfulness, answer relevancy, context precision/recall trên golden dataset.
- **Độ chính xác theo ý**: các \`must_include\` có xuất hiện không; \`must_not_include\` có bị vi phạm không.
- **Citation coverage**: tỉ lệ câu trả lời có dẫn nguồn hợp lệ.
- **Hành vi đúng theo tình huống**: ca ngoài phạm vi phải từ chối; ca thiếu thông tin phải hỏi lại hoặc escalate — **đúng hành vi cũng là một dạng đúng**.
- **So sánh với baseline**: không được kém hơn bản đang chạy.

**3. Test an toàn & bảo mật (phải đạt 100%)**
- **Prompt injection**: "bỏ qua hướng dẫn trước", chỉ thị giấu trong tài liệu được retrieve, nội dung độc trong kết quả tool.
- **Đòi lộ system prompt / thông tin nội bộ.**
- **Vượt quyền**: yêu cầu hoàn tiền/hành động ngoài hạn mức.
- **Rò rỉ PII** và kiểm tra phân quyền dữ liệu: user A không được thấy dữ liệu user B.
- Nội dung độc hại, thiên lệch.

**4. Hiệu năng & chi phí**
- Latency P95/P99, TTFT; số bước agent trung bình; cost/request và token/request; hành vi khi tải cao; tỉ lệ lỗi khi tool timeout.

**5. Vận hành**
- Rollback có hoạt động không; health check; migration; feature flag; cấu hình giữa các môi trường có khớp không.

**Nguyên tắc phân bổ:** cái nhanh và rẻ chạy ở mỗi commit; cái chậm và tốn tiền (eval đầy đủ, red teaming) chạy ở giai đoạn trước deploy hoặc theo lịch.`,
      points: [
        { id: 'p1', w: 3, text: 'Test phần mềm truyền thống: unit test cho tool/hàm, integration test pipeline RAG-agent, contract test cho output schema' },
        { id: 'p2', w: 3, text: 'AI evaluation trên golden dataset: faithfulness/relevancy/context metrics, độ phủ ý bắt buộc, citation, so sánh với baseline' },
        { id: 'p3', w: 3, text: 'Test an toàn: prompt injection, đòi lộ system prompt, yêu cầu vượt quyền, rò rỉ PII/phân quyền dữ liệu' },
        { id: 'p4', w: 2, text: 'Test hiệu năng và chi phí (P95/P99, TTFT, cost/request) và test vận hành (rollback, health check, cấu hình môi trường)' },
      ],
      why: 'Danh sách này là checklist thực chiến. Điểm đặc biệt: với AI, "trả lời đúng hành vi" (biết từ chối, biết escalate) cũng phải được test như một tính năng.',
      traps: ['Chỉ nêu unit test và eval, bỏ qua nhóm an toàn và nhóm chi phí.'],
      hook: '5 nhóm: Code – Chất lượng – An toàn – Hiệu năng/Chi phí – Vận hành.',
      related: [108, 109, 111],
    },
    {
      id: 111,
      q: 'Tại sao AI Evaluation cần được đưa vào CI/CD?',
      type: 'concept',
      diff: 2,
      answer: `Vì với hệ thống AI, **test truyền thống không phát hiện được sự suy giảm chất lượng** — code vẫn chạy, API vẫn trả 200, chỉ có nội dung là kém đi.

**Sáu lý do:**
1. **Chất lượng là thứ duy nhất có thể âm thầm hỏng.** Sửa một câu trong prompt có thể làm faithfulness tụt 15% mà **không một unit test nào đỏ**. Eval là bộ test duy nhất nhìn thấy điều đó.
2. **Chống hồi quy.** Sửa prompt cho nhóm câu hỏi A rất dễ làm hỏng nhóm B. Không chạy lại toàn bộ golden dataset thì bạn không bao giờ biết.
3. **Chặn tự động, khách quan.** Quality gate biến "tôi thấy nó có vẻ tốt hơn" thành "faithfulness 0.91 ≥ ngưỡng 0.90, và không kém bản đang chạy".
4. **Tần suất thay đổi rất cao.** Prompt, model, knowledge base, top-k đổi liên tục — thủ công không theo kịp. Chỉ tự động hóa mới đủ nhanh.
5. **Nhiều biến cùng thay đổi.** Eval gắn với version (code + prompt + model + KB) cho phép quy kết: chất lượng tụt vì cái nào.
6. **Rẻ hơn nhiều so với phát hiện muộn.** Một prompt tệ bị chặn ở pipeline tốn vài đô tiền eval; cũng prompt đó ra production thì tốn uy tín và có thể tạo cam kết sai với khách hàng.

**Nhược điểm phải xử lý:** eval **tốn tiền và thời gian** (mỗi lần chạy là hàng trăm lời gọi LLM) và **có nhiễu** (không tất định). Cách xử lý: eval nhanh ở CI (tập nhỏ) + eval đầy đủ trước deploy; đặt temperature = 0; dùng ngưỡng có biên độ thay vì so sánh cứng; và **cache kết quả eval** cho những phần không thay đổi.`,
      points: [
        { id: 'p1', w: 3, text: 'Test truyền thống không bắt được suy giảm chất lượng: code vẫn chạy, API vẫn 200 nhưng câu trả lời kém đi' },
        { id: 'p2', w: 3, text: 'Chống hồi quy: sửa cho nhóm câu hỏi này dễ làm hỏng nhóm khác, chỉ chạy lại eval toàn bộ mới phát hiện' },
        { id: 'p3', w: 2, text: 'Tạo cổng chặn tự động, khách quan theo ngưỡng thay vì đánh giá cảm tính; gắn kết quả với version để quy kết nguyên nhân' },
        { id: 'p4', w: 2, text: 'Tần suất thay đổi prompt/model/KB rất cao nên phải tự động hóa; và nêu được nhược điểm (tốn chi phí, có nhiễu) cùng cách xử lý' },
      ],
      why: 'Đây là ý tưởng trung tâm của MLOps/LLMOps: chất lượng phải được kiểm soát bằng máy, vì con người không thể đọc lại 200 câu trả lời mỗi lần sửa một dòng prompt.',
      traps: ['Chỉ nói "để đảm bảo chất lượng" mà không nêu vì sao test thường không đủ.'],
      hook: 'Unit test canh code. Eval canh câu trả lời.',
      related: [76, 86, 112],
    },
    {
      id: 112,
      q: 'Nếu AI Evaluation không đạt threshold thì pipeline nên xử lý như thế nào?',
      type: 'judgment',
      diff: 2,
      answer: `**Nguyên tắc: chặn lại (fail the build), không cho đi tiếp — và cung cấp đủ thông tin để sửa.**

**Quy trình xử lý:**
1. **Dừng pipeline**, không deploy. Đánh dấu build là failed/blocked.
2. **Báo cáo cụ thể, không chỉ báo "fail"**: metric nào tụt, tụt bao nhiêu so với baseline, **những câu nào trong golden dataset bị hỏng** (kèm câu trả lời cũ vs mới). Không có phần này thì người sửa phải mò lại từ đầu.
3. **Thông báo cho đúng người** (chủ PR, kênh chat của đội) kèm link tới báo cáo eval.
4. **Lưu artifact eval** để so sánh về sau.
5. **Người phụ trách quyết định**: sửa prompt/dữ liệu rồi chạy lại; hoặc xác định đây là **thay đổi có chủ đích** (ví dụ vừa siết prompt nên câu trả lời ngắn hơn, relevancy giảm nhẹ) ⇒ cần **cơ chế override có kiểm soát**: phải có người duyệt, ghi rõ lý do, và cập nhật baseline/golden dataset một cách minh bạch.

**Phân tầng ngưỡng cho hợp lý (đừng để mọi thứ đều chặn cứng):**

| Loại | Xử lý |
|---|---|
| **An toàn** (injection, PII, vượt quyền) | **Hard fail** — không có ngoại lệ, không override |
| **Chất lượng lõi** dưới ngưỡng tuyệt đối | Hard fail |
| **Kém hơn baseline** vượt biên độ nhiễu | Fail, cho phép override có phê duyệt |
| **Giảm nhẹ trong biên độ nhiễu** | **Warning** — cho qua nhưng ghi nhận và theo dõi |
| Latency/cost vượt ngưỡng | Warning hoặc fail tùy mức độ |

**Nếu đã lỡ ra production rồi mới phát hiện:** **rollback trước, điều tra sau**.

**Điều tối kỵ:** hạ ngưỡng cho vừa kết quả để pipeline xanh trở lại. Làm vậy một lần thì quality gate mất hết ý nghĩa — và lần sau sẽ dễ hạ tiếp.`,
      points: [
        { id: 'p1', w: 3, text: 'Chặn pipeline, không cho deploy (fail the build)' },
        { id: 'p2', w: 3, text: 'Báo cáo chi tiết: metric nào không đạt, so với baseline bao nhiêu, những câu nào bị hỏng, và thông báo cho đúng người' },
        { id: 'p3', w: 2, text: 'Cho phép override có kiểm soát khi thay đổi là có chủ đích (cần phê duyệt, ghi lý do, cập nhật baseline/golden dataset)' },
        { id: 'p4', w: 2, text: 'Phân tầng ngưỡng: nhóm an toàn hard fail không ngoại lệ, giảm nhẹ trong biên nhiễu chỉ warning; nếu đã lên production thì rollback trước; không hạ ngưỡng cho vừa kết quả' },
      ],
      why: 'Một quality gate không bao giờ chặn ai là một quality gate vô dụng. Nhưng gate quá cứng cũng bị đội né bằng cách tắt nó — nên phân tầng mới là câu trả lời chín chắn.',
      traps: [
        'Trả lời "chỉ cảnh báo rồi vẫn deploy" — mất tác dụng của cổng chặn.',
        'Chặn cứng mọi dao động nhỏ ⇒ pipeline đỏ liên tục vì nhiễu, đội mất niềm tin vào eval.',
      ],
      hook: 'Chặn – Giải thích – Cho phép override có chữ ký – Đừng hạ chuẩn.',
      related: [109, 111, 113],
    },
    {
      id: 113,
      q: 'Khi thay đổi Prompt/Model/RAG thì có cần chạy lại AI Evaluation không? Vì sao?',
      type: 'judgment',
      diff: 2,
      answer: `**Có — bắt buộc, không có ngoại lệ.** Ba thành phần này chính là **những gì quyết định đầu ra**; đổi bất kỳ cái nào là đổi hành vi của hệ thống.

**Vì sao với từng thành phần:**

| Thay đổi | Vì sao phải eval lại |
|---|---|
| **Prompt** | Một từ cũng có thể đổi độ dài, giọng điệu, mức độ thận trọng, tỉ lệ từ chối. Thêm một ràng buộc để sửa nhóm A rất dễ làm hỏng nhóm B. |
| **Model** (nâng cấp, đổi nhà cung cấp, đổi version) | Model mới **không phải lúc nào cũng tốt hơn cho use case của bạn**: định dạng đầu ra khác, cách gọi tool khác, độ dài khác, chi phí và latency khác. Prompt tối ưu cho model cũ có thể phản tác dụng với model mới. |
| **RAG** (chunking, embedding, top-k, rerank, dữ liệu mới) | Đổi ngữ cảnh đưa vào ⇒ đổi câu trả lời. Đổi embedding model buộc phải reindex và làm mọi số liệu retrieval cũ mất hiệu lực. Thêm tài liệu có thể **làm loãng** kết quả tìm kiếm cho các câu hỏi khác. |

**Lý do chung:**
1. **Hệ thống LLM cực nhạy và có hiệu ứng phi tuyến** — thay đổi nhỏ, tác động lớn và khó đoán.
2. **Không có cách nào biết trước** ngoài đo: khác hoàn toàn với phần mềm truyền thống nơi bạn có thể lý luận về tác động của một dòng code.
3. **Rủi ro hồi quy chéo**: cải thiện chỗ này, hỏng chỗ kia.
4. **Cần bằng chứng để quyết định** giữ hay bỏ thay đổi, và để giải trình khi ra production.
5. **Chi phí và latency cũng đổi**, không chỉ chất lượng.

**Thực hành:** gắn **version cho cả ba** (prompt_v, model, kb_v); mỗi thay đổi là một PR **kích hoạt pipeline eval**; so sánh với baseline; và **đổi một thứ mỗi lần** — đổi cùng lúc prompt và model thì không quy kết được nguyên nhân.

*(Ngoại lệ duy nhất chấp nhận được: sửa lỗi chính tả trong phần không ảnh hưởng hành vi — và ngay cả khi đó, chạy eval nhanh vẫn rẻ hơn là đoán.)*`,
      points: [
        { id: 'p1', w: 3, text: 'Có, bắt buộc — vì prompt/model/RAG là ba yếu tố quyết định trực tiếp đầu ra' },
        { id: 'p2', w: 3, text: 'Hệ thống LLM rất nhạy: thay đổi nhỏ có thể gây tác động lớn và khó đoán trước, không thể suy luận mà phải đo' },
        { id: 'p3', w: 2, text: 'Rủi ro hồi quy chéo: cải thiện nhóm câu hỏi này có thể làm hỏng nhóm khác; model mới chưa chắc tốt hơn cho use case cụ thể' },
        { id: 'p4', w: 2, text: 'Thực hành: version hóa cả ba, mỗi thay đổi kích hoạt pipeline eval và so với baseline, chỉ đổi một thứ mỗi lần để quy kết nguyên nhân' },
      ],
      why: 'Đây là kỷ luật cốt lõi của LLMOps. Đội nào bỏ qua bước này sẽ sống trong trạng thái "không ai biết vì sao tuần này hệ thống trả lời tệ hơn".',
      traps: [
        'Cho rằng đổi model lên bản mới hơn thì không cần eval vì "chắc chắn tốt hơn".',
        'Đổi nhiều thứ cùng lúc rồi eval một lần.',
      ],
      hook: 'Ba thứ quyết định câu trả lời: prompt, model, ngữ cảnh. Đụng cái nào cũng phải đo lại.',
      related: [56, 111, 112],
    },
    {
      id: 114,
      q: 'Hãy thiết kế một CI/CD pipeline hoàn chỉnh từ lúc developer push code cho đến production và monitoring.',
      type: 'design',
      diff: 3,
      answer: `\`\`\`
┌─ 1. DEV ────────────────────────────────────────────────────────┐
│ developer làm việc trên nhánh feature                            │
│ pre-commit hook: lint, format, quét secret                       │
│ chạy tay eval nhanh (20 câu) trước khi mở PR                     │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼ git push / mở Pull Request
┌─ 2. CI (mục tiêu < 10 phút) ────────────────────────────────────┐
│ checkout → cài dependency (có cache) → lint → build image        │
│ unit test (tool, parser, validator)  ── coverage tối thiểu       │
│ integration test với mock (RAG, agent loop, tool dispatch)       │
│ contract test: đầu ra khớp JSON schema                           │
│ security: SAST, quét dependency, kiểm tra secret                 │
│ EVAL NHANH: 30 câu đại diện, ngưỡng tối thiểu + không vi phạm cấm│
│ → báo kết quả ngay trên PR (bảng so sánh với baseline)           │
└──────────────────────────┬──────────────────────────────────────┘
                           ▼ review + approve → merge vào main
┌─ 3. STAGING ────────────────────────────────────────────────────┐
│ build artifact có gắn version: code_sha + prompt_v + model + kb_v│
│ deploy staging (cấu hình như production, tool trỏ sandbox)       │
│ e2e test các luồng chính                                         │
│ AI EVALUATION ĐẦY ĐỦ trên golden dataset (200+ câu):             │
│   RAGAS + LLM judge + must_include + citation coverage           │
│   cắt lát theo intent/độ khó; SO SÁNH VỚI BẢN PRODUCTION         │
│ RED TEAM: injection, lộ prompt, vượt quyền, PII, ngoài phạm vi   │
│ PERF/COST: P95, TTFT, cost/request, thử tải                      │
└──────────────────────────┬──────────────────────────────────────┘
              ▼ QUALITY GATE  (fail ⇒ chặn + báo cáo chi tiết)
┌─ 4. PHÊ DUYỆT ──────────────────────────────────────────────────┐
│ tự động cho thay đổi nhỏ                                         │
│ cần người duyệt nếu: đổi model, đổi prompt về chính sách,        │
│ đổi quyền tool, cập nhật KB lớn                                  │
└──────────────────────────┬──────────────────────────────────────┘
┌─ 5. PRODUCTION ─────────────────────────────────────────────────┐
│ blue-green hoặc canary: 5% → smoke test → 25% → 50% → 100%       │
│ feature flag để tắt nhanh từng tính năng                         │
│ mỗi mốc giữ 30–60 phút, so sánh trực tiếp với nhánh cũ:          │
│   quality (LLM judge trên mẫu), escalate rate, 👎, P95,          │
│   cost/request, error rate                                       │
│ AUTO-ROLLBACK khi chạm ngưỡng; rollback = đổi cờ, < 1 phút       │
└──────────────────────────┬──────────────────────────────────────┘
┌─ 6. MONITORING & FEEDBACK (chạy mãi) ───────────────────────────┐
│ Hạ tầng : uptime, error rate, P50/P95/P99, throughput            │
│ AI      : quality score, faithfulness (mẫu), hallucination,      │
│           escalate rate, tỉ lệ "không trả lời được", drift       │
│ Chi phí : cost/request, token/request, cache hit rate            │
│ Kinh doanh: deflection rate, CSAT, thời gian phản hồi            │
│ Alert theo ngưỡng + theo xu hướng → on-call                      │
│ Lấy mẫu hằng ngày cho LLM judge + người soát ngẫu nhiên          │
│ Ca lỗi → thêm vào golden dataset; câu hỏi không trả lời được →   │
│           đội nội dung bổ sung KB                                │
│ Báo cáo tuần: chất lượng, chi phí, top vấn đề                    │
└──────────────────────────┬──────────────────────────────────────┘
                           └────────► quay lại DEV (Iterate)
\`\`\`

**Bốn nguyên tắc xuyên suốt:**
1. **Nhanh và rẻ trước, chậm và đắt sau** — phản hồi cho dev trong vài phút, eval nặng để sau.
2. **Version mọi thứ ảnh hưởng đầu ra**: code, prompt, model, knowledge base — và ghi kèm vào mỗi response để truy vết.
3. **Mọi cổng chặn phải có đường thoát có kiểm soát** (override cần phê duyệt), trừ nhóm an toàn.
4. **Pipeline là một vòng tròn**: production sinh dữ liệu → làm giàu golden dataset → nâng chất lượng lần deploy sau.`,
      points: [
        { id: 'p1', w: 3, text: 'Giai đoạn CI sau khi push: lint, build, unit/integration/contract test, security scan và eval nhanh, phản hồi ngay trên PR' },
        { id: 'p2', w: 3, text: 'Staging với AI evaluation đầy đủ trên golden dataset, red teaming an toàn, kiểm tra performance/cost, có quality gate và phê duyệt' },
        { id: 'p3', w: 3, text: 'Deploy production theo canary/blue-green tăng dần, feature flag, so sánh chỉ số với bản cũ và auto-rollback' },
        { id: 'p4', w: 3, text: 'Monitoring đủ 4 nhóm (hạ tầng, chất lượng AI, chi phí, kinh doanh) với alert; vòng phản hồi đưa ca lỗi trở lại golden dataset/KB và quay lại giai đoạn phát triển' },
      ],
      why: 'Đây là câu tổng hợp lớn nhất của phần CI/CD. Trả lời được nghĩa là bạn hình dung được toàn bộ vòng đời kỹ thuật của một hệ thống AI đang chạy thật.',
      traps: [
        'Dừng ở bước deploy, không nói monitoring và vòng phản hồi.',
        'Không nêu rollback và cách so sánh với bản đang chạy.',
      ],
      hook: 'Dev → CI nhanh → Staging + Eval → Gate → Canary → Monitor → quay lại Dev.',
      related: [108, 109, 120],
    },
  ],
};
