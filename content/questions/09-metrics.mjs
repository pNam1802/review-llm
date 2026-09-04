export default {
  id: 'metrics',
  name: 'AI Metrics / Monitoring',
  short: 'Metrics',
  emoji: '📊',
  blurb: 'TTFT, P99, quality score, cost/request, drift — và cái gì KHÔNG phải AI metric.',
  questions: [
    {
      id: 58,
      q: 'TTFT là gì?',
      type: 'concept',
      diff: 1,
      answer: `**TTFT = Time To First Token** — khoảng thời gian từ lúc gửi request đến lúc **nhận được token đầu tiên** trong luồng trả về.

Nó tách tổng độ trễ thành hai phần rất khác nhau về bản chất:
\`\`\`
Tổng latency = TTFT  +  (số token sinh ra × thời gian mỗi token)
                 ▲                    ▲
        prefill: đọc prompt,   decode: sinh từng token
        xếp hàng, retrieval,   (TPOT / tokens-per-second)
        network
\`\`\`

**TTFT phản ánh:** thời gian chờ hàng đợi, thời gian nạp và xử lý prompt (prefill — tỉ lệ với **độ dài input**), thời gian các bước trước khi sinh (retrieval trong RAG, các bước tool trong agent), network.

**Giá trị tham khảo:** chatbot tốt < 1s; > 3s là người dùng bắt đầu bỏ đi. Chỉ đo được khi có **streaming** — không stream thì TTFT ≈ tổng latency.

**Vì sao TTFT thường quan trọng hơn tổng latency:** người dùng cảm nhận sự phản hồi ở khoảnh khắc đầu tiên. Câu trả lời dài 12 giây nhưng bắt đầu chảy chữ sau 0.4 giây được cảm nhận là "nhanh"; câu trả lời 5 giây nhưng im lặng suốt được cảm nhận là "treo".`,
      points: [
        { id: 'p1', w: 3, text: 'Time To First Token: thời gian từ khi gửi request đến khi nhận token đầu tiên' },
        { id: 'p2', w: 2, text: 'Chỉ đo được/có ý nghĩa khi dùng streaming; là một phần của tổng latency' },
        { id: 'p3', w: 2, text: 'Chịu ảnh hưởng bởi độ dài prompt (prefill), hàng đợi, các bước trước khi sinh (retrieval/tool), network' },
        { id: 'p4', w: 1, text: 'Nêu ngưỡng thực tế (dưới ~1s là tốt) hoặc lý do nó quan trọng với trải nghiệm hơn tổng latency' },
      ],
      why: 'TTFT là metric UX quan trọng nhất của hệ thống LLM và cũng là metric đầu tiên xấu đi khi prompt phình to hoặc retrieval chậm.',
      traps: ['Nhầm TTFT với tổng thời gian phản hồi.'],
      hook: 'TTFT = im lặng bao lâu trước khi chữ đầu tiên hiện ra.',
      related: [59, 63],
    },
    {
      id: 59,
      q: 'TTFT dùng để đo điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đo **độ phản hồi cảm nhận được** của hệ thống — khoảng im lặng mà người dùng phải chịu trước khi thấy dấu hiệu đầu tiên rằng hệ thống đang làm việc.

**Về mặt kỹ thuật, TTFT là chỉ số chẩn đoán cho mọi thứ xảy ra TRƯỚC bước sinh chữ:**
- **Độ dài prompt / prefill**: prompt phình (context nhồi quá nhiều chunk, lịch sử hội thoại dài) ⇒ TTFT tăng ngay.
- **Retrieval chậm** trong RAG (vector search + rerank).
- **Các bước tool đầu tiên** trong agent.
- **Hàng đợi và tải hệ thống**: TTFT tăng đột biến trong giờ cao điểm = thiếu capacity.
- **Cold start** của model/instance.
- **Network / vùng triển khai** cách xa người dùng.

**Cách dùng trong vận hành:**
- Đặt **SLO theo TTFT**, ví dụ "P95 TTFT < 1.2s".
- Khi TTFT tăng mà **tổng latency giữ nguyên**, thủ phạm nằm ở khâu chuẩn bị (prompt/retrieval/queue), không phải khâu sinh.
- Khi TTFT ổn mà tổng latency tăng ⇒ câu trả lời đang dài ra (đổi prompt? model nói nhiều hơn?).

Cặp đi kèm cần theo dõi: **TPOT / tokens-per-second** (tốc độ sinh) và **tổng latency**. Ba con số này tách được nguyên nhân chậm nằm ở đâu.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo độ phản hồi cảm nhận được — người dùng phải chờ im lặng bao lâu trước khi thấy chữ đầu tiên' },
        { id: 'p2', w: 3, text: 'Là chỉ số chẩn đoán cho các bước TRƯỚC khi sinh: độ dài prompt/prefill, retrieval, hàng đợi/tải, cold start, network' },
        { id: 'p3', w: 2, text: 'Dùng để đặt SLO và để tách nguyên nhân chậm (TTFT tăng vs tổng latency tăng nói lên hai vấn đề khác nhau)' },
        { id: 'p4', w: 1, text: 'Nêu metric đi kèm: tokens/second (TPOT) và tổng latency' },
      ],
      why: 'Biết TTFT đo cái gì giúp bạn debug đúng chỗ: prompt dài hay retrieval chậm — hai nguyên nhân hoàn toàn khác nhau nhưng cùng làm người dùng thấy "chậm".',
      traps: ['Trả lời chung chung "đo tốc độ hệ thống" mà không nêu nó soi vào giai đoạn nào.'],
      hook: 'TTFT soi phần chuẩn bị; tokens/s soi phần nói.',
      related: [58, 63, 64],
    },
    {
      id: 60,
      q: 'Quality Score dùng để đo điều gì?',
      type: 'concept',
      diff: 2,
      answer: `**Quality Score** đo **chất lượng nội dung câu trả lời** — mức độ câu trả lời đúng, đủ, trúng trọng tâm và hữu ích, thay vì đo hệ thống chạy nhanh hay chạy được.

Đây là một **chỉ số tổng hợp** do bạn định nghĩa, thường ghép từ nhiều thành phần:
- **Từ eval tự động**: Faithfulness, Answer Relevancy, Context Precision/Recall (RAGAS), tỉ lệ khớp với ground truth trên golden dataset.
- **Từ LLM-as-a-Judge**: chấm theo rubric (đúng/đủ/rõ/đúng giọng thương hiệu/có trích dẫn).
- **Từ tín hiệu người dùng**: thumbs up/down, CSAT, tỉ lệ hỏi lại, tỉ lệ escalate sang người.
- **Từ kiểm tra luật cứng**: có trích dẫn không, có vi phạm điều cấm không, có đúng schema không.

**Đặc điểm quan trọng:**
- Nó là metric **AI-specific**: HTTP 200 và latency 300ms không nói gì về việc câu trả lời có đúng hay không. Một hệ thống có thể "khỏe" hoàn hảo về hạ tầng trong khi đang trả lời sai mọi câu.
- Cần đo **trước khi deploy** (trên golden dataset, trong CI/CD, làm cổng chặn) **và sau khi deploy** (trên mẫu traffic thật, để phát hiện drift).
- Phải **được định nghĩa cụ thể và cố định** thì mới so sánh được giữa các phiên bản; đổi cách tính giữa chừng là mất chuỗi so sánh.

**Cách dùng:** đặt ngưỡng (ví dụ ≥ 0.85), theo dõi theo thời gian, cắt lát theo loại câu hỏi để biết nhóm nào đang yếu.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo chất lượng nội dung câu trả lời (đúng, đủ, trúng trọng tâm, hữu ích) — không phải hiệu năng hệ thống' },
        { id: 'p2', w: 2, text: 'Là chỉ số tổng hợp từ eval tự động (RAGAS/golden dataset), LLM-as-judge, và/hoặc phản hồi người dùng' },
        { id: 'p3', w: 2, text: 'Là metric AI-specific: 200 OK và latency thấp không nói gì về việc câu trả lời có đúng không' },
        { id: 'p4', w: 2, text: 'Dùng làm cổng chặn trong CI/CD trước deploy và theo dõi sau deploy để phát hiện suy giảm/drift; cần định nghĩa cố định để so sánh được' },
      ],
      why: 'Đây là metric trả lời câu hỏi mà sếp và người dùng thực sự quan tâm: "hệ thống có trả lời đúng không". Không có nó thì mọi dashboard chỉ đang đo hạ tầng.',
      traps: ['Định nghĩa mơ hồ "đo chất lượng" mà không nói lấy số ở đâu.'],
      hook: 'Hạ tầng xanh không có nghĩa câu trả lời đúng.',
      related: [66, 85, 111],
    },
    {
      id: 61,
      q: 'Cost/request dùng để đo điều gì?',
      type: 'concept',
      diff: 1,
      answer: `Đo **chi phí trung bình để phục vụ một request** — thường tính bằng tiền, ghép từ:
\`\`\`
cost/request = (input_tokens × giá input) + (output_tokens × giá output)
             + chi phí embedding + vector DB + rerank
             + hạ tầng (compute, storage, egress)
\`\`\`

**Nó dùng để:**
1. **Kiểm soát đơn vị kinh tế (unit economics).** Nếu mỗi cuộc hội thoại tốn 4.000đ mà giá trị tiết kiệm được chỉ 3.000đ thì dự án lỗ — dù chất lượng rất tốt.
2. **Dự báo và lập ngân sách**: cost/request × lượng request dự kiến = hóa đơn tháng.
3. **Tính ROI** và trình bày với ban lãnh đạo.
4. **Phát hiện hồi quy chi phí**: prompt dài thêm, k tăng, agent chạy nhiều bước hơn, cache hỏng ⇒ cost/request tăng âm thầm dù chức năng không đổi.
5. **So sánh phương án**: model A vs B, có cache vs không cache, single-agent vs multi-agent.

**Nên theo dõi kèm:** token/request (in và out riêng), số bước agent trung bình, **cache hit rate**, và **cost theo phân vị** — vì phân phối rất lệch: trung bình 500đ nhưng P99 có thể 15.000đ do các phiên agent dài. Cắt lát theo **tenant/khách hàng/loại câu hỏi** để biết chỗ nào đang đốt tiền.

**Đòn bẩy giảm chi phí:** semantic cache, prompt caching, rút gọn context/top-k, chọn model nhỏ cho tác vụ đơn giản, giới hạn max_steps, batch cho tác vụ offline.`,
      points: [
        { id: 'p1', w: 3, text: 'Đo chi phí trung bình cho mỗi request (token in/out × đơn giá, cộng embedding/vector DB/hạ tầng)' },
        { id: 'p2', w: 3, text: 'Dùng để kiểm soát unit economics, dự báo ngân sách và tính ROI' },
        { id: 'p3', w: 2, text: 'Phát hiện hồi quy chi phí khi prompt/k/số bước agent tăng, hoặc cache hỏng' },
        { id: 'p4', w: 2, text: 'Nên xem theo phân vị và cắt lát theo tenant/loại câu hỏi; nêu đòn bẩy giảm chi phí (cache, giảm context, chọn model rẻ hơn)' },
      ],
      why: 'AI là hệ thống hiếm hoi mà chi phí biến đổi theo từng request. Không đo cost/request thì không thể biết sản phẩm có lãi hay không.',
      traps: ['Chỉ tính tiền token mà quên embedding, vector DB, rerank và hạ tầng.'],
      hook: 'Mỗi câu trả lời đều có giá. Biết giá mới biết lãi.',
      related: [53, 71, 103],
    },
    {
      id: 62,
      q: 'Drift trong AI system là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Drift** là hiện tượng **chất lượng hệ thống suy giảm theo thời gian dù code không đổi**, vì **thế giới xung quanh đã đổi** so với lúc xây/đánh giá model.

**Các loại drift:**
1. **Data drift (covariate shift)** — phân phối *đầu vào* đổi: người dùng bắt đầu hỏi kiểu khác, dùng tiếng lóng mới, sản phẩm mới ra, mùa vụ (Tết, Black Friday).
2. **Concept drift** — quan hệ *input → output đúng* đổi: chính sách hoàn tiền thay đổi ⇒ câu trả lời đúng của hôm qua thành sai hôm nay.
3. **Knowledge/content drift (rất đặc thù RAG)** — tài liệu trong kho cũ đi, có bản mới mà chưa index ⇒ trả lời đúng theo tài liệu nhưng sai với thực tế.
4. **Model drift** — nhà cung cấp cập nhật/đổi phiên bản model, hoặc bạn nâng cấp ⇒ hành vi đổi dù prompt giữ nguyên.
5. **Feedback loop drift** — chính đầu ra của hệ thống làm đổi hành vi người dùng, rồi dữ liệu mới lại phản ánh điều đó.

**Dấu hiệu phát hiện:** quality score giảm dần, tỉ lệ escalate/hỏi lại tăng, thumbs-down tăng, tỉ lệ "không tìm thấy tài liệu" tăng, phân phối intent lệch so với baseline, độ tuổi tài liệu được trích dẫn tăng.

**Cách xử lý:** monitor liên tục trên mẫu traffic thật; chạy lại eval trên golden dataset định kỳ; **cập nhật golden dataset** theo dữ liệu mới (bản thân golden dataset cũng bị lỗi thời); cập nhật knowledge base; điều chỉnh prompt/fine-tune lại; đặt cảnh báo theo ngưỡng. Đây chính là lý do vòng đời AI có bước **Monitor → Iterate** chứ không kết thúc ở Deploy.`,
      points: [
        { id: 'p1', w: 3, text: 'Chất lượng suy giảm theo thời gian dù hệ thống không đổi, vì dữ liệu/thế giới thực đã thay đổi' },
        { id: 'p2', w: 3, text: 'Phân biệt được ít nhất hai loại: data drift (phân phối đầu vào đổi) và concept drift (quan hệ input→output đúng đổi)' },
        { id: 'p3', w: 2, text: 'Với RAG/LLM còn có knowledge drift (tài liệu cũ) và model drift (nhà cung cấp đổi phiên bản)' },
        { id: 'p4', w: 2, text: 'Cách phát hiện và xử lý: monitor chất lượng liên tục, eval định kỳ, cập nhật KB/golden dataset, retrain/điều chỉnh prompt' },
      ],
      why: 'Drift là lý do tồn tại của giai đoạn Monitor và Iterate. Không hiểu drift thì sẽ coi deploy là vạch đích.',
      traps: ['Chỉ nói "model kém đi theo thời gian" mà không nêu nguyên nhân là dữ liệu/thế giới đổi.'],
      hook: 'Model đứng yên, thế giới đi tiếp.',
      related: [79, 86],
    },
    {
      id: 63,
      q: 'P99 latency là gì?',
      type: 'concept',
      diff: 2,
      answer: `**P99 latency** (phân vị thứ 99) là **ngưỡng mà 99% request nhanh hơn nó, và 1% chậm hơn**.

Ví dụ: P99 = 8s nghĩa là 99/100 request phản hồi trong vòng 8 giây, còn 1/100 request mất hơn 8 giây.

**Vì sao dùng phân vị thay vì trung bình:**
- Phân phối latency **lệch phải rất mạnh** (long tail): đa số nhanh, một thiểu số cực chậm. Trung bình bị số nhỏ kéo xuống và **giấu mất phần đuôi**.
- Ví dụ kinh điển: 99 request 200ms + 1 request 30s ⇒ **trung bình ≈ 500ms (nhìn rất đẹp)** nhưng **P99 = 30s** — và người dùng thứ 100 đó có thể là khách hàng lớn nhất của bạn.

**Với hệ thống AI, đuôi đặc biệt dài vì:** câu trả lời dài hơn, agent chạy nhiều bước hơn, retrieval chậm, retry sau lỗi, hàng đợi giờ cao điểm, cold start.

**Thực hành:** đặt SLO theo P95/P99 (ví dụ "P95 < 3s, P99 < 8s"), theo dõi cả **P50** để hiểu trải nghiệm điển hình; đo riêng **TTFT** và **tổng latency**. Nhớ rằng nếu một thao tác của người dùng cần 5 lời gọi nội bộ, xác suất chạm phải đuôi tăng lên đáng kể — vì vậy P99 của thành phần quyết định trải nghiệm chung nhiều hơn ta tưởng.`,
      points: [
        { id: 'p1', w: 3, text: '99% request có latency nhỏ hơn giá trị này, 1% chậm nhất nằm ngoài — phân vị 99' },
        { id: 'p2', w: 3, text: 'Phản ánh phần đuôi (worst case) mà trung bình che mất; phân phối latency lệch phải' },
        { id: 'p3', w: 2, text: 'Nêu ví dụ số cụ thể cho thấy average đẹp nhưng P99 rất xấu' },
        { id: 'p4', w: 1, text: 'Với AI đuôi dài do câu trả lời dài, agent nhiều bước, retry, hàng đợi, cold start; dùng để đặt SLO' },
      ],
      why: 'P99 là ngôn ngữ chung của SRE. Trả lời được câu này là bạn nói cùng ngôn ngữ với đội vận hành.',
      traps: ['Nói P99 là "1% request nhanh nhất" — ngược.', 'Nhầm P99 với giá trị lớn nhất (max).'],
      hook: 'P99 = trải nghiệm của người xui nhất trong 100 người.',
      related: [64, 58],
    },
    {
      id: 64,
      q: 'Tại sao nên theo dõi P95/P99 thay vì chỉ theo dõi Average Latency?',
      type: 'concept',
      diff: 2,
      answer: `Vì **trung bình che giấu đúng phần gây đau**.

1. **Phân phối lệch, trung bình vô nghĩa.** Latency không phân phối chuẩn; nó có đuôi dài. Trung bình bị đa số request nhanh kéo xuống, khiến dashboard "xanh" trong khi một nhóm người dùng đang chịu 20 giây.
2. **Trung bình không đại diện cho ai cả.** 99 × 200ms + 1 × 30s ⇒ trung bình 500ms, không mô tả đúng trải nghiệm của cả nhóm nhanh lẫn người bị chậm.
3. **Người dùng nhớ lần tệ nhất, không nhớ trung bình.** Một lần treo 30 giây làm mất niềm tin nhiều hơn 99 lần mượt mà tạo ra.
4. **Đuôi là nơi lỗi ẩn nấp**: timeout, retry, cold start, hàng đợi, truy vấn chậm, agent chạy quá nhiều bước. Đuôi tăng thường là **dấu hiệu sớm** của sự cố sắp lan rộng — trung bình chỉ nhúc nhích khi mọi thứ đã hỏng.
5. **Hiệu ứng khuếch đại**: nếu một thao tác gọi 5 dịch vụ nội bộ, xác suất trúng ít nhất một "đuôi chậm" cao hơn nhiều so với 1%. Đuôi của thành phần trở thành phần thân của trải nghiệm.
6. **SLA/SLO được viết theo phân vị**, không theo trung bình — vì cam kết phải bảo vệ cả những người xui nhất.

**Thực hành:** theo dõi **bộ P50 / P95 / P99** cạnh nhau. P50 nói về trải nghiệm điển hình; khoảng cách P50→P99 nói về **độ ổn định**. Khoảng cách giãn rộng = hệ thống đang mất ổn định dù trung bình chưa đổi.`,
      points: [
        { id: 'p1', w: 3, text: 'Latency phân phối lệch phải, có đuôi dài; trung bình bị kéo xuống và che mất các trường hợp chậm' },
        { id: 'p2', w: 3, text: 'Đưa được ví dụ/lập luận cụ thể: average đẹp nhưng vẫn có nhóm người dùng chịu độ trễ rất lớn' },
        { id: 'p3', w: 2, text: 'Đuôi là nơi lộ ra lỗi thật (timeout, retry, cold start, hàng đợi) và là tín hiệu cảnh báo sớm' },
        { id: 'p4', w: 2, text: 'SLA/SLO viết theo phân vị; nên theo dõi P50/P95/P99 cùng nhau, khoảng cách giữa chúng cho biết độ ổn định' },
      ],
      why: 'Đây là câu hỏi kinh điển phân biệt người đọc dashboard và người hiểu dashboard.',
      traps: ['Chỉ nói "P99 chính xác hơn" mà không giải thích cơ chế phân phối lệch.'],
      hook: 'Trung bình là câu chuyện dễ chịu; phân vị là sự thật.',
      related: [63],
    },
    {
      id: 65,
      q: 'CPU và Memory có phải AI-specific metrics không?',
      type: 'concept',
      diff: 1,
      answer: `**Không.** CPU và Memory là **metric hạ tầng/hệ thống chung (system/infrastructure metrics)** — mọi ứng dụng đều có, từ web server tới cron job. Chúng không nói gì về việc AI trả lời **đúng hay sai**.

**Vẫn phải theo dõi chúng** (để biết máy có sắp hết tài nguyên không, có cần scale không), nhưng chúng thuộc **nhóm khác** trên dashboard.

**Metric AI-specific là những cái chỉ tồn tại vì đây là hệ thống AI:**

| Nhóm | Metric |
|---|---|
| Chất lượng | Faithfulness, Answer Relevancy, Context Precision/Recall, Quality Score, hallucination rate |
| Hiệu năng đặc thù LLM | TTFT, tokens/second, số bước agent trung bình, tỉ lệ gọi tool thành công |
| Chi phí | Cost/request, token in/out, cache hit rate |
| Hành vi & an toàn | Tỉ lệ escalate sang người, tỉ lệ từ chối trả lời, tỉ lệ vi phạm guardrail, drift |
| Kinh doanh | Deflection rate, CSAT, thời gian xử lý trung bình |

**Lưu ý riêng:** nếu bạn **self-host model trên GPU** thì **GPU utilization, VRAM, KV-cache usage, batch size** trở thành metric rất quan trọng — nhưng vẫn là metric hạ tầng, chỉ là hạ tầng đặc thù cho AI. Còn CPU/RAM của một app gọi API model thì hoàn toàn là chuyện thường ngày.`,
      points: [
        { id: 'p1', w: 3, text: 'Trả lời dứt khoát: KHÔNG — đây là metric hạ tầng/hệ thống chung, không phải AI-specific' },
        { id: 'p2', w: 2, text: 'Vẫn cần theo dõi nhưng thuộc nhóm khác (infrastructure monitoring)' },
        { id: 'p3', w: 3, text: 'Nêu được metric AI-specific thật sự: TTFT, quality score/faithfulness, cost per request, hallucination/escalation rate, drift' },
        { id: 'p4', w: 1, text: 'Nêu ngoại lệ hợp lý: nếu self-host model thì GPU/VRAM quan trọng nhưng vẫn là metric hạ tầng' },
      ],
      why: 'Câu bẫy để kiểm tra bạn có phân biệt được "hệ thống khỏe" với "AI làm đúng việc" hay không.',
      traps: ['Trả lời "có, vì AI chạy tốn CPU/RAM" — tốn tài nguyên không làm nó thành metric AI.'],
      hook: 'CPU nói máy có mệt không. Quality score nói câu trả lời có đúng không.',
      related: [66, 119],
    },
    {
      id: 66,
      q: 'HTTP 200/500 có phải AI quality metrics không?',
      type: 'concept',
      diff: 1,
      answer: `**Không.** HTTP status code là **metric khả dụng/kỹ thuật (availability / reliability)**: request có tới nơi và có được xử lý mà không lỗi hệ thống hay không.

**Điểm mấu chốt:** một hệ thống AI có thể trả **200 OK cho 100% request** trong khi **mọi câu trả lời đều sai, bịa hoặc lạc đề**. Về phía HTTP, mọi thứ hoàn hảo. Đây chính là lý do AI cần một tầng metric riêng — *lỗi của AI là lỗi im lặng, không phát ra status code*.

- **200/500 đo:** hệ thống có sống không, có lỗi hạ tầng không, tỉ lệ lỗi bao nhiêu.
- **Không đo:** độ chính xác, độ trung thành với tài liệu, tính hữu ích, giọng điệu, an toàn.

**Metric chất lượng AI phải đo bằng cách khác:** RAGAS (faithfulness, relevancy, context precision/recall), LLM-as-a-Judge theo rubric, đối chiếu golden dataset, phản hồi người dùng (thumbs, CSAT), tỉ lệ escalate, tỉ lệ vi phạm guardrail.

**Cả hai nhóm đều cần**, đặt cạnh nhau trên dashboard:
\`\`\`
Reliability:  200 OK 99.95%  |  5xx 0.05%  |  P99 6.2s
Quality:      Faithfulness 0.93  |  Relevancy 0.88  |  Escalate 7%  |  👍 82%
\`\`\``,
      points: [
        { id: 'p1', w: 3, text: 'Trả lời dứt khoát: KHÔNG — đây là metric kỹ thuật/khả dụng (reliability), không phải chất lượng AI' },
        { id: 'p2', w: 3, text: 'Nêu lập luận cốt lõi: hệ thống có thể trả 200 OK cho mọi request trong khi câu trả lời hoàn toàn sai/bịa' },
        { id: 'p3', w: 2, text: 'Chất lượng AI phải đo bằng RAGAS / LLM-as-judge / golden dataset / phản hồi người dùng' },
        { id: 'p4', w: 1, text: 'Vẫn cần theo dõi status code, nhưng ở nhóm reliability riêng, song song với nhóm quality' },
      ],
      why: 'Đây là ý tưởng trung tâm của monitoring AI: lỗi AI không làm sập hệ thống, nên hệ thống giám sát truyền thống không bao giờ nhìn thấy nó.',
      traps: ['Trả lời "có vì 500 nghĩa là chất lượng kém" — 500 là lỗi hệ thống, không phải chất lượng nội dung.'],
      hook: '200 OK vẫn có thể là 200 câu trả lời sai.',
      related: [60, 65, 119],
    },
  ],
};
