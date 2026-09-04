export default {
  id: 'tong-hop',
  name: 'Câu tổng hợp',
  short: 'Tổng hợp',
  emoji: '🧩',
  blurb: 'So sánh các khái niệm lớn và thiết kế hệ thống end-to-end.',
  questions: [
    {
      id: 115,
      q: 'Phân biệt Discriminative AI, Generative AI và Agentic AI.',
      type: 'compare',
      diff: 2,
      answer: `| | **Discriminative AI** | **Generative AI** | **Agentic AI** |
|---|---|---|---|
| Học/làm gì | Ranh giới giữa các lớp: \`P(y\\|x)\` | Phân phối dữ liệu để sinh nội dung mới | Dùng LLM để **lập kế hoạch và hành động** |
| Đầu ra | Nhãn, điểm số, xác suất | Văn bản, ảnh, code, âm thanh | Chuỗi hành động + kết quả cuối |
| Ví dụ | Phân loại email 5 nhóm, phát hiện gian lận, dự đoán churn | ChatGPT trả lời, tóm tắt, RAG Q&A, sinh code | Agent tra đơn hàng, gọi tool, tạo ticket |
| Tương tác bên ngoài | Không | Không (chỉ sinh chữ) | **Có — gọi tool, thay đổi trạng thái thế giới** |
| Số lần gọi model | 1 | 1 | **Nhiều (vòng lặp ReAct)** |
| Tính tự chủ | Không | Không | Tự quyết định bước tiếp theo |
| Chi phí / latency | Thấp nhất | Trung bình | Cao nhất |
| Đánh giá bằng | Accuracy, F1, AUC | Faithfulness, relevancy, human eval | Task success rate, số bước, tỉ lệ gọi tool đúng, chi phí/nhiệm vụ |
| Rủi ro chính | Sai nhãn | Hallucination | **Hành động sai trong thế giới thật** |

**Quan hệ:** đây là các **lớp chồng lên nhau**, không loại trừ nhau. Agentic AI **dùng** Generative AI làm bộ não; một hệ thống thật thường có cả ba: classifier định tuyến intent (discriminative) → agent xử lý (agentic) → LLM soạn câu trả lời (generative).

**Ranh giới quyết định:**
- Đầu ra là **nhãn trong tập đóng** ⇒ discriminative.
- Đầu ra là **nội dung mới**, một lượt là xong ⇒ generative.
- Cần **nhiều bước, cần lấy dữ liệu thật hoặc thực hiện hành động** ⇒ agentic.

**Nguyên tắc chọn:** đi từ trái sang phải, dừng ở cái đơn giản nhất đủ dùng. Mỗi bước sang phải là chi phí, độ trễ và rủi ro tăng thêm.`,
      points: [
        { id: 'p1', w: 3, text: 'Discriminative: phân loại/dự đoán, đầu ra là nhãn hoặc điểm số trong tập hữu hạn' },
        { id: 'p2', w: 3, text: 'Generative: sinh nội dung mới (văn bản, ảnh, code), thường một lượt gọi model' },
        { id: 'p3', w: 3, text: 'Agentic: dùng LLM để lập kế hoạch, gọi tool và hành động qua nhiều bước lặp, có thể thay đổi trạng thái bên ngoài' },
        { id: 'p4', w: 2, text: 'Nêu quan hệ chồng lớp (agentic dùng generative) và tiêu chí chọn theo độ phức tạp/chi phí/rủi ro' },
      ],
      why: 'Đây là bản đồ khái niệm bao trùm cả khóa học. Chọn đúng lớp là quyết định kiến trúc đầu tiên và ảnh hưởng lớn nhất tới chi phí.',
      traps: ['Coi ba loại là ba lựa chọn loại trừ nhau.', 'Định nghĩa agentic chỉ là "AI thông minh hơn" mà không nêu vòng lặp và tool.'],
      hook: 'Chọn nhãn → sinh chữ → hành động. Càng sang phải càng đắt.',
      related: [3, 4, 31],
    },
    {
      id: 116,
      q: 'Phân biệt RAG với Fine-tuning.',
      type: 'compare',
      diff: 2,
      answer: `| | **RAG** | **Fine-tuning** |
|---|---|---|
| Bản chất | **Đưa kiến thức vào ngữ cảnh** lúc chạy | **Ghi kiến thức/hành vi vào trọng số** model |
| Dạy được gì tốt nhất | **Sự kiện, dữ liệu, tài liệu** (biết CÁI GÌ) | **Phong cách, định dạng, kỹ năng, giọng điệu** (biết LÀM THẾ NÀO) |
| Cập nhật kiến thức | Sửa/thêm tài liệu rồi index lại — **vài phút tới vài giờ** | Chuẩn bị dữ liệu + huấn luyện lại — **ngày tới tuần** |
| Dữ liệu cần | Tài liệu (không cần gán nhãn) | Hàng trăm–hàng nghìn cặp ví dụ chất lượng cao |
| Chi phí ban đầu | Thấp | Cao (dữ liệu + huấn luyện) |
| Chi phí mỗi request | **Cao hơn** (prompt dài vì có context) | Thấp hơn (prompt ngắn) |
| Latency | Cao hơn (thêm bước retrieval) | Thấp hơn |
| Truy nguồn / trích dẫn | **Có** — chỉ được đúng tài liệu | **Không** — kiến thức hòa tan trong trọng số |
| Kiểm soát truy cập | Lọc theo quyền ở tầng retrieval | Không lọc được — ai dùng model cũng có kiến thức đó |
| Hallucination | Giảm mạnh nhờ grounding | Không giải quyết được |
| Gỡ bỏ thông tin sai/nhạy cảm | Xóa tài liệu là xong | Phải huấn luyện lại |

**Không phải hoặc/hoặc.** Kết hợp thường là tốt nhất: **fine-tune để model biết cách trả lời** (định dạng, giọng điệu, quy trình nghiệp vụ, cách gọi tool) + **RAG để cung cấp dữ liệu cập nhật** (chính sách, đơn hàng, tài liệu).

**Thứ tự thử trong thực tế:** prompt engineering → few-shot → **RAG** → fine-tuning. Fine-tuning là bước cuối vì tốn kém nhất và khó đảo ngược nhất. Và nhớ: **fine-tuning không phải cách để nhồi kiến thức mới** — đó là hiểu lầm phổ biến nhất; nhồi sự kiện vào trọng số cho kết quả kém tin cậy hơn nhiều so với việc đặt nó trong ngữ cảnh.`,
      points: [
        { id: 'p1', w: 3, text: 'RAG đưa kiến thức vào lúc chạy qua ngữ cảnh; fine-tuning ghi vào trọng số model qua huấn luyện' },
        { id: 'p2', w: 3, text: 'RAG hợp với dữ liệu/sự kiện hay thay đổi và cập nhật nhanh; fine-tuning hợp với phong cách, định dạng, kỹ năng, giọng điệu' },
        { id: 'p3', w: 3, text: 'RAG cho phép trích dẫn nguồn, kiểm soát quyền truy cập, gỡ bỏ thông tin dễ dàng; fine-tuning thì không' },
        { id: 'p4', w: 2, text: 'Đánh đổi chi phí: RAG tốn hơn mỗi request và thêm latency, fine-tuning tốn ban đầu; hai cách bổ sung nhau và nên thử RAG trước' },
      ],
      why: 'Đây là quyết định kiến trúc tốn kém nhất trong dự án LLM. Hiểu sai dẫn tới việc đốt hàng chục nghìn đô fine-tune cho một vấn đề mà RAG giải trong một tuần.',
      traps: ['Nói "fine-tuning để model học kiến thức mới của công ty" — đây là hiểu lầm kinh điển.'],
      hook: 'RAG dạy CÁI GÌ. Fine-tune dạy LÀM THẾ NÀO.',
      related: [117, 11],
    },
    {
      id: 117,
      q: 'Khi nào nên dùng RAG thay vì Fine-tuning?',
      type: 'judgment',
      diff: 2,
      answer: `**Chọn RAG khi:**
1. **Kiến thức thay đổi thường xuyên** — chính sách, giá, tồn kho, tài liệu sản phẩm. Cập nhật tài liệu là xong, không phải huấn luyện lại.
2. **Cần trích dẫn nguồn** để người dùng kiểm chứng, hoặc để tuân thủ/audit.
3. **Cần phân quyền theo người dùng** — chỉ RAG mới lọc được tài liệu theo quyền ở tầng retrieval.
4. **Kho tri thức lớn** (hàng nghìn tài liệu) — không nhồi hết vào trọng số được.
5. **Không có dữ liệu huấn luyện dạng cặp câu hỏi–câu trả lời chất lượng cao**, chỉ có tài liệu.
6. **Cần ra mắt nhanh, ngân sách hạn chế**, và cần **dễ đảo ngược** (gỡ một tài liệu sai là xong).
7. **Cần giảm hallucination** bằng grounding vào tài liệu thật.
8. **Cần xóa dữ liệu theo yêu cầu** (quyền được lãng quên) — không thể "xóa" khỏi trọng số.

**Chọn Fine-tuning khi:**
- Cần **định dạng/giọng điệu rất đặc thù**, ổn định và nhất quán.
- Cần **kỹ năng chuyên biệt** mà prompt không dạy nổi (ngôn ngữ chuyên ngành hẹp, cách suy luận riêng, tuân thủ một quy trình phức tạp).
- Cần **giảm chi phí/latency ở quy mô rất lớn**: prompt ngắn hơn nhiều vì không phải nhồi hướng dẫn dài.
- Muốn **thu nhỏ model** (dùng model nhỏ đã fine-tune thay model lớn) mà vẫn đạt chất lượng cho một tác vụ hẹp.

**Trong thực tế, gần như luôn bắt đầu bằng RAG.** Lý do: rẻ hơn, nhanh hơn, dễ đảo ngược, và phần lớn nhu cầu doanh nghiệp là "trả lời đúng theo tài liệu của chúng tôi" — đó đúng là bài toán của RAG.

**Kết hợp cả hai khi:** cần cả giọng điệu chuẩn thương hiệu **và** dữ liệu cập nhật — fine-tune phần *cách nói*, RAG phần *nội dung nói*.

**Câu hỏi phân định gọn nhất:** *"Vấn đề là model không BIẾT, hay model không BIẾT CÁCH?"* — Không biết ⇒ RAG. Không biết cách ⇒ fine-tuning.`,
      points: [
        { id: 'p1', w: 3, text: 'Chọn RAG khi kiến thức thay đổi thường xuyên và cần cập nhật nhanh mà không phải huấn luyện lại' },
        { id: 'p2', w: 3, text: 'Khi cần trích dẫn nguồn, audit, và/hoặc phân quyền truy cập theo người dùng' },
        { id: 'p3', w: 2, text: 'Khi kho tri thức lớn, không có dữ liệu huấn luyện dạng cặp Q-A, cần triển khai nhanh với chi phí thấp và dễ đảo ngược' },
        { id: 'p4', w: 2, text: 'Nêu ranh giới ngược lại (fine-tuning cho giọng điệu/định dạng/kỹ năng, tối ưu chi phí ở quy mô lớn) và khả năng kết hợp cả hai' },
      ],
      why: 'Câu hỏi này xuất hiện trong hầu hết mọi dự án LLM doanh nghiệp. Có một tiêu chí phân định rõ ràng giúp bạn kết thúc tranh luận trong hai phút.',
      traps: ['Trả lời "RAG rẻ hơn nên luôn dùng RAG" — thiếu tiêu chí và thiếu trường hợp fine-tuning thắng.'],
      hook: 'Không BIẾT ⇒ RAG. Không BIẾT CÁCH ⇒ fine-tune.',
      related: [116, 20],
    },
    {
      id: 118,
      q: 'Khi nào nên dùng Single-agent thay vì Multi-agent?',
      type: 'judgment',
      diff: 2,
      answer: `**Single-agent là lựa chọn mặc định.** Chỉ tách khi có lý do đo được.

**Dùng Single-agent khi:**
1. **Nhiệm vụ nằm trong một miền chuyên môn**, luồng xử lý tuyến tính.
2. **Ít tool** (dưới khoảng 10–15) — một agent vẫn chọn đúng tool ở tỉ lệ chấp nhận được.
3. **Prompt vẫn rõ ràng, không mâu thuẫn** khi mô tả toàn bộ nhiệm vụ.
4. **Cần latency thấp** — mỗi lớp điều phối cộng thêm ít nhất một lời gọi LLM.
5. **Cần chi phí thấp** — supervisor cũng tiêu token.
6. **Cần dễ debug** — một chuỗi trace tuyến tính dễ đọc hơn nhiều so với trace xuyên nhiều agent.
7. **Đội nhỏ, giai đoạn đầu, đang tìm product-market fit.**

**Chuyển sang Multi-agent khi có bằng chứng:**
- Tỉ lệ **chọn sai tool** tăng theo số tool.
- Prompt phình quá lớn, sửa cho việc này hỏng việc kia.
- Có phần **chạy song song được** và latency đang là vấn đề.
- Cần **cách ly quyền hạn** giữa các loại việc.
- Cần **tối ưu chi phí theo từng phần việc** (model rẻ cho việc đơn giản).
- Các phần việc thuộc **đội sở hữu khác nhau**, cần triển khai độc lập.

**Cách làm đúng:** bắt đầu single-agent → **đo** (tỉ lệ hoàn thành nhiệm vụ, tỉ lệ chọn đúng tool, latency, chi phí) → chỉ tách **đúng phần đang hỏng**, không tách cho đủ bộ.

**Nguyên tắc chung của kỹ thuật:** độ phức tạp phải được **kiếm về bằng bằng chứng**, không được giả định trước. Multi-agent giải quyết vấn đề *quá tải phạm vi*; nếu bạn chưa gặp vấn đề đó thì nó chỉ thêm chi phí và điểm hỏng.`,
      points: [
        { id: 'p1', w: 3, text: 'Single-agent là mặc định: dùng khi nhiệm vụ một miền, luồng tuyến tính, ít tool, prompt còn rõ ràng' },
        { id: 'p2', w: 3, text: 'Ưu điểm: latency thấp hơn, chi phí thấp hơn, dễ debug và bảo trì hơn' },
        { id: 'p3', w: 2, text: 'Nêu dấu hiệu cần chuyển sang multi-agent: quá nhiều tool/chọn sai tool, prompt quá tải, cần song song, cần cách ly quyền' },
        { id: 'p4', w: 2, text: 'Nguyên tắc: bắt đầu đơn giản, đo rồi mới tách đúng phần đang hỏng — độ phức tạp phải có bằng chứng' },
      ],
      why: 'Đây là câu kiểm tra kỷ luật kỹ thuật. Xu hướng chung là dựng multi-agent quá sớm vì nó nghe hấp dẫn hơn.',
      traps: ['Chỉ liệt kê ưu điểm multi-agent rồi kết luận ngược với câu hỏi.'],
      hook: 'Một người làm được thì đừng lập ban.',
      related: [42, 40, 41],
    },
    {
      id: 119,
      q: 'Một AI Agent production cần theo dõi những nhóm metric nào?',
      type: 'design',
      diff: 2,
      answer: `**Năm nhóm, mỗi nhóm trả lời một câu hỏi khác nhau:**

**1. Chất lượng AI — "Trả lời có đúng không?"**
Faithfulness, Answer Relevancy, Context Precision/Recall, Quality Score, hallucination rate, citation coverage, tỉ lệ trả lời đúng trên golden dataset, **drift**.

**2. Hiệu năng — "Có nhanh không?"**
TTFT, tổng latency **P50/P95/P99**, tokens/second, throughput, số bước agent trung bình, tỉ lệ gọi tool thành công, thời gian retrieval.

**3. Chi phí — "Có bền vững về kinh tế không?"**
Cost/request, token in/out mỗi request, **cache hit rate**, chi phí theo tenant/loại câu hỏi, tổng chi phí ngày/tháng so với ngân sách.

**4. Độ tin cậy & an toàn — "Có chạy và có an toàn không?"**
Uptime, error rate (4xx/5xx), tỉ lệ timeout, tỉ lệ retry, **tỉ lệ vi phạm guardrail**, số lần phát hiện prompt injection, sự cố rò rỉ PII (mục tiêu 0), tỉ lệ chạm \`max_steps\`.

**5. Kinh doanh & trải nghiệm — "Có tạo ra giá trị không?"**
Deflection rate (tỉ lệ tự động hóa hoàn toàn), **escalate rate**, CSAT/NPS, 👍/👎, tỉ lệ giải quyết ngay lần đầu, thời gian phản hồi, số hội thoại/người dùng hoạt động.

**Nguyên tắc theo dõi:**
- **Cắt lát (slice)** theo intent, tenant, ngôn ngữ, kênh — chỉ số tổng luôn che giấu vấn đề của một nhóm nhỏ.
- **Alert theo cả ngưỡng lẫn xu hướng**: giảm 2% mỗi tuần không bao giờ chạm ngưỡng nhưng ba tháng sau là thảm họa.
- **Nhóm 1 và nhóm 5 là quan trọng nhất và cũng bị bỏ quên nhiều nhất**, vì chúng không tự phát ra lỗi hệ thống. Hệ thống có thể "xanh hoàn toàn" trong khi đang trả lời sai.
- Mỗi request nên có \`request_id\` và **trace đầy đủ** (bao nhiêu bước, gọi tool nào, lấy tài liệu nào) — không có trace thì không điều tra được gì.`,
      points: [
        { id: 'p1', w: 3, text: 'Nhóm chất lượng AI: faithfulness/relevancy/context metrics, quality score, hallucination, drift' },
        { id: 'p2', w: 3, text: 'Nhóm hiệu năng (TTFT, P95/P99 latency, throughput, số bước agent) và nhóm chi phí (cost/request, token, cache hit rate)' },
        { id: 'p3', w: 2, text: 'Nhóm độ tin cậy & an toàn: uptime, error rate, timeout, vi phạm guardrail, rò rỉ PII, chạm max_steps' },
        { id: 'p4', w: 3, text: 'Nhóm kinh doanh/trải nghiệm: deflection rate, escalate rate, CSAT, phản hồi người dùng; kèm nguyên tắc cắt lát theo nhóm, alert theo xu hướng và cần trace đầy đủ' },
      ],
      why: 'Đây là bản thiết kế dashboard bạn sẽ dựng trong ngày đầu tiên vận hành. Thiếu nhóm nào thì mù ở đúng khía cạnh đó.',
      traps: ['Chỉ nêu metric hạ tầng và latency — bỏ mất chất lượng và giá trị kinh doanh.'],
      hook: 'Đúng – Nhanh – Rẻ – An toàn – Có ích.',
      related: [24, 60, 65, 66],
    },
    {
      id: 120,
      q: 'Hãy thiết kế hoàn chỉnh một AI Customer Support Agent từ **Problem Scoping → Data → RAG → Agent → Evaluation → CI/CD → Deploy → Monitoring → Iterate**.',
      type: 'design',
      diff: 3,
      answer: `## 1. Problem Scoping
- **Vấn đề:** 1.200 ticket/ngày, 60% là câu hỏi lặp lại (trạng thái đơn, phí ship, đổi trả); phản hồi trung bình 4 giờ; 8 nhân sự quá tải; CSAT 3.2/5.
- **Mục tiêu:** deflection ≥ 50%, thời gian phản hồi < 1 phút cho nhóm câu hỏi tự động, **CSAT không giảm** (guardrail).
- **Phạm vi:** trạng thái đơn, chính sách đổi/trả/hoàn tiền, phí và thời gian ship, hướng dẫn tài khoản. **Ngoài phạm vi:** khiếu nại nghiêm trọng, hoàn tiền > 500k, tư vấn pháp lý.
- **Rủi ro:** trả lời sai chính sách, rò rỉ dữ liệu khách, hứa vượt quyền → mỗi rủi ro có một biện pháp kiểm soát tương ứng ở các bước sau.

## 2. Data Strategy
- **Nguồn:** kho chính sách (PDF/Confluence), FAQ, 50.000 hội thoại CS lịch sử, API đơn hàng/khách hàng.
- **Xử lý:** parse → chunk 300–500 token, overlap 15%, cắt theo mục/điều khoản → gắn metadata (\`source, version, effective_date, department, access_level\`).
- **Golden dataset:** 200 câu lấy mẫu phân tầng theo intent/độ khó (gồm ca biên, ngoài phạm vi, an toàn), có ground truth + \`must_include\` + nguồn mong đợi, do CS Lead duyệt.
- **Quản trị:** ẩn PII trong dữ liệu lịch sử; quy trình cập nhật tài liệu có người chịu trách nhiệm; reindex khi tài liệu đổi.

## 3. RAG
- Embedding đa ngôn ngữ; vector DB có filter metadata.
- **Hybrid search** (BM25 + vector) → **top-k = 20 → rerank cross-encoder → giữ 4**; ngưỡng similarity tối thiểu, dưới ngưỡng ⇒ nhánh "không đủ thông tin".
- **Pre-filter bắt buộc**: \`status = active\`, \`effective_date <= now\`, và **\`access_level\` theo quyền của người dùng**.
- Ép **citation** cho mọi khẳng định về chính sách.

## 4. Agent
- **Single-agent ReAct** (đủ cho phạm vi này), \`max_steps = 6\`, timeout tổng 30s, temperature 0–0.3.
- **Tool:** \`get_order_status\`, \`search_policy\`, \`get_customer_info\` (sau xác minh), \`create_ticket\`, \`escalate_to_human\`. Tool ghi có hạn mức và audit log.
- **System prompt** đủ 8 khối (vai trò, phạm vi, nguồn, khi không biết, tool, quyền hạn, an toàn, định dạng).
- **Output Contract:** \`{reply, citations[], intent, confidence, needs_human}\`.
- **Semantic cache** cho câu hỏi chung (không cá nhân hóa), khóa theo ngôn ngữ + \`kb_v\`.

## 5. Evaluation
- Ngưỡng: faithfulness ≥ 0.90, answer relevancy ≥ 0.85, context recall ≥ 0.85, citation coverage 100%, nhóm an toàn 100%.
- **LLM-as-judge** theo rubric + đối chiếu \`must_include\`; cắt lát theo intent.
- Red teaming: prompt injection, đòi lộ prompt, vượt quyền, PII.
- Đo cả P95, TTFT, cost/request.

## 6. CI/CD
- Trigger: đổi code / prompt / KB / model.
- CI: unit + integration + contract test + eval nhanh 30 câu (< 10 phút).
- Staging: **eval đầy đủ 200 câu + red team + perf/cost** → **quality gate** (tuyệt đối *và* so với bản đang chạy) → phê duyệt (CS Lead duyệt khi đổi prompt chính sách hoặc model).
- Version hóa: \`code_sha + prompt_v + model + kb_v\`, ghi vào mọi response.

## 7. Deploy
- Canary 5% → 25% → 50% → 100%, mỗi mốc giữ 30–60 phút, so trực tiếp với nhánh cũ.
- Feature flag để tắt nhanh; **auto-rollback** khi escalate rate +50%, quality dưới ngưỡng, error > 1%, hoặc cost/request +40%.

## 8. Monitoring
- **Chất lượng:** LLM judge trên mẫu hằng ngày, hallucination, citation coverage, drift, tuổi tài liệu được trích dẫn.
- **Hiệu năng:** TTFT, P95/P99, số bước agent.
- **Chi phí:** cost/request, cache hit rate.
- **An toàn:** vi phạm guardrail, injection, rò rỉ PII (mục tiêu 0).
- **Kinh doanh:** deflection rate, escalate rate, CSAT, 👍/👎.
- Trace đầy đủ theo \`request_id\`; alert theo ngưỡng **và** xu hướng.

## 9. Iterate
- Hằng tuần: xem ca 👎 và ca escalate → phân loại nguyên nhân (thiếu tài liệu / retrieval sai / prompt / ngoài phạm vi).
- Ca thất bại → **bổ sung golden dataset**; câu hỏi chưa trả lời được → đội nội dung bổ sung KB.
- Mỗi vòng **đổi một thứ**, chạy lại eval, so baseline rồi mới phát hành.
- Xem lại phạm vi hằng quý: nhóm câu hỏi nào đã đủ chín để tự động hóa tiếp.

**Ba nguyên tắc xuyên suốt:** *grounding* (chỉ nói điều có nguồn) · *đường thoát an toàn* (không biết thì hỏi lại hoặc chuyển người) · *đo được ở mọi bước* (không có số thì không có cải tiến).`,
      points: [
        { id: 'p1', w: 3, text: 'Problem Scoping và Data Strategy: nêu vấn đề có số liệu, mục tiêu đo được, phạm vi in/out; nguồn dữ liệu, chunking + metadata, xây golden dataset' },
        { id: 'p2', w: 3, text: 'RAG + Agent: pipeline retrieval (hybrid/top-k/rerank/ngưỡng/filter quyền và hiệu lực), vòng lặp ReAct với max_steps, bộ tool, system prompt, output contract' },
        { id: 'p3', w: 3, text: 'Evaluation và CI/CD: ngưỡng metric cụ thể, red teaming, quality gate chặn deploy, version hóa prompt/model/KB' },
        { id: 'p4', w: 3, text: 'Deploy canary có rollback, monitoring đủ nhóm (chất lượng, hiệu năng, chi phí, an toàn, kinh doanh) và vòng iterate đưa ca lỗi trở lại golden dataset/KB' },
        { id: 'p5', w: 2, text: 'Xuyên suốt có yếu tố an toàn/guardrail: phân quyền dữ liệu, giới hạn quyền hạn tool, hành vi khi không đủ thông tin, citation bắt buộc' },
      ],
      why: 'Đây là câu tổng kết toàn bộ chương trình. Nó không kiểm tra bạn nhớ bao nhiêu khái niệm, mà kiểm tra bạn có nối được chúng thành một hệ thống mạch lạc hay không.',
      traps: [
        'Kể tên từng giai đoạn mà không có quyết định kỹ thuật cụ thể (con số, ngưỡng, tool).',
        'Bỏ quên phân quyền dữ liệu và hành vi khi không đủ thông tin.',
        'Dừng ở Deploy, không nói Monitoring và Iterate.',
      ],
      hook: 'Mỗi giai đoạn phải để lại một sản phẩm cụ thể: mục tiêu đo được → golden dataset → pipeline → agent → ngưỡng → gate → canary → dashboard → danh sách cải tiến.',
      related: [72, 109, 114, 119],
    },
  ],
};
