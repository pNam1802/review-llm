export default {
  id: 'rag',
  name: 'RAG',
  short: 'RAG',
  emoji: '📚',
  blurb: 'Embedding, similarity, top-k, metadata và cách đọc bộ metric của RAG.',
  questions: [
    {
      id: 11,
      q: 'Embedding là gì và dùng để làm gì?',
      type: 'concept',
      diff: 1,
      answer: `**Embedding** là biểu diễn một mẩu dữ liệu (câu, đoạn văn, ảnh…) thành một **vector số thực nhiều chiều** (thường 384–3072 chiều), sao cho **khoảng cách hình học phản ánh khoảng cách ngữ nghĩa**: nội dung nghĩa gần nhau thì vector nằm gần nhau.

Nhờ vậy, "hủy đơn hàng" và "cancel my order" nằm sát nhau dù **không chung một ký tự nào** — điều mà tìm kiếm từ khóa (keyword) không làm được.

**Dùng để:**
- **Semantic search / retrieval trong RAG** — trái tim của bước tìm tài liệu.
- **Semantic cache** — nhận ra câu hỏi mới thực chất giống câu đã trả lời.
- **Clustering / phân nhóm** feedback, phát hiện chủ đề.
- **Deduplication**, gợi ý nội dung tương tự, phát hiện bất thường.
- **Classification** nhẹ: embedding + một classifier nhỏ.

**Cần nhớ khi triển khai:**
- Query và document **phải dùng cùng một model embedding** (và cùng phiên bản). Đổi model ⇒ **phải index lại toàn bộ**.
- Vector được lưu trong **vector database** (FAISS, pgvector, Qdrant, Milvus, Pinecone…) với chỉ mục ANN để tìm nhanh.
- Embedding **không hiểu phủ định và thời gian tốt**: "không được hoàn tiền" khá gần "được hoàn tiền"; bản 2024 và 2026 gần như trùng nhau ⇒ phải cứu bằng metadata và rerank.`,
      points: [
        { id: 'p1', w: 3, text: 'Là vector số nhiều chiều biểu diễn dữ liệu, sao cho gần nhau về nghĩa = gần nhau trong không gian vector' },
        { id: 'p2', w: 3, text: 'Dùng cho semantic search / retrieval trong RAG (nêu thêm được: semantic cache, clustering, dedup, recommendation)' },
        { id: 'p3', w: 2, text: 'Ưu điểm so với keyword search: bắt được cách diễn đạt khác nhau, khác ngôn ngữ, không cần trùng từ' },
        { id: 'p4', w: 2, text: 'Lưu ý triển khai: query và document phải cùng model embedding, lưu trong vector DB, đổi model thì phải reindex' },
      ],
      why: 'Embedding là giả định nền của toàn bộ RAG. Mọi lỗi retrieval đều bắt đầu từ việc "gần về nghĩa" của model không trùng với "đúng thứ tôi cần" của nghiệp vụ.',
      traps: [
        'Nói embedding là "nén dữ liệu" — sai bản chất; nó là ánh xạ sang không gian ngữ nghĩa.',
        'Quên rằng embedding kém với phủ định và với phiên bản/thời gian.',
      ],
      hook: 'Embedding = tọa độ GPS của ý nghĩa.',
      visual: `        "hủy đơn hàng" ●
                          ●  "cancel my order"     ← gần nhau
   "chính sách bảo hành" ●                          ← xa hơn
                                    ● "công thức nấu phở"`,
      related: [12, 70],
    },
    {
      id: 12,
      q: 'Cosine Similarity là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Cosine similarity** đo độ tương đồng giữa hai vector bằng **cosin của góc giữa chúng**:

\`\`\`
cos(A, B) = (A · B) / (|A| × |B|)
\`\`\`

- Kết quả trong khoảng **[-1, 1]**: 1 = cùng hướng (rất giống), 0 = vuông góc (không liên quan), -1 = ngược hướng. Với embedding văn bản thực tế, giá trị thường rơi vào **0 → 1**.
- **Chỉ quan tâm hướng, bỏ qua độ dài vector** — đây là lý do nó được chọn: một đoạn 50 từ và một đoạn 500 từ cùng chủ đề vẫn được coi là giống nhau, không bị độ dài làm lệch.

**Trong RAG:** embed câu hỏi → tính cosine với mọi vector trong index → lấy **top-k** điểm cao nhất làm ngữ cảnh.

**Cần biết thêm:**
- Nếu vector đã được **chuẩn hóa L2** (\`|v| = 1\`) thì cosine ≡ dot product, và thứ tự xếp hạng giống hệt Euclidean distance ⇒ nhiều vector DB chuẩn hóa sẵn để tính nhanh hơn.
- Điểm cosine là **tương đối, không phải xác suất đúng**. 0.82 không có nghĩa "đúng 82%". Ngưỡng cắt phải được hiệu chỉnh trên chính dữ liệu của bạn.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo độ tương đồng bằng cosin của góc giữa hai vector: tích vô hướng chia tích độ dài' },
        { id: 'p2', w: 2, text: 'Giá trị từ -1 đến 1 (thực tế với text thường 0..1); càng gần 1 càng giống' },
        { id: 'p3', w: 3, text: 'Chỉ xét hướng, không xét độ lớn ⇒ không bị thiên lệch vì độ dài văn bản' },
        { id: 'p4', w: 1, text: 'Dùng để xếp hạng và lấy top-k trong retrieval; điểm số là tương đối, không phải xác suất đúng' },
      ],
      why: 'Đây là hàm quyết định tài liệu nào được đưa vào prompt. Hiểu nó giải thích vì sao một đoạn dài lan man vẫn có thể thắng một đoạn ngắn chính xác — và vì sao cần rerank.',
      traps: ['Nói "cosine đo khoảng cách" mà không nói nó bỏ qua độ dài.', 'Coi điểm 0.9 là "chắc chắn đúng".'],
      hook: 'Cosine hỏi "hai mũi tên có chỉ cùng hướng không?", không hỏi "mũi tên nào dài hơn?".',
      related: [11, 13],
    },
    {
      id: 13,
      q: 'Top-k trong RAG có ý nghĩa gì?',
      type: 'concept',
      diff: 1,
      answer: `**Top-k** là **số lượng chunk có điểm tương đồng cao nhất** được lấy ra và nhét vào ngữ cảnh cho LLM.

Đây là núm vặn đánh đổi trực tiếp giữa **Context Recall** và **Context Precision**:

| k | Hệ quả |
|---|---|
| k nhỏ (1–3) | Precision cao, prompt gọn, rẻ, nhanh — nhưng dễ **sót** thông tin ⇒ Recall thấp, câu trả lời thiếu |
| k lớn (10–20) | Recall cao, ít sót — nhưng **nhiễu nhiều**, tốn token, chậm, và LLM dễ bị "lost in the middle" |

**Thực hành:**
- Khởi điểm phổ biến: **k = 3–5** cho câu hỏi FAQ ngắn; k lớn hơn cho câu hỏi tổng hợp nhiều nguồn.
- Kỹ thuật chuẩn để thoát khỏi đánh đổi: **retrieve rộng rồi rerank hẹp** — lấy k = 20 bằng vector search (rẻ), rồi dùng cross-encoder rerank giữ lại 3–5 đoạn tốt nhất. Recall của bước một + Precision của bước hai.
- Đi kèm là **ngưỡng điểm tối thiểu**: nếu không chunk nào vượt ngưỡng thì trả lời "tôi không có thông tin" thay vì nhồi 5 đoạn vô quan vào prompt.
- k phải được chọn bằng **đo trên golden dataset**, không chọn bằng cảm tính.`,
      points: [
        { id: 'p1', w: 3, text: 'Là số chunk/tài liệu tương đồng nhất được lấy ra làm ngữ cảnh cho LLM' },
        { id: 'p2', w: 3, text: 'Đánh đổi: k nhỏ → precision cao nhưng dễ sót (recall thấp); k lớn → recall cao nhưng nhiều nhiễu, tốn token, chậm' },
        { id: 'p3', w: 2, text: 'Nêu giá trị thực tế (khoảng 3–5) và/hoặc cách chọn bằng đo đạc trên golden dataset' },
        { id: 'p4', w: 2, text: 'Kỹ thuật kèm theo: retrieve rộng rồi rerank, hoặc đặt ngưỡng similarity tối thiểu' },
      ],
      why: 'Top-k là tham số bị chỉnh nhiều nhất và bị hiểu sai nhiều nhất. "Tăng k cho chắc" là cách nhanh nhất để vừa tăng chi phí vừa giảm chất lượng.',
      traps: ['Nghĩ k càng lớn càng tốt.', 'Không đặt ngưỡng similarity ⇒ luôn có k đoạn kể cả khi kho không hề chứa câu trả lời.'],
      hook: 'k là cái phễu: hẹp thì lọt, rộng thì lẫn.',
      related: [14, 15, 29],
    },
    {
      id: 14,
      q: 'Context Precision là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Context Precision** đo **độ sạch của ngữ cảnh đã lấy về**: trong số các chunk được retrieve, bao nhiêu phần thực sự **liên quan/hữu ích** cho câu hỏi.

\`\`\`
Context Precision ≈ (số chunk liên quan) / (tổng số chunk lấy về)
\`\`\`

Trong RAGAS, chỉ số này còn **có trọng số theo thứ hạng**: chunk liên quan nằm ở vị trí đầu được tính cao hơn nằm ở cuối — vì LLM chú ý phần đầu ngữ cảnh nhiều hơn.

**Nó trả lời câu hỏi:** *"Retriever có lôi về rác không?"*

- Precision = 1.0 với k = 5 ⇒ cả 5 đoạn đều liên quan.
- Precision = 0.2 ⇒ 4/5 đoạn là nhiễu: tốn token, tăng nguy cơ model bám vào đoạn sai, "lost in the middle".

**Cách cải thiện:** thêm rerank (cross-encoder), giảm k, dùng metadata filter (phòng ban, sản phẩm, ngày hiệu lực), chunking tốt hơn, hybrid search (BM25 + vector).

⚠️ Đừng nhầm: precision **không** nói bạn có lấy **đủ** hay không — đó là việc của Context Recall.`,
      points: [
        { id: 'p1', w: 3, text: 'Tỉ lệ chunk liên quan trên tổng số chunk được retrieve — đo độ sạch/nhiễu của ngữ cảnh' },
        { id: 'p2', w: 2, text: 'Đánh giá chất lượng của khâu retrieval (retriever có lôi về rác không)' },
        { id: 'p3', w: 2, text: 'Trong RAGAS có tính đến thứ hạng: chunk liên quan nằm càng trên càng được điểm cao' },
        { id: 'p4', w: 2, text: 'Cách cải thiện: rerank, giảm k, metadata filter, chunking/hybrid search tốt hơn' },
      ],
      why: 'Precision thấp là nguyên nhân âm thầm làm tăng chi phí token và làm câu trả lời loãng, dù Faithfulness vẫn có thể đẹp.',
      traps: ['Nhầm precision với recall (đủ hay không).', 'Quên yếu tố thứ hạng trong công thức của RAGAS.'],
      hook: 'Precision = "trong giỏ có bao nhiêu quả không hỏng".',
      related: [15, 27, 29],
    },
    {
      id: 15,
      q: 'Context Recall là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Context Recall** đo **độ đầy đủ của ngữ cảnh**: trong toàn bộ thông tin cần thiết để trả lời đúng (theo ground truth), bao nhiêu phần **thực sự có mặt** trong các chunk đã lấy về.

\`\`\`
Context Recall ≈ (số ý trong ground truth được ngữ cảnh chứng minh) / (tổng số ý trong ground truth)
\`\`\`

**Nó trả lời câu hỏi:** *"Retriever có bỏ sót thông tin nào không?"*

Đây là **metric duy nhất trong bộ lõi RAGAS bắt buộc phải có ground truth** — vì muốn biết còn thiếu gì thì phải biết đáp án đầy đủ trông như thế nào.

**Recall thấp nghĩa là gì:** câu trả lời sẽ **thiếu ý** (hoặc model buộc phải bịa phần thiếu). Đây là loại lỗi nguy hiểm nhất vì câu trả lời **nghe vẫn trôi chảy và tự tin**.

**Cách cải thiện:** tăng k, chunking lại (chunk quá nhỏ làm đứt ngữ cảnh; quá lớn làm loãng embedding), query rewriting / multi-query / HyDE, hybrid search, và trước hết là **kiểm tra tài liệu đó có nằm trong kho hay không** — recall = 0 rất hay là do thiếu tài liệu chứ không phải do thuật toán.`,
      points: [
        { id: 'p1', w: 3, text: 'Tỉ lệ thông tin cần thiết (theo ground truth) thực sự xuất hiện trong ngữ cảnh đã retrieve — đo độ đầy đủ' },
        { id: 'p2', w: 2, text: 'Trả lời câu hỏi "có bỏ sót không"; cần ground truth để tính' },
        { id: 'p3', w: 2, text: 'Recall thấp ⇒ câu trả lời thiếu ý hoặc model phải bịa phần thiếu' },
        { id: 'p4', w: 2, text: 'Cách cải thiện: tăng k, chunking lại, query rewriting/multi-query, hybrid search, bổ sung tài liệu còn thiếu' },
      ],
      why: 'Recall là chỗ vỡ âm thầm nhất của RAG: hệ thống vẫn trả lời trôi chảy, người dùng không biết là đang thiếu mất một nửa chính sách.',
      traps: ['Nhầm với Answer Relevancy.', 'Quên rằng recall cần ground truth.'],
      hook: 'Recall = "đã nhặt hết những quả cần nhặt chưa".',
      related: [14, 18, 28, 30],
    },
    {
      id: 16,
      q: 'Faithfulness là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Faithfulness** (độ trung thành) đo **mức độ câu trả lời bám sát ngữ cảnh đã cho**: mọi khẳng định trong câu trả lời có **được suy ra từ context** hay không.

**Cách RAGAS tính:** tách câu trả lời thành các **claim** (mệnh đề) riêng lẻ → với từng claim, kiểm tra context có chứng minh được không → điểm = số claim được chứng minh / tổng số claim. Kết quả trong khoảng 0–1.

**Đây chính là metric đo hallucination.** Faithfulness = 0.6 nghĩa là ~40% khẳng định trong câu trả lời **không có căn cứ trong tài liệu** — model tự bịa hoặc dùng kiến thức nội tại.

**Điểm mấu chốt cần phân biệt:** faithfulness đo **trung thành với context**, KHÔNG đo **đúng với sự thật**. Nếu context sai/cũ mà model chép đúng theo context ⇒ faithfulness = 1.0 nhưng câu trả lời vẫn sai đối với người dùng. Vì vậy phải đọc nó **kèm** Context Recall/Precision.

**Cách cải thiện:** hạ temperature, prompt "chỉ dùng thông tin trong context, không có thì nói không biết", bắt buộc trích dẫn (citation) từng ý, thêm bước tự kiểm tra, và cải thiện chất lượng retrieval.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo mức độ câu trả lời bám sát / được chứng minh bởi context được cung cấp — tức là đo hallucination' },
        { id: 'p2', w: 2, text: 'Cách tính: tách answer thành các claim, đếm tỉ lệ claim được context chứng minh (0..1)' },
        { id: 'p3', w: 3, text: 'Phân biệt rõ: trung thành với context ≠ đúng sự thật; context sai mà chép đúng vẫn được điểm cao' },
        { id: 'p4', w: 1, text: 'Cách cải thiện: giảm temperature, ép citation, prompt cấm suy diễn ngoài context' },
      ],
      why: 'Faithfulness là metric được nhìn nhiều nhất và bị hiểu sai nhiều nhất. Điểm 0.95 khiến người ta yên tâm sai chỗ, trong khi vấn đề thật nằm ở retrieval.',
      traps: ['Coi faithfulness cao = hệ thống đúng.', 'Nhầm faithfulness với answer relevancy (đúng trọng tâm câu hỏi).'],
      hook: 'Faithfulness = "có chép đúng bài của thầy không", không phải "bài của thầy có đúng không".',
      related: [18, 25],
    },
    {
      id: 17,
      q: 'Answer Relevancy là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Answer Relevancy** đo **câu trả lời có đúng trọng tâm câu hỏi hay không**: có trả lời thẳng vào điều được hỏi, hay lan man, thừa, lạc đề, trả lời nửa vời.

**Cách RAGAS tính (đảo ngược thú vị):** từ câu trả lời, dùng LLM **sinh ngược ra n câu hỏi** mà câu trả lời đó có thể đang trả lời → embed các câu hỏi sinh ra → tính **cosine similarity trung bình** với câu hỏi gốc. Càng giống ⇒ câu trả lời càng đúng trọng tâm.

Nhờ cách tính này, **không cần ground truth**.

**Lưu ý quan trọng:** relevancy đo **tính đúng trọng tâm**, không đo **tính đúng nội dung**. Một câu trả lời sai bét nhưng đúng chủ đề vẫn có thể đạt relevancy cao. Phải đọc cùng Faithfulness.

**Relevancy thấp thường do:** prompt chưa nêu rõ vai trò và định dạng, model lan man rào đón ("Là một AI, tôi…"), context nhiễu kéo model sang chủ đề khác, hoặc câu hỏi nhiều ý mà model chỉ trả lời một ý.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo mức độ câu trả lời đúng trọng tâm / trả lời thẳng vào câu hỏi, không lan man lạc đề' },
        { id: 'p2', w: 2, text: 'Cách tính của RAGAS: sinh ngược câu hỏi từ answer rồi so cosine với câu hỏi gốc; không cần ground truth' },
        { id: 'p3', w: 2, text: 'Đo tính đúng trọng tâm, không đo tính đúng sự thật — phải đọc cùng faithfulness' },
        { id: 'p4', w: 1, text: 'Nguyên nhân điểm thấp: prompt kém, model rào đón/lan man, context nhiễu, trả lời thiếu ý của câu hỏi nhiều phần' },
      ],
      why: 'Đây là metric duy nhất trong bộ lõi phản ánh trải nghiệm người dùng ở khía cạnh "có được trả lời đúng thứ mình hỏi không".',
      traps: ['Nhầm relevancy với faithfulness hoặc với context precision.'],
      hook: 'Relevancy = "trả lời có trúng câu hỏi không", Faithfulness = "trả lời có bịa không".',
      related: [16, 26],
    },
    {
      id: 18,
      q: 'Nếu Faithfulness = 0.95 nhưng Context Recall = 0.60 thì vấn đề nằm ở đâu?',
      type: 'judgment',
      diff: 3,
      answer: `**Vấn đề nằm ở khâu RETRIEVAL, không phải ở generation.**

Đọc hai con số:
- **Faithfulness 0.95** ⇒ model rất ngoan: nói gần như đúng những gì có trong context, không bịa. Khâu sinh câu trả lời **khỏe mạnh**.
- **Context Recall 0.60** ⇒ ngữ cảnh lấy về **chỉ chứa 60% thông tin cần thiết**. 40% còn lại chưa bao giờ đến tay model.

⇒ Hệ quả: model **trả lời trung thành trên một nửa sự thật**. Câu trả lời **thiếu ý nhưng nghe rất tự tin** — dạng lỗi nguy hiểm nhất, vì cả người dùng lẫn dashboard faithfulness đều không phát hiện ra.

**Nguyên nhân có thể (kiểm tra theo thứ tự):**
1. **Tài liệu chứa phần thiếu không có trong kho** (chưa index, sai pipeline ingest) — kiểm tra đầu tiên, rẻ nhất.
2. **k quá nhỏ** ⇒ cắt mất đoạn liên quan.
3. **Chunking hỏng**: chunk quá nhỏ làm đứt ý, hoặc quá lớn làm embedding loãng, hoặc cắt giữa bảng/điều khoản.
4. **Query mismatch**: người dùng hỏi bằng từ nghiệp vụ khác với từ trong tài liệu ⇒ cần query rewriting / hybrid search (BM25 + vector).
5. **Filter metadata quá chặt** loại nhầm tài liệu đúng.

**KHÔNG nên làm:** chỉnh prompt hay đổi model sinh — cả hai đều không sửa được thứ chưa bao giờ được lấy về.`,
      points: [
        { id: 'p1', w: 3, text: 'Kết luận đúng: vấn đề ở khâu retrieval, không phải khâu generation' },
        { id: 'p2', w: 3, text: 'Giải thích: model trung thành với context nhưng context chỉ chứa 60% thông tin cần ⇒ câu trả lời thiếu ý mà vẫn nghe tự tin' },
        { id: 'p3', w: 2, text: 'Nêu nguyên nhân cụ thể: thiếu tài liệu trong kho / k quá nhỏ / chunking kém / query mismatch / filter quá chặt' },
        { id: 'p4', w: 2, text: 'Hướng sửa nhắm vào retrieval (tăng k, rerank, chunking lại, hybrid search, bổ sung tài liệu), không phải sửa prompt/model sinh' },
      ],
      why: 'Đây là bài tập chẩn đoán kinh điển: biết đọc cặp metric để khoanh vùng lỗi vào đúng tầng, thay vì chỉnh mò từng thứ.',
      traps: [
        'Kết luận "model bị hallucination" — ngược hoàn toàn, faithfulness đang rất cao.',
        'Đề xuất sửa prompt/đổi model trong khi lỗi nằm ở dữ liệu đầu vào.',
      ],
      hook: 'Trung thành cao + đầy đủ thấp = trung thực kể một nửa sự thật.',
      related: [15, 16, 30],
    },
    {
      id: 19,
      q: 'Nếu fact trong RAG đúng nhưng đã cũ thì nguyên nhân có thể nằm ở layer nào?',
      type: 'judgment',
      diff: 3,
      answer: `Nằm ở **tầng dữ liệu / data & indexing layer** — cụ thể là **quản trị phiên bản và vòng đời tài liệu**, không phải ở model.

**Các điểm hỏng có thể:**
1. **Ingestion / Indexing**: tài liệu mới đã phát hành nhưng chưa được ingest, hoặc pipeline chạy nhưng lỗi im lặng. Kho vẫn đang giữ bản cũ.
2. **Thiếu metadata phiên bản**: chunk không có \`effective_date\`, \`version\`, \`status\` ⇒ retriever không có cách nào biết đâu là bản mới. Embedding của bản 2024 và 2026 gần như trùng nhau.
3. **Không dọn bản cũ (no invalidation)**: bản cũ vẫn nằm trong index cạnh bản mới ⇒ tùy điểm similarity mà bản nào thắng, hoàn toàn ngẫu nhiên.
4. **Retrieval không lọc/không ưu tiên theo thời gian**: không có filter \`effective_date <= today\`, không có rerank ưu tiên bản mới nhất.
5. **Cache cũ**: semantic cache hoặc cache câu trả lời còn giữ kết quả sinh từ tài liệu cũ, chưa bị invalidate khi tài liệu đổi.

**Cách sửa:** gắn metadata (\`version\`, \`effective_date\`, \`expiry_date\`, \`status: active/archived\`) → lọc/rerank theo đó → **soft-delete hoặc archive bản cũ** khi ingest bản mới → invalidate cache theo document version → monitor "tuổi tài liệu trung bình được trích dẫn".

Lưu ý: **Faithfulness vẫn có thể = 1.0** trong tình huống này, vì model chép đúng theo context. Metric không cứu được bạn ở đây — chỉ có data governance.`,
      points: [
        { id: 'p1', w: 3, text: 'Nằm ở tầng dữ liệu/indexing (data & retrieval layer), không phải lỗi của model sinh' },
        { id: 'p2', w: 3, text: 'Nguyên nhân cụ thể: thiếu metadata version/effective_date, chưa reindex tài liệu mới, không xóa/archive bản cũ' },
        { id: 'p3', w: 2, text: 'Retrieval không lọc hoặc không ưu tiên theo thời gian/phiên bản; hoặc cache còn giữ câu trả lời cũ' },
        { id: 'p4', w: 2, text: 'Cách sửa: metadata + filter/rerank theo thời gian, quy trình cập nhật/invalidation, invalidate cache, giám sát độ tuổi tài liệu' },
      ],
      why: 'Đây là dạng lỗi RAG thường gặp nhất trong doanh nghiệp và cũng khó phát hiện nhất — mọi metric vẫn xanh trong khi câu trả lời đã lỗi thời.',
      traps: ['Đổ lỗi cho model hoặc cho prompt.', 'Quên rằng bản cũ phải được archive, không chỉ thêm bản mới.'],
      hook: 'Đúng nhưng cũ = lỗi của thủ thư, không phải lỗi của người đọc.',
      related: [21, 22],
    },
    {
      id: 20,
      q: 'Một RAG pipeline cơ bản gồm những bước nào?',
      type: 'design',
      diff: 2,
      answer: `Chia làm hai pha: **Indexing (offline)** và **Retrieval + Generation (online)**.

**A. Indexing — chạy trước, theo lịch hoặc khi tài liệu đổi**
1. **Load / ingest**: thu thập tài liệu (PDF, HTML, Confluence, DB…).
2. **Parse & clean**: bóc text, giữ cấu trúc (tiêu đề, bảng), bỏ nhiễu.
3. **Chunking**: cắt thành đoạn (thường 200–800 token, có overlap 10–20%), cắt theo ranh giới ngữ nghĩa (mục, điều khoản).
4. **Gắn metadata**: nguồn, tiêu đề, \`version\`, \`effective_date\`, phòng ban, quyền truy cập.
5. **Embedding**: chuyển mỗi chunk thành vector.
6. **Lưu vào Vector DB** + tạo chỉ mục ANN (và index BM25 nếu làm hybrid).

**B. Online — mỗi khi có câu hỏi**
7. **Query processing**: chuẩn hóa, (tùy chọn) rewrite/expand query, xác định filter metadata.
8. **Embed query** bằng **cùng model embedding**.
9. **Retrieve top-k** (vector search, hoặc hybrid BM25 + vector), áp filter quyền/phiên bản.
10. **Rerank** (cross-encoder) và cắt còn 3–5 đoạn tốt nhất; áp ngưỡng điểm.
11. **Build prompt**: system prompt + context (kèm nguồn) + câu hỏi.
12. **Generate**: LLM sinh câu trả lời **kèm citation**.
13. **Post-process & guardrail**: kiểm tra Output Contract, kiểm tra citation, chặn PII, xử lý "không đủ thông tin".
14. **Log & evaluate**: lưu trace (query, chunk, answer, điểm số) để chạy RAGAS và monitoring.

\`\`\`
[Docs] → chunk → embed → [Vector DB]
                              ↑
Query → embed → search → rerank → prompt → LLM → Answer + Citations → Log/Eval
\`\`\``,
      points: [
        { id: 'p1', w: 3, text: 'Tách hai pha: indexing offline (load → chunk → embed → lưu vector DB) và truy vấn online' },
        { id: 'p2', w: 3, text: 'Pha online: embed query → retrieve top-k → (rerank) → ghép prompt với context → LLM sinh câu trả lời' },
        { id: 'p3', w: 2, text: 'Nêu chunking và metadata như bước riêng, có ý thức về kích thước chunk/overlap' },
        { id: 'p4', w: 2, text: 'Nêu bước sau sinh: citation/guardrail/validate và logging + evaluation' },
      ],
      why: 'Vẽ được pipeline là điều kiện để chẩn đoán: mọi lỗi RAG đều quy được về một mắt xích cụ thể trong chuỗi này.',
      traps: ['Chỉ kể "tìm tài liệu rồi hỏi LLM" — thiếu chunking, metadata, rerank, citation, logging.'],
      hook: 'Offline: Cắt – Nhúng – Cất. Online: Hỏi – Tìm – Lọc – Ghép – Sinh – Ghi.',
      related: [11, 13, 21],
    },
    {
      id: 21,
      q: 'Tại sao document trong RAG nên có metadata như `effective_date` và `version`?',
      type: 'concept',
      diff: 2,
      answer: `Vì **embedding không phân biệt được thời gian và phiên bản**. Bản SLA 2024 và bản 2026 khác nhau vài con số nhưng nội dung gần như trùng ⇒ vector gần như trùng ⇒ retriever chọn bản nào là chuyện **ngẫu nhiên**. Metadata là thứ duy nhất khôi phục lại trật tự đó.

**Metadata cho phép:**
1. **Lọc trước khi tìm (pre-filter)**: chỉ tìm trong \`status = active\` và \`effective_date <= hôm nay\` — loại hẳn bản hết hiệu lực khỏi không gian tìm kiếm.
2. **Ưu tiên khi rerank**: cùng điểm similarity thì bản mới hơn thắng.
3. **Trích dẫn có trách nhiệm**: câu trả lời ghi rõ "theo SLA v2026, hiệu lực 01/01/2026" ⇒ người dùng tự kiểm chứng được, và audit được.
4. **Vòng đời tài liệu**: biết cái gì cần archive/xóa khi có bản mới; tránh chuyện hai bản cùng sống trong index.
5. **Invalidate cache** đúng lúc khi tài liệu đổi version.
6. **Giám sát**: đo "tuổi trung bình của tài liệu được trích dẫn" — cảnh báo sớm khi hệ thống bắt đầu trả lời bằng tài liệu cũ.

Metadata nên có thêm: \`source\`, \`title\`, \`section\`, \`doc_type\`, \`department\`, \`access_level\` (để lọc quyền — rất quan trọng: **không lọc quyền ở tầng retrieval nghĩa là rò rỉ dữ liệu**), \`expiry_date\`, \`checksum\`.`,
      points: [
        { id: 'p1', w: 3, text: 'Embedding không phân biệt được phiên bản/thời gian: hai bản tài liệu gần như trùng vector nên retriever có thể lấy nhầm bản cũ' },
        { id: 'p2', w: 3, text: 'Metadata cho phép lọc (pre-filter) và ưu tiên/rerank theo hiệu lực, phiên bản' },
        { id: 'p3', w: 2, text: 'Phục vụ trích dẫn, audit và quản trị vòng đời tài liệu (archive bản cũ, invalidate cache)' },
        { id: 'p4', w: 2, text: 'Nêu thêm metadata quan trọng khác, đặc biệt access_level để lọc quyền truy cập tránh rò rỉ dữ liệu' },
      ],
      why: 'Metadata là ranh giới giữa một demo RAG và một hệ thống RAG có thể đưa vào doanh nghiệp có quy định tuân thủ.',
      traps: ['Chỉ nói "để biết tài liệu mới cũ" mà không nói cơ chế filter/rerank cụ thể.'],
      hook: 'Vector biết "nói về cái gì", metadata biết "của thời nào, của ai".',
      related: [19, 22],
    },
    {
      id: 22,
      q: 'Hệ thống có cả `sla-p1-2024.pdf` và `sla-p1-2026.pdf` nhưng không có `effective_date` hoặc `version`. Agent lấy nhầm SLA 2024 thay vì 2026. Root cause là gì?',
      type: 'judgment',
      diff: 3,
      answer: `**Root cause: thiếu metadata phiên bản/hiệu lực ⇒ tầng retrieval không có tín hiệu nào để phân biệt hai bản, nên xếp hạng chỉ dựa vào similarity ngữ nghĩa — và hai bản gần như giống hệt nhau về ngữ nghĩa.**

Diễn giải chuỗi nhân quả:
1. Hai tài liệu nói cùng một chủ đề, khác nhau vài con số ⇒ vector gần như trùng.
2. Không có \`effective_date\`/\`version\` ⇒ **không filter được, không rerank theo thời gian được**.
3. Bản 2024 có thể còn ăn điểm cao hơn do tình cờ trùng từ ngữ với câu hỏi, hoặc do nằm trước trong index.
4. ⇒ Agent trích dẫn cam kết SLA sai — **rủi ro nghiệp vụ và pháp lý thật**, không chỉ là lỗi kỹ thuật.

**Đây KHÔNG phải lỗi của LLM.** Faithfulness vẫn 1.0 vì model trả lời đúng theo tài liệu được đưa.

**Khắc phục (ngắn hạn → dài hạn):**
- **Ngay lập tức**: archive/xóa \`sla-p1-2024.pdf\` khỏi index đang phục vụ (hoặc đặt \`status = archived\`).
- **Ngắn hạn**: bổ sung metadata \`version\`, \`effective_date\`, \`expiry_date\`, \`status\` cho toàn bộ kho; thêm filter \`status = active AND effective_date <= now\`; rerank ưu tiên bản mới.
- **Dài hạn**: quy trình ingest bắt buộc gắn metadata (không có metadata thì không được index); tự động archive bản cũ khi có bản mới cùng \`doc_key\`; ép citation hiển thị phiên bản; thêm test hồi quy vào CI — câu hỏi "SLA P1 là gì" phải trích dẫn bản 2026; monitor tuổi tài liệu được trích dẫn.`,
      points: [
        { id: 'p1', w: 3, text: 'Root cause: thiếu metadata version/effective_date nên retrieval không phân biệt được hai bản, chỉ xếp hạng theo similarity' },
        { id: 'p2', w: 2, text: 'Hai tài liệu gần như giống nhau về ngữ nghĩa nên embedding không tách được; bản cũ vẫn nằm trong index' },
        { id: 'p3', w: 2, text: 'Nêu rõ đây không phải lỗi model/prompt (faithfulness vẫn cao) mà là lỗi data governance' },
        { id: 'p4', w: 3, text: 'Cách sửa: archive bản cũ + bổ sung metadata + filter/rerank theo hiệu lực + quy trình ingest bắt buộc + test hồi quy/monitor' },
      ],
      why: 'Đây là bài toán "root cause analysis" mẫu mực: một lỗi trông như lỗi AI thực chất là lỗi quy trình dữ liệu. Trả lời tốt phải tách được hai tầng đó.',
      traps: [
        'Trả lời "model chọn sai" hoặc "cần prompt tốt hơn".',
        'Chỉ nói "thêm metadata" mà quên xử lý bản cũ đang nằm trong index và quên test hồi quy.',
      ],
      hook: 'Hai bản giống hệt nhau trong mắt vector — chỉ metadata mới nhìn ra ngày tháng.',
      related: [19, 21],
    },
    {
      id: 23,
      q: '`Hit@1`, `Hit@5`, `Recall@5` có phải là 4 metric chính của RAGAS không?',
      type: 'concept',
      diff: 2,
      answer: `**Không.**

**4 metric lõi của RAGAS là:**
1. **Faithfulness** — câu trả lời có bám context không (đo hallucination).
2. **Answer Relevancy** — câu trả lời có đúng trọng tâm câu hỏi không.
3. **Context Precision** — ngữ cảnh lấy về có sạch không.
4. **Context Recall** — ngữ cảnh lấy về có đủ không.

Hai cái đầu đánh giá **generation**, hai cái sau đánh giá **retrieval**.

**Vậy Hit@k / Recall@k là gì?** Đó là **metric xếp hạng (IR – Information Retrieval) cổ điển**: \`Hit@k\` = tài liệu đúng có nằm trong top-k không (0/1), \`Recall@k\` = tỉ lệ tài liệu đúng nằm trong top-k, cùng họ với MRR, NDCG, MAP.

Chúng **hữu ích và nên đo** — nhưng ở **tầng retriever**, và chúng cần danh sách tài liệu đúng được gán nhãn sẵn. Chúng **không nằm trong bộ lõi RAGAS**, và quan trọng hơn: chúng **không nói gì về chất lượng câu trả lời cuối** — Hit@5 = 1.0 mà model vẫn có thể bịa.

**Thực hành tốt:** đo cả hai họ. IR metric để tuning retriever nhanh và rẻ; RAGAS để đánh giá chất lượng end-to-end.`,
      points: [
        { id: 'p1', w: 3, text: 'Trả lời dứt khoát: KHÔNG phải' },
        { id: 'p2', w: 3, text: 'Liệt kê đúng 4 metric lõi RAGAS: Faithfulness, Answer Relevancy, Context Precision, Context Recall' },
        { id: 'p3', w: 2, text: 'Giải thích Hit@k/Recall@k là metric IR/ranking cổ điển đánh giá riêng khâu retrieval' },
        { id: 'p4', w: 1, text: 'Nêu rằng vẫn nên đo chúng để tuning retriever, nhưng chúng không phản ánh chất lượng câu trả lời cuối' },
      ],
      why: 'Câu bẫy kiểm tra bạn có thuộc bộ lõi RAGAS và có phân biệt được tầng retriever với tầng end-to-end hay không.',
      traps: ['Trả lời "có" vì thấy tên nghe giống metric của RAG.'],
      hook: 'RAGAS = 2 cho câu trả lời (Faithfulness, Relevancy) + 2 cho ngữ cảnh (Precision, Recall).',
      related: [24, 25],
    },
    {
      id: 24,
      q: 'Latency có phải là RAGAS metric không?',
      type: 'concept',
      diff: 1,
      answer: `**Không.** RAGAS chỉ đo **chất lượng nội dung** (quality) của pipeline RAG: Faithfulness, Answer Relevancy, Context Precision, Context Recall.

**Latency là metric vận hành (operational / performance)**, thuộc nhóm khác cùng với TTFT, P95/P99, throughput, error rate, cost/request.

**Vì sao phải tách bạch:**
- Chúng **đo hai thứ khác nhau**: một bên là "trả lời có đúng không", một bên là "trả lời có nhanh không".
- Chúng **đánh đổi nhau**: thêm rerank, tăng k, thêm bước self-check ⇒ chất lượng lên, latency lên theo. Trộn chung vào một chỉ số thì không thấy được sự đánh đổi này.
- Chúng được **thu thập ở nơi khác nhau**: RAGAS chạy theo mẻ trên golden dataset (offline, trong CI); latency đo trên traffic thật (online, trong APM/observability).

**Bảng theo dõi production nên có cả hai nhóm cạnh nhau:**

| Nhóm | Metric |
|---|---|
| Chất lượng (RAGAS + eval) | Faithfulness, Answer Relevancy, Context Precision, Context Recall, Quality Score |
| Vận hành | TTFT, P95/P99 latency, throughput, error rate |
| Chi phí | Cost/request, token/request, cache hit rate |
| Kinh doanh | Deflection rate, CSAT, escalation rate |`,
      points: [
        { id: 'p1', w: 3, text: 'Trả lời dứt khoát: KHÔNG — latency không phải metric của RAGAS' },
        { id: 'p2', w: 2, text: 'RAGAS chỉ đo chất lượng nội dung; latency thuộc nhóm metric vận hành/performance' },
        { id: 'p3', w: 2, text: 'Vẫn phải theo dõi latency, chỉ là ở dashboard/nhóm khác (cùng TTFT, P95/P99, throughput, error rate)' },
        { id: 'p4', w: 2, text: 'Nêu lý do tách bạch: đo hai khía cạnh khác nhau, có đánh đổi với nhau, thu thập ở nơi khác nhau (offline eval vs online monitoring)' },
      ],
      why: 'Phân nhóm metric đúng là nền của một dashboard đọc được. Trộn chất lượng với hiệu năng là cách nhanh nhất để không ai hiểu hệ thống đang tốt hay xấu.',
      traps: ['Trả lời "có, vì latency cũng quan trọng" — quan trọng nhưng không cùng nhóm.'],
      hook: 'RAGAS trả lời "ĐÚNG không". Latency trả lời "NHANH không".',
      related: [23, 58, 119],
    },
  ],
};
