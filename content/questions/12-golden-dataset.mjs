export default {
  id: 'golden-dataset',
  name: 'Golden Dataset / Evaluation',
  short: 'Eval',
  emoji: '🏅',
  blurb: 'Bộ dữ liệu chuẩn để chấm AI: chọn mẫu, ground truth, LLM-as-judge.',
  questions: [
    {
      id: 80,
      q: 'Golden Dataset là gì?',
      type: 'concept',
      diff: 2,
      answer: `**Golden Dataset** là **bộ dữ liệu chuẩn được con người kiểm duyệt**, gồm các cặp **câu hỏi + câu trả lời đúng (ground truth)**, dùng làm **thước đo cố định** để đánh giá hệ thống AI qua mọi phiên bản.

**Đặc điểm:**
- **Được con người xác nhận** — đây là "sự thật" mà mọi phiên bản đều bị đối chiếu.
- **Đại diện** cho phân phối câu hỏi thật (không phải toàn câu dễ, không phải toàn câu hiếm).
- **Ổn định theo thời gian** để so sánh được giữa các phiên bản; khi cập nhật thì cập nhật có kiểm soát và ghi version.
- **Đủ nhỏ để chạy thường xuyên** (vài chục đến vài trăm câu cho eval trong CI), đủ lớn để có ý nghĩa thống kê.

**Dùng để:**
1. Đo chất lượng trước khi deploy (**cổng chặn trong CI/CD**).
2. So sánh phiên bản: prompt A vs B, model X vs Y, có rerank vs không.
3. **Phát hiện hồi quy**: sửa chỗ này có làm hỏng chỗ kia không.
4. Theo dõi drift theo thời gian.
5. Là "định nghĩa vận hành" của **câu trả lời tốt** — buộc cả đội thống nhất tiêu chuẩn.

**Nên chia thành các tập nhỏ** (train/dev để tinh chỉnh, **test/holdout để chấm cuối**) — nếu bạn liên tục tinh chỉnh prompt cho hợp với chính bộ dữ liệu đang chấm thì điểm số sẽ đẹp lên mà chất lượng thật không đổi (overfit vào eval).

**Đây là tài sản có giá trị lâu dài nhất của dự án AI:** model đổi, prompt đổi, framework đổi — golden dataset vẫn dùng được.`,
      points: [
        { id: 'p1', w: 3, text: 'Là tập dữ liệu chuẩn được con người kiểm duyệt, gồm câu hỏi + câu trả lời đúng (ground truth)' },
        { id: 'p2', w: 3, text: 'Dùng làm thước đo cố định để đánh giá/so sánh các phiên bản và phát hiện hồi quy' },
        { id: 'p3', w: 2, text: 'Phải đại diện cho phân phối câu hỏi thật, đủ đa dạng về độ khó và loại câu hỏi' },
        { id: 'p4', w: 2, text: 'Dùng trong CI/CD làm cổng chặn trước deploy; nên tách holdout để tránh overfit; là tài sản dùng lại qua mọi phiên bản' },
      ],
      why: 'Không có golden dataset thì mọi câu "bản này tốt hơn" đều là cảm tính. Đây là hạ tầng đo lường của cả dự án.',
      traps: ['Mô tả như "dữ liệu để train model" — golden dataset dùng để ĐÁNH GIÁ, không phải để huấn luyện.'],
      hook: 'Golden dataset = cái thước. Đổi model thì đổi, thước thì giữ.',
      related: [81, 82, 83],
    },
    {
      id: 81,
      q: 'Có 500 câu hỏi customer support, làm thế nào để chọn ra 20 câu representative?',
      type: 'design',
      diff: 3,
      answer: `**Không chọn ngẫu nhiên thuần, cũng không chọn theo cảm tính. Dùng lấy mẫu phân tầng (stratified sampling) theo các chiều quan trọng.**

**Quy trình:**

**1. Phân tích và phân tầng 500 câu**
- **Theo chủ đề/intent**: trạng thái đơn hàng, hoàn tiền, kỹ thuật, thanh toán, chính sách… (dùng clustering trên embedding nếu chưa có nhãn).
- **Theo tần suất**: câu hỏi phổ biến vs câu hỏi hiếm.
- **Theo độ khó**: một bước / nhiều bước / cần tổng hợp nhiều tài liệu.
- **Theo loại**: hỏi thông tin, hỏi quy trình, khiếu nại, ngoài phạm vi.

**2. Phân bổ 20 slot theo tỉ trọng thật + đảm bảo phủ ca quan trọng**

| Nhóm | Số câu | Lý do |
|---|---|---|
| Câu phổ biến nhất (top intent) | 8 | Chiếm phần lớn traffic ⇒ ảnh hưởng lớn nhất |
| Độ khó trung bình, nhiều bước | 5 | Kiểm tra khả năng thật của agent/RAG |
| Ca khó / trường hợp biên | 3 | Nơi hệ thống hay vỡ |
| Câu ngoài phạm vi / mơ hồ | 2 | Kiểm tra hệ thống có biết nói "không biết"/escalate |
| Câu nhạy cảm, an toàn, dễ bị injection | 2 | Kiểm tra guardrail |

**3. Chọn trong từng tầng**: ưu tiên câu hỏi **thật của người dùng** (giữ nguyên cách diễn đạt, lỗi chính tả, tiếng lóng), tránh câu trùng lặp ngữ nghĩa, và ưu tiên câu có tác động nghiệp vụ cao.

**4. Viết ground truth** cho từng câu, có chuyên gia nghiệp vụ duyệt; ghi kèm nguồn tài liệu và các ý bắt buộc phải có.

**5. Kiểm tra lại tính đại diện**: phân phối chủ đề của 20 câu có gần với phân phối của 500 câu không; có bao phủ đủ các loại lỗi đã từng gặp không.

**6. Coi đây là bản v1**: mở rộng dần bằng chính các ca thất bại trong production.

**Nguyên tắc bao trùm:** đại diện **theo tỉ trọng thật** + **cố ý bao phủ** ca khó và ca an toàn. 20 câu dễ là một bộ eval vô dụng — nó chỉ khiến bạn tự tin sai.`,
      points: [
        { id: 'p1', w: 3, text: 'Dùng lấy mẫu phân tầng theo các chiều: chủ đề/intent, độ khó, tần suất, loại câu hỏi — không chọn ngẫu nhiên hay theo cảm tính' },
        { id: 'p2', w: 3, text: 'Phân bổ theo tỉ trọng thật của traffic để giữ tính đại diện' },
        { id: 'p3', w: 3, text: 'Cố ý bao gồm ca khó/biên, câu ngoài phạm vi và câu kiểm tra an toàn, không chỉ câu phổ biến dễ' },
        { id: 'p4', w: 2, text: 'Dùng câu hỏi thật của người dùng, viết ground truth có chuyên gia duyệt, kiểm tra lại tính đại diện và mở rộng dần theo thời gian' },
      ],
      why: 'Cách chọn mẫu quyết định eval của bạn có nói thật hay không. Chọn sai mẫu thì mọi con số sau đó đều là ảo giác — đây cũng chính là selection bias.',
      traps: [
        'Chọn 20 câu ngẫu nhiên thuần ⇒ mất hết ca hiếm nhưng quan trọng.',
        'Chọn theo "câu nào hệ thống trả lời tốt" ⇒ tự lừa mình.',
      ],
      hook: 'Phân tầng theo tỉ trọng thật, rồi cố ý chừa chỗ cho ca khó.',
      related: [80, 84, 88],
    },
    {
      id: 82,
      q: 'Một record trong Golden Dataset nên chứa những thông tin gì?',
      type: 'design',
      diff: 2,
      answer: `\`\`\`json
{
  "id": "gd_042",
  "question": "Đơn hàng của tôi bị trễ 5 ngày, tôi có được hoàn tiền không?",
  "ground_truth": "Theo chính sách hiện hành, đơn trễ trên 3 ngày được hoàn 100% phí vận chuyển; hoàn tiền hàng chỉ áp dụng khi khách hủy đơn trước khi giao...",
  "must_include": ["ngưỡng 3 ngày", "hoàn phí vận chuyển", "điều kiện hoàn tiền hàng"],
  "must_not_include": ["cam kết hoàn tiền vô điều kiện"],
  "expected_sources": ["policy_refund_v3#muc2", "sla_delivery_2026#p4"],
  "expected_tools": ["get_order_status", "search_policy"],
  "category": "hoan_tien",
  "difficulty": "medium",
  "type": "multi_hop",
  "language": "vi",
  "expected_behavior": "answer",
  "created_by": "cs_lead_an",
  "reviewed_at": "2026-08-20",
  "version": 2,
  "notes": "Ca thường gặp mùa cao điểm; hay bị trả lời quá hứa hẹn."
}
\`\`\`

**Các nhóm trường và vì sao cần:**
1. **Định danh & câu hỏi** (\`id\`, \`question\`): giữ nguyên văn của người dùng.
2. **Ground truth** (\`ground_truth\`, \`must_include\`, \`must_not_include\`): đáp án chuẩn + **các ý bắt buộc** — phần \`must_include\` mới là thứ chấm tự động dựa vào, vì câu chữ có thể khác nhau mà vẫn đúng.
3. **Nguồn mong đợi** (\`expected_sources\`): để đo **Context Recall/Precision** và kiểm tra citation.
4. **Hành vi mong đợi** (\`expected_behavior\`: answer / refuse / escalate / ask_clarification, \`expected_tools\`): với ca ngoài phạm vi thì **câu trả lời đúng là từ chối**, và điều đó phải ghi rõ.
5. **Phân loại** (\`category\`, \`difficulty\`, \`type\`, \`language\`): để cắt lát kết quả eval theo nhóm — biết hệ thống yếu ở đâu chứ không chỉ biết điểm tổng.
6. **Quản trị** (\`created_by\`, \`reviewed_at\`, \`version\`, \`notes\`): ground truth cũng lỗi thời khi chính sách đổi; phải biết ai duyệt, khi nào, và có phiên bản.`,
      points: [
        { id: 'p1', w: 3, text: 'Câu hỏi (input) và ground truth answer (đáp án chuẩn được duyệt)' },
        { id: 'p2', w: 3, text: 'Các ý bắt buộc phải có / không được có (must_include, must_not_include) để chấm theo ngữ nghĩa thay vì so khớp chữ' },
        { id: 'p3', w: 2, text: 'Nguồn tài liệu mong đợi và/hoặc tool mong đợi, phục vụ đo context recall/precision và kiểm tra citation' },
        { id: 'p4', w: 2, text: 'Metadata phân loại (category, độ khó, ngôn ngữ, hành vi mong đợi như answer/refuse/escalate) và thông tin quản trị (người duyệt, ngày, version)' },
      ],
      why: 'Thiết kế record quyết định eval chấm được cái gì. Thiếu must_include thì chỉ chấm được bằng cách so chuỗi; thiếu expected_behavior thì không đo được khả năng nói "không biết".',
      traps: ['Chỉ có cặp question–answer, thiếu nguồn, thiếu ý bắt buộc và thiếu metadata phân loại.'],
      hook: 'Một record tốt trả lời được: hỏi gì, đúng là gì, phải có ý nào, lấy từ đâu, nếu không biết thì phải làm gì.',
      related: [80, 83],
    },
    {
      id: 83,
      q: 'Tại sao cần Ground Truth Answer?',
      type: 'concept',
      diff: 2,
      answer: `Vì **không có chuẩn so sánh thì không có phép đo** — chỉ còn cảm tính.

**Ground truth cho phép:**
1. **Chấm tự động, lặp lại được.** Không có nó thì mỗi lần đánh giá phải nhờ người đọc lại từ đầu — không thể chạy trong CI/CD, không thể chạy hằng ngày.
2. **Tính được các metric cần đáp án**: **Context Recall** (thiếu bao nhiêu phần thông tin cần thiết), độ chính xác, độ phủ ý — những metric này **không tồn tại** nếu không biết "đủ" nghĩa là gì.
3. **So sánh công bằng giữa các phiên bản.** Cùng một chuẩn, hai phiên bản mới so được với nhau; nếu chuẩn đổi theo cảm nhận thì mọi so sánh vô nghĩa.
4. **Phát hiện hồi quy**: sửa prompt cho nhóm A có làm hỏng nhóm B không.
5. **Thống nhất định nghĩa "đúng" trong nội bộ.** Quá trình viết ground truth buộc đội nghiệp vụ và đội kỹ thuật phải thỏa thuận: câu trả lời tốt gồm những ý gì, dài bao nhiêu, có cần trích dẫn không, khi nào thì được phép nói không biết. Giá trị này lớn ngang giá trị đo lường.
6. **Là mỏ neo cho LLM-as-a-Judge**: judge chấm dựa trên ground truth ổn định hơn nhiều so với chấm "theo cảm nhận chung".

**Lưu ý:** ground truth phải chấp nhận **nhiều cách diễn đạt** — vì vậy nên chấm theo **các ý bắt buộc (\`must_include\`)** và bằng judge ngữ nghĩa, thay vì so khớp chuỗi. Và ground truth **cũng lỗi thời**: chính sách đổi thì phải cập nhật, nếu không bạn sẽ đo phiên bản mới bằng chuẩn cũ.`,
      points: [
        { id: 'p1', w: 3, text: 'Không có chuẩn tham chiếu thì không đo được chất lượng một cách khách quan — chỉ còn cảm tính' },
        { id: 'p2', w: 3, text: 'Cho phép chấm tự động, lặp lại được trong CI/CD và tính các metric cần đáp án (như context recall, độ phủ ý)' },
        { id: 'p3', w: 2, text: 'Cho phép so sánh công bằng giữa các phiên bản và phát hiện hồi quy' },
        { id: 'p4', w: 2, text: 'Buộc cả đội thống nhất định nghĩa "câu trả lời đúng"; là mỏ neo cho LLM-as-judge; cần chấm theo ngữ nghĩa/ý bắt buộc và phải cập nhật khi nghiệp vụ đổi' },
      ],
      why: 'Đây là câu hỏi về bản chất của đo lường: bạn không thể cải thiện thứ bạn không đo được, và không thể đo nếu không có chuẩn.',
      traps: ['Chỉ nói "để biết đúng sai" mà không nêu vai trò trong tự động hóa, so sánh phiên bản và chống hồi quy.'],
      hook: 'Không có thước thì mọi phép đo đều là ý kiến.',
      related: [80, 82, 85],
    },
    {
      id: 84,
      q: 'Có nên chọn toàn bộ 20 câu dễ nhất để làm Golden Dataset không? Vì sao?',
      type: 'judgment',
      diff: 2,
      answer: `**Không.** Đó là cách tự lừa mình một cách có hệ thống.

**Vì sao sai:**
1. **Mất tính đại diện.** Traffic thật có cả câu dễ lẫn câu khó. Bộ eval toàn câu dễ đo một thế giới không tồn tại — đây chính là **selection bias** áp vào chính khâu đánh giá.
2. **Điểm số ảo, tạo niềm tin sai.** Faithfulness 0.98 trên 20 câu dễ chẳng nói gì về hành vi của hệ thống với ca khó — nơi rủi ro thật nằm ở đó.
3. **Không phát hiện được điểm yếu.** Câu dễ thì mọi phiên bản đều làm đúng ⇒ **eval mất khả năng phân biệt**: prompt A và prompt B cùng 100%, bạn không biết chọn cái nào. Một bộ eval không phân biệt được các phiên bản là một bộ eval vô dụng.
4. **Không chống được hồi quy** ở đúng chỗ dễ hỏng.
5. **Bỏ lọt rủi ro an toàn**: câu ngoài phạm vi, yêu cầu vượt quyền, prompt injection — toàn nằm ở nhóm "khó".

**Nên làm thế nào:** phân tầng theo độ khó và chủ đề, **cố ý** giữ chỗ cho ca khó, ca biên, ca ngoài phạm vi và ca an toàn (xem câu 81). Một bộ 20 câu hợp lý có khoảng 8 câu phổ biến, 5 câu trung bình/nhiều bước, 3 câu khó, 2 câu ngoài phạm vi, 2 câu an toàn.

**Ngoại lệ duy nhất:** một tập nhỏ **smoke test** gồm câu dễ, chạy nhanh sau mỗi commit để bắt lỗi vỡ nghiêm trọng. Nhưng đó là *smoke test*, **không phải golden dataset**, và không được dùng để tuyên bố chất lượng.`,
      points: [
        { id: 'p1', w: 3, text: 'Không nên — vì mất tính đại diện cho phân phối câu hỏi thật (selection bias trong chính khâu đánh giá)' },
        { id: 'p2', w: 3, text: 'Điểm số sẽ cao giả tạo, tạo niềm tin sai về chất lượng hệ thống' },
        { id: 'p3', w: 3, text: 'Không phát hiện được điểm yếu và không phân biệt được các phiên bản (mọi phiên bản đều đúng hết ⇒ eval vô dụng)' },
        { id: 'p4', w: 2, text: 'Nêu cách đúng: phân tầng đủ mức độ khó, có ca biên/ngoài phạm vi/an toàn; hoặc nêu ngoại lệ smoke test' },
      ],
      why: 'Bộ eval dễ dãi là cách chắc chắn nhất để một hệ thống tệ được deploy với sự tự tin cao.',
      traps: ['Trả lời "không nên vì thiếu đa dạng" mà không nêu hệ quả quan trọng nhất: eval mất khả năng phân biệt phiên bản.'],
      hook: 'Đề thi toàn câu dễ thì ai cũng 10 điểm — và bạn không học được gì.',
      related: [81, 88],
    },
    {
      id: 85,
      q: 'GPT-4 làm Judge trong AI Evaluation có tác dụng gì?',
      type: 'concept',
      diff: 2,
      answer: `**LLM-as-a-Judge** = dùng một LLM mạnh để **chấm điểm đầu ra của hệ thống theo rubric**, thay cho việc con người đọc từng câu.

**Tác dụng:**
1. **Chấm được thứ mà so khớp chuỗi không chấm nổi.** Hai câu trả lời khác nhau hoàn toàn về từ ngữ có thể cùng đúng. Judge chấm theo **ngữ nghĩa**: đủ ý chưa, có bịa không, có đúng giọng không, có trích dẫn không.
2. **Mở rộng quy mô.** Con người chấm 500 câu mất nhiều ngày; judge chấm trong vài phút với chi phí nhỏ ⇒ **chạy được trong CI/CD ở mỗi lần thay đổi**.
3. **Nhất quán hơn con người** ở quy mô lớn (người mệt, người chấm khác nhau, người đổi tiêu chuẩn giữa chừng).
4. **Là động cơ tính toán bên dưới RAGAS**: faithfulness, answer relevancy, context recall đều được tính nhờ một LLM đứng ra phán đoán từng claim.
5. **Cho phản hồi có cấu trúc**: không chỉ điểm, mà còn "thiếu ý nào", "câu nào trong bài không có căn cứ" ⇒ dùng để cải tiến, không chỉ để chấm.

**Hạn chế phải biết (và cách giảm):**
- **Thiên lệch**: thiên vị câu trả lời dài, thiên vị văn phong giống mình (self-preference), thiên vị vị trí khi so sánh A/B ⇒ **rubric rõ ràng, hoán đổi vị trí, ép chấm theo từng tiêu chí riêng**.
- **Không tất định**: đặt temperature = 0, chấm nhiều lần lấy đa số cho ca quan trọng.
- **Tốn tiền và thời gian** khi bộ eval lớn ⇒ dùng model rẻ hơn cho tiêu chí đơn giản.
- **Judge cũng cần được kiểm định**: lấy ~50 mẫu cho người chấm song song, đo mức độ đồng thuận giữa judge và người. Judge không được đồng thuận với con người thì mọi điểm số nó đưa ra đều vô nghĩa.
- **Không dùng chính model đang bị chấm để làm judge** cho các đánh giá quan trọng.`,
      points: [
        { id: 'p1', w: 3, text: 'Dùng LLM mạnh chấm điểm đầu ra theo rubric/tiêu chí, thay cho việc con người chấm thủ công' },
        { id: 'p2', w: 3, text: 'Đánh giá được theo ngữ nghĩa (đúng ý dù khác câu chữ) — điều mà so khớp chuỗi không làm được' },
        { id: 'p3', w: 2, text: 'Cho phép mở rộng quy mô và tự động hóa trong CI/CD; là cơ chế tính của các metric RAGAS' },
        { id: 'p4', w: 3, text: 'Nêu hạn chế và cách giảm: thiên lệch (độ dài, vị trí, tự ưu ái), không tất định, tốn chi phí; cần rubric rõ, temperature 0 và kiểm định judge với người chấm' },
      ],
      why: 'LLM-as-judge là công nghệ khiến eval tự động cho GenAI trở nên khả thi. Nhưng dùng mà không kiểm định judge là xây thước đo bằng cao su.',
      traps: ['Chỉ nói ưu điểm mà không nêu bias và nhu cầu kiểm định judge với con người.'],
      hook: 'Judge chấm ý, không chấm chữ — nhưng judge cũng phải được chấm.',
      related: [60, 83, 86],
    },
    {
      id: 86,
      q: 'AI Evaluation nên được thực hiện ở những giai đoạn nào?',
      type: 'concept',
      diff: 2,
      answer: `**Ở mọi giai đoạn — eval là hoạt động liên tục, không phải một cột mốc.**

| Giai đoạn | Eval làm gì | Hình thức |
|---|---|---|
| **Development** (khi làm) | So sánh nhanh prompt/tham số, tạo baseline | Chạy tay trên tập nhỏ (20–50 câu), vòng lặp nhanh |
| **Pre-deploy / CI-CD** | **Cổng chặn**: không đạt ngưỡng thì không merge/deploy | Tự động trên golden dataset đầy đủ, có so sánh với baseline |
| **Staging / Pre-production** | Kiểm tra với dữ liệu và tải gần thật, red teaming, kiểm thử an toàn | Tự động + con người soát |
| **Deploy (canary / A-B)** | So chất lượng bản mới với bản đang chạy trên **traffic thật** | Online eval trên mẫu; đối chiếu quality, cost, latency |
| **Production (monitor)** | Phát hiện drift và suy giảm | Lấy mẫu traffic hằng ngày + LLM judge + phản hồi người dùng |
| **Định kỳ (hàng tuần/tháng)** | Chạy lại full eval, kiểm định lại judge, **cập nhật golden dataset** | Theo lịch |
| **Sự kiện đặc biệt** | Bất cứ khi nào đổi **prompt / model / RAG / tool / knowledge base** | Bắt buộc chạy lại |

**Hai nguyên tắc:**
1. **Càng phát hiện sớm càng rẻ.** Một lỗi bắt được lúc dev tốn vài phút; cùng lỗi đó bắt được từ khách hàng tốn uy tín.
2. **Eval offline (golden dataset) và eval online (traffic thật) bổ sung cho nhau.** Offline lặp lại được và so sánh được, nhưng có thể lỗi thời. Online phản ánh thực tế, nhưng không có ground truth và nhiễu hơn. Thiếu một trong hai đều mù một nửa.`,
      points: [
        { id: 'p1', w: 3, text: 'Trong quá trình phát triển: so sánh prompt/model, tạo baseline trên tập nhỏ' },
        { id: 'p2', w: 3, text: 'Trước khi deploy / trong CI-CD: chạy trên golden dataset làm cổng chặn theo ngưỡng' },
        { id: 'p3', w: 3, text: 'Sau khi deploy: online eval trên traffic thật (canary/A-B) và monitoring liên tục để phát hiện drift' },
        { id: 'p4', w: 2, text: 'Bắt buộc chạy lại mỗi khi đổi prompt/model/RAG/KB; định kỳ cập nhật golden dataset và kiểm định lại judge' },
      ],
      why: 'Câu này kiểm tra bạn có coi eval là hạ tầng thường trực hay chỉ là một bước kiểm tra trước khi ra mắt.',
      traps: ['Chỉ trả lời "trước khi deploy" — bỏ mất eval online và eval định kỳ, tức là bỏ mất khả năng phát hiện drift.'],
      hook: 'Eval không phải cửa ải một lần, mà là nhịp tim của hệ thống.',
      related: [76, 79, 111],
    },
  ],
};
