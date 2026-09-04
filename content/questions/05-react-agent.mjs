export default {
  id: 'react-agent',
  name: 'ReAct / Agent',
  short: 'ReAct',
  emoji: '🔁',
  blurb: 'Vòng lặp Thought–Action–Observation và kiến trúc Supervisor / Worker.',
  questions: [
    {
      id: 31,
      q: 'ReAct pattern gồm những bước nào?',
      type: 'concept',
      diff: 1,
      answer: `**ReAct = Reasoning + Acting**: model **xen kẽ suy luận và hành động** trong một **vòng lặp**, thay vì suy luận một lần rồi trả lời.

**Chu trình:**
\`\`\`
Thought  → Action → Observation ─┐
   ↑                             │
   └─────── lặp lại ─────────────┘
                ↓ (khi đủ thông tin)
          Final Answer
\`\`\`

1. **Thought** — model tự phân tích: mình đang thiếu gì, bước tiếp theo nên làm gì.
2. **Action** — chọn một tool + tham số (\`search_web("tỷ giá USD VND")\`).
3. **Observation** — kết quả tool trả về, được **đưa ngược vào ngữ cảnh**.
4. **Lặp lại** Thought → Action → Observation cho tới khi đủ thông tin.
5. **Final Answer** — tổng hợp toàn bộ observation thành câu trả lời cho người dùng.

**Ba đặc điểm bắt buộc, thiếu một là không còn ReAct:**
- **Có vòng lặp** (nhiều bước, không phải một lần gọi).
- **Có tool thật** được thực thi (không phải model tưởng tượng kết quả).
- **Observation được đưa trở lại ngữ cảnh** để chi phối bước suy luận kế tiếp.

Kèm theo là **điều kiện dừng**: \`max_steps\`, timeout, hoặc khi model phát tín hiệu \`Final Answer\`.`,
      points: [
        { id: 'p1', w: 3, text: 'Nêu đúng chu trình Thought → Action → Observation, lặp lại, kết thúc bằng Final Answer' },
        { id: 'p2', w: 3, text: 'Nhấn mạnh đây là VÒNG LẶP, không phải chuỗi tuyến tính một lần' },
        { id: 'p3', w: 2, text: 'Observation (kết quả tool) được đưa ngược vào ngữ cảnh để chi phối bước suy luận tiếp theo' },
        { id: 'p4', w: 1, text: 'Nêu điều kiện dừng: có Final Answer hoặc chạm max_steps/timeout' },
      ],
      why: 'ReAct là khung xương của mọi agent hiện đại. Không nắm chu trình thì không debug được agent khi nó lặp vô tận hoặc bỏ qua tool.',
      traps: ['Kể đủ ba từ nhưng quên chữ "lặp" — đây là điểm bị trừ nhiều nhất.'],
      hook: 'Nghĩ → Làm → Nhìn → Nghĩ tiếp… đúng như cách con người dò đường.',
      related: [36, 37, 44],
    },
    {
      id: 32,
      q: 'Thought trong ReAct là gì?',
      type: 'concept',
      diff: 1,
      answer: `**Thought** là bước **suy luận nội bộ** của model trước khi hành động: nó tự trả lời "mình đang có gì, còn thiếu gì, bước tiếp theo nên làm gì và vì sao".

**Vai trò:**
- **Lập kế hoạch từng bước** thay vì đoán ngay đáp án ⇒ giảm lỗi ở bài toán nhiều bước.
- **Quyết định có cần tool không**, và nếu cần thì tool nào, tham số nào.
- **Diễn giải Observation** vừa nhận và quyết định đã đủ để kết luận chưa.
- **Là dấu vết để debug**: đọc chuỗi Thought là cách nhanh nhất để hiểu vì sao agent đi sai hướng.

**Ví dụ:**
> *Thought: Người dùng hỏi 100 USD bằng bao nhiêu VND. Mình không biết tỷ giá hôm nay và tỷ giá thay đổi hằng ngày, nên phải tra bằng tool thay vì dùng trí nhớ. Mình sẽ gọi get_exchange_rate(USD, VND).*

**Lưu ý production:** Thought là **nội bộ**, không hiển thị cho người dùng cuối (có thể chứa suy đoán chưa kiểm chứng), nhưng **phải được log** để trace. Đừng nhầm Thought với câu trả lời.`,
      points: [
        { id: 'p1', w: 3, text: 'Là bước suy luận/lập kế hoạch nội bộ của model trước khi hành động' },
        { id: 'p2', w: 2, text: 'Nội dung: đang thiếu gì, bước tiếp theo là gì, có cần tool không và tool nào' },
        { id: 'p3', w: 2, text: 'Cũng là nơi diễn giải Observation vừa nhận để quyết định tiếp tục hay kết luận' },
        { id: 'p4', w: 1, text: 'Là dấu vết để debug/trace; không phải nội dung trả cho người dùng' },
      ],
      why: 'Thought chính là thứ biến LLM từ "máy trả lời phản xạ" thành "tác nhân có kế hoạch" — và là log quý nhất khi agent hành xử lạ.',
      traps: ['Mô tả Thought như câu trả lời sơ bộ cho người dùng.'],
      hook: 'Thought = độc thoại nội tâm.',
      related: [31, 33],
    },
    {
      id: 33,
      q: 'Action trong ReAct là gì?',
      type: 'concept',
      diff: 1,
      answer: `**Action** là **hành động cụ thể agent quyết định thực hiện**: chọn **một tool** và **tham số** để gọi nó.

- Dạng chuẩn hóa: \`tool_name(arguments)\` — trong API hiện đại chính là một **tool_use block** với tên tool và JSON arguments đã theo schema.
- Ví dụ: \`get_exchange_rate({"from": "USD", "to": "VND"})\`, \`search_kb({"query": "chính sách hoàn tiền", "top_k": 5})\`.
- Action là **cầu nối giữa model và thế giới thật**: gọi API, truy vấn DB, tính toán, đọc file, gửi email.

**Nguyên tắc thiết kế Action trong production:**
- Tool phải có **schema chặt** (JSON Schema, strict) ⇒ tham số hợp lệ mới chạy.
- **Phân quyền theo hành động**: tool chỉ đọc thì tự do; tool ghi/hoàn tiền/xóa phải có xác nhận hoặc quyền riêng.
- **Idempotency** cho action ghi (tránh gọi hai lần khi retry).
- Tool phải **trả lỗi có cấu trúc** thay vì ném exception làm chết vòng lặp.
- Action còn có một dạng đặc biệt: **kết thúc** — model phát tín hiệu \`Final Answer\` thay vì gọi tool.`,
      points: [
        { id: 'p1', w: 3, text: 'Là hành động cụ thể: chọn tool và tham số để gọi (tool_name + arguments)' },
        { id: 'p2', w: 2, text: 'Là cầu nối giữa model và thế giới bên ngoài: API, database, tính toán, file' },
        { id: 'p3', w: 2, text: 'Cần schema/định dạng chuẩn để hệ thống parse và thực thi được' },
        { id: 'p4', w: 1, text: 'Nêu lưu ý production: phân quyền, xử lý lỗi có cấu trúc, hoặc action đặc biệt là kết thúc bằng Final Answer' },
      ],
      why: 'Action là nơi agent chạm vào hệ thống thật — cũng là nơi mọi rủi ro an toàn tập trung. Thiết kế tool cẩu thả là lỗ hổng lớn nhất của agent.',
      traps: ['Mô tả Action như "model nghĩ ra câu trả lời" — không, Action là lời gọi tool.'],
      hook: 'Action = bàn tay. Thought = bộ não. Observation = con mắt.',
      related: [31, 39],
    },
    {
      id: 34,
      q: 'Observation trong ReAct là gì?',
      type: 'concept',
      diff: 1,
      answer: `**Observation** là **kết quả trả về sau khi thực thi Action** — dữ liệu thật từ thế giới bên ngoài, được **đưa ngược vào ngữ cảnh** của agent.

- Ví dụ: \`Observation: {"rate": 25430, "base": "USD", "quote": "VND", "as_of": "2026-09-04"}\`.
- Observation **cũng bao gồm lỗi**: \`{"error": "timeout after 5s"}\`, \`{"error": "not_found"}\`. Lỗi là thông tin hợp lệ — nhờ nó agent mới biết để thử cách khác thay vì đứng im.

**Vai trò:** đây là **thông tin mới duy nhất** đi vào vòng lặp. Không có Observation thì Thought tiếp theo chỉ là suy đoán trên chính nó ⇒ vòng lặp vô nghĩa.

**Nguyên tắc production:**
- **Rút gọn trước khi đưa vào context**: tool trả 10.000 dòng JSON thì phải tóm/cắt, nếu không context phình và tiền tăng theo mỗi bước.
- **Đánh dấu rõ nguồn**: observation là *dữ liệu*, không phải *mệnh lệnh*. Nội dung từ web/tool có thể chứa prompt injection ⇒ phải bọc và không cho phép nó ghi đè system prompt.
- **Log đầy đủ** để trace lại được toàn bộ chuỗi ra quyết định.`,
      points: [
        { id: 'p1', w: 3, text: 'Là kết quả trả về sau khi thực thi tool (dữ liệu thật từ bên ngoài)' },
        { id: 'p2', w: 3, text: 'Được đưa ngược vào ngữ cảnh để agent suy luận tiếp — thông tin mới duy nhất của vòng lặp' },
        { id: 'p3', w: 2, text: 'Bao gồm cả trường hợp lỗi/timeout — agent cần biết để thử hướng khác' },
        { id: 'p4', w: 1, text: 'Lưu ý production: rút gọn trước khi đưa vào context, coi là dữ liệu chứ không phải mệnh lệnh (prompt injection), log lại' },
      ],
      why: 'Observation là chỗ agent tiếp xúc với dữ liệu không tin cậy. Hiểu nó là "dữ liệu, không phải lệnh" là nguyên tắc an toàn cốt lõi.',
      traps: ['Chỉ nói "kết quả tool" mà quên phần "được đưa lại vào context".'],
      hook: 'Observation = con mắt nhìn thấy kết quả việc mình vừa làm.',
      related: [31, 35, 46],
    },
    {
      id: 35,
      q: 'Tool result được đưa trở lại đâu để agent xử lý tiếp?',
      type: 'concept',
      diff: 1,
      answer: `Đưa trở lại **ngữ cảnh hội thoại (context / messages) của agent**, dưới dạng **Observation**, rồi **gọi LLM lại** để sinh Thought tiếp theo.

Cụ thể trong code:
\`\`\`python
messages.append(assistant_message)          # Thought + Action (tool_use)
messages.append({                            # Observation
    "role": "user",
    "content": [{
        "type": "tool_result",
        "tool_use_id": tool_use.id,
        "content": json.dumps(result)
    }]
})
response = llm.call(messages, tools=tools)   # vòng lặp tiếp
\`\`\`

**Ba điểm bắt buộc:**
1. **Phải nối đúng \`tool_use_id\`** để model biết kết quả này thuộc lời gọi nào (nhất là khi gọi song song nhiều tool).
2. **Cả lời gọi tool lẫn kết quả đều phải nằm trong messages.** Thiếu lời gọi ⇒ lịch sử không hợp lệ; thiếu kết quả ⇒ model gọi lại tool y hệt, lặp vô tận.
3. **Nếu gọi song song nhiều tool thì trả tất cả tool_result trong MỘT message**, không tách ra nhiều message.

Chính vì tool result quay lại ngữ cảnh nên **mỗi bước lặp lại tốn token cho toàn bộ lịch sử** — đây là lý do agent nhiều bước đắt lên rất nhanh, và là lý do phải rút gọn observation.`,
      points: [
        { id: 'p1', w: 3, text: 'Đưa trở lại vào context/messages (lịch sử hội thoại) của agent dưới dạng Observation/tool_result' },
        { id: 'p2', w: 3, text: 'Sau đó gọi LLM lại với lịch sử mới để sinh bước Thought/Action tiếp theo' },
        { id: 'p3', w: 2, text: 'Phải giữ liên kết đúng (tool_use_id) và append cả lời gọi tool lẫn kết quả' },
        { id: 'p4', w: 1, text: 'Hệ quả: context lớn dần theo mỗi vòng lặp ⇒ tốn token, cần rút gọn/giới hạn' },
      ],
      why: 'Đây là cơ chế duy nhất giúp agent "nhớ" việc nó vừa làm. Quên append là bug số một khiến agent lặp vô hạn.',
      traps: ['Trả lời "đưa cho người dùng" hoặc "lưu vào database" — sai đích đến.'],
      hook: 'Tool result về lại hộp thư messages, rồi mới gọi LLM lần nữa.',
      related: [34, 49],
    },
    {
      id: 36,
      q: 'Một code chỉ gọi LLM một lần rồi `return response` có phải ReAct Agent không? Vì sao?',
      type: 'judgment',
      diff: 2,
      answer: `**Không.** Đó là một **LLM call đơn thuần** (single-shot completion), không phải ReAct Agent.

**Thiếu ba yếu tố bắt buộc:**
1. **Không có vòng lặp.** ReAct là \`while\`: suy luận → hành động → quan sát → suy luận lại. Gọi một lần rồi return là đường thẳng, không có cơ hội sửa hướng.
2. **Không thực thi tool.** Nếu model có "nói" rằng nó gọi tool, thì đó chỉ là văn bản; **không ai chạy tool đó**, kết quả là do model tưởng tượng ⇒ dữ liệu bịa.
3. **Không có Observation quay lại context.** Không có thông tin mới nào từ thế giới thật đi vào, nên không có gì để suy luận tiếp.

**Thiếu thêm những thứ của một agent thật:** không có điều kiện dừng (\`max_steps\`), không phát hiện \`Final Answer\`, không xử lý lỗi tool, không trace từng bước.

**Sửa thành ReAct tối thiểu:**
\`\`\`python
for step in range(MAX_STEPS):
    resp = llm.call(messages, tools=TOOLS)
    messages.append(resp)
    if resp.stop_reason != "tool_use":
        return resp.text                      # Final Answer
    results = [run_tool(tc) for tc in resp.tool_calls]
    messages.append(tool_results_message(results))   # Observation
raise MaxStepsExceeded()
\`\`\``,
      points: [
        { id: 'p1', w: 3, text: 'Trả lời dứt khoát: KHÔNG phải ReAct agent, chỉ là một lời gọi LLM đơn thuần' },
        { id: 'p2', w: 3, text: 'Lý do chính: không có vòng lặp Thought–Action–Observation' },
        { id: 'p3', w: 2, text: 'Không thực sự thực thi tool và không đưa kết quả tool trở lại context (nếu có nhắc tool thì cũng chỉ là văn bản model bịa)' },
        { id: 'p4', w: 2, text: 'Nêu thiếu sót khác (không có max_steps / không phát hiện Final Answer / không xử lý lỗi) hoặc phác được cách sửa thành vòng lặp' },
      ],
      why: 'Rất nhiều "AI Agent" trong thực tế chỉ là một prompt gọi một lần. Nhận ra khác biệt này là ranh giới giữa hiểu khái niệm và dùng buzzword.',
      traps: ['Trả lời "có, vì nó dùng LLM và có prompt ReAct" — prompt có chữ ReAct không tạo ra vòng lặp.'],
      hook: 'Không có while ⇒ không có agent.',
      related: [31, 37, 47],
    },
    {
      id: 37,
      q: 'Tại sao ReAct cần loop?',
      type: 'concept',
      diff: 2,
      answer: `Vì **một lượt suy luận không đủ để giải bài toán nhiều bước**, và vì **thông tin mới chỉ xuất hiện sau khi hành động**.

**Bốn lý do:**
1. **Phụ thuộc tuần tự.** Bước sau cần kết quả của bước trước: phải biết \`order_id\` mới tra được đơn; phải có tỷ giá mới nhân được. Không lặp thì không có cách nào chuyền kết quả.
2. **Không biết trước cần bao nhiêu bước.** Câu "đơn của tôi đâu?" có thể cần 1 tool, cũng có thể cần 4 (tra khách → tra đơn → tra vận chuyển → tra chính sách). Vòng lặp cho phép số bước **thích ứng theo bài toán**.
3. **Sửa sai giữa chừng.** Tool lỗi/timeout/không tìm thấy ⇒ Observation báo lỗi ⇒ agent đổi chiến lược (thử tool khác, đổi tham số, hỏi lại người dùng). Không lặp thì lỗi đầu tiên là kết thúc.
4. **Grounding.** Mỗi vòng bơm dữ liệu thật vào context, kéo model rời khỏi phỏng đoán nội tại ⇒ giảm hallucination.

**Cái giá của loop (phải nói ra mới đủ):** mỗi vòng là một lời gọi LLM với toàn bộ lịch sử ⇒ **chi phí và latency tăng gần tuyến tính theo số bước**. Vì thế loop luôn phải đi kèm \`max_steps\`, timeout tổng, và cơ chế rút gọn context.`,
      points: [
        { id: 'p1', w: 3, text: 'Bài toán nhiều bước có phụ thuộc tuần tự: bước sau cần kết quả bước trước' },
        { id: 'p2', w: 3, text: 'Không biết trước cần bao nhiêu bước / tool nào ⇒ số bước phải thích ứng động' },
        { id: 'p3', w: 2, text: 'Cho phép phản ứng với lỗi và tự sửa hướng giữa chừng' },
        { id: 'p4', w: 2, text: 'Nêu cái giá: mỗi vòng tốn thêm token và latency ⇒ bắt buộc có max_steps/timeout' },
      ],
      why: 'Hiểu vì sao cần loop cũng chính là hiểu vì sao agent đắt. Đây là nền cho quyết định "khi nào dùng agent, khi nào dùng workflow cứng".',
      traps: ['Chỉ nói "để làm nhiều việc" mà không nêu phụ thuộc tuần tự và khả năng sửa sai.'],
      hook: 'Không lặp thì agent chỉ đoán được một lần rồi thôi.',
      related: [31, 38, 118],
    },
    {
      id: 38,
      q: 'Tại sao cần `max_steps` cho agent?',
      type: 'concept',
      diff: 1,
      answer: `\`max_steps\` là **cầu chì an toàn** cho vòng lặp ReAct.

**Nó chặn năm rủi ro:**
1. **Vòng lặp vô hạn.** Agent kẹt trong chu kỳ lặp lại: gọi cùng một tool, nhận cùng một lỗi, thử lại mãi. Không có trần thì nó chạy đến khi hết tiền hoặc hết quota.
2. **Chi phí không kiểm soát.** Mỗi bước = một lời gọi LLM với toàn bộ lịch sử (ngày càng dài) ⇒ chi phí tăng **siêu tuyến tính**. Một agent kẹt có thể đốt hàng triệu token trong vài phút.
3. **Latency không kiểm soát.** Request treo, người dùng chờ vô tận, connection pool cạn.
4. **Tràn context window.** Lịch sử phình đến khi vượt cửa sổ ⇒ lỗi hoặc mất thông tin đầu.
5. **Tác dụng phụ lặp lại.** Với tool ghi (gửi email, tạo ticket, hoàn tiền), lặp vô hạn nghĩa là **hành động thật bị lặp nhiều lần**.

**Thiết kế đúng:** \`max_steps\` thường 5–10 cho agent hỗ trợ khách hàng; kèm theo **timeout tổng**, **trần chi phí/token cho một phiên**, và **hành vi khi chạm trần**: không im lặng thất bại mà trả lời trung thực ("tôi chưa tra được, đang chuyển bạn cho nhân viên"), đồng thời **log và cảnh báo** vì chạm trần thường xuyên là dấu hiệu tool hoặc prompt có vấn đề.`,
      points: [
        { id: 'p1', w: 3, text: 'Ngăn vòng lặp vô hạn khi agent bị kẹt / lặp lại cùng một hành động' },
        { id: 'p2', w: 3, text: 'Kiểm soát chi phí token và latency (mỗi bước là một lời gọi LLM với lịch sử ngày càng dài)' },
        { id: 'p3', w: 2, text: 'Tránh tràn context window và tránh lặp lại tác dụng phụ của tool ghi' },
        { id: 'p4', w: 2, text: 'Nêu hành vi khi chạm trần: trả lời/escalate tử tế, log + alert vì đó là tín hiệu bất thường' },
      ],
      why: 'Đây là câu hỏi an toàn vận hành. Một agent không có trần bước là một hóa đơn không có trần.',
      traps: ['Chỉ nói "tránh lặp vô hạn" mà quên chi phí, context và tác dụng phụ; quên nói làm gì khi chạm trần.'],
      hook: 'max_steps = cầu chì. Cháy cầu chì còn hơn cháy nhà.',
      related: [37, 55],
    },
    {
      id: 39,
      q: 'Khi nào agent cần gọi tool?',
      type: 'concept',
      diff: 2,
      answer: `Khi **thông tin hoặc khả năng cần thiết không nằm trong model**. Cụ thể:

1. **Dữ liệu thời gian thực / hay thay đổi**: tỷ giá, thời tiết, tồn kho, trạng thái đơn hàng, giá cổ phiếu.
2. **Dữ liệu riêng của tổ chức**: hồ sơ khách hàng, chính sách nội bộ, lịch sử ticket ⇒ tra DB hoặc RAG.
3. **Tính toán chính xác**: số học, tài chính, ngày tháng. LLM sinh token, **không tính toán đáng tin** ⇒ dùng calculator/code.
4. **Hành động thay đổi trạng thái thế giới**: tạo ticket, gửi email, đặt lịch, hoàn tiền, cập nhật hồ sơ.
5. **Kiến thức sau cutoff hoặc ngoài phạm vi huấn luyện**: sự kiện mới, tài liệu nội bộ.
6. **Việc cần đảm bảo đúng tuyệt đối** và có nguồn kiểm chứng được (trích dẫn).

**Khi KHÔNG cần gọi tool:** kiến thức chung ổn định, định nghĩa khái niệm, viết lại/tóm tắt nội dung người dùng đã đưa, chào hỏi, hoặc thông tin đã có sẵn trong ngữ cảnh (gọi lại chỉ tốn tiền và thời gian).

**Quyết định này được thực hiện ở bước Thought**, dựa trên: mô tả tool có rõ ràng không, prompt có hướng dẫn "khi nào dùng tool nào" không, và có ràng buộc "không được đoán dữ liệu thời gian thực" không. Trong production, chất lượng của **mô tả tool** ảnh hưởng đến quyết định gọi tool nhiều hơn cả model.`,
      points: [
        { id: 'p1', w: 3, text: 'Khi cần dữ liệu model không có: thời gian thực, dữ liệu riêng của tổ chức, sau cutoff' },
        { id: 'p2', w: 2, text: 'Khi cần tính toán chính xác (LLM tính số không đáng tin) hoặc cần độ chính xác kiểm chứng được' },
        { id: 'p3', w: 2, text: 'Khi cần thực hiện hành động thay đổi trạng thái bên ngoài (tạo ticket, gửi mail, hoàn tiền)' },
        { id: 'p4', w: 2, text: 'Nêu khi KHÔNG cần gọi tool (kiến thức chung, thông tin đã có trong context) và việc này được quyết định ở bước Thought dựa vào mô tả tool/prompt' },
      ],
      why: 'Gọi tool thừa thì chậm và đắt; gọi thiếu thì bịa. Ranh giới này quyết định cả chi phí lẫn độ tin cậy của agent.',
      traps: ['Nói "luôn gọi tool cho chắc" — làm latency và chi phí tăng vô ích.'],
      hook: 'Model biết cách nói, tool biết sự thật.',
      related: [33, 45],
    },
    {
      id: 40,
      q: 'Supervisor Agent có nhiệm vụ gì?',
      type: 'concept',
      diff: 2,
      answer: `**Supervisor (orchestrator)** là agent **điều phối**, không trực tiếp làm việc chuyên môn.

**Nhiệm vụ:**
1. **Hiểu và phân rã yêu cầu** thành các nhiệm vụ con.
2. **Định tuyến**: chọn worker phù hợp cho từng nhiệm vụ (routing).
3. **Điều phối thứ tự**: cái nào chạy song song, cái nào phải chờ kết quả cái trước.
4. **Tổng hợp kết quả** từ các worker thành một đầu ra thống nhất, xử lý mâu thuẫn giữa các worker.
5. **Kiểm soát vòng đời**: retry worker lỗi, timeout, fallback, quyết định khi nào dừng.
6. **Giữ ngữ cảnh chung và trạng thái phiên**; quyết định thông tin nào cần chia sẻ cho worker nào (không nên đổ toàn bộ context cho mọi worker).
7. **Chốt guardrail cuối**: kiểm tra đầu ra tổng hợp trước khi trả cho người dùng.

**Điểm cần nhấn:** supervisor **không tự làm việc chuyên môn** — nó không tự phân tích sentiment, mà giao cho worker. Nó là "quản lý dự án", không phải "người thực thi".

**Rủi ro cần biết:** supervisor là **điểm nghẽn và điểm chết đơn lẻ** (single point of failure), và mỗi lớp điều phối cộng thêm latency + chi phí. Vì vậy chỉ dựng supervisor khi bài toán thật sự cần nhiều worker.`,
      points: [
        { id: 'p1', w: 3, text: 'Phân rã yêu cầu thành nhiệm vụ con và định tuyến cho worker phù hợp' },
        { id: 'p2', w: 3, text: 'Điều phối thứ tự/song song và tổng hợp kết quả từ các worker thành đầu ra cuối' },
        { id: 'p3', w: 2, text: 'Quản lý vòng đời: retry, timeout, fallback, quyết định dừng; giữ ngữ cảnh chung' },
        { id: 'p4', w: 2, text: 'Nhấn mạnh supervisor không trực tiếp làm chuyên môn; nêu rủi ro nghẽn cổ chai/latency tăng' },
      ],
      why: 'Kiến trúc multi-agent thất bại thường vì supervisor ôm việc hoặc vì không ai chịu trách nhiệm tổng hợp kết quả.',
      traps: ['Mô tả supervisor như một worker mạnh hơn.'],
      hook: 'Supervisor = quản lý dự án: chia việc, xếp lịch, gom báo cáo.',
      related: [41, 42, 43],
    },
    {
      id: 41,
      q: 'Worker Agent có nhiệm vụ gì?',
      type: 'concept',
      diff: 2,
      answer: `**Worker** là agent **chuyên trách một nhiệm vụ hẹp**, thực thi phần việc được supervisor giao và trả kết quả theo định dạng đã thống nhất.

**Đặc điểm:**
1. **Phạm vi hẹp, rõ ràng**: chỉ làm sentiment analysis, chỉ trích xuất topic, chỉ tra cứu đơn hàng.
2. **Bộ tool riêng, quyền riêng**: chỉ được truy cập đúng tool cần cho việc của mình (nguyên tắc least privilege).
3. **Prompt/model riêng, có thể tối ưu riêng**: worker đơn giản dùng model nhỏ và rẻ; worker cần lập luận dùng model mạnh. Đây là nguồn tiết kiệm chi phí lớn nhất của kiến trúc multi-agent.
4. **Đầu ra có Output Contract** để supervisor tổng hợp được bằng code, không phải đọc văn xuôi.
5. **Không tự ý gọi worker khác** (trong mô hình supervisor chuẩn) — mọi điều phối đi qua supervisor để tránh mạng lưới phụ thuộc rối và vòng lặp chéo.
6. **Có thể tự chạy vòng ReAct riêng** trong phạm vi việc của mình.

**Lợi ích:** context ngắn hơn ⇒ ít nhiễu, ít lỗi, rẻ hơn; dễ test riêng từng worker; dễ thay thế/nâng cấp độc lập.`,
      points: [
        { id: 'p1', w: 3, text: 'Chuyên trách một nhiệm vụ hẹp cụ thể do supervisor giao' },
        { id: 'p2', w: 2, text: 'Có bộ tool/quyền hạn riêng giới hạn theo đúng phần việc (least privilege)' },
        { id: 'p3', w: 2, text: 'Trả kết quả theo định dạng/contract thống nhất để supervisor tổng hợp' },
        { id: 'p4', w: 2, text: 'Có thể dùng model/prompt riêng tối ưu theo việc (worker đơn giản dùng model rẻ) và không tự điều phối worker khác' },
      ],
      why: 'Worker hẹp = context ngắn = ít lỗi và rẻ. Đây là lý do kỹ thuật chính khiến multi-agent đôi khi thắng single-agent.',
      traps: ['Mô tả worker như một agent tổng quát nhỏ hơn, không nói đến phạm vi hẹp và contract đầu ra.'],
      hook: 'Worker = chuyên viên: một việc, làm cho thật tốt.',
      related: [40, 42, 43],
    },
    {
      id: 42,
      q: 'Khi nào nên dùng Multi-agent thay vì Single-agent?',
      type: 'judgment',
      diff: 3,
      answer: `**Nguyên tắc: mặc định là single-agent. Chỉ tách multi-agent khi có lý do rõ ràng.**

**Nên dùng multi-agent khi:**
1. **Nhiệm vụ tách được thành các phần độc lập, khác biệt về bản chất** — ví dụ sentiment + trích xuất topic + viết báo cáo. Mỗi phần cần tư duy và tool khác nhau.
2. **Có phần chạy song song được** ⇒ giảm latency tổng thật sự.
3. **Số tool quá lớn** (>15–20): nhồi hết vào một agent làm nó chọn sai tool; chia theo nhóm cho từng worker giúp tỉ lệ chọn đúng tăng.
4. **Prompt trở nên quá dài và mâu thuẫn** vì phải mô tả nhiều vai trò trong một chỗ.
5. **Cần cách ly quyền hạn**: worker đọc dữ liệu khách hàng không nên có quyền hoàn tiền.
6. **Cần tối ưu chi phí theo việc**: dùng model rẻ cho phần đơn giản, model mạnh cho phần khó.
7. **Cần đội ngũ khác nhau sở hữu và triển khai độc lập** từng phần.

**Nên ở single-agent khi:** luồng tuyến tính đơn giản, ít tool, cần latency thấp, đội nhỏ, hoặc mới ở giai đoạn prototype.

**Cái giá của multi-agent (bắt buộc nêu):** thêm latency ở mỗi lớp điều phối; chi phí cao hơn (supervisor cũng tiêu token); debug khó hơn nhiều (phải trace xuyên nhiều agent); nguy cơ mất mát thông tin khi truyền giữa các agent; supervisor thành điểm chết đơn lẻ.

**Lộ trình khuyến nghị:** bắt đầu single-agent → đo xem hỏng ở đâu (chọn sai tool, prompt quá tải, latency) → chỉ tách đúng phần đang hỏng.`,
      points: [
        { id: 'p1', w: 3, text: 'Khi nhiệm vụ tách được thành các phần độc lập, khác biệt về chuyên môn/tool (và có thể chạy song song)' },
        { id: 'p2', w: 2, text: 'Khi số tool quá nhiều / prompt quá dài khiến single-agent chọn sai; hoặc cần cách ly quyền hạn, tối ưu model theo từng việc' },
        { id: 'p3', w: 3, text: 'Nêu cái giá: latency, chi phí, độ phức tạp debug, nguy cơ mất thông tin khi truyền giữa các agent' },
        { id: 'p4', w: 2, text: 'Nêu nguyên tắc mặc định dùng single-agent trước, chỉ tách khi đo được vấn đề cụ thể' },
      ],
      why: 'Multi-agent là quyết định kiến trúc đắt tiền. Câu trả lời hay phải cân cả hai phía, không chỉ ca ngợi.',
      traps: ['Chỉ liệt kê lợi ích mà không nói chi phí/độ phức tạp — đây là điểm phân biệt rõ nhất.'],
      hook: 'Chia việc khi một người làm không xuể, không phải khi nghe cho oai.',
      related: [40, 41, 118],
    },
    {
      id: 43,
      q: 'Cho use case: **phân tích customer feedback gồm sentiment analysis, extract topics và generate summary report**. Hãy thiết kế kiến trúc Supervisor + Worker.',
      type: 'design',
      diff: 3,
      answer: `**Kiến trúc:**
\`\`\`
                      ┌──────────────────────┐
   Feedback batch ──► │  SUPERVISOR AGENT    │
                      │  - validate & chuẩn  │
                      │    hóa input         │
                      │  - fan-out song song │
                      │  - gom & xử lý lỗi   │
                      └───────┬──────────────┘
              ┌───────────────┼───────────────┐
              ▼ (song song)   ▼ (song song)   │
      ┌───────────────┐ ┌───────────────┐     │
      │ W1: SENTIMENT │ │ W2: TOPIC     │     │
      │ label + score │ │ EXTRACTION    │     │
      │ model rẻ      │ │ + clustering  │     │
      └───────┬───────┘ └───────┬───────┘     │
              └────────┬────────┘             │
                       ▼                      │
              ┌───────────────────┐           │
              │ W3: REPORT WRITER │◄──────────┘
              │ (chờ W1 + W2)     │
              │ model mạnh        │
              └─────────┬─────────┘
                        ▼
              Báo cáo + số liệu + trích dẫn
\`\`\`

**Supervisor**: nhận batch feedback → validate, khử trùng lặp, ẩn PII → **fan-out W1 và W2 song song** (chúng độc lập) → chờ cả hai → ghép theo \`feedback_id\` → gọi **W3** (phụ thuộc, phải chạy sau) → kiểm tra chất lượng báo cáo → trả kết quả. Xử lý retry/timeout từng worker, và **degrade gracefully**: nếu W2 hỏng thì vẫn xuất báo cáo có sentiment kèm ghi chú thiếu phần topic.

**W1 — Sentiment**: model nhỏ/rẻ (hoặc classifier fine-tuned, không cần LLM). Output contract:
\`\`\`json
{ "feedback_id": "f_001", "sentiment": "negative", "score": -0.82, "confidence": 0.91 }
\`\`\`

**W2 — Topic extraction**: trích topic + khía cạnh, gom cụm bằng embedding, ánh xạ về **taxonomy cố định** (giao hàng / giá / chất lượng / CSKH / app…) thay vì để model tự bịa nhãn mới mỗi lần.
\`\`\`json
{ "feedback_id": "f_001", "topics": ["giao_hang_cham", "dong_goi"], "evidence": ["giao 5 ngày mới tới"] }
\`\`\`

**W3 — Report writer**: model mạnh, nhận **dữ liệu đã tổng hợp** (đếm, tỉ lệ, top topic theo sentiment, xu hướng theo thời gian) chứ không nhận toàn bộ feedback thô ⇒ tiết kiệm token và tránh lạc. Xuất: tóm tắt điều hành, top 5 vấn đề kèm số liệu, xu hướng, khuyến nghị hành động, **trích dẫn feedback_id** cho mỗi khẳng định.

**Vì sao multi-agent hợp ở đây:** W1/W2 độc lập ⇒ chạy song song thật; ba việc khác nhau về bản chất; chi phí tối ưu được theo từng worker; mỗi worker test riêng được.

**Bổ sung production:** xử lý theo batch (không gọi LLM cho từng feedback lẻ), idempotency theo \`feedback_id\`, cache theo hash nội dung, ngưỡng confidence để đưa ca khó cho người, và eval riêng cho từng worker (accuracy sentiment, độ phủ topic, chất lượng báo cáo).`,
      points: [
        { id: 'p1', w: 3, text: 'Supervisor: nhận input, phân rã và giao việc, điều phối, gom kết quả, xử lý lỗi/retry' },
        { id: 'p2', w: 3, text: 'Ba worker rõ vai: sentiment, topic extraction, report writer — mỗi worker có nhiệm vụ và output contract riêng' },
        { id: 'p3', w: 3, text: 'Chỉ ra W1 và W2 chạy song song vì độc lập, còn W3 phải chờ kết quả của cả hai' },
        { id: 'p4', w: 2, text: 'Nêu tối ưu/vận hành: model rẻ cho việc đơn giản và model mạnh cho báo cáo, taxonomy topic cố định, batch, xử lý lỗi/degrade, eval từng worker' },
      ],
      why: 'Đây là dạng câu thiết kế hay gặp nhất. Điểm ăn nhau nằm ở chỗ nhận ra quan hệ phụ thuộc (song song vs tuần tự) và ở phần vận hành, không phải ở việc vẽ ba cái hộp.',
      traps: [
        'Cho cả ba worker chạy tuần tự dù W1, W2 độc lập.',
        'Đưa toàn bộ feedback thô cho worker viết báo cáo thay vì đưa dữ liệu đã tổng hợp.',
        'Để W2 tự sinh nhãn topic tự do ⇒ mỗi lần chạy ra một bộ nhãn khác nhau, không so sánh được theo thời gian.',
      ],
      hook: 'Hai việc độc lập chạy song song, việc tổng hợp luôn đứng cuối.',
      related: [40, 41, 42],
    },
  ],
};
