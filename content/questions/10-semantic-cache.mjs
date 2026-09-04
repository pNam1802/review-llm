export default {
  id: 'semantic-cache',
  name: 'Semantic Caching',
  short: 'Cache',
  emoji: '⚡',
  blurb: 'Cache theo ý nghĩa thay vì theo chuỗi ký tự — và cái giá của nó.',
  questions: [
    {
      id: 67,
      q: 'Semantic Cache là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Semantic Cache** là bộ nhớ đệm **đối chiếu theo ý nghĩa** thay vì theo chuỗi ký tự: câu hỏi mới được coi là "trúng cache" nếu nó **gần về ngữ nghĩa** với một câu hỏi đã trả lời trước đó.

**Cách hoạt động:**
\`\`\`
Câu hỏi mới → embed → tìm vector gần nhất trong cache
        │
        ├─ similarity ≥ ngưỡng (vd 0.92) → HIT: trả câu trả lời đã lưu (≈50ms, 0đ)
        └─ dưới ngưỡng                    → MISS: gọi LLM → lưu (embedding, câu hỏi,
                                                    câu trả lời, TTL) vào cache
\`\`\`

**Ví dụ trúng cache:** "Làm sao để đổi mật khẩu?", "Tôi quên mật khẩu thì làm thế nào?", "How to reset my password?" → cùng một ý định → một câu trả lời.

**Thành phần cần có:** model embedding, vector store cho cache, **ngưỡng similarity** (núm quan trọng nhất), **TTL** và cơ chế **invalidation** khi tài liệu/chính sách đổi, và **khóa phân vùng cache** (theo ngôn ngữ, theo tenant, theo quyền truy cập, theo phiên bản prompt/KB).

**Rủi ro cốt lõi phải nói ra:** ngưỡng đặt quá thấp ⇒ **trả nhầm câu trả lời cho câu hỏi khác** ("hủy đơn hàng" vs "hủy tài khoản" rất gần nhau về vector). Đây là loại lỗi tệ hơn cả việc không có cache, vì nó sai một cách tự tin. Vì vậy: đặt ngưỡng cao, không cache câu hỏi có yếu tố cá nhân hóa (số đơn, số dư, tên khách), và đo tỉ lệ "false hit".`,
      points: [
        { id: 'p1', w: 3, text: 'Cache dựa trên ý nghĩa (embedding + similarity) thay vì so khớp chuỗi chính xác' },
        { id: 'p2', w: 3, text: 'Cơ chế: embed câu hỏi → tìm vector gần nhất → nếu vượt ngưỡng similarity thì trả câu trả lời đã lưu, ngược lại gọi LLM rồi lưu lại' },
        { id: 'p3', w: 2, text: 'Nêu ngưỡng similarity là tham số then chốt, kèm TTL/invalidation' },
        { id: 'p4', w: 2, text: 'Nêu rủi ro: ngưỡng thấp gây trả nhầm câu trả lời cho câu hỏi gần giống; không cache nội dung cá nhân hóa; cần phân vùng cache theo tenant/quyền' },
      ],
      why: 'Semantic cache là đòn bẩy giảm chi phí lớn nhất trong hệ thống LLM có traffic lặp lại — nhưng cũng là nơi dễ tạo ra lỗi "trả lời tự tin nhưng nhầm người" nhất.',
      traps: ['Mô tả như cache thường mà quên phần embedding/ngưỡng.', 'Quên rủi ro false hit và vấn đề invalidation.'],
      hook: 'Cache thường hỏi "chuỗi có giống hệt không". Semantic cache hỏi "ý có giống không".',
      related: [68, 69, 70, 71],
    },
    {
      id: 68,
      q: '`"Hủy đơn hàng"` và `"Cancel my order"` có thể sử dụng cùng một semantic cache không? Vì sao?',
      type: 'judgment',
      diff: 2,
      answer: `**Có — về nguyên tắc thì được, vì hai câu có cùng ý định (intent).** Nhưng chỉ đúng khi thỏa mấy điều kiện.

**Vì sao được:**
- Semantic cache đối chiếu bằng **embedding**, không phải bằng chuỗi. Với **model embedding đa ngôn ngữ**, hai câu này được ánh xạ về gần như cùng một vùng không gian ⇒ similarity cao ⇒ hit.
- Cùng ý định ⇒ cùng nội dung nghiệp vụ cần trả lời (quy trình hủy đơn, điều kiện, thời hạn).

**Điều kiện bắt buộc:**
1. **Embedding model phải đa ngôn ngữ.** Model chỉ huấn luyện tiếng Anh sẽ không kéo được hai câu này lại gần nhau ⇒ không hit.
2. **Câu trả lời phải trả về đúng ngôn ngữ của người hỏi.** Đây là điểm quan trọng nhất trong thực tế: nếu cache lưu câu trả lời tiếng Việt mà người hỏi bằng tiếng Anh thì hit nhưng trải nghiệm hỏng. Giải pháp: **thêm ngôn ngữ vào khóa cache** (\`vi:hủy_đơn\` / \`en:cancel_order\`), hoặc lưu cache ở mức "nội dung trung tính" rồi sinh/ dịch phần trình bày theo ngôn ngữ.
3. **Câu hỏi phải là dạng chung, không cá nhân hóa.** "Hủy đơn hàng thế nào?" thì cache được; "Hủy đơn DH123 của tôi" thì **không** — câu trả lời phụ thuộc trạng thái đơn cụ thể.
4. **Cùng ngữ cảnh phân quyền/tenant** và cùng phiên bản chính sách (TTL/invalidation khi chính sách đổi).

**Kết luận thực dụng:** dùng chung *lớp tri thức*, tách theo *ngôn ngữ trình bày*. Và đừng quên cặp nguy hiểm ngược lại: "hủy đơn hàng" vs "hủy tài khoản" cũng có similarity cao mà **ý định hoàn toàn khác** — lý do phải đặt ngưỡng cao và đo false hit.`,
      points: [
        { id: 'p1', w: 3, text: 'Có — vì hai câu cùng ý định và semantic cache so khớp theo embedding chứ không theo chuỗi ký tự' },
        { id: 'p2', w: 3, text: 'Điều kiện: phải dùng embedding model đa ngôn ngữ thì hai câu mới gần nhau trong không gian vector' },
        { id: 'p3', w: 2, text: 'Phải xử lý ngôn ngữ đầu ra: trả lời đúng ngôn ngữ người hỏi ⇒ thêm ngôn ngữ vào cache key hoặc tách phần trình bày' },
        { id: 'p4', w: 2, text: 'Chỉ áp dụng với câu hỏi chung, không cá nhân hóa (không kèm mã đơn/thông tin riêng) và cùng ngữ cảnh quyền/phiên bản chính sách' },
      ],
      why: 'Câu này kiểm tra bạn có nhìn ra bẫy ngôn ngữ đầu ra và bẫy cá nhân hóa hay không — hai lỗi phổ biến khi bật semantic cache cho sản phẩm đa ngôn ngữ.',
      traps: [
        'Trả lời "có" mà quên điều kiện model đa ngôn ngữ và ngôn ngữ trả lời.',
        'Trả lời "không vì khác ngôn ngữ" — sai bản chất của semantic cache.',
      ],
      hook: 'Cùng ý ⇒ cache chung tri thức. Khác tiếng ⇒ tách khóa trình bày.',
      related: [67, 70],
    },
    {
      id: 69,
      q: 'Semantic Cache khác cache thông thường ở điểm nào?',
      type: 'compare',
      diff: 2,
      answer: `| | **Cache thông thường** | **Semantic Cache** |
|---|---|---|
| Khóa | Chuỗi/hash chính xác (\`md5(query)\`) | **Vector embedding** của câu hỏi |
| So khớp | Bằng nhau tuyệt đối (exact match) | **Tương đồng ≥ ngưỡng** (approximate) |
| Hit khi | Chuỗi giống từng ký tự | **Ý nghĩa giống**, chữ có thể khác hoàn toàn |
| Ví dụ | "abc" ≠ "abc " (thừa dấu cách ⇒ miss) | "đổi mật khẩu" ≈ "quên pass" ⇒ hit |
| Chi phí tra cứu | O(1), micro-giây | Embed + tìm vector, mili-giây, **tốn tiền embedding** |
| Hit rate với câu hỏi tự nhiên | Rất thấp (người ta hiếm khi gõ giống hệt nhau) | Cao hơn nhiều |
| Rủi ro | Gần như không (trúng thì chắc chắn đúng khóa) | **False hit**: trả nhầm câu trả lời của câu hỏi khác |
| Tham số phải tinh chỉnh | TTL | TTL + **ngưỡng similarity** + phân vùng khóa |
| Hạ tầng | Redis/Memcached | Vector store + model embedding |

**Ý cốt lõi:** cache thường là **tra cứu tất định** — trúng hay trượt là chuyện đúng/sai rạch ròi. Semantic cache là **truy hồi xác suất** — nó có thể sai, và độ sai do bạn chọn qua ngưỡng.

⇒ Vì thế semantic cache cần thêm: đo **false hit rate** (lấy mẫu và kiểm tra thủ công hoặc bằng LLM judge), ngưỡng thận trọng, không cache nội dung cá nhân hóa/nhạy cảm, và cơ chế invalidate theo phiên bản tài liệu. Trong thực tế người ta thường dùng **cả hai tầng**: exact-match cache ở trên (rẻ, an toàn), semantic cache ở dưới.`,
      points: [
        { id: 'p1', w: 3, text: 'Cache thường khớp chính xác chuỗi/khóa; semantic cache khớp theo độ tương đồng ngữ nghĩa của embedding' },
        { id: 'p2', w: 2, text: 'Semantic cache có hit rate cao hơn nhiều với câu hỏi ngôn ngữ tự nhiên (người dùng diễn đạt khác nhau)' },
        { id: 'p3', w: 3, text: 'Semantic cache là truy hồi xác suất ⇒ có rủi ro false hit (trả nhầm câu trả lời), cache thường thì không' },
        { id: 'p4', w: 2, text: 'Khác biệt hạ tầng/chi phí: cần embedding + vector store, tra cứu tốn hơn, phải chỉnh ngưỡng similarity ngoài TTL' },
      ],
      why: 'Sự khác biệt "tất định vs xác suất" là bài học chung của mọi thành phần AI trong hệ thống — cache chỉ là ví dụ dễ thấy nhất.',
      traps: ['Chỉ nói "một cái theo nghĩa, một cái theo chữ" mà quên phần rủi ro và chi phí.'],
      hook: 'Cache thường: đúng khóa mới mở. Semantic cache: khóa giống giống cũng mở — nên phải cẩn thận.',
      related: [67, 71],
    },
    {
      id: 70,
      q: 'Semantic Cache thường sử dụng công nghệ gì để xác định hai câu hỏi có ý nghĩa giống nhau?',
      type: 'concept',
      diff: 1,
      answer: `**Embedding + đo tương đồng vector (thường là cosine similarity), lưu và tra trong vector database.**

Chuỗi công nghệ đầy đủ:
1. **Embedding model** (đa ngôn ngữ nếu sản phẩm đa ngôn ngữ) — biến câu hỏi thành vector.
2. **Vector store / ANN index** — Redis Vector, FAISS, Qdrant, pgvector, Milvus… tìm láng giềng gần nhất nhanh (HNSW/IVF).
3. **Độ đo tương đồng** — **cosine similarity** là mặc định (bỏ qua độ dài, chỉ xét hướng); tương đương dot product khi vector đã chuẩn hóa L2.
4. **Ngưỡng quyết định** — ví dụ ≥ 0.92 thì coi là hit. Ngưỡng này phải **hiệu chỉnh trên dữ liệu thật**, không lấy theo cảm tính, và nên đo bằng cặp chỉ số: tỉ lệ hit và tỉ lệ false hit.
5. (Tùy chọn) **Bước xác nhận thứ hai** cho các trường hợp gần ngưỡng: dùng cross-encoder hoặc một lời gọi LLM rẻ để hỏi "hai câu này có cùng ý định không?" — đắt hơn chút nhưng cắt được phần lớn false hit.
6. **Chuẩn hóa trước khi embed**: bỏ khoảng trắng thừa, hạ chữ thường, bóc bỏ thông tin cá nhân (mã đơn, số điện thoại) — vừa tăng hit rate vừa tránh cache dữ liệu nhạy cảm.`,
      points: [
        { id: 'p1', w: 3, text: 'Dùng embedding để biến câu hỏi thành vector' },
        { id: 'p2', w: 3, text: 'So sánh bằng độ đo tương đồng vector, phổ biến nhất là cosine similarity' },
        { id: 'p3', w: 2, text: 'Lưu và tra cứu trong vector database/ANN index (FAISS, Redis Vector, Qdrant, pgvector…)' },
        { id: 'p4', w: 2, text: 'Cần ngưỡng similarity được hiệu chỉnh trên dữ liệu thật; có thể thêm bước xác nhận (cross-encoder/LLM) hoặc chuẩn hóa câu hỏi trước khi embed' },
      ],
      why: 'Chuỗi công nghệ này giống hệt phần retrieval của RAG — nhận ra sự trùng lặp đó giúp bạn tái sử dụng hạ tầng thay vì dựng hai hệ thống.',
      traps: ['Trả lời "dùng AI để so sánh" — quá mơ hồ.'],
      hook: 'Cùng bộ đồ nghề với RAG: embed – vector DB – cosine – ngưỡng.',
      related: [11, 12, 67],
    },
    {
      id: 71,
      q: 'Semantic Cache giúp giảm những loại cost/performance nào?',
      type: 'concept',
      diff: 2,
      answer: `**Giảm chi phí:**
1. **Token cost** — khoản lớn nhất: cache hit là **không gọi LLM**, không tốn token input lẫn output. Với hệ thống hỗ trợ khách hàng có 30–50% câu hỏi lặp lại, đây là mức tiết kiệm hai con số phần trăm ngay lập tức.
2. **Chi phí retrieval** — hit thì bỏ qua luôn vector search + rerank của RAG.
3. **Chi phí hạ tầng/compute** cho các bước xử lý phía sau; giảm áp lực lên hạn mức (rate limit) của nhà cung cấp model.
4. **Chi phí agent nhiều bước** — hit cắt bỏ cả chuỗi tool call, vốn là phần đắt nhất.

**Cải thiện hiệu năng:**
5. **Latency** — từ vài giây xuống vài chục mili-giây; **TTFT** gần như tức thì.
6. **Throughput / khả năng chịu tải** — cùng hạ tầng phục vụ được nhiều người hơn, chống chịu tốt hơn khi có đợt tăng đột biến (ví dụ sự cố khiến hàng nghìn người cùng hỏi một câu).
7. **Ổn định P95/P99** — cắt bớt phần đuôi dài, vì các câu hỏi phổ biến không còn phải đi qua đường chậm.
8. **Tính nhất quán** — cùng một câu hỏi cho cùng một câu trả lời (bớt dao động do tính không tất định của LLM). Đây vừa là lợi ích (đồng nhất thương hiệu) vừa là ràng buộc (phải invalidate khi nội dung đổi).

**Không phải miễn phí:** vẫn tốn chi phí embedding cho mỗi câu hỏi + lưu trữ vector + độ trễ tra cứu, cộng chi phí vận hành ngưỡng/TTL. Cần theo dõi **cache hit rate**, **false hit rate** và **tiết kiệm thực tế (đ/tháng)** để biết cache có đáng hay không.`,
      points: [
        { id: 'p1', w: 3, text: 'Giảm chi phí token/LLM call — cache hit thì không cần gọi model' },
        { id: 'p2', w: 3, text: 'Giảm latency mạnh (mili-giây thay vì giây), cải thiện TTFT' },
        { id: 'p3', w: 2, text: 'Giảm cả chi phí retrieval/embedding của RAG và các bước tool của agent; giảm áp lực rate limit' },
        { id: 'p4', w: 2, text: 'Tăng throughput/khả năng chịu tải, ổn định P95/P99 và tăng tính nhất quán câu trả lời; nêu chi phí đi kèm (embedding, lưu trữ, quản lý ngưỡng/TTL)' },
      ],
      why: 'Đây là lập luận bạn sẽ dùng để xin ngân sách hoặc để giải thích vì sao hóa đơn tháng này giảm. Nêu được cả phần chi phí đi kèm mới là câu trả lời cân bằng.',
      traps: ['Chỉ nói "giảm chi phí và nhanh hơn" mà không tách được các loại chi phí, và quên chi phí của chính cache.'],
      hook: 'Hit = 0 token, 0 giây chờ. Nhưng vẫn tốn tiền embedding.',
      related: [61, 67, 69],
    },
  ],
};
