export default {
  id: 'ai-fundamentals',
  name: 'AI Fundamentals',
  short: 'Nền tảng',
  emoji: '🧭',
  blurb: 'Phân biệt ML / DL / GenAI và biết khi nào KHÔNG nên dùng AI.',
  questions: [
    {
      id: 1,
      q: 'ML và Deep Learning có quan hệ với nhau như thế nào?',
      type: 'concept',
      diff: 1,
      answer: `**Quan hệ bao hàm (tập con), không phải hai thứ song song.**

- **AI** ⊃ **Machine Learning** ⊃ **Deep Learning**.
- **ML** là nhánh của AI: máy *học quy luật từ dữ liệu* thay vì được lập trình từng luật. Bao gồm cả các thuật toán cổ điển: linear/logistic regression, decision tree, SVM, k-means, gradient boosting…
- **Deep Learning** là một *nhóm thuật toán bên trong ML*, dùng mạng nơ-ron **nhiều lớp** (deep = nhiều hidden layer) để **tự học đặc trưng (feature learning)** từ dữ liệu thô.

**Khác biệt thực dụng:**

| | ML cổ điển | Deep Learning |
|---|---|---|
| Feature | người làm feature engineering | mô hình tự học feature |
| Dữ liệu | chạy tốt với vài nghìn dòng | thường cần rất nhiều dữ liệu |
| Tính toán | CPU là đủ | thường cần GPU |
| Giải thích | dễ diễn giải | hộp đen, khó diễn giải |
| Hợp với | dữ liệu bảng (tabular) | ảnh, âm thanh, văn bản, video |

LLM là Deep Learning (kiến trúc Transformer) ⇒ nói "LLM là một ứng dụng của DL, DL là một nhánh của ML, ML là một nhánh của AI" là chuỗi đúng.`,
      points: [
        { id: 'p1', w: 3, text: 'Nêu đúng quan hệ tập con: DL nằm trong ML, ML nằm trong AI (không phải hai lĩnh vực ngang hàng)' },
        { id: 'p2', w: 2, text: 'DL = mạng nơ-ron nhiều lớp, điểm mấu chốt là tự học đặc trưng thay vì phải feature engineering thủ công' },
        { id: 'p3', w: 2, text: 'Nêu được ít nhất một khác biệt thực dụng: nhu cầu dữ liệu / compute (GPU) / khả năng diễn giải' },
        { id: 'p4', w: 1, text: 'Nêu được ví dụ hoặc miền áp dụng phù hợp của mỗi bên (ML cổ điển ↔ tabular; DL ↔ ảnh/text/audio)' },
      ],
      why: 'Nhầm "ML" với "DL" dẫn tới quyết định kỹ thuật sai: kéo GPU và mạng nơ-ron vào một bài toán tabular 5.000 dòng mà XGBoost giải trong 10 phút, vừa đắt vừa kém chính xác hơn.',
      traps: [
        'Nói "ML và DL là hai loại AI khác nhau" — sai về quan hệ bao hàm.',
        'Nói "DL luôn tốt hơn ML" — với dữ liệu bảng ít dòng thì ngược lại.',
      ],
      hook: 'Búp bê Nga: AI ⊃ ML ⊃ DL ⊃ (Transformer → LLM).',
      related: [115],
    },
    {
      id: 2,
      q: 'Trong các use case được cho, use case nào phù hợp để triển khai AI?',
      type: 'judgment',
      diff: 2,
      answer: `Không thuộc lòng danh sách — hãy dùng **bộ 5 tiêu chí sàng lọc**:

1. **Có pattern trong dữ liệu, nhưng luật quá phức tạp để viết tay.** Đây là điều kiện cần số một. Phân loại email, phát hiện gian lận, dự đoán churn → hợp. Tính thuế theo biểu thuế → viết if-else.
2. **Có dữ liệu đủ nhiều và đủ chất lượng** (hoặc mua/thuê được, hoặc dùng được model pretrained).
3. **Chấp nhận được sai số.** AI luôn sai một tỉ lệ nào đó. Gợi ý sản phẩm sai → mất chút doanh thu (OK). Tính lương sai → không chấp nhận được (dùng rule).
4. **Bài toán lặp lại nhiều lần, khối lượng lớn** → mới đủ ROI để bù chi phí xây và vận hành.
5. **Sai sót phát hiện và sửa được** (có human-in-the-loop, có rollback).

**Hợp với AI:** phân loại / trích xuất thông tin từ văn bản, tóm tắt, tìm kiếm ngữ nghĩa, dự đoán (churn, demand), gợi ý, phát hiện bất thường, hỗ trợ trả lời khách hàng.

**Không hợp:** logic xác định 100% (tính tiền, tính thuế, kiểm tra định dạng), quyết định pháp lý cần giải trình tuyệt đối, việc chỉ chạy vài lần, việc không có dữ liệu.`,
      points: [
        { id: 'p1', w: 3, text: 'Tiêu chí "có pattern nhưng luật quá phức tạp/không viết tay được" — điều kiện cần cốt lõi' },
        { id: 'p2', w: 2, text: 'Yêu cầu về dữ liệu: đủ số lượng và chất lượng (hoặc tận dụng model pretrained)' },
        { id: 'p3', w: 2, text: 'Bài toán phải chấp nhận được sai số / rủi ro sai có thể kiểm soát' },
        { id: 'p4', w: 2, text: 'Quy mô lặp lại đủ lớn để có ROI, và nêu được ví dụ hợp / không hợp cụ thể' },
      ],
      why: 'Đây chính là bước Problem Scoping. 80% dự án AI chết vì chọn sai bài toán, không phải vì chọn sai model.',
      traps: [
        'Chọn use case chỉ vì "nghe hiện đại" mà không hỏi có dữ liệu không.',
        'Đưa AI vào chỗ đòi hỏi đúng 100% (tính tiền, tuân thủ pháp lý).',
      ],
      hook: 'PDRRR: Pattern – Data – Rủi ro chấp nhận được – Repeat (quy mô) – Recover (sửa được).',
      related: [5, 73],
    },
    {
      id: 3,
      q: 'Phân loại email customer support thành 5 nhóm nên sử dụng loại AI nào? Vì sao?',
      type: 'judgment',
      diff: 1,
      answer: `**Discriminative AI — bài toán phân loại (multi-class text classification)**, không phải Generative AI.

**Vì sao:**
- Đầu ra là **một nhãn trong tập đóng gồm 5 giá trị** → mô hình chỉ cần học ranh giới quyết định giữa các lớp, không cần sinh văn bản mới.
- Rẻ hơn và nhanh hơn nhiều lần so với gọi LLM cho mỗi email; latency mili-giây thay vì giây.
- **Đo được bằng metric chuẩn**: accuracy, precision/recall/F1 theo từng lớp, confusion matrix.
- Đầu ra ổn định, không "sáng tác" nhãn thứ 6.

**Cách làm thực tế:**
- Có sẵn vài nghìn email đã gán nhãn → fine-tune một encoder (PhoBERT / BERT multilingual) hoặc đơn giản là TF-IDF + Logistic Regression làm baseline.
- Chưa có nhãn → dùng **LLM zero-shot/few-shot làm bước khởi động** để gán nhãn nhanh + con người soát, rồi mới huấn luyện model nhỏ. Đây là kiểu "LLM để bootstrap dữ liệu", vẫn về đích ở một classifier.
- Luôn có nhãn **"other/cần người xử lý"** và ngưỡng confidence để định tuyến ca khó cho người.`,
      points: [
        { id: 'p1', w: 3, text: 'Chọn Discriminative AI / bài toán classification (phân loại nhiều lớp), không phải Generative' },
        { id: 'p2', w: 3, text: 'Lý do: đầu ra là nhãn trong tập đóng, không cần sinh nội dung mới' },
        { id: 'p3', w: 2, text: 'Nêu ưu thế: rẻ hơn / nhanh hơn / ổn định hơn LLM và đo được bằng accuracy, F1, confusion matrix' },
        { id: 'p4', w: 1, text: 'Nêu hướng triển khai thực tế: cần dữ liệu gán nhãn, hoặc dùng LLM zero-shot để bootstrap rồi mới train model nhỏ' },
      ],
      why: 'Đây là câu kiểm tra bạn có phản xạ "không phải bài toán nào cũng ném cho LLM" hay không — một trong những nguồn lãng phí chi phí lớn nhất trong hệ thống production.',
      traps: [
        'Trả lời "dùng GenAI vì nó làm được" — làm được ≠ nên dùng.',
        'Quên nhóm "other" và ngưỡng confidence để escalate cho người.',
      ],
      hook: 'Tập đóng, hữu hạn nhãn ⇒ phân loại. Đầu ra tự do ⇒ sinh.',
      related: [115, 4],
    },
    {
      id: 4,
      q: 'Khi nào nên sử dụng Generative AI?',
      type: 'concept',
      diff: 1,
      answer: `Dùng Generative AI khi **đầu ra là nội dung mới, ngôn ngữ tự nhiên, không nằm trong tập nhãn hữu hạn** — và khi có thể chấp nhận đầu ra biến thiên.

**Hợp:**
- Sinh văn bản: soạn phản hồi khách hàng, viết mô tả sản phẩm, sinh code, dịch.
- **Tóm tắt** và diễn giải lại nội dung dài.
- **Hỏi đáp trên tài liệu** (RAG) — câu trả lời phải viết thành câu, có ngữ cảnh.
- **Trích xuất thông tin phi cấu trúc → cấu trúc** khi lược đồ phức tạp hoặc dữ liệu gán nhãn quá ít để train classifier.
- Bài toán **few-shot / zero-shot**: chưa có dữ liệu huấn luyện nhưng cần chạy ngay.
- Là "bộ não lập luận" trong agent: quyết định gọi tool nào, tổng hợp kết quả.

**Không hợp:**
- Đầu ra là số/nhãn cố định (dùng model dự đoán/phân loại).
- Cần chính xác tuyệt đối và tái lập 100% (tính toán tài chính — hãy để LLM gọi calculator).
- Khối lượng cực lớn, latency cực thấp, ngân sách cực mỏng.

**Điều kiện đi kèm:** luôn ràng buộc bằng **Output Contract** (schema), có kiểm chứng/guardrail, và đo bằng eval — vì đầu ra không tất định.`,
      points: [
        { id: 'p1', w: 3, text: 'Khi đầu ra là nội dung mới / ngôn ngữ tự nhiên, không thuộc tập nhãn hữu hạn' },
        { id: 'p2', w: 2, text: 'Nêu ít nhất 2 use case đúng: sinh văn bản, tóm tắt, RAG Q&A, trích xuất khi thiếu dữ liệu nhãn, agent reasoning' },
        { id: 'p3', w: 2, text: 'Hợp khi thiếu dữ liệu huấn luyện / cần zero-shot, few-shot, ra sản phẩm nhanh' },
        { id: 'p4', w: 2, text: 'Nêu ranh giới: không dùng khi cần chính xác tuyệt đối, tất định, hoặc khi classifier/rule rẻ hơn; cần schema + eval kèm theo' },
      ],
      why: 'GenAI đắt hơn 10–100 lần một classifier cho cùng một việc phân loại. Biết ranh giới là kỹ năng tiết kiệm tiền rõ rệt nhất của AI Engineer.',
      traps: ['Kể use case mà quên nêu điều kiện "chấp nhận đầu ra biến thiên" và nhu cầu guardrail.'],
      hook: 'Sinh ra chữ mới ⇒ GenAI. Chọn trong danh sách ⇒ classifier. Luật rõ ⇒ if-else.',
      related: [3, 9, 116],
    },
    {
      id: 5,
      q: 'Khi nào nên sử dụng Rule-based system?',
      type: 'concept',
      diff: 1,
      answer: `Dùng rule khi **logic đã biết, hữu hạn và phải đúng 100%**.

**Dấu hiệu nên dùng rule:**
- Luật do **con người/pháp luật/hợp đồng quy định**: biểu thuế, phí ship theo vùng, chính sách hoàn tiền, SLA. Luật đã viết sẵn — chỉ cần mã hóa.
- Cần **tất định và tái lập**: cùng input luôn cho cùng output, audit được từng bước.
- **Không được phép sai**: tính tiền, kiểm tra định dạng, hạn mức tín dụng cứng, chặn giao dịch vượt quyền.
- **Không có dữ liệu** để huấn luyện, hoặc số lượng case quá ít.
- Cần **giải trình pháp lý**: "vì sao hệ thống từ chối hồ sơ này" phải trả lời bằng một dòng luật cụ thể.

**Hạn chế của rule:** bùng nổ tổ hợp khi số luật lớn, không tổng quát hóa cho trường hợp chưa gặp, chi phí bảo trì tăng theo thời gian.

**Thực tế production là hệ lai:** rule làm **guardrail cứng** bọc ngoài AI. Ví dụ agent chăm sóc khách hàng: LLM soạn câu trả lời, nhưng rule chặn cứng việc hoàn tiền > 5 triệu nếu chưa có người duyệt.`,
      points: [
        { id: 'p1', w: 3, text: 'Khi logic đã biết rõ, hữu hạn, do con người/pháp luật quy định — mã hóa được thành if-else' },
        { id: 'p2', w: 2, text: 'Khi cần tất định, tái lập, audit và giải trình được' },
        { id: 'p3', w: 2, text: 'Khi không được phép sai / không có dữ liệu để huấn luyện' },
        { id: 'p4', w: 2, text: 'Nêu hạn chế (khó mở rộng, không tổng quát hóa) hoặc mô hình lai rule làm guardrail bọc ngoài AI' },
      ],
      why: 'Trong hệ thống thật, rule không biến mất khi có AI — nó trở thành lớp an toàn. Câu trả lời hay nhất là câu nói được vai trò "guardrail" đó.',
      traps: ['Chỉ nói "khi bài toán đơn giản" — quá mơ hồ, thiếu tiêu chí tất định/không được sai.'],
      hook: 'Luật đã có sẵn trong đầu người ⇒ if-else. Luật nằm ẩn trong dữ liệu ⇒ ML.',
      related: [2, 94],
    },
  ],
};
