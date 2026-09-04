export default {
  id: 'lifecycle',
  name: 'AI Product Lifecycle',
  short: 'Lifecycle',
  emoji: '♻️',
  blurb: 'Bảy giai đoạn từ Problem Scoping tới Iterate — và vì sao nó là vòng tròn.',
  questions: [
    {
      id: 72,
      q: 'Hãy sắp xếp các bước sau theo đúng AI Product Lifecycle: Problem Scoping, Data Strategy, Build & Prototype, Test & Evaluate, Deploy, Monitor, Iterate.',
      type: 'concept',
      diff: 1,
      answer: `**Thứ tự đúng:**
\`\`\`
1. Problem Scoping   → xác định bài toán, tiêu chí thành công
2. Data Strategy     → dữ liệu ở đâu, chất lượng ra sao, golden dataset
3. Build & Prototype → dựng phiên bản chạy được (prompt, RAG, agent)
4. Test & Evaluate   → đo trên golden dataset, so với ngưỡng
5. Deploy            → đưa ra production (canary/A-B, rollback)
6. Monitor           → theo dõi chất lượng, chi phí, hiệu năng, drift
7. Iterate           → cải tiến dựa trên dữ liệu thật → quay lại bước phù hợp
\`\`\`

\`\`\`
   ┌──────────────────────── vòng lặp ─────────────────────────┐
   ▼                                                            │
Problem → Data → Build → Test&Eval → Deploy → Monitor → Iterate ┘
Scoping  Strategy Proto      ▲                              │
                              └── không đạt ngưỡng ──────────┘
\`\`\`

**Ba điều quan trọng hơn cả thứ tự:**
1. **Đây là vòng tròn, không phải đường thẳng.** Iterate quay lại — có khi về Build (đổi prompt), có khi về Data (thiếu tài liệu), thậm chí về Problem Scoping (bài toán chọn sai).
2. **Test & Evaluate là cổng chặn trước Deploy.** Không đạt ngưỡng thì không được ra.
3. **Data đứng trước Build.** Đây là điểm khác biệt lớn nhất so với vòng đời phần mềm truyền thống: không có dữ liệu và tiêu chí đánh giá thì việc "xây" chỉ là đoán mò.`,
      points: [
        { id: 'p1', w: 4, text: 'Sắp đúng thứ tự: Problem Scoping → Data Strategy → Build & Prototype → Test & Evaluate → Deploy → Monitor → Iterate' },
        { id: 'p2', w: 3, text: 'Nêu rõ đây là vòng lặp: Iterate quay lại các bước trước, không phải quy trình một chiều' },
        { id: 'p3', w: 2, text: 'Test & Evaluate đóng vai trò cổng chặn trước khi Deploy' },
        { id: 'p4', w: 1, text: 'Nhận xét Data đứng trước Build — khác với vòng đời phần mềm truyền thống' },
      ],
      why: 'Vòng đời này là bộ khung để trả lời mọi câu "quy trình làm AI thế nào". Nhớ thứ tự là mức tối thiểu; hiểu tính vòng lặp mới là mức làm được việc.',
      traps: ['Xếp Deploy trước Test.', 'Coi Iterate là bước cuối cùng rồi kết thúc.'],
      hook: 'Hỏi đúng → Có dữ liệu → Dựng → Đo → Thả → Canh → Sửa → quay lại.',
      related: [73, 79],
    },
    {
      id: 73,
      q: 'Problem Scoping là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Problem Scoping** là giai đoạn **định nghĩa bài toán trước khi viết bất kỳ dòng code nào**: làm rõ vấn đề nghiệp vụ, ai chịu tác động, thành công đo bằng gì, và **AI có phải lời giải phù hợp không**.

**Sản phẩm đầu ra của giai đoạn này:**
1. **Phát biểu bài toán nghiệp vụ** — không phải "làm chatbot", mà "60% ticket là câu hỏi lặp lại về trạng thái đơn hàng, khiến thời gian phản hồi trung bình lên 4 giờ".
2. **Tiêu chí thành công đo được**: giảm thời gian phản hồi xuống < 1 phút cho nhóm câu hỏi này; deflection rate ≥ 50%; CSAT không giảm.
3. **Phạm vi (in/out of scope)**: xử lý câu hỏi trạng thái đơn + chính sách đổi trả; **không** xử lý khiếu nại, không thực hiện hoàn tiền.
4. **Ràng buộc**: ngân sách, thời gian, dữ liệu sẵn có, quy định pháp lý, yêu cầu bảo mật, ngôn ngữ.
5. **Đánh giá tính khả thi**: có dữ liệu không? có chấp nhận sai số không? AI có phải công cụ đúng không (hay chỉ cần rule/FAQ tốt hơn)?
6. **Định nghĩa "câu trả lời tốt"** và các trường hợp biên/hành vi khi không chắc chắn — đây là đầu vào để xây golden dataset ở bước sau.
7. **Rủi ro và kế hoạch giảm thiểu**: hallucination, rò rỉ dữ liệu, phản ứng của người dùng, ai chịu trách nhiệm khi AI trả lời sai.

**Vì sao đây là bước quan trọng nhất:** sai ở đây thì mọi công sức phía sau đều lãng phí — bạn sẽ xây rất giỏi một thứ không ai cần. Đa số dự án AI thất bại **ở giai đoạn này**, không phải ở khâu kỹ thuật.`,
      points: [
        { id: 'p1', w: 3, text: 'Xác định rõ bài toán nghiệp vụ cần giải và ai/vấn đề gì bị tác động, trước khi bắt tay xây' },
        { id: 'p2', w: 3, text: 'Định nghĩa tiêu chí thành công đo được (business + kỹ thuật) và phạm vi in/out of scope' },
        { id: 'p3', w: 2, text: 'Đánh giá tính khả thi: có dữ liệu không, AI có phải giải pháp phù hợp không, ràng buộc nguồn lực/pháp lý' },
        { id: 'p4', w: 2, text: 'Nêu rủi ro/tiêu chí "câu trả lời tốt" và giải thích vì sao đây là bước quyết định thành bại của dự án' },
      ],
      why: 'Đây là bước có tỉ lệ hoàn vốn cao nhất trong toàn bộ vòng đời: một tuần làm rõ bài toán tiết kiệm hàng tháng xây nhầm.',
      traps: ['Mô tả Problem Scoping như "chọn công nghệ/model" — sai giai đoạn.'],
      hook: 'Chưa rõ bài toán thì mọi model đều là model sai.',
      related: [2, 72, 74],
    },
    {
      id: 74,
      q: 'Data Strategy là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Data Strategy** là kế hoạch trả lời: **dữ liệu nào cần, lấy từ đâu, xử lý thế nào, ai sở hữu, đánh giá bằng gì** — cho cả lúc xây lẫn lúc vận hành lâu dài.

**Bao gồm:**
1. **Nguồn dữ liệu**: tài liệu nội bộ (chính sách, FAQ, wiki), lịch sử ticket/hội thoại, dữ liệu giao dịch (đơn hàng, khách hàng), API bên ngoài. Cái nào có sẵn, cái nào phải xin, cái nào phải mua.
2. **Chất lượng và bao phủ**: dữ liệu có đủ, có cập nhật, có mâu thuẫn giữa các tài liệu, có bao phủ đủ các trường hợp (kể cả ca hiếm và ca khó) không.
3. **Xử lý và chuẩn hóa**: parse, làm sạch, khử trùng lặp, chunking, gắn **metadata** (nguồn, version, effective_date, quyền truy cập).
4. **Golden dataset / Ground truth**: bộ câu hỏi–đáp án chuẩn để đánh giá. **Đây là phần bị bỏ quên nhiều nhất và tốn công nhất.**
5. **Quản trị (governance)**: quyền riêng tư, PII, tuân thủ, ai được xem gì, lưu trữ ở đâu, giữ bao lâu.
6. **Vòng đời và cập nhật**: ai cập nhật tài liệu, tần suất reindex, quy trình khi chính sách đổi, cơ chế phát hiện tài liệu lỗi thời.
7. **Vòng phản hồi (data flywheel)**: thu thập hội thoại thật, phản hồi người dùng, ca escalate → bổ sung vào golden dataset và knowledge base.

**Vì sao đứng trước Build:** với AI, **dữ liệu là sản phẩm**. Model và prompt có thể đổi trong một buổi chiều; kho tri thức sạch và golden dataset tốt mất hàng tuần và là tài sản dùng lại cho mọi phiên bản sau.`,
      points: [
        { id: 'p1', w: 3, text: 'Xác định nguồn dữ liệu cần thiết và đánh giá chất lượng/độ bao phủ/tính cập nhật' },
        { id: 'p2', w: 3, text: 'Kế hoạch xử lý: làm sạch, chunking, gắn metadata, chuẩn hóa cho retrieval' },
        { id: 'p3', w: 3, text: 'Xây golden dataset/ground truth để đánh giá' },
        { id: 'p4', w: 2, text: 'Quản trị dữ liệu (PII, quyền truy cập, tuân thủ), quy trình cập nhật và vòng phản hồi thu thập dữ liệu mới từ production' },
      ],
      why: 'Với AI, chất lượng đầu ra bị chặn trên bởi chất lượng dữ liệu. Không có chiến lược dữ liệu thì mọi cải tiến prompt chỉ là đánh bóng bề mặt.',
      traps: ['Chỉ nói "thu thập dữ liệu" mà quên golden dataset, metadata và quản trị/PII.'],
      hook: 'Model đổi trong một buổi chiều; dữ liệu sạch mất một quý.',
      related: [73, 80, 82],
    },
    {
      id: 75,
      q: 'Build & Prototype là gì?',
      type: 'concept',
      diff: 1,
      answer: `**Build & Prototype** là giai đoạn **dựng phiên bản chạy được đầu tiên** để kiểm chứng giả thuyết — nhanh, nhỏ, tập trung vào **đường đi chính (happy path)** trước khi hoàn thiện.

**Nội dung công việc:**
- Chọn cách tiếp cận: prompt-only → RAG → agent → (cuối cùng mới tới) fine-tuning. **Luôn bắt đầu từ phương án đơn giản nhất có thể hoạt động** — nó vừa là sản phẩm khả dĩ, vừa là baseline để so sánh.
- Dựng pipeline lõi: ingest → chunk → embed → index; prompt + Output Contract; vòng lặp agent và tool nếu cần.
- Chọn model, tinh chỉnh tham số (temperature, top-k, max_tokens).
- Làm giao diện tối thiểu để người thật dùng thử được.
- Chạy trên **một tập nhỏ** dữ liệu thật, không phải dữ liệu mẫu đẹp đẽ.

**Nguyên tắc:**
- **Mục tiêu là học, không phải hoàn hảo.** Prototype để trả lời: cách này có khả thi không? sai ở đâu? chi phí cỡ nào?
- **Baseline trước, tối ưu sau.** Có baseline mới biết cải tiến có thực sự cải tiến.
- **Đo ngay từ prototype**: gắn logging và chạy thử eval trên vài chục câu — nếu để sau, bạn sẽ không biết mình đang tiến hay lùi.
- **Đừng nhầm prototype với production**: thiếu guardrail, phân quyền, xử lý lỗi, giám sát. Việc "prototype chạy tốt trong demo" là bẫy phổ biến nhất của dự án AI.`,
      points: [
        { id: 'p1', w: 3, text: 'Dựng phiên bản chạy được đầu tiên (PoC/MVP) để kiểm chứng tính khả thi' },
        { id: 'p2', w: 3, text: 'Bắt đầu từ giải pháp đơn giản nhất (prompt → RAG → agent → fine-tune) và tạo baseline để so sánh' },
        { id: 'p3', w: 2, text: 'Nội dung: pipeline lõi (chunk/embed/index), prompt + output contract, chọn model/tham số, giao diện thử nghiệm' },
        { id: 'p4', w: 2, text: 'Mục tiêu là học nhanh chứ không phải hoàn hảo; đo/log ngay từ đầu; ý thức prototype chưa phải production' },
      ],
      why: 'Giai đoạn này quyết định tốc độ học của cả dự án. Người làm tốt tạo ra baseline đo được trong một tuần; người làm dở mất một quý cho một demo không đo được.',
      traps: ['Nhảy thẳng vào fine-tuning hoặc kiến trúc multi-agent phức tạp khi chưa có baseline.'],
      hook: 'Đơn giản nhất mà chạy được, trước đã.',
      related: [72, 76, 117],
    },
    {
      id: 76,
      q: 'Test & Evaluate là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Test & Evaluate** là giai đoạn **đo chất lượng hệ thống một cách có hệ thống** trước khi đưa ra người dùng — và nó có **hai lớp khác nhau**:

**1. Test phần mềm truyền thống (đúng/sai rạch ròi)**
- Unit test cho tool, hàm xử lý, parser.
- Integration test cho pipeline (retrieval trả về đúng định dạng, agent gọi được tool).
- Kiểm tra Output Contract, xử lý lỗi, timeout, phân quyền.

**2. AI Evaluation (chấm theo mức độ, không phải pass/fail tuyệt đối)**
- Chạy trên **golden dataset** (bộ câu hỏi + ground truth đại diện).
- Metric chất lượng: **RAGAS** (faithfulness, answer relevancy, context precision/recall), độ chính xác so với ground truth, **LLM-as-a-Judge** theo rubric.
- Metric vận hành: latency, TTFT, cost/request.
- Kiểm thử an toàn: prompt injection, câu hỏi ngoài phạm vi, yêu cầu vượt quyền, nội dung nhạy cảm (**red teaming**).
- **So sánh với baseline/phiên bản trước**, không chỉ nhìn con số tuyệt đối.

**Kết quả:** đối chiếu với **ngưỡng đã định trước** (ví dụ faithfulness ≥ 0.90, quality score ≥ 0.85, P95 < 3s, cost/request ≤ X). Đạt ⇒ đi tiếp Deploy. Không đạt ⇒ quay lại Build/Data.

**Nguyên tắc:** ngưỡng phải được chốt **trước khi chạy eval**, nếu không sẽ có xu hướng hạ chuẩn cho vừa kết quả. Và eval phải **tự động hóa** để chạy lại được trong CI/CD ở mọi lần đổi prompt/model/dữ liệu.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo chất lượng hệ thống một cách hệ thống trước khi deploy, dựa trên golden dataset' },
        { id: 'p2', w: 3, text: 'Phân biệt hai lớp: test phần mềm truyền thống (pass/fail) và AI evaluation (chấm theo mức độ, metric RAGAS/LLM-judge)' },
        { id: 'p3', w: 2, text: 'Đo cả chất lượng lẫn vận hành (latency, cost) và kiểm thử an toàn/red teaming, so sánh với baseline' },
        { id: 'p4', w: 2, text: 'Đối chiếu với ngưỡng đã chốt trước; không đạt thì quay lại Build/Data; eval phải tự động hóa để chạy trong CI/CD' },
      ],
      why: 'Đây là cổng duy nhất ngăn một bản prompt tệ đi thẳng tới khách hàng. Và nó phải tự động, vì với AI bạn sẽ đổi prompt hằng tuần.',
      traps: ['Chỉ nói "test thử vài câu xem có ổn không" — không có golden dataset, không có ngưỡng, không lặp lại được.'],
      hook: 'Test hỏi "có chạy không". Evaluate hỏi "có tốt không".',
      related: [80, 86, 111],
    },
    {
      id: 77,
      q: 'Deploy và Monitor khác nhau như thế nào?',
      type: 'compare',
      diff: 2,
      answer: `| | **Deploy** | **Monitor** |
|---|---|---|
| Bản chất | **Một sự kiện** (hoặc chuỗi sự kiện rời rạc) | **Một quá trình liên tục**, chạy mãi |
| Câu hỏi | "Đưa phiên bản này ra production thế nào cho an toàn?" | "Nó đang hoạt động ra sao ngoài thực tế?" |
| Việc làm | Đóng gói, cấu hình, migration, **canary / blue-green / A-B**, feature flag, chuẩn bị **rollback** | Thu thập metric & log, dashboard, alert, phát hiện **drift**, phân tích lỗi, lấy mẫu chấm chất lượng |
| Thời điểm | Tại một thời điểm | 24/7 sau đó |
| Thành công nghĩa là | Phiên bản mới chạy ổn định, không downtime, rollback được | Phát hiện sớm vấn đề trước khi người dùng phàn nàn |
| Với AI, đặc thù | Version cả prompt/model/KB; thả dần theo % traffic để so chất lượng thật | Theo dõi quality score, hallucination, escalate rate, cost/request, drift — những thứ **không** phát ra lỗi HTTP |

**Quan hệ giữa hai bước:** Deploy **kết thúc** khi phiên bản đã chạy; Monitor **bắt đầu** từ đó và không bao giờ kết thúc. Monitor là nguồn dữ liệu cho **Iterate**.

**Điểm đặc thù AI đáng nhấn:** với phần mềm truyền thống, deploy xong mà không có lỗi thì gần như coi là xong. Với AI, **chất lượng có thể suy giảm dần dù không có sự cố nào** (drift, tài liệu cũ, người dùng đổi cách hỏi). Vì vậy Monitor với AI không chỉ là canh hạ tầng, mà phải **canh cả nội dung câu trả lời** — bằng cách lấy mẫu và chấm lại định kỳ.`,
      points: [
        { id: 'p1', w: 3, text: 'Deploy là hành động/sự kiện đưa phiên bản ra production; Monitor là quá trình theo dõi liên tục sau đó' },
        { id: 'p2', w: 2, text: 'Deploy gồm: đóng gói, cấu hình, canary/blue-green/A-B, feature flag, chuẩn bị rollback' },
        { id: 'p3', w: 2, text: 'Monitor gồm: thu thập metric/log, dashboard, alert, phát hiện drift và suy giảm chất lượng' },
        { id: 'p4', w: 3, text: 'Với AI: monitor phải theo dõi cả chất lượng nội dung (quality, hallucination, escalate, cost) chứ không chỉ hạ tầng, vì chất lượng suy giảm không tạo ra lỗi hệ thống' },
      ],
      why: 'Nhiều đội coi deploy là vạch đích. Với AI, deploy chỉ là lúc bắt đầu biết sự thật.',
      traps: ['Trả lời deploy = "đưa lên server", monitor = "xem log" mà không nêu đặc thù chất lượng AI.'],
      hook: 'Deploy là một khoảnh khắc. Monitor là một thói quen.',
      related: [62, 78, 114],
    },
    {
      id: 78,
      q: 'Iterate trong AI Product Lifecycle là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Iterate** là giai đoạn **dùng dữ liệu thật từ production để cải tiến hệ thống**, rồi quay lại vòng đời ở đúng bước cần sửa.

**Đầu vào của Iterate:** kết quả monitor (quality score giảm ở nhóm câu hỏi nào), phản hồi người dùng (thumbs down, CSAT), ca escalate cho người, log câu hỏi không trả lời được, phân tích lỗi, và chi phí thực tế.

**Việc làm — quan trọng là quay về đúng bước:**

| Triệu chứng | Quay về bước nào |
|---|---|
| Trả lời sai giọng/thiếu cấu trúc | **Build** — sửa prompt |
| Thiếu thông tin, không tìm thấy tài liệu | **Data** — bổ sung/cập nhật KB, chỉnh chunking |
| Retrieval lấy nhầm/ nhiễu | **Build** — chỉnh top-k, rerank, metadata filter |
| Sai nhóm câu hỏi mới xuất hiện | **Data** — mở rộng golden dataset rồi mới tối ưu |
| Người dùng hỏi thứ ngoài phạm vi rất nhiều | **Problem Scoping** — xem lại phạm vi sản phẩm |
| Chi phí vượt ngân sách | **Build** — cache, giảm context, đổi model |

**Nguyên tắc làm iterate cho đúng:**
- **Mỗi vòng chỉ đổi một thứ chính** rồi đo lại — đổi năm thứ cùng lúc thì không biết cái nào có tác dụng.
- **Luôn chạy lại eval** trên golden dataset trước khi phát hành (chống hồi quy: sửa chỗ này hỏng chỗ kia).
- **Cập nhật golden dataset** bằng chính các ca thất bại vừa gặp — đây là cách bộ eval mạnh dần lên theo thời gian.
- Ưu tiên theo **tác động × tần suất**, không theo cái dễ sửa nhất.

Iterate là lý do vòng đời AI **không có điểm kết thúc**: model đứng yên nhưng thế giới thì không.`,
      points: [
        { id: 'p1', w: 3, text: 'Dùng dữ liệu và phản hồi thật từ production để cải tiến hệ thống, lặp lại vòng đời' },
        { id: 'p2', w: 3, text: 'Quay lại đúng bước cần sửa (prompt/Build, dữ liệu/Data, thậm chí Problem Scoping) tùy nguyên nhân' },
        { id: 'p3', w: 2, text: 'Nguồn đầu vào: monitoring, phản hồi người dùng, ca escalate, log lỗi, chi phí' },
        { id: 'p4', w: 2, text: 'Kỷ luật: mỗi vòng đổi một thứ, chạy lại eval chống hồi quy, cập nhật golden dataset bằng ca thất bại, ưu tiên theo tác động' },
      ],
      why: 'Iterate là chỗ giá trị thật của sản phẩm AI được tạo ra. Phiên bản đầu tiên hiếm khi tốt; hệ thống tốt là hệ thống học nhanh.',
      traps: ['Mô tả iterate như "cập nhật tính năng mới" thay vì "cải thiện dựa trên dữ liệu đo được".'],
      hook: 'Đo → tìm nguyên nhân → quay về đúng bước → đo lại.',
      related: [72, 79, 86],
    },
    {
      id: 79,
      q: 'Khi model đã deploy nhưng chất lượng giảm theo thời gian thì nên làm gì?',
      type: 'judgment',
      diff: 3,
      answer: `Đây là **drift**. Xử lý theo bốn nhịp: **xác nhận → chẩn đoán → khắc phục → phòng ngừa**.

**1. Xác nhận và đo lường (đừng sửa theo cảm giác)**
- Chất lượng giảm ở **đâu**: nhóm câu hỏi nào, tenant nào, ngôn ngữ nào, khoảng thời gian nào.
- Chạy lại eval trên **golden dataset**: nếu điểm vẫn cao mà production tệ ⇒ **phân phối câu hỏi thật đã đổi** (golden dataset lỗi thời). Nếu điểm cũng giảm ⇒ có gì đó trong hệ thống đã đổi.
- Đối chiếu mốc thời gian với **nhật ký thay đổi**: prompt version, model version, KB version, thay đổi hạ tầng.

**2. Chẩn đoán nguyên nhân**

| Loại | Dấu hiệu | Xử lý |
|---|---|---|
| **Data drift** — người dùng hỏi kiểu mới | Xuất hiện cụm câu hỏi lạ, tỉ lệ "không tìm thấy" tăng | Mở rộng KB & golden dataset, cập nhật prompt/few-shot |
| **Concept drift** — chính sách/quy trình đổi | Câu trả lời cũ nay bị đánh giá sai | Cập nhật tài liệu, ground truth |
| **Knowledge drift** — tài liệu cũ | Tuổi tài liệu trích dẫn tăng | Reindex, archive bản cũ, gắn effective_date |
| **Model drift** — nhà cung cấp đổi model | Thay đổi trùng ngày nâng cấp | Pin phiên bản model, chạy lại eval, chỉnh prompt |
| **Hỏng hạ tầng thầm lặng** | Cache/ingest lỗi im lặng | Sửa pipeline, thêm alert cho job ingest |

**3. Khắc phục:** cập nhật knowledge base và reindex; cập nhật/mở rộng golden dataset bằng chính các ca thất bại; chỉnh prompt hoặc fine-tune lại; điều chỉnh retrieval (k, rerank, filter); nếu do model thì pin version hoặc đổi model — **rồi chạy lại eval và phát hành theo canary** để so trực tiếp với bản đang chạy. Nếu nghiêm trọng: **rollback trước, điều tra sau**.

**4. Phòng ngừa:** giám sát chất lượng liên tục trên mẫu traffic thật (LLM-judge), **cảnh báo theo ngưỡng và theo xu hướng**, lịch chạy eval định kỳ, quy trình cập nhật KB có chủ, pin phiên bản model, và duy trì **vòng phản hồi** đưa ca lỗi vào golden dataset.

**Điều không nên làm:** vội đổi model hoặc viết lại prompt khi chưa biết nguyên nhân — thường chỉ làm nhiễu thêm và mất luôn khả năng so sánh.`,
      points: [
        { id: 'p1', w: 3, text: 'Nhận diện đây là drift và bước đầu tiên là đo/xác nhận cụ thể (nhóm câu hỏi nào, từ khi nào), chạy lại eval trên golden dataset' },
        { id: 'p2', w: 3, text: 'Chẩn đoán nguyên nhân theo loại: data drift, concept drift, knowledge/tài liệu cũ, model đổi phiên bản, lỗi pipeline' },
        { id: 'p3', w: 2, text: 'Khắc phục tương ứng: cập nhật KB/reindex, cập nhật golden dataset, chỉnh prompt/fine-tune, chỉnh retrieval, pin version model; deploy lại theo canary và rollback nếu nghiêm trọng' },
        { id: 'p4', w: 2, text: 'Phòng ngừa: monitoring chất lượng liên tục + alert theo ngưỡng, eval định kỳ, quy trình cập nhật dữ liệu và vòng phản hồi bổ sung ca lỗi vào golden dataset' },
      ],
      why: 'Đây là câu hỏi tình huống hay gặp nhất về vận hành AI. Điểm nằm ở kỷ luật "đo trước, sửa sau", không phải ở việc kể tên giải pháp.',
      traps: [
        'Nhảy thẳng vào "retrain model" — tốn kém, thường không phải nguyên nhân.',
        'Quên khả năng golden dataset đã lỗi thời so với câu hỏi thật.',
      ],
      hook: 'Xác nhận → Chẩn đoán → Khắc phục → Phòng ngừa.',
      related: [62, 78, 86],
    },
  ],
};
