export default {
  id: 'selection-bias',
  name: 'Selection Bias',
  short: 'Bias',
  emoji: '🎯',
  blurb: 'Khi dữ liệu tự chọn người vào mẫu, mô hình học sai cả thế giới.',
  questions: [
    {
      id: 87,
      q: 'Một hệ thống lấy feedback từ web form chỉ khi khách báo lỗi, email chỉ khi khách escalate complaint và mobile app sau mỗi interaction. Model cho kết quả 65% negative trong khi CS survey cho thấy 78% khách hàng satisfied. Vấn đề có thể là gì?',
      type: 'judgment',
      diff: 3,
      answer: `**Vấn đề nằm ở dữ liệu, không phải ở model: đây là Selection Bias (cụ thể là self-selection / sampling bias) trong khâu thu thập feedback.**

**Phân tích từng kênh:**

| Kênh | Điều kiện để dữ liệu được sinh ra | Hệ quả |
|---|---|---|
| Web form | **chỉ khi khách báo lỗi** | 100% mẫu là trải nghiệm xấu |
| Email | **chỉ khi khách escalate khiếu nại** | Còn cực đoan hơn — nhóm bức xúc nhất |
| Mobile app | sau **mỗi** interaction | Kênh duy nhất tương đối cân bằng |

⇒ Hai trong ba kênh **chỉ mở cửa cho người không hài lòng**. Khách hàng hài lòng gần như **không có đường nào để xuất hiện** trong dữ liệu. Con số 65% negative vì thế không mô tả khách hàng — nó mô tả **cơ chế thu thập**.

**Vì sao 78% satisfied của CS survey không mâu thuẫn:** survey lấy mẫu theo cách khác (thường là ngẫu nhiên/toàn bộ, chủ động hỏi), nên nó gần với tổng thể hơn. Hai con số đo **hai quần thể khác nhau**, không phải hai kết quả trái ngược.

**Các thiên lệch chồng thêm:**
- **Non-response bias**: người hài lòng ít khi chủ động phản hồi (cảm xúc mạnh mới thúc đẩy người ta viết).
- **Channel bias**: mỗi kênh có nhóm người dùng và bối cảnh khác nhau (app dùng nhiều bởi khách trẻ, khiếu nại qua email thường là ca nặng).
- **Volume bias**: nếu gộp thô, kênh nào nhiều dữ liệu hơn sẽ áp đảo kết quả tổng.

**Hệ quả nếu không sửa:** model được huấn luyện/đánh giá trên dữ liệu này sẽ "học" rằng thế giới toàn tiêu cực; mọi báo cáo dựa trên nó đều lệch; và nếu dùng để ra quyết định (phân bổ nguồn lực, cảnh báo churn) thì quyết định cũng lệch theo.

**Điều cần nói rõ:** **model không sai — dữ liệu sai.** Đổi model, tăng dữ liệu, tinh chỉnh prompt đều không cứu được; phải sửa ở khâu **thiết kế thu thập**.`,
      points: [
        { id: 'p1', w: 4, text: 'Chỉ đúng tên vấn đề: Selection Bias / sampling bias trong khâu thu thập dữ liệu, không phải lỗi model' },
        { id: 'p2', w: 3, text: 'Chỉ ra cơ chế: web form và email chỉ ghi nhận khi có lỗi/khiếu nại nên mẫu gần như toàn trải nghiệm tiêu cực' },
        { id: 'p3', w: 2, text: 'Giải thích 65% negative không mâu thuẫn với 78% satisfied vì hai nguồn đo hai quần thể khác nhau (survey lấy mẫu đại diện hơn)' },
        { id: 'p4', w: 2, text: 'Nêu thiên lệch bổ sung (non-response bias, channel bias, chênh lệch khối lượng giữa kênh) và hệ quả với quyết định dựa trên dữ liệu này' },
      ],
      why: 'Đây là dạng lỗi nguy hiểm nhất trong AI vì nó không xuất hiện ở bất kỳ metric kỹ thuật nào — model vẫn chính xác trên tập dữ liệu của nó, chỉ có điều tập đó không phải thế giới thật.',
      traps: [
        'Kết luận "model bị bias/cần retrain" mà không chỉ ra nguồn gốc ở khâu thu thập.',
        'Cho rằng CS survey sai hoặc model sai — thực ra cả hai đều "đúng" trên quần thể của mình.',
      ],
      hook: 'Chỉ người bực mới gõ form ⇒ dữ liệu chỉ toàn người bực.',
      related: [88, 89],
    },
    {
      id: 88,
      q: 'Selection Bias trong trường hợp trên xuất hiện như thế nào?',
      type: 'concept',
      diff: 2,
      answer: `Nó xuất hiện **ngay ở điều kiện kích hoạt việc thu thập dữ liệu** — tức là mẫu không được chọn ngẫu nhiên từ tổng thể, mà **tự chọn theo một đặc điểm có tương quan trực tiếp với biến ta muốn đo (sự hài lòng)**.

**Chuỗi hình thành:**
\`\`\`
Tổng thể khách hàng (giả sử ~78% hài lòng)
        │
        ├─ Web form  ─── cổng vào: "khi khách báo lỗi"     → gần 100% tiêu cực
        ├─ Email     ─── cổng vào: "khi khách escalate"    → cực đoan tiêu cực
        └─ Mobile app ── cổng vào: "sau mỗi interaction"   → tương đối cân bằng
                                    │
                            Dữ liệu gộp lại → 65% negative
                                    │
                          Model học từ đây → tưởng thế giới tiêu cực
\`\`\`

**Ba tầng thiên lệch chồng lên nhau:**
1. **Self-selection (tự chọn):** người dùng tự quyết định có phản hồi hay không, và **cảm xúc tiêu cực mạnh thúc đẩy hành vi phản hồi mạnh hơn** cảm xúc hài lòng.
2. **Thiết kế cổng thu thập:** hai kênh chỉ tồn tại *trong ngữ cảnh sự cố* — về mặt cấu trúc, khách hài lòng **không thể** xuất hiện ở đó dù có muốn.
3. **Gộp mẫu không trọng số:** ba kênh có phân phối và khối lượng khác nhau nhưng bị cộng thẳng, nên kênh lệch nhất kéo kết quả tổng.

**Điểm cốt lõi:** đây là **survivorship/selection bias theo chiều ngược** — thứ không lọt vào mẫu (khách hài lòng, khách im lặng bỏ đi) mới là phần quyết định bức tranh thật. Và bias này **không thể phát hiện bằng cách nhìn vào dữ liệu đã thu**: bên trong tập dữ liệu, mọi thứ đều nhất quán và "đúng". Chỉ khi so với một nguồn độc lập (CS survey) mới lộ ra.`,
      points: [
        { id: 'p1', w: 3, text: 'Bias phát sinh ở điều kiện kích hoạt thu thập: mẫu tự chọn theo đặc điểm tương quan với chính biến cần đo' },
        { id: 'p2', w: 3, text: 'Self-selection: người không hài lòng có động lực phản hồi cao hơn nhiều so với người hài lòng' },
        { id: 'p3', w: 2, text: 'Cấu trúc kênh: hai trong ba kênh chỉ tồn tại trong ngữ cảnh sự cố nên khách hài lòng không có đường xuất hiện' },
        { id: 'p4', w: 2, text: 'Gộp dữ liệu từ các kênh có phân phối khác nhau mà không cân trọng số; và bias này không phát hiện được từ chính tập dữ liệu, phải so với nguồn độc lập' },
      ],
      why: 'Hiểu cơ chế hình thành bias mới sửa được tận gốc. Nếu chỉ biết tên gọi, bạn sẽ đi "cân bằng lại nhãn" — một cách chữa triệu chứng.',
      traps: ['Chỉ nói "dữ liệu bị lệch" mà không chỉ ra lệch phát sinh từ đâu trong quy trình.'],
      hook: 'Cổng vào quyết định ai có mặt trong dữ liệu.',
      related: [87, 89],
    },
    {
      id: 89,
      q: 'Làm thế nào để giảm Selection Bias trong dữ liệu feedback?',
      type: 'design',
      diff: 3,
      answer: `Sửa ở **khâu thu thập trước**, rồi mới đến **xử lý dữ liệu** và **cách diễn giải**.

**A. Sửa cơ chế thu thập (quan trọng nhất)**
1. **Lấy mẫu chủ động, ngẫu nhiên**: hỏi một tỉ lệ ngẫu nhiên khách hàng sau giao dịch (không chỉ khi có sự cố), bằng cùng một câu hỏi trên mọi kênh.
2. **Mở cổng phản hồi ở mọi trạng thái**, không chỉ ở luồng khiếu nại: thêm micro-survey trong app/website sau mọi interaction, không chỉ sau lỗi.
3. **Giảm ma sát** cho phản hồi tích cực: 1 chạm (👍/👎, 1–5 sao) thay vì bắt viết mô tả — chi phí phản hồi cao sẽ lọc mất người bình thường/hài lòng.
4. **Đa dạng hóa kênh** để phủ các nhóm người dùng khác nhau (app, web, SMS, gọi điện, POS), tránh chỉ nghe nhóm rành công nghệ.

**B. Xử lý dữ liệu**
5. **Gắn nhãn nguồn và ngữ cảnh** cho mỗi feedback (kênh, thời điểm, có sự cố hay không) ⇒ luôn có thể cắt lát và không gộp mù.
6. **Cân trọng số / stratified sampling** khi tổng hợp: điều chỉnh theo tỉ trọng thật của từng nhóm khách hàng, hoặc phân tích **riêng từng kênh** thay vì gộp một con số.
7. **Đối chiếu với nguồn độc lập**: CS survey, NPS, dữ liệu hành vi (tỉ lệ quay lại, churn, retention) — hành vi không bị self-selection như lời nói.
8. **Bổ sung tín hiệu ngầm (implicit)**: khách không phàn nàn nhưng vẫn mua tiếp là tín hiệu tích cực có thật, và nó có ở **toàn bộ** khách hàng.

**C. Cách dùng và diễn giải**
9. **Phát biểu đúng phạm vi**: "65% feedback nhận được là tiêu cực" ≠ "65% khách hàng không hài lòng". Ghi rõ giới hạn này trong mọi báo cáo.
10. **Với model**: dùng dữ liệu lệch để phát hiện *chủ đề vấn đề* (rất giá trị), **không** dùng để ước lượng *tỉ lệ hài lòng*. Nếu vẫn phải train, dùng reweighting/resampling và đánh giá trên tập nhãn đại diện được thu riêng.
11. **Giám sát liên tục**: so phân phối feedback với phân phối khách hàng thật theo thời gian để phát hiện lệch mới.

**Nguyên tắc gói gọn:** *không thể sửa selection bias bằng thuật toán nếu dữ liệu cần thiết chưa bao giờ được thu.*`,
      points: [
        { id: 'p1', w: 3, text: 'Sửa khâu thu thập: lấy mẫu ngẫu nhiên/chủ động sau mọi interaction, không chỉ khi có lỗi hoặc khiếu nại' },
        { id: 'p2', w: 3, text: 'Giảm ma sát phản hồi và đa dạng hóa kênh để phủ được nhóm khách hài lòng/im lặng' },
        { id: 'p3', w: 2, text: 'Xử lý dữ liệu: gắn nhãn nguồn, cân trọng số/stratified, phân tích riêng từng kênh thay vì gộp thô' },
        { id: 'p4', w: 3, text: 'Đối chiếu nguồn độc lập (survey, NPS, dữ liệu hành vi/churn), dùng tín hiệu ngầm, và diễn giải đúng phạm vi ("65% feedback" ≠ "65% khách hàng")' },
      ],
      why: 'Đây là câu hỏi phân biệt người làm data thật sự: hiểu rằng có những vấn đề không sửa được bằng model, chỉ sửa được bằng thiết kế thu thập.',
      traps: [
        'Chỉ đề xuất "thu thập thêm dữ liệu" — thêm dữ liệu lệch vẫn lệch.',
        'Chỉ nói "cân bằng lại nhãn khi train" — chữa triệu chứng, không chữa gốc.',
      ],
      hook: 'Không thuật toán nào cứu được dữ liệu chưa bao giờ được thu.',
      related: [87, 88, 81],
    },
  ],
};
