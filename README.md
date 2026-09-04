# Ôn tập AI Engineering — 120 câu

Hệ thống học chủ động cho trọn bộ 120 câu hỏi trong `question.md`: bạn **tự viết câu trả lời trước**, hệ thống **chấm theo từng ý trong rubric**, rồi **hẹn lịch ôn lại đúng lúc bạn sắp quên**.

Chạy hoàn toàn trên máy bạn. Dữ liệu học nằm ở `data/progress.json`.

---

## Chạy trong 30 giây

```bash
npm install      # cài SDK của OpenAI / Anthropic (chỉ cần cho việc chấm bài)
npm start        # mở http://localhost:5173
```

Không có API key vẫn học được đầy đủ — chỉ khác ở chỗ bạn tự chấm theo rubric thay vì để LLM chấm.

## Bật chấm tự luận bằng LLM

Câu tự luận không thể so khớp chữ: bạn viết khác đáp án mẫu nhưng **đúng ý** thì vẫn phải được điểm. Đó là việc của LLM.

Mở file `.env` (đã có sẵn) và điền key:

```
OPENAI_API_KEY=sk-...
GRADER_MODEL=          # để trống = tự chọn model tốt nhất mà key của bạn dùng được
```

Khởi động lại `npm start`. Góc trái dưới sẽ hiện “Chấm bài: OpenAI” kèm tên model.

Hệ thống hỗ trợ **cả OpenAI lẫn Anthropic**, tự nhận diện theo key có trong `.env`:

| Key trong `.env` | Nhà cung cấp được dùng |
|---|---|
| `OPENAI_API_KEY` | OpenAI |
| `ANTHROPIC_API_KEY` | Anthropic (Claude) |
| Cả hai | Cái nào ghi ở `LLM_PROVIDER`, mặc định OpenAI |

**Chọn model:** để `GRADER_MODEL` trống thì lúc chấm lần đầu hệ thống gọi `/v1/models`, xem key của bạn dùng được gì rồi chọn bản mạnh nhất (ưu tiên dòng gpt-5 → o-series → gpt-4.1 → gpt-4o). Muốn cố định hoặc muốn rẻ: `GRADER_MODEL=gpt-4o-mini`.

**Chi phí tham khảo:** mỗi lần chấm tốn khoảng 1.500–2.500 token vào + 400–900 token ra. Với `gpt-4o-mini` là vài trăm đồng cho cả trăm câu; với model đầu bảng thì khoảng 0,02–0,03 USD/câu (đi hết 120 câu ≈ 2–4 USD). Muốn tiết kiệm thì đặt model rẻ trong `.env` — chất lượng chấm rubric không chênh nhiều vì đã có rubric và đáp án mẫu làm mỏ neo.

Nếu chấm lỗi (sai key, hết quota, mất mạng), hệ thống **tự chuyển sang chấm nháp bằng từ khóa** và báo cho bạn — buổi học không bao giờ bị chặn.

---

## Luồng học một câu

```
1. Dự đoán      → "Bạn nghĩ mình nhớ tới đâu?"  (quên / mang máng / chắc chắn)
2. Nhớ lại      → tự viết câu trả lời, không nhìn đáp án
3. Chấm         → điểm 0–100 + đánh dấu TỪNG Ý: đủ / một phần / thiếu
4. Đối chiếu    → đáp án mẫu, vì sao quan trọng, bẫy thường gặp, neo trí nhớ
5. Đánh giá     → Quên / Khó / Được / Dễ → hệ thống hẹn lần ôn kế tiếp
```

Bạn có thể **bấm vào từng ý trong rubric để tự sửa đánh giá** — điểm được tính lại ngay. Máy chấm chỉ là gợi ý; người học mới là trọng tài cuối cùng.

## Luyện lại ý còn hụt

Dưới **80 điểm** (hoặc khi một ý bị hụt từ 2 lần trở lên) thì sau khi đánh giá sẽ có một bài luyện nhỏ ~30 giây.

Nguyên tắc: với câu tự luận dài, đích đến **không phải thuộc lòng** mà là dựng lại được **khung xương** — và khung đó chính là mảng `points` trong rubric. Nên bài luyện:

- **chỉ nhắm đúng ý bị hụt**, không bắt viết lại cả bài;
- **bớt giàn giáo dần** sau mỗi lần gặp lại cùng một ý:

  | Lần | Kiểu bài | Việc phải làm | Cần LLM |
  |---|---|---|---|
  | 1 | Nhận ra ý đúng | chọn ý đúng, lẫn giữa ý của câu khác cùng chủ đề | không |
  | 2 | Điền từ chịu lực | điền thuật ngữ bị che (`context`, `top-k`, `max_steps`…) | không |
  | 3 | Tự viết lại một ý | viết đủ ý đó bằng lời của bạn, 1–2 câu | có, ~500 token |
  | 4+ | Giảng lại cho người mới | giải thích 2 câu + một ví dụ của riêng bạn | có |

- **rải theo ba nhịp**: ngay sau khi chấm → cuối buổi (cách ~6 phút) → buổi sau. Chưa đạt thì gặp lại trong cùng buổi, đạt rồi mới được đẩy sang nhịp xa hơn;
- câu dài (từ 5 ý trở lên) mà hụt từ 2 ý sẽ có thêm bài **“dựng lại khung xương”**: gọi tên đủ N ý bằng 3–5 từ, chưa cần viết đầy đủ.

Hệ thống theo dõi **từng ý một** (`pointStats`), nên trang Tiến độ trả lời được câu hỏi hữu ích hơn điểm số: *bạn hay bỏ sót loại ý nào* — “cách khắc phục”, “đánh đổi/chi phí”, “phân biệt/ranh giới”… Đó là thói quen tư duy, sửa một lần thì đúng cho cả trăm câu.

### Các chế độ

| Chế độ | Dùng khi |
|---|---|
| **Ôn tập** (trang chủ) | Hằng ngày: gộp câu tới hạn + câu mới, trộn xen kẽ chủ đề |
| **Ôn theo chủ đề** | Bấm vào một chủ đề ở trang chủ khi muốn đào sâu một mảng |
| **Thi thử** | Làm liền N câu, không xem đáp án giữa chừng, chấm và báo cáo ở cuối |
| **Thư viện** | Tra cứu, đọc lại, hoặc tự kiểm tra một câu bất kỳ |
| **Luyện câu hay quên** | Ở trang Tiến độ: gom riêng những câu bạn quên nhiều lần |
| **Bài luyện nhỏ** | Tự bật khi điểm dưới 80 — xem mục bên dưới |

### Phím tắt

`Ctrl`+`Enter` nộp bài · `1`–`4` đánh giá mức nhớ · `T` đổi sáng/tối · `Esc` thoát buổi học

---

## Vì sao thiết kế như vậy

Mỗi lựa chọn trong giao diện đều dựa trên một kết quả đã được lặp lại nhiều lần trong nghiên cứu về trí nhớ:

| Nguyên tắc | Thể hiện trong ứng dụng |
|---|---|
| **Hiệu ứng kiểm tra** — cố nhớ lại tạo trí nhớ bền hơn đọc lại nhiều lần | Bắt buộc tự viết trước khi được xem đáp án |
| **Lặp lại ngắt quãng** — ôn đúng lúc sắp quên thì mỗi lần ôn kéo dài trí nhớ hơn | Lịch SM-2 cải tiến, khoảng cách giãn dần theo mức độ nhớ |
| **Khó khăn hữu ích** — học dễ thì quên nhanh | Không gợi ý sẵn; gợi ý phải chủ động xin và chỉ có 2 mức |
| **Xen kẽ** — trộn chủ đề khó hơn nhưng nhớ chắc và biết áp dụng đúng lúc hơn | Hàng đợi tránh xếp hai câu cùng chủ đề liền nhau |
| **Hiệu chỉnh nhận thức** — phát hiện "ảo giác thông thạo" | Bước tự dự đoán trước khi trả lời, đối chiếu với điểm thật ở trang Tiến độ |
| **Phản hồi theo thành phần** — biết thiếu ý nào hữu ích hơn biết mình sai | Rubric từng ý thay vì một điểm số duy nhất |
| **Xử lý sâu / giải thích cơ chế** — kiến thức có ý nghĩa thì khó rơi rụng | Mỗi câu đều có "vì sao quan trọng", bẫy thường gặp, neo trí nhớ, câu liên quan |
| **Củng cố khi nghỉ** | Không khuyến khích học dồn; khi hết câu tới hạn thì nói thẳng là nên dừng |

---

## Cấu trúc

```
server.mjs                  server Node thuần (static + lưu tiến độ + định tuyến API)
llm.mjs                     lớp gọi LLM: OpenAI hoặc Anthropic, rubric + schema chấm bài
content/questions/*.mjs     120 câu: đề, đáp án mẫu, rubric, bẫy, neo trí nhớ
public/
  index.html
  css/app.css               design system (sáng/tối, đáp ứng di động)
  js/
    app.js                  định tuyến + phím tắt + giao diện
    store.js                trạng thái, lưu trữ, gọi API
    srs.js                  lịch lặp lại ngắt quãng + chấm nháp offline
    drills.js               bài luyện theo từng ý: bậc thang, ba nhịp, phân loại ý
    metrics.js              số liệu tiến độ
    md.js  ui.js            markdown + tiện ích, biểu đồ SVG
    views/                  home · study · drill · library · stats · settings
data/progress.json          tiến độ học của bạn (đã gitignore)
```

## Sửa hoặc thêm câu hỏi

Mỗi chủ đề là một file trong `content/questions/`. Một câu có dạng:

```js
{
  id: 16,
  q: 'Faithfulness là gì?',
  type: 'concept',            // concept | compare | judgment | design | calc | trace | code
  diff: 2,                    // 1..3
  answer: `markdown đáp án mẫu`,
  points: [                   // rubric — thứ LLM dùng để chấm
    { id: 'p1', w: 3, text: 'Đo mức độ câu trả lời bám sát context...' },
  ],
  why: 'Vì sao ý này quan trọng',
  traps: ['Bẫy thường gặp'],
  hook: 'Câu neo trí nhớ',
  visual: 'sơ đồ ASCII (tùy chọn)',
  related: [18, 25],
}
```

Server tự nạp lại nội dung mỗi lần trình duyệt gọi `/api/content`, nên **sửa file xong chỉ cần F5**, không phải khởi động lại.

## Sao lưu

Vào **Cài đặt → Tải file sao lưu** để xuất JSON, hoặc copy trực tiếp `data/progress.json`. Nạp lại bằng **Nạp từ file sao lưu**.

---

## API nội bộ

| Endpoint | Việc |
|---|---|
| `GET /api/content` | 120 câu + danh sách chủ đề |
| `GET /api/health` | có API key chưa, model nào |
| `GET/PUT /api/state` | đọc / ghi tiến độ |
| `POST /api/grade` | chấm một câu theo rubric (`{questionId, answer}`) |
| `POST /api/drill-grade` | chấm một bài luyện nhỏ (`{questionId, pointId, mode, answer}`) |
| `POST /api/coach` | hỏi thêm về một câu (`{questionId, question, history}`) |

Khóa API chỉ nằm ở phía server (`.env` → `llm.mjs`), **không bao giờ đi ra trình duyệt**.
