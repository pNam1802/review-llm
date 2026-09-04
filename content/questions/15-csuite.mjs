export default {
  id: 'csuite',
  name: 'C-suite / Business',
  short: 'C-suite',
  emoji: '👔',
  blurb: 'Trình bày AI với ban lãnh đạo bằng ngôn ngữ tiền và rủi ro.',
  questions: [
    {
      id: 95,
      q: 'Khi trình bày một AI product với C-suite nên tập trung vào những gì?',
      type: 'judgment',
      diff: 2,
      answer: `Tập trung vào **tác động kinh doanh và rủi ro**, không phải kiến trúc kỹ thuật.

**Khung trình bày (theo thứ tự):**
1. **Vấn đề kinh doanh, quy ra tiền.** "1.200 ticket/ngày, thời gian phản hồi trung bình 4 giờ, 8 nhân sự, chi phí 96 triệu/tháng, CSAT 3.2/5."
2. **Giải pháp trong một câu, không thuật ngữ.** "Trợ lý tự động trả lời 60% câu hỏi lặp lại và rút ngắn thời gian xử lý phần còn lại một nửa."
3. **Kết quả kỳ vọng, có số**: tiết kiệm 61,8 triệu/tháng, hoàn vốn 3,2 tháng, ROI 12 tháng ~271%, thời gian phản hồi 4 giờ → 1 phút.
4. **Bằng chứng**: kết quả pilot, độ chính xác đo trên golden dataset, phản hồi khách hàng thử nghiệm. Số liệu thật quan trọng hơn lời hứa.
5. **Rủi ro và cách kiểm soát**: trả lời sai (guardrail + escalate + đo chất lượng), bảo mật dữ liệu (phân quyền, không đưa PII ra ngoài), phụ thuộc nhà cung cấp, phản ứng của nhân viên. **Nêu rủi ro chủ động làm tăng độ tin cậy, không giảm.**
6. **Chi phí và nguồn lực**: đầu tư ban đầu, chi phí vận hành hằng tháng, nhân sự cần, thời gian triển khai.
7. **Lộ trình theo mốc có thể kiểm chứng**: pilot 1 nhóm câu hỏi (6 tuần) → mở rộng → tích hợp toàn kênh, kèm **tiêu chí go/no-go** ở mỗi mốc.
8. **Đề nghị cụ thể (the ask)**: xin duyệt bao nhiêu tiền, bao nhiêu người, quyết định gì hôm nay.

**Giọng điệu:** ngắn, có số, một thông điệp chính; chuẩn bị phần kỹ thuật ở phụ lục để trả lời nếu được hỏi. Nói được **điều gì xảy ra nếu không làm** (đối thủ, chi phí tăng theo tăng trưởng) cũng mạnh ngang việc nói lợi ích.`,
      points: [
        { id: 'p1', w: 3, text: 'Tập trung vào vấn đề kinh doanh và tác động quy ra tiền (chi phí tiết kiệm, doanh thu, hiệu suất), không phải kiến trúc kỹ thuật' },
        { id: 'p2', w: 3, text: 'Nêu con số cụ thể: ROI, payback period, các chỉ số vận hành cải thiện; kèm bằng chứng từ pilot/eval' },
        { id: 'p3', w: 2, text: 'Chủ động nêu rủi ro và cách kiểm soát (chất lượng, bảo mật, tuân thủ, phụ thuộc nhà cung cấp)' },
        { id: 'p4', w: 2, text: 'Nêu chi phí/nguồn lực, lộ trình theo mốc có tiêu chí go/no-go, và một đề nghị cụ thể cần được duyệt' },
      ],
      why: 'C-suite phân bổ vốn giữa nhiều lựa chọn. Bạn không cạnh tranh với một dự án AI khác, bạn cạnh tranh với mọi cách tiêu tiền khác của công ty.',
      traps: ['Dành 80% thời gian nói về RAG, embedding, kiến trúc — mất khán giả trong 2 phút đầu.'],
      hook: 'Vấn đề (tiền) → Giải pháp (1 câu) → Kết quả (số) → Rủi ro → Chi phí → Lộ trình → Đề nghị.',
      related: [96, 97, 98],
    },
    {
      id: 96,
      q: 'Tại sao không nên tập trung quá nhiều vào technical architecture khi trình bày với C-suite?',
      type: 'judgment',
      diff: 2,
      answer: `1. **Sai mối quan tâm.** C-suite chịu trách nhiệm về **doanh thu, chi phí, rủi ro, tăng trưởng, uy tín** — không về việc bạn chọn Qdrant hay pgvector. Kiến trúc không trả lời câu hỏi của họ: "Có đáng đầu tư không? Rủi ro gì? Bao giờ hoàn vốn?"
2. **Sai ngôn ngữ ⇒ mất kết nối.** Nghe "chúng tôi dùng RAG với hybrid retrieval và rerank cross-encoder", người nghe không đánh giá được tốt hay xấu, nên họ mặc định… không quan tâm. Thời lượng chú ý bị tiêu vào thứ không giúp ra quyết định.
3. **Thời gian cực hạn hẹp.** Thường 10–20 phút cho một quyết định lớn. Mỗi phút nói về kiến trúc là một phút không nói về tác động.
4. **Chi tiết kỹ thuật gây lo lắng sai chỗ**, hoặc tệ hơn — dẫn tới việc lãnh đạo can thiệp vào quyết định kỹ thuật mà họ không có đủ ngữ cảnh.
5. **Kiến trúc sẽ đổi.** Model, vector DB, framework sẽ khác sau sáu tháng. Cam kết giá trị kinh doanh mới là thứ bền vững để xin phê duyệt.
6. **Nghe như đang khoe hơn là đang thuyết phục** — làm giảm độ tin cậy thay vì tăng.

**Không có nghĩa là giấu kỹ thuật.** Hãy:
- **Chuẩn bị sẵn phần kiến trúc ở phụ lục** để trả lời khi được hỏi (và bạn *sẽ* được hỏi, nhất là bởi CTO).
- Đưa kỹ thuật vào **khi nó trả lời một câu hỏi kinh doanh**: "Chúng tôi dùng RAG thay vì fine-tuning, nghĩa là khi chính sách đổi, chỉ cần cập nhật tài liệu trong một ngày thay vì huấn luyện lại mất hai tuần." — đây là câu về kiến trúc, nhưng đơn vị là **thời gian và tiền**.
- Dùng kỹ thuật để chứng minh **rủi ro đã được kiểm soát**: "hệ thống bắt buộc trích dẫn nguồn và tự chuyển cho nhân viên khi không chắc chắn".`,
      points: [
        { id: 'p1', w: 3, text: 'C-suite quan tâm doanh thu/chi phí/rủi ro/chiến lược, không phải chi tiết công nghệ; kiến trúc không giúp họ ra quyết định' },
        { id: 'p2', w: 3, text: 'Nói sai ngôn ngữ làm mất kết nối và lãng phí thời gian trình bày vốn rất ngắn' },
        { id: 'p3', w: 2, text: 'Chi tiết kỹ thuật dễ gây lo lắng sai chỗ hoặc can thiệp không phù hợp; kiến trúc rồi cũng sẽ thay đổi' },
        { id: 'p4', w: 2, text: 'Không phải giấu kỹ thuật: để ở phụ lục, và chỉ đưa ra khi nó trả lời một câu hỏi kinh doanh (thời gian, chi phí, rủi ro được kiểm soát)' },
      ],
      why: 'Kỹ sư giỏi thường trượt ở đây: trình bày thứ mình tự hào thay vì thứ người nghe cần để quyết định.',
      traps: ['Kết luận "không nên nói kỹ thuật" — nên nói, nhưng phải dịch sang đơn vị tiền và rủi ro.'],
      hook: 'Đừng bán động cơ. Hãy bán quãng đường đi được với một lít xăng.',
      related: [95, 98],
    },
    {
      id: 97,
      q: 'Những business metrics nào nên đưa vào khi trình bày AI solution?',
      type: 'concept',
      diff: 2,
      answer: `**Nhóm 1 — Tài chính (bắt buộc phải có)**
- **Cost saving / tháng** và **năm**.
- **ROI (%)** và **Payback period** (thời gian hoàn vốn).
- **NPV / TCO** cho dự án lớn.
- **Cost per ticket / cost per interaction**: trước và sau.
- **Doanh thu tăng thêm** nếu có (chuyển đổi, upsell, giữ chân khách).

**Nhóm 2 — Vận hành**
- **Thời gian xử lý trung bình (AHT)**: 6 phút → 3 phút.
- **Thời gian phản hồi đầu tiên**: 4 giờ → 1 phút.
- **Deflection rate**: % yêu cầu được xử lý hoàn toàn tự động.
- **Capacity**: số ticket xử lý được với cùng nhân sự; khả năng chịu mùa cao điểm.
- **Tỉ lệ escalate** sang người.

**Nhóm 3 — Khách hàng**
- **CSAT / NPS** (bắt buộc: chứng minh tiết kiệm mà **không làm hỏng trải nghiệm**).
- Tỉ lệ giải quyết ngay lần đầu (FCR), tỉ lệ khách quay lại hỏi cùng vấn đề.
- Churn/retention nếu đo được.

**Nhóm 4 — Chất lượng & rủi ro (dịch sang ngôn ngữ kinh doanh)**
- **Độ chính xác** trên golden dataset — trình bày như "tỉ lệ trả lời đúng", không phải "faithfulness 0.93".
- **Tỉ lệ trả lời sai/phải đính chính**, số sự cố.
- Tuân thủ: tỉ lệ trả lời có dẫn nguồn, số lần rò rỉ dữ liệu (mục tiêu 0).

**Nhóm 5 — Nhân sự**
- Thời gian nhân viên được giải phóng để làm việc giá trị cao hơn; hài lòng của nhân viên; thời gian đào tạo người mới.

**Nguyên tắc trình bày:** luôn có **baseline (trước) – kết quả (sau) – cách đo**; nêu **cả metric bảo vệ (guardrail metric)** như CSAT để chứng minh không đánh đổi chất lượng lấy chi phí; và nói rõ giả định (ví dụ: tiết kiệm là capacity saving hay cash saving thật).`,
      points: [
        { id: 'p1', w: 3, text: 'Nhóm tài chính: cost saving, ROI, payback period, cost per ticket/interaction, doanh thu tăng thêm' },
        { id: 'p2', w: 3, text: 'Nhóm vận hành: thời gian xử lý/phản hồi, deflection rate (tỉ lệ tự động hóa), capacity, tỉ lệ escalate' },
        { id: 'p3', w: 2, text: 'Nhóm trải nghiệm khách hàng: CSAT/NPS, FCR — chứng minh tiết kiệm mà không làm giảm chất lượng' },
        { id: 'p4', w: 2, text: 'Nhóm chất lượng/rủi ro dịch sang ngôn ngữ kinh doanh (tỉ lệ trả lời đúng, sự cố, tuân thủ) và luôn có baseline trước–sau kèm cách đo' },
      ],
      why: 'Chọn đúng bộ metric là cách bạn định nghĩa thành công trước khi bắt đầu — và tránh được cảnh cuối dự án mỗi người đo một kiểu.',
      traps: [
        'Chỉ đưa metric kỹ thuật (accuracy, F1, faithfulness) — không dịch sang tác động kinh doanh.',
        'Quên guardrail metric (CSAT) ⇒ nghe như đang đánh đổi khách hàng lấy chi phí.',
      ],
      hook: 'Tiền – Vận hành – Khách hàng – Rủi ro – Nhân sự.',
      related: [95, 98, 103],
    },
    {
      id: 98,
      q: 'Làm thế nào để chứng minh AI solution tạo ra business value?',
      type: 'judgment',
      diff: 3,
      answer: `**Bằng đo lường có đối chứng, không bằng lời hứa.**

**1. Chốt baseline TRƯỚC khi triển khai.** Không có số liệu "trước" thì không bao giờ chứng minh được "sau". Đo: số ticket, AHT, thời gian phản hồi, chi phí/ticket, CSAT, tỉ lệ escalate — ít nhất 4 tuần liên tục.

**2. Định nghĩa trước tiêu chí thành công** cùng bên nghiệp vụ: mục tiêu, ngưỡng chấp nhận, guardrail metric (CSAT không giảm quá 0,2 điểm). Chốt trước để không bị "dời cột gôn".

**3. Chạy thử có đối chứng (đây là phần thuyết phục nhất):**
- **A/B test** hoặc **canary**: một phần traffic qua AI, phần còn lại giữ nguyên quy trình cũ ⇒ so sánh trực tiếp trong cùng bối cảnh thị trường.
- Nếu không A/B được: so sánh **theo nhóm tương đương** (cùng loại ticket, cùng khung giờ), hoặc **before/after có kiểm soát mùa vụ**.
- Tránh gán công cho AI khi cùng lúc có chương trình khuyến mãi, mùa cao điểm, hay thay đổi quy trình khác.

**4. Đo cả ba tầng, và nối chúng lại thành một chuỗi nhân quả:**
\`\`\`
Chất lượng model  →  Thay đổi vận hành  →  Kết quả tài chính
(độ chính xác 92%)  (deflection 58%,      (tiết kiệm 61,8tr/tháng,
                     AHT 6→3 phút)         payback 3,2 tháng)
\`\`\`
Thiếu mắt xích giữa thì con số tài chính trông như bịa.

**5. Quy đổi ra tiền một cách minh bạch**, ghi rõ giả định và **phân biệt cash saving với capacity saving**. Nói thẳng "đây là năng lực được giải phóng, thành tiền thật khi ta hấp thụ tăng trưởng mà không tuyển thêm" — trung thực ở điểm này làm tăng độ tin cậy hơn là thổi phồng.

**6. Trình bày cả mặt trái:** chi phí vận hành, ca thất bại, giới hạn hiện tại, và các rủi ro đang được kiểm soát ra sao.

**7. Theo dõi liên tục sau khi triển khai** và báo cáo định kỳ: giá trị phải **duy trì được**, không chỉ đẹp trong tháng đầu (nhớ drift).

**8. Kèm bằng chứng định tính**: trích dẫn phản hồi khách hàng và nhân viên — số liệu thuyết phục lý trí, câu chuyện thuyết phục cảm xúc.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo baseline trước khi triển khai và định nghĩa trước tiêu chí thành công cùng bên nghiệp vụ' },
        { id: 'p2', w: 3, text: 'Dùng thử nghiệm có đối chứng (A/B test, canary, nhóm đối chứng) để quy kết nhân quả thay vì chỉ so trước–sau' },
        { id: 'p3', w: 3, text: 'Nối chuỗi từ chất lượng model → thay đổi vận hành → kết quả tài chính, quy đổi ra tiền với giả định minh bạch (phân biệt cash vs capacity saving)' },
        { id: 'p4', w: 2, text: 'Theo dõi liên tục sau triển khai để chứng minh giá trị bền vững; trình bày cả chi phí, hạn chế và bằng chứng định tính' },
      ],
      why: 'Đây là kỹ năng khiến dự án AI được tiếp tục cấp ngân sách. Rất nhiều dự án tốt bị cắt chỉ vì không ai chứng minh được nó tạo ra giá trị.',
      traps: [
        'So sánh trước–sau mà bỏ qua yếu tố mùa vụ hoặc các thay đổi khác diễn ra cùng lúc.',
        'Trình bày tiết kiệm như tiền mặt trong khi thực chất là năng lực dôi ra.',
      ],
      hook: 'Baseline → Đối chứng → Chuỗi nhân quả → Tiền → Duy trì.',
      related: [95, 97, 104],
    },
  ],
};
