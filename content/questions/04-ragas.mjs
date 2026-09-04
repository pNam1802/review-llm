export default {
  id: 'ragas',
  name: 'RAGAS',
  short: 'RAGAS',
  emoji: '📐',
  blurb: 'Bốn metric lõi và cách chẩn đoán khi từng chỉ số tụt.',
  questions: [
    {
      id: 25,
      q: 'Faithfulness dùng để đánh giá điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đánh giá **mức độ trung thành của câu trả lời với ngữ cảnh được cung cấp** — tức là **đo hallucination** ở khâu sinh.

- Cách tính: tách answer thành các **claim**, đếm tỉ lệ claim được context chứng minh. Điểm 0–1.
- Đối tượng bị đánh giá: **generation layer** (LLM + prompt), không phải retriever.
- Faithfulness 1.0 = mọi khẳng định đều truy được về context. Faithfulness 0.6 = 40% khẳng định không có căn cứ.

**Ranh giới quan trọng:** faithfulness đo *trung thành với context*, **không** đo *đúng với sự thật*. Context sai/cũ mà model chép đúng ⇒ điểm vẫn cao.

**Khi điểm thấp, sửa ở đâu:** giảm temperature; prompt ràng buộc "chỉ dùng thông tin trong context, không có thì nói không biết"; **bắt buộc citation cho từng ý**; thêm bước tự kiểm tra (self-check/verifier); và dọn bớt nhiễu trong context vì context lộn xộn cũng đẩy model sang suy diễn.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo mức độ câu trả lời bám sát context được cung cấp — tức là đo hallucination' },
        { id: 'p2', w: 2, text: 'Đánh giá khâu generation (LLM + prompt), không phải khâu retrieval' },
        { id: 'p3', w: 2, text: 'Nêu cách tính theo claim: tỉ lệ khẳng định được context chứng minh, thang 0–1' },
        { id: 'p4', w: 2, text: 'Nêu ranh giới (trung thành ≠ đúng sự thật) hoặc cách cải thiện (temperature thấp, ép citation, prompt cấm suy diễn)' },
      ],
      why: 'Đây là metric bạn sẽ bị hỏi đầu tiên trong mọi cuộc phỏng vấn về RAG, và là metric quyết định hệ thống có được phép trả lời khách hàng hay không.',
      traps: ['Nhầm với Answer Relevancy.', 'Coi faithfulness cao là hệ thống đã đúng.'],
      hook: 'Faithfulness = "có chép đúng bài của thầy không".',
      related: [16, 18],
    },
    {
      id: 26,
      q: 'Answer Relevancy dùng để đánh giá điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đánh giá **câu trả lời có đúng trọng tâm câu hỏi hay không** — có đi thẳng vào điều được hỏi, hay lan man, thừa thãi, trả lời thiếu ý, rào đón.

- Cách tính (RAGAS): từ answer, **sinh ngược n câu hỏi** mà nó có thể đang trả lời → embed → tính **cosine trung bình** với câu hỏi gốc.
- **Không cần ground truth**, nên chạy được cả trên traffic thật (online eval), không chỉ trên golden dataset.
- Đối tượng bị đánh giá: **generation** (prompt + model), một phần phản ánh cả chất lượng context.

**Ranh giới:** relevancy đo *đúng trọng tâm*, không đo *đúng nội dung*. Một câu trả lời sai nội dung nhưng đúng chủ đề vẫn có thể đạt điểm cao ⇒ **luôn đọc cùng Faithfulness**.

**Khi điểm thấp:** siết prompt (vai trò, độ dài, cấu trúc, cấm rào đón), tách câu hỏi nhiều ý thành nhiều bước, giảm nhiễu context, thêm ví dụ few-shot về câu trả lời tốt.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo mức độ câu trả lời trúng trọng tâm câu hỏi, không lan man/thiếu ý/lạc đề' },
        { id: 'p2', w: 2, text: 'Cách tính: sinh ngược câu hỏi từ answer rồi so cosine với câu hỏi gốc; không cần ground truth' },
        { id: 'p3', w: 2, text: 'Không đánh giá tính đúng của nội dung — phải đọc cùng faithfulness' },
        { id: 'p4', w: 1, text: 'Cách cải thiện: prompt rõ ràng hơn, giảm nhiễu context, tách câu hỏi nhiều ý' },
      ],
      why: 'Relevancy là chỉ số gần với cảm nhận người dùng nhất trong bộ bốn — người dùng bực khi bị trả lời vòng vo dù nội dung không sai.',
      traps: ['Nhầm với Context Precision (độ sạch của ngữ cảnh, không phải của câu trả lời).'],
      hook: 'Relevancy = "có trúng câu hỏi không".',
      related: [17, 25],
    },
    {
      id: 27,
      q: 'Context Precision dùng để đánh giá điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đánh giá **chất lượng/độ sạch của ngữ cảnh được retrieve**: trong các chunk lấy về, bao nhiêu phần thực sự liên quan tới câu hỏi — và các chunk liên quan có **được xếp lên trên** hay không.

- Đối tượng bị đánh giá: **retrieval layer** (embedding, index, top-k, rerank).
- Công thức trực giác: chunk liên quan / tổng chunk lấy về, **có trọng số theo thứ hạng** trong RAGAS.
- Precision thấp ⇒ prompt đầy nhiễu ⇒ tốn token, chậm, và tăng nguy cơ model bám vào đoạn sai ("lost in the middle").

**Không nhầm với Context Recall:** precision hỏi *"có lôi về rác không"*, recall hỏi *"có bỏ sót không"*. Hai chỉ số này thường **đánh đổi qua tham số k**.

**Cách cải thiện:** thêm rerank cross-encoder, giảm k, đặt ngưỡng similarity, lọc metadata (phòng ban/sản phẩm/hiệu lực), chunking sạch hơn, hybrid search.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo tỉ lệ chunk thực sự liên quan trong ngữ cảnh retrieve — độ sạch/độ nhiễu' },
        { id: 'p2', w: 2, text: 'Đánh giá khâu retrieval, không phải generation' },
        { id: 'p3', w: 2, text: 'Có tính đến thứ hạng: chunk liên quan nên nằm ở vị trí đầu' },
        { id: 'p4', w: 2, text: 'Phân biệt với Context Recall và nêu cách cải thiện (rerank, giảm k, filter metadata, ngưỡng similarity)' },
      ],
      why: 'Precision là metric gắn thẳng với tiền: mỗi chunk rác là token phải trả tiền ở mọi request.',
      traps: ['Nói "precision là độ chính xác của câu trả lời" — sai đối tượng, nó nói về ngữ cảnh.'],
      hook: 'Precision = độ sạch của giỏ hàng.',
      related: [14, 29],
    },
    {
      id: 28,
      q: 'Context Recall dùng để đánh giá điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đánh giá **độ đầy đủ của ngữ cảnh**: trong toàn bộ thông tin cần để trả lời đúng (theo **ground truth**), bao nhiêu phần thực sự có trong các chunk lấy về.

- Đối tượng bị đánh giá: **retrieval layer** — và cả **chất lượng kho tri thức** (tài liệu có tồn tại trong index không).
- Là metric **bắt buộc cần ground truth** trong bộ lõi RAGAS.
- Recall thấp ⇒ câu trả lời **thiếu ý**, hoặc model bịa phần thiếu. Đây là lỗi im lặng: câu trả lời vẫn trôi chảy, người dùng không biết mình đang thiếu thông tin.

**Cách cải thiện (theo thứ tự kiểm tra):**
1. Tài liệu chứa thông tin đó **có trong index không** (thường đây mới là gốc rễ).
2. Tăng k / mở rộng vùng tìm.
3. Chunking lại (chunk cắt ngang điều khoản, bảng biểu là thủ phạm phổ biến), tăng overlap.
4. Query rewriting, multi-query, HyDE để bắc cầu khác biệt từ vựng.
5. Hybrid search BM25 + vector (cứu các trường hợp mã sản phẩm, số hiệu văn bản).`,
      points: [
        { id: 'p1', w: 3, text: 'Đo độ đầy đủ: bao nhiêu phần thông tin cần thiết (theo ground truth) có mặt trong ngữ cảnh retrieve' },
        { id: 'p2', w: 2, text: 'Đánh giá khâu retrieval và cả độ phủ của kho tri thức; cần ground truth để tính' },
        { id: 'p3', w: 2, text: 'Recall thấp ⇒ câu trả lời thiếu ý hoặc model bịa phần thiếu' },
        { id: 'p4', w: 2, text: 'Cách cải thiện: kiểm tra tài liệu có trong index, tăng k, chunking lại, query rewriting, hybrid search' },
      ],
      why: 'Trong bốn metric, recall là cái duy nhất phát hiện được "hệ thống không biết mà không biết là mình không biết".',
      traps: ['Quên rằng recall cần ground truth.', 'Nhầm recall của context với recall trong bài toán phân loại.'],
      hook: 'Recall = đã nhặt đủ chưa.',
      related: [15, 18, 30],
    },
    {
      id: 29,
      q: 'Nếu Context Precision thấp thì có thể do những nguyên nhân nào?',
      type: 'judgment',
      diff: 2,
      answer: `Precision thấp = **ngữ cảnh lấy về nhiều rác**. Nguyên nhân xếp theo tầng:

**1. Tham số truy vấn**
- **top-k quá lớn** — nguyên nhân số một. k = 20 gần như luôn kéo theo đoạn không liên quan.
- **Không có ngưỡng similarity tối thiểu** ⇒ luôn trả đủ k đoạn kể cả khi kho không chứa câu trả lời.
- **Không có bước rerank** ⇒ xếp hạng chỉ dựa vào embedding thô, vốn khá thô.

**2. Chunking**
- Chunk **quá lớn**: một chunk chứa nhiều chủ đề ⇒ phần liên quan bị pha loãng, phần thừa đi kèm.
- Chunk cắt **sai ranh giới ngữ nghĩa** (giữa bảng, giữa điều khoản).

**3. Dữ liệu & index**
- Kho có nhiều tài liệu **trùng lặp / gần trùng** (nhiều bản của cùng một chính sách) ⇒ top-k bị lấp bởi các bản sao.
- **Thiếu filter metadata**: không lọc theo sản phẩm/phòng ban/hiệu lực ⇒ tài liệu của bộ phận khác vẫn lọt vào.
- Tài liệu nhiễu: header/footer, boilerplate, mục lục được index như nội dung.

**4. Truy vấn & model**
- **Câu hỏi mơ hồ hoặc quá ngắn** ("về vụ kia thì sao?") ⇒ vector query không rõ ràng.
- **Embedding model không hợp domain / không hợp tiếng Việt** ⇒ khái niệm gần nhau bị hiểu lệch.

**Ưu tiên sửa:** thêm rerank + giảm k + đặt ngưỡng (rẻ, hiệu quả ngay) → rồi mới đến chunking và metadata (tốn công hơn nhưng bền).`,
      points: [
        { id: 'p1', w: 3, text: 'top-k quá lớn và/hoặc không có ngưỡng similarity, không có rerank' },
        { id: 'p2', w: 2, text: 'Chunking kém: chunk quá lớn hoặc cắt sai ranh giới ngữ nghĩa làm loãng nội dung' },
        { id: 'p3', w: 2, text: 'Dữ liệu nhiễu/trùng lặp trong kho, thiếu filter metadata theo phòng ban/sản phẩm/hiệu lực' },
        { id: 'p4', w: 2, text: 'Query mơ hồ hoặc embedding model không phù hợp domain/ngôn ngữ; nêu được hướng ưu tiên khắc phục' },
      ],
      why: 'Bài chẩn đoán này rèn thói quen đi từ tham số rẻ nhất (k, ngưỡng, rerank) tới thay đổi tốn kém nhất (reindex, đổi embedding).',
      traps: ['Chỉ nói "retrieval kém" mà không nêu nguyên nhân cụ thể ở tầng nào.'],
      hook: 'Precision thấp ⇒ nhìn k, nhìn ngưỡng, nhìn rerank trước tiên.',
      related: [13, 27],
    },
    {
      id: 30,
      q: 'Nếu Context Recall thấp thì có thể do những nguyên nhân nào?',
      type: 'judgment',
      diff: 2,
      answer: `Recall thấp = **ngữ cảnh thiếu thông tin cần thiết**. Nguyên nhân theo thứ tự nên kiểm tra:

**1. Kho tri thức (kiểm tra đầu tiên — rẻ nhất, hay đúng nhất)**
- Tài liệu chứa thông tin đó **chưa được ingest / index**, hoặc pipeline ingest lỗi im lặng.
- Tài liệu tồn tại nhưng parse hỏng: PDF scan không OCR, bảng biểu mất, nội dung nằm trong ảnh.

**2. Chunking**
- Chunk **quá nhỏ** hoặc **không overlap** ⇒ một ý bị cắt đôi, không chunk nào chứa đủ.
- Cắt giữa bảng/điều khoản làm mất phần định nghĩa quan trọng.

**3. Tham số truy vấn**
- **k quá nhỏ** ⇒ đoạn đúng nằm ở hạng 6 nhưng k = 5.
- **Filter metadata quá chặt** ⇒ loại nhầm tài liệu đúng (lọc sai phòng ban, sai khoảng ngày).
- Ngưỡng similarity đặt quá cao.

**4. Khoảng cách từ vựng (vocabulary mismatch)**
- Người dùng dùng từ nghiệp vụ/tiếng lóng khác hẳn từ trong tài liệu ⇒ cần **query rewriting / multi-query / HyDE**.
- Câu hỏi cần **nhiều nguồn** mà top-k chỉ đủ chỗ cho một nguồn ⇒ cần multi-hop retrieval.
- Mã hiệu, số văn bản, tên riêng ⇒ vector search kém; cần **hybrid BM25 + vector**.

**5. Embedding model** không phù hợp domain hoặc không hỗ trợ tốt tiếng Việt.`,
      points: [
        { id: 'p1', w: 3, text: 'Tài liệu chứa thông tin chưa có trong index / ingest lỗi / parse hỏng (kiểm tra đầu tiên)' },
        { id: 'p2', w: 2, text: 'Chunking: chunk quá nhỏ, thiếu overlap, cắt đứt ngữ cảnh' },
        { id: 'p3', w: 2, text: 'k quá nhỏ, ngưỡng quá cao, hoặc filter metadata quá chặt loại nhầm tài liệu đúng' },
        { id: 'p4', w: 2, text: 'Vocabulary mismatch giữa câu hỏi và tài liệu ⇒ cần query rewriting/multi-query/hybrid search; hoặc embedding model không hợp domain' },
      ],
      why: 'Recall thấp là nguyên nhân của phần lớn câu trả lời "thiếu mà nghe vẫn xuôi" — dạng lỗi làm mất niềm tin của người dùng nhanh nhất.',
      traps: ['Nhảy ngay vào đổi embedding model mà chưa kiểm tra tài liệu có trong index hay không.'],
      hook: 'Recall thấp ⇒ hỏi "tài liệu có trong kho không?" trước khi hỏi "thuật toán có tốt không?".',
      related: [15, 18, 28],
    },
  ],
};
