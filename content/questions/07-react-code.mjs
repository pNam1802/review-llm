export default {
  id: 'react-code',
  name: 'ReAct Code',
  short: 'Code',
  emoji: '💻',
  blurb: 'Viết và soi code vòng lặp agent: lỗi thiết kế, pseudocode, append, điều kiện dừng.',
  questions: [
    {
      id: 47,
      q: 'Cho đoạn code agent chỉ gọi LLM một lần. Hãy chỉ ra các lỗi trong thiết kế ReAct.',
      type: 'code',
      diff: 3,
      answer: `Đoạn code điển hình bị hỏi:
\`\`\`python
def agent(query):
    response = llm.call(f"Bạn là agent. Hãy dùng tool nếu cần.\\n{query}")
    return response          # ❌ hết
\`\`\`

**Các lỗi thiết kế:**

1. **Không có vòng lặp.** Chỉ một lần gọi ⇒ không có Thought → Action → Observation → Thought. Không thể giải bài toán nhiều bước.
2. **Không thực thi tool.** Không có \`tools=\` truyền vào, không parse tool call, không có hàm nào chạy tool ⇒ nếu model "nói" nó gọi tool thì đó là **văn bản bịa**, kết quả tool là do model tưởng tượng.
3. **Không có Observation quay lại context.** Không có gì để suy luận tiếp; vòng đời agent kết thúc ngay khi bắt đầu.
4. **Không quản lý \`messages\`.** Không tích lũy lịch sử ⇒ mất trạng thái giữa các bước (và cũng chẳng có bước nào).
5. **Không có điều kiện dừng rõ ràng.** Không kiểm tra \`stop_reason\`/\`Final Answer\`, không có \`max_steps\`.
6. **Không xử lý lỗi tool** (timeout, tham số sai, tool không tồn tại) và không có retry/fallback.
7. **Không validate đầu ra.** Không có Output Contract, trả thẳng chuỗi thô cho caller.
8. **Không có timeout / trần chi phí / logging & trace** ⇒ không vận hành được, không debug được.
9. **Prompt yếu**: dặn "dùng tool nếu cần" nhưng không mô tả tool, không nêu định dạng Action, không nêu khi nào dừng.

**Sửa đúng — vòng lặp tối thiểu:**
\`\`\`python
def agent(query, max_steps=8):
    messages = [{"role": "user", "content": query}]
    for step in range(max_steps):
        resp = llm.call(messages, tools=TOOLS, system=SYSTEM_PROMPT)
        messages.append(resp)                       # nhớ Thought + Action
        if resp.stop_reason != "tool_use":
            return validate(resp.text)              # Final Answer
        results = []
        for call in resp.tool_calls:                # có thể song song
            try:
                results.append(ok(call, run_tool(call)))
            except Exception as e:
                results.append(err(call, str(e)))   # lỗi cũng là Observation
        messages.append(tool_results_message(results))
        log_step(step, resp, results)
    return "Tôi chưa tra được thông tin này, đang chuyển bạn cho nhân viên hỗ trợ."
\`\`\``,
      points: [
        { id: 'p1', w: 3, text: 'Lỗi lớn nhất: không có vòng lặp — chỉ gọi LLM một lần rồi return' },
        { id: 'p2', w: 3, text: 'Không thực sự thực thi tool và không đưa kết quả tool (Observation) trở lại messages/context' },
        { id: 'p3', w: 2, text: 'Không quản lý lịch sử messages, không có điều kiện dừng (Final Answer / stop_reason) và không có max_steps' },
        { id: 'p4', w: 2, text: 'Thiếu xử lý lỗi tool, validate output theo contract, timeout/logging/trace; hoặc phác được đoạn code sửa đúng' },
      ],
      why: 'Đây là bài "code review" cho agent. Nhìn ra 3 lỗi đầu là đạt; nhìn ra phần vận hành (lỗi, trace, trần) là mức production.',
      traps: ['Chỉ nói "thiếu loop" rồi dừng — mất điểm phần tool, observation và vận hành.'],
      hook: 'Soi theo thứ tự: loop → tool thật → observation quay lại → dừng ở đâu → lỗi thì sao.',
      related: [36, 48],
    },
    {
      id: 48,
      q: 'Hãy viết pseudocode cho một ReAct Agent có thể gọi `search_web`, `calculator` và `get_weather`.',
      type: 'code',
      diff: 3,
      answer: `\`\`\`python
TOOLS = {
    "search_web":  {"fn": search_web,  "schema": {...}, "desc": "Tìm thông tin trên internet. Dùng cho sự kiện mới, dữ liệu ngoài kiến thức."},
    "calculator":  {"fn": calculator,  "schema": {...}, "desc": "Tính biểu thức số học. Luôn dùng cho mọi phép tính."},
    "get_weather": {"fn": get_weather, "schema": {...}, "desc": "Thời tiết hiện tại/dự báo theo thành phố."},
}

SYSTEM = """Bạn là trợ lý dùng vòng lặp ReAct.
Mỗi bước: nêu Thought ngắn, rồi hoặc gọi MỘT tool, hoặc trả lời cuối cùng.
Quy tắc: không đoán dữ liệu thời gian thực; mọi phép tính đều qua calculator;
khi đã đủ thông tin, trả lời bắt đầu bằng 'Final Answer:'.
Nếu tool lỗi 2 lần liên tiếp, hãy nói rõ là chưa tra được."""

def react_agent(user_query, max_steps=8, timeout_s=30):
    messages = [{"role": "user", "content": user_query}]
    started  = now()

    for step in range(max_steps):
        if now() - started > timeout_s:
            return "Xin lỗi, yêu cầu mất quá nhiều thời gian."

        response = llm.call(system=SYSTEM, messages=messages,
                            tools=[t["schema"] for t in TOOLS.values()],
                            temperature=0)
        messages.append(response)                       # ⬅ luôn append

        # --- điều kiện dừng ---
        if response.stop_reason != "tool_use":
            text = response.text
            return text.replace("Final Answer:", "").strip()

        # --- thực thi các Action (có thể song song) ---
        observations = []
        for call in response.tool_calls:
            tool = TOOLS.get(call.name)
            if tool is None:
                observations.append(error_result(call.id, f"Không có tool '{call.name}'"))
                continue
            try:
                result = with_retry(tool["fn"], call.arguments, retries=1, timeout=5)
                observations.append(ok_result(call.id, truncate(result, 2000)))
            except TimeoutError:
                observations.append(error_result(call.id, "timeout sau 5s"))
            except Exception as e:
                observations.append(error_result(call.id, str(e)))

        # --- Observation quay lại context (TẤT CẢ trong MỘT message) ---
        messages.append({"role": "user", "content": observations})
        log_trace(step, response, observations)

    return "Tôi chưa hoàn tất được yêu cầu, đang chuyển cho nhân viên hỗ trợ."
\`\`\`

**Những điểm chấm điểm nằm ở:** vòng lặp có trần; append cả response lẫn observation; điều kiện dừng rõ ràng; lỗi tool trở thành observation chứ không làm sập vòng lặp; mô tả tool rõ để model chọn đúng; truncate kết quả tool; timeout tổng; log trace từng bước.`,
      points: [
        { id: 'p1', w: 3, text: 'Có vòng lặp with max_steps, mỗi vòng gọi LLM với messages + danh sách tool' },
        { id: 'p2', w: 3, text: 'Parse/nhận tool call, dispatch đúng tool theo tên (search_web / calculator / get_weather) và thực thi thật' },
        { id: 'p3', w: 3, text: 'Append cả phản hồi của LLM lẫn kết quả tool (observation) vào messages trước khi lặp tiếp' },
        { id: 'p4', w: 2, text: 'Có điều kiện dừng (Final Answer / stop_reason) và xử lý lỗi tool, timeout, fallback khi hết số bước' },
      ],
      why: 'Viết được đoạn này nghĩa là bạn có thể tự dựng agent mà không cần framework — và hiểu framework đang làm gì thay bạn.',
      traps: [
        'Quên append observation ⇒ agent gọi lại cùng một tool mãi.',
        'Để exception của tool văng ra ngoài vòng lặp ⇒ agent chết thay vì tự sửa.',
        'Không có nhánh trả về khi hết max_steps.',
      ],
      hook: 'Khung: for step → call → append → dừng? → chạy tool → append observation.',
      related: [47, 49, 50],
    },
    {
      id: 49,
      q: 'Trong code ReAct, tại sao cần `messages.append()` sau khi nhận response từ LLM?',
      type: 'code',
      diff: 2,
      answer: `Vì **LLM API không có trạng thái (stateless)**: mỗi lời gọi chỉ biết đúng những gì bạn gửi kèm trong \`messages\`. Không append thì bước sau **không biết bước trước đã xảy ra**.

**Cụ thể, append giữ lại:**
1. **Thought và Action vừa sinh ra.** Nếu thiếu, model không biết nó đã gọi tool nào ⇒ **gọi lại y hệt** ⇒ vòng lặp vô hạn (bug kinh điển).
2. **Tính hợp lệ của lịch sử hội thoại.** Một \`tool_result\` phải đi sau đúng \`tool_use\` tương ứng. Thiếu vế trước, API báo lỗi hoặc model hiểu sai.
3. **Chuỗi suy luận tích lũy.** Bước 3 cần dữ liệu bước 1 (tỷ giá) để nhân. Không có lịch sử thì không có gì để tổng hợp ở Final Answer.
4. **Trace để debug và eval.** \`messages\` chính là bản ghi đầy đủ của phiên làm việc.

**Phải append hai thứ ở mỗi vòng:**
\`\`\`python
messages.append(response)                     # assistant: Thought + tool_use
messages.append(tool_results_message(results)) # user: tool_result (Observation)
\`\`\`

**Hệ quả cần biết:** vì phải gửi lại toàn bộ lịch sử ở mỗi bước, **chi phí token tăng theo cấp số cộng dồn** (bước n phải trả tiền cho toàn bộ n-1 bước trước). Vì thế production cần: truncate kết quả tool, tóm tắt/nén lịch sử khi dài, và prompt caching cho phần đầu ổn định.`,
      points: [
        { id: 'p1', w: 3, text: 'LLM API là stateless: chỉ biết những gì được gửi trong messages, nên phải tự tích lũy lịch sử' },
        { id: 'p2', w: 3, text: 'Không append ⇒ model không biết đã gọi tool nào, gọi lặp lại y hệt ⇒ vòng lặp vô hạn / mất chuỗi suy luận' },
        { id: 'p3', w: 2, text: 'Phải append cả phản hồi assistant (tool_use) lẫn tool_result để lịch sử hợp lệ và ghép đúng cặp' },
        { id: 'p4', w: 1, text: 'Nêu hệ quả: context lớn dần, tốn token ⇒ cần truncate/nén/caching' },
      ],
      why: 'Đây là câu phân biệt người đã thực sự viết agent với người mới đọc lý thuyết — ai từng quên append đều nhớ đời.',
      traps: ['Trả lời "để lưu lịch sử chat cho người dùng xem" — sai mục đích, mục đích là để model suy luận tiếp.'],
      hook: 'LLM không có trí nhớ. messages CHÍNH LÀ trí nhớ.',
      related: [35, 48],
    },
    {
      id: 50,
      q: 'Nếu `response` bắt đầu bằng `Final Answer:` thì agent nên làm gì?',
      type: 'code',
      diff: 2,
      answer: `**Thoát khỏi vòng lặp và trả câu trả lời về cho người dùng** — đó là tín hiệu model báo "đã đủ thông tin, không cần tool nữa".

\`\`\`python
if response.text.strip().startswith("Final Answer:"):
    answer = response.text.split("Final Answer:", 1)[1].strip()
    log_trace(step, "final", answer)
    return validate(answer)     # kiểm tra Output Contract trước khi trả
\`\`\`

**Chuỗi việc cần làm, không chỉ mỗi \`break\`:**
1. **Break vòng lặp** — không gọi LLM thêm lần nào nữa (mỗi vòng thừa là tiền thừa).
2. **Bóc tách nội dung**: bỏ tiền tố \`Final Answer:\` để người dùng không thấy chi tiết nội bộ.
3. **Validate theo Output Contract** (đúng schema? có citation? có nói điều bị cấm không?).
4. **Guardrail đầu ra**: lọc PII, kiểm tra không hứa vượt quyền hạn.
5. **Log toàn bộ trace** + metric (số bước, tool đã dùng, tokens, latency) để eval và monitoring.
6. **Trả kết quả** cho caller/UI.

**Lưu ý thực tế quan trọng:** dựa vào chuỗi ký tự \`"Final Answer:"\` là cách của thời prompt-based ReAct và **mong manh** — model có thể viết thường, thêm dấu, hoặc quên hẳn. Trong API hiện đại, tín hiệu dừng chuẩn là **\`stop_reason\` khác \`"tool_use"\`** (tức model không gọi tool nữa). Nên dùng tín hiệu cấu trúc đó làm chính, và bắt chuỗi \`Final Answer:\` chỉ như một lớp dự phòng.`,
      points: [
        { id: 'p1', w: 3, text: 'Thoát/break khỏi vòng lặp ReAct, không gọi LLM hay tool thêm nữa' },
        { id: 'p2', w: 2, text: 'Bóc bỏ tiền tố "Final Answer:" và trả phần nội dung cho người dùng' },
        { id: 'p3', w: 2, text: 'Trước khi trả: validate theo output contract / guardrail và log trace, metric' },
        { id: 'p4', w: 2, text: 'Nêu rằng bắt chuỗi text là cách mong manh; tín hiệu dừng chuẩn là stop_reason khác tool_use' },
      ],
      why: 'Điều kiện dừng là nơi agent hoặc kết thúc gọn gàng, hoặc quay vòng đốt tiền. Ai cũng viết được vòng lặp; ít người viết đúng chỗ thoát.',
      traps: ['Chỉ nói "return response" mà bỏ qua validate, guardrail và log.'],
      hook: 'Thấy Final Answer ⇒ dừng, dọn, kiểm, ghi, trả.',
      related: [48, 9],
    },
  ],
};
