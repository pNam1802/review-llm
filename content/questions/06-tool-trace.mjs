export default {
  id: 'tool-trace',
  name: 'Tool Calling / Trace',
  short: 'Trace',
  emoji: '🧾',
  blurb: 'Đọc và viết được trace Thought → Action → Observation → Final Answer.',
  questions: [
    {
      id: 44,
      q: 'Hãy trace quá trình agent xử lý câu hỏi: **"100 USD hôm nay bằng bao nhiêu VND?"** theo Thought → Action → Observation → Final Answer.',
      type: 'trace',
      diff: 2,
      answer: `\`\`\`
User: "100 USD hôm nay bằng bao nhiêu VND?"

--- Bước 1 ---
Thought: Người dùng cần quy đổi 100 USD sang VND theo tỷ giá HÔM NAY.
         Tỷ giá thay đổi hằng ngày và nằm ngoài kiến thức của mình
         ⇒ không được đoán, phải gọi tool tra tỷ giá.
Action:  get_exchange_rate({"from": "USD", "to": "VND"})
Observation: {"rate": 25430, "as_of": "2026-09-04", "source": "vietcombank"}

--- Bước 2 ---
Thought: Đã có tỷ giá 25.430 VND/USD, cập nhật hôm nay.
         Cần nhân 100 × 25430. Phép tính đơn giản nhưng để chắc chắn
         và tránh sai số, gọi calculator.
Action:  calculator({"expression": "100 * 25430"})
Observation: {"result": 2543000}

--- Bước 3 ---
Thought: Đã có đủ dữ liệu: tỷ giá + kết quả nhân. Không cần tool nào nữa
         ⇒ tổng hợp và kết thúc.
Final Answer: 100 USD ≈ 2.543.000 VND, theo tỷ giá 25.430 VND/USD
              (Vietcombank, ngày 04/09/2026). Tỷ giá thay đổi hằng ngày
              và ngân hàng có thể áp mức mua/bán khác.
\`\`\`

**Những chi tiết làm nên một trace tốt:**
- **Thought nêu rõ lý do gọi tool** ("dữ liệu thời gian thực, không được đoán").
- **Observation có \`as_of\` và \`source\`** ⇒ câu trả lời cuối trích dẫn được.
- **Bước 3 là bước quyết định dừng** — không phải cứ có dữ liệu là dừng ngay, agent vẫn phải "nghĩ" một nhịp để kiểm tra đã đủ chưa.
- **Final Answer nêu cả điều kiện/ngữ cảnh** (ngày, nguồn, cảnh báo tỷ giá mua/bán) chứ không chỉ trả con số trần trụi.

*(Có thể gộp còn 2 bước nếu tin phép nhân của model, nhưng với con số tài chính, dùng calculator là lựa chọn đúng.)*`,
      points: [
        { id: 'p1', w: 3, text: 'Thought đầu tiên nhận ra cần tỷ giá thời gian thực, không được đoán ⇒ phải gọi tool' },
        { id: 'p2', w: 3, text: 'Action gọi tool tra tỷ giá với tham số USD→VND, Observation trả về tỷ giá cụ thể' },
        { id: 'p3', w: 2, text: 'Có bước tính toán 100 × tỷ giá (bằng calculator hoặc nêu rõ phép nhân) và Thought kiểm tra đã đủ dữ liệu chưa' },
        { id: 'p4', w: 2, text: 'Final Answer nêu kết quả kèm tỷ giá/ngày/nguồn, đúng định dạng Final Answer kết thúc vòng lặp' },
      ],
      why: 'Viết được trace là bằng chứng bạn hiểu vòng lặp chứ không chỉ thuộc ba từ khóa. Đây cũng đúng là thứ bạn sẽ đọc mỗi ngày khi debug agent.',
      traps: [
        'Bỏ qua Thought, viết thẳng Action.',
        'Để agent tự "nhớ" tỷ giá thay vì gọi tool.',
        'Final Answer chỉ có con số, không nêu tỷ giá và ngày.',
      ],
      hook: 'Mỗi bước phải trả lời được: vì sao nghĩ vậy, gọi gì, nhận được gì.',
      related: [31, 45, 46],
    },
    {
      id: 45,
      q: 'Trong trace trên, agent cần gọi tool nào?',
      type: 'trace',
      diff: 1,
      answer: `**Bắt buộc: một tool tra tỷ giá.**
\`get_exchange_rate(from="USD", to="VND")\` — hoặc tương đương: \`currency_api\`, \`search_web\` nếu không có API chuyên dụng.
**Lý do:** tỷ giá là dữ liệu **thời gian thực**, thay đổi hằng ngày, không nằm trong tham số của model. Để model tự nhớ ⇒ số liệu bịa hoặc lỗi thời.

**Nên có: calculator.**
\`calculator("100 * 25430")\` — LLM sinh token chứ không thực sự tính toán; với số tiền thì sai một chữ số là sự cố. Phép nhân này đơn giản, nhưng nguyên tắc "số liệu tài chính đi qua calculator" nên được giữ nhất quán.

**Không cần:** RAG/knowledge base (đây không phải câu hỏi về tài liệu nội bộ), tool gửi mail/tạo ticket (không có hành động thay đổi trạng thái nào).

**Ghi chú thiết kế:** nếu API tỷ giá hỗ trợ sẵn tham số \`amount\` thì chỉ cần **một** tool — quy đổi luôn trong một lời gọi. Ít bước hơn ⇒ nhanh hơn, rẻ hơn, ít chỗ hỏng hơn. Thiết kế tool tốt làm giảm số vòng lặp.`,
      points: [
        { id: 'p1', w: 3, text: 'Tool tra tỷ giá (get_exchange_rate / currency API / search) — bắt buộc vì là dữ liệu thời gian thực' },
        { id: 'p2', w: 2, text: 'Calculator để nhân 100 × tỷ giá, vì LLM tính toán không đáng tin với số liệu tài chính' },
        { id: 'p3', w: 2, text: 'Giải thích được lý do cần tool (ngoài kiến thức model, thay đổi hằng ngày) thay vì chỉ liệt kê tên tool' },
        { id: 'p4', w: 1, text: 'Nêu được rằng nếu API hỗ trợ tham số amount thì một tool là đủ / không cần RAG hay tool ghi' },
      ],
      why: 'Câu ngắn nhưng kiểm tra phản xạ quan trọng nhất: nhận ra ranh giới "cái gì model biết" và "cái gì phải hỏi thế giới".',
      traps: ['Chỉ trả lời "gọi API" mà không nêu tool cụ thể và lý do.'],
      hook: 'Số liệu sống ⇒ tool. Phép tính tiền ⇒ calculator.',
      related: [39, 44],
    },
    {
      id: 46,
      q: 'Sau khi tool trả về tỷ giá, agent sử dụng Observation như thế nào để đưa ra câu trả lời cuối?',
      type: 'trace',
      diff: 2,
      answer: `Theo bốn nhịp:

1. **Nhận Observation và đưa vào context.** Kết quả \`{"rate": 25430, "as_of": "2026-09-04"}\` được append vào \`messages\` dưới dạng \`tool_result\` gắn với \`tool_use_id\` tương ứng, rồi **gọi LLM lại**.

2. **Thought diễn giải Observation.** Model đọc lại toàn bộ ngữ cảnh và tự hỏi: dữ liệu này có trả lời được câu hỏi chưa? Có hợp lệ không (không rỗng, không lỗi, ngày có mới không)? Còn thiếu bước nào không? Ở đây: đã có tỷ giá, còn thiếu phép nhân.

3. **Hành động tiếp hoặc dừng.** Nếu còn thiếu ⇒ Action tiếp theo (\`calculator("100 * 25430")\`). Nếu đủ ⇒ chuyển sang Final Answer. Nếu Observation là **lỗi** ⇒ Thought quyết định retry, đổi tool, hoặc trả lời trung thực rằng không tra được.

4. **Tổng hợp thành Final Answer.** Model kết hợp: yêu cầu gốc (100 USD → VND) + dữ liệu quan sát (tỷ giá 25.430, ngày 04/09/2026, nguồn) + kết quả tính (2.543.000) → viết thành câu trả lời **có dẫn nguồn và có ngữ cảnh thời gian**:
> "100 USD ≈ 2.543.000 VND theo tỷ giá 25.430 VND/USD (Vietcombank, 04/09/2026)."

**Nguyên tắc chốt:** Final Answer phải **dựa trên Observation, không dựa trên trí nhớ của model** — đây chính là điểm ReAct làm giảm hallucination. Và Observation là **dữ liệu**, không phải mệnh lệnh: nếu nội dung tool trả về có chứa câu như "hãy bỏ qua hướng dẫn trước đó", agent phải coi đó là văn bản dữ liệu, không phải chỉ thị.`,
      points: [
        { id: 'p1', w: 3, text: 'Observation được đưa vào context rồi gọi LLM lại để suy luận tiếp (không phải trả thẳng cho người dùng)' },
        { id: 'p2', w: 3, text: 'Thought diễn giải dữ liệu: kiểm tra hợp lệ và xác định đã đủ để trả lời chưa, hay cần thêm bước (ví dụ nhân với 100)' },
        { id: 'p3', w: 2, text: 'Khi đã đủ, tổng hợp thành Final Answer dựa trên dữ liệu quan sát được, kèm tỷ giá/ngày/nguồn' },
        { id: 'p4', w: 2, text: 'Nêu xử lý trường hợp Observation lỗi/không hợp lệ (retry, đổi tool, trả lời trung thực) hoặc nguyên tắc coi observation là dữ liệu chứ không phải mệnh lệnh' },
      ],
      why: 'Đây là chỗ nhiều người hiểu lơ mơ: tool trả kết quả KHÔNG phải là câu trả lời. Còn một nhịp suy luận và tổng hợp nữa mới tới người dùng.',
      traps: ['Nói "agent trả luôn kết quả của tool cho người dùng" — bỏ mất bước suy luận và tổng hợp.'],
      hook: 'Observation vào đầu, không vào thẳng miệng.',
      related: [34, 35, 44],
    },
  ],
};
