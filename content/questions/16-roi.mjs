const DE_BAI = `**Đề bài chung cho câu 99–104:** 8 nhân viên CS · 1.200 ticket/ngày · 6 phút/ticket · lương 12 triệu/người/tháng. AI xử lý trọn 60% ticket đơn giản; 40% còn lại giảm từ 6 phút xuống 3 phút. Chi phí build 200 triệu, vận hành 15 triệu/tháng. *(Quy ước: 22 ngày làm việc/tháng.)*`;

export default {
  id: 'roi',
  name: 'ROI',
  short: 'ROI',
  emoji: '💰',
  blurb: 'Bài toán tính tiền hoàn chỉnh: workload saving → payback → ROI → cash hay không.',
  questions: [
    {
      id: 99,
      q: 'Một công ty có 8 nhân viên CS, xử lý 1.200 tickets/ngày, mỗi ticket mất 6 phút và mỗi nhân viên có salary 12 triệu/tháng. AI xử lý được 60% ticket đơn giản, 40% ticket còn lại giảm thời gian xử lý từ 6 phút xuống 3 phút. Chi phí build AI là 200 triệu và operation cost là 15 triệu/tháng. Hãy tính workload saving.',
      type: 'calc',
      diff: 2,
      answer: `${DE_BAI}

**Bước 1 — Khối lượng công việc HIỆN TẠI**
\`\`\`
1.200 ticket/ngày × 6 phút = 7.200 phút/ngày = 120 giờ/ngày
Tháng (22 ngày): 7.200 × 22 = 158.400 phút = 2.640 giờ/tháng
\`\`\`

**Bước 2 — Khối lượng SAU KHI CÓ AI**
\`\`\`
60% tự động  : 1.200 × 60% = 720 ticket × 0 phút =     0 phút
40% có AI hỗ trợ: 1.200 × 40% = 480 ticket × 3 phút = 1.440 phút/ngày
                                          Tổng =  1.440 phút/ngày = 24 giờ/ngày
Tháng: 1.440 × 22 = 31.680 phút = 528 giờ/tháng
\`\`\`

**Bước 3 — Workload saving**
\`\`\`
Tiết kiệm/ngày   = 7.200 − 1.440 = 5.760 phút = 96 giờ/ngày
Tiết kiệm/tháng  = 158.400 − 31.680 = 126.720 phút = 2.112 giờ/tháng
Tỉ lệ tiết kiệm  = 5.760 / 7.200 = 80%
\`\`\`

**➡️ Workload saving = 80% (96 giờ/ngày, ~2.112 giờ/tháng).**

**Kiểm tra nhanh bằng trực giác:** 60% việc biến mất hoàn toàn; 40% còn lại chỉ mất một nửa thời gian ⇒ phần việc còn lại = 40% × 50% = **20%** ⇒ tiết kiệm **80%**. Khớp.

⚠️ **Ghi chú giả định:** 7.200 phút/ngày chia cho 8 người là 900 phút ≈ 15 giờ/người/ngày — cao hơn năng lực thực tế (8 giờ). Nghĩa là đội đang quá tải hoặc số liệu chỉ mang tính minh họa. Khi trình bày thật, nên nêu rõ giả định này thay vì lờ đi.`,
      points: [
        { id: 'p1', w: 3, text: 'Tính khối lượng hiện tại: 1.200 × 6 = 7.200 phút/ngày (120 giờ/ngày)' },
        { id: 'p2', w: 3, text: 'Tính khối lượng sau AI: 60% về 0, 40% (480 ticket) × 3 phút = 1.440 phút/ngày' },
        { id: 'p3', w: 3, text: 'Workload saving = 7.200 − 1.440 = 5.760 phút/ngày, tương đương 80%' },
        { id: 'p4', w: 1, text: 'Quy đổi sang giờ hoặc theo tháng (96 giờ/ngày, ~2.112 giờ/tháng với 22 ngày làm việc) hoặc nêu giả định số ngày làm việc' },
      ],
      why: 'Bước này là nền của toàn bộ bài ROI. Sai ở đây thì mọi con số phía sau sai theo — và đây cũng là bước hay bị nhầm nhất (quên rằng 40% chỉ giảm một nửa, không biến mất).',
      traps: [
        'Tính 60% + 40% đều về 0 ⇒ ra 100%.',
        'Quên nhân 40% với 3 phút mà lấy luôn 1.200 × 3.',
        'Không nêu giả định số ngày làm việc/tháng.',
      ],
      hook: 'Còn lại = 40% × ½ = 20% ⇒ tiết kiệm 80%.',
      related: [100, 101],
    },
    {
      id: 100,
      q: 'Với dữ liệu trên, hãy tính monthly labor saving/equivalent capacity saving.',
      type: 'calc',
      diff: 2,
      answer: `${DE_BAI}

**Cách 1 — Quy theo số nhân sự tương đương (FTE)** *(cách phổ biến và dễ trình bày nhất)*
\`\`\`
Workload saving = 80%
Nhân sự tương đương tiết kiệm = 8 người × 80% = 6,4 FTE
Chi phí lương tương ứng     = 6,4 × 12 triệu   = 76,8 triệu/tháng
\`\`\`

**Cách 2 — Quy theo chi phí trên mỗi phút (kiểm chứng chéo)**
\`\`\`
Tổng chi phí lương/tháng = 8 × 12 triệu = 96 triệu
Tổng khối lượng/tháng    = 158.400 phút
Chi phí ≈ 96.000.000 / 158.400 ≈ 606 đ/phút
Tiết kiệm = 126.720 phút × 606 đ ≈ 76,8 triệu/tháng
\`\`\`
Hai cách cho cùng kết quả — vì cùng một tỉ lệ 80% áp lên cùng một quỹ lương.

**➡️ Monthly labor saving (equivalent capacity saving) ≈ 76,8 triệu đồng/tháng**, tương đương **6,4 nhân sự**.

**Cách gọi tên cho đúng:** đây là **equivalent capacity saving** — *năng lực lao động được giải phóng*, quy ra tiền theo đơn giá lương. Nó **chưa phải tiền mặt** cho tới khi công ty thực sự giảm chi phí (giảm nhân sự, ngừng tuyển thêm, hoặc dùng năng lực dôi ra để hấp thụ tăng trưởng). Xem chi tiết ở câu 104.

*(Chú ý: nếu tính theo chi phí sử dụng lao động thật — gồm bảo hiểm, thưởng, chỗ ngồi, công cụ — con số thường cao hơn lương gộp khoảng 1,2–1,3 lần. Bài này chỉ dùng lương để đơn giản.)*`,
      points: [
        { id: 'p1', w: 3, text: 'Quy 80% workload saving thành nhân sự tương đương: 8 × 80% = 6,4 FTE' },
        { id: 'p2', w: 3, text: 'Nhân với lương: 6,4 × 12 triệu = 76,8 triệu/tháng' },
        { id: 'p3', w: 2, text: 'Có thể kiểm chứng bằng cách tính chi phí trên mỗi phút (96 triệu / 158.400 phút) rồi nhân với số phút tiết kiệm' },
        { id: 'p4', w: 2, text: 'Gọi đúng tên: đây là equivalent capacity saving (năng lực quy ra tiền), chưa phải cash saving' },
      ],
      why: 'Bước quy đổi "phút tiết kiệm → tiền" là chỗ mọi bài ROI của AI đứng hoặc sụp. Gọi đúng tên khoản tiết kiệm cũng quan trọng ngang việc tính đúng.',
      traps: [
        'Lấy luôn 96 triệu (toàn bộ quỹ lương) làm khoản tiết kiệm.',
        'Quên rằng đây là năng lực quy đổi, không phải tiền mặt ngay.',
      ],
      hook: '80% × 8 người = 6,4 người × 12 triệu = 76,8 triệu.',
      related: [99, 101, 104],
    },
    {
      id: 101,
      q: 'Với dữ liệu trên, hãy tính net monthly saving sau khi trừ AI operation cost.',
      type: 'calc',
      diff: 1,
      answer: `${DE_BAI}

\`\`\`
Labor saving (gross)      =  76,8 triệu/tháng
AI operation cost         = −15,0 triệu/tháng
─────────────────────────────────────────────
Net monthly saving        =  61,8 triệu/tháng
\`\`\`

**➡️ Net monthly saving = 61,8 triệu đồng/tháng** (≈ 741,6 triệu/năm).

**Đọc con số này thế nào:**
- Tỉ lệ hiệu quả: mỗi 1 đồng chi cho vận hành AI mang lại ≈ **5,1 đồng** tiết kiệm (76,8 / 15).
- Biên an toàn: chi phí vận hành chỉ chiếm ~19,5% khoản tiết kiệm gộp ⇒ ngay cả khi chi phí vận hành tăng gấp đôi (30 triệu), dự án vẫn dương (46,8 triệu/tháng). Nêu được biên an toàn này rất có sức thuyết phục với lãnh đạo.

**Lưu ý khi làm bài thật:** \`operation cost\` 15 triệu ở đây nên hiểu là **tổng chi phí vận hành**: token API, vector DB, hạ tầng, giám sát, và phần công bảo trì. Nếu đề tách riêng, phải cộng đủ trước khi trừ. Và nhớ rằng chi phí này thường **tăng theo lượng traffic**, trong khi khoản tiết kiệm cũng tăng theo — nên tỉ lệ thường giữ, còn con số tuyệt đối thì đổi.`,
      points: [
        { id: 'p1', w: 4, text: 'Net = 76,8 − 15 = 61,8 triệu/tháng' },
        { id: 'p2', w: 2, text: 'Trừ đúng chi phí vận hành hằng tháng, KHÔNG trừ chi phí build 200 triệu ở bước này (build là đầu tư một lần)' },
        { id: 'p3', w: 2, text: 'Quy ra năm hoặc nêu ý nghĩa (mỗi đồng vận hành đổi lấy khoảng 5 đồng tiết kiệm / biên an toàn)' },
        { id: 'p4', w: 1, text: 'Hiểu operation cost gồm token, hạ tầng, vector DB, giám sát, bảo trì' },
      ],
      why: 'Đây là con số dùng cho mọi bước sau (payback, ROI). Lỗi kinh điển là trừ nhầm chi phí build vào đây.',
      traps: ['Trừ 200 triệu chi phí build vào tiết kiệm hằng tháng.', 'Quên trừ chi phí vận hành và báo cáo luôn 76,8 triệu.'],
      hook: 'Gross trừ vận hành = Net. Build để dành cho payback.',
      related: [100, 102, 103],
    },
    {
      id: 102,
      q: 'Với dữ liệu trên, hãy tính Payback Period.',
      type: 'calc',
      diff: 1,
      answer: `${DE_BAI}

**Payback Period = Chi phí đầu tư ban đầu / Dòng tiền tiết kiệm ròng hằng tháng**
\`\`\`
= 200 triệu / 61,8 triệu mỗi tháng
≈ 3,24 tháng  ≈ 3 tháng 7 ngày
\`\`\`

**➡️ Payback Period ≈ 3,2 tháng.**

**Ý nghĩa:** sau khoảng 3,2 tháng, khoản tiết kiệm ròng đã bù đủ 200 triệu bỏ ra ban đầu; từ tháng thứ 4 trở đi là phần lợi ròng.

**Vì sao chỉ số này được lãnh đạo thích:** nó trả lời trực tiếp câu "bao lâu thì lấy lại vốn" và là **thước đo rủi ro** — thời gian hoàn vốn càng ngắn thì càng ít bị ảnh hưởng bởi những thứ khó đoán (công nghệ thay đổi, nhu cầu thay đổi). Dưới 6 tháng thường được xem là rất hấp dẫn với dự án phần mềm nội bộ.

**Hạn chế cần biết:** payback **không tính đến dòng tiền sau điểm hoàn vốn** (một dự án hoàn vốn 3 tháng rồi chết vẫn "đẹp" hơn dự án hoàn vốn 6 tháng nhưng sinh lời 5 năm) và **không tính giá trị tiền theo thời gian**. Vì thế nên trình bày kèm **ROI** và, với dự án lớn, kèm **NPV**.

**Trình bày thực tế nên nêu thêm:** thời gian triển khai trước khi bắt đầu tiết kiệm (nếu mất 1 tháng để đưa vào vận hành thì thời điểm hoàn vốn thực tế là ~4,2 tháng kể từ lúc bắt đầu dự án) và kịch bản thận trọng (nếu chỉ đạt 70% hiệu quả kỳ vọng thì payback ≈ 4,8 tháng).`,
      points: [
        { id: 'p1', w: 4, text: 'Công thức: chi phí đầu tư ban đầu chia cho net saving hằng tháng = 200 / 61,8' },
        { id: 'p2', w: 3, text: 'Kết quả ≈ 3,2 tháng (khoảng 3 tháng 7 ngày)' },
        { id: 'p3', w: 2, text: 'Giải thích ý nghĩa: sau ~3,2 tháng thu hồi đủ vốn đầu tư, từ đó trở đi là lợi ròng' },
        { id: 'p4', w: 1, text: 'Nêu hạn chế của payback (không tính dòng tiền sau điểm hoàn vốn, không tính giá trị thời gian của tiền) hoặc kịch bản thận trọng/thời gian triển khai' },
      ],
      why: 'Payback là con số đầu tiên ban lãnh đạo hỏi. Biết cả hạn chế của nó cho thấy bạn hiểu tài chính chứ không chỉ biết chia.',
      traps: [
        'Chia 200 cho 76,8 (quên trừ chi phí vận hành) ⇒ 2,6 tháng — quá lạc quan.',
        'Cộng chi phí vận hành 12 tháng vào tử số.',
      ],
      hook: '200 chia 61,8 — vốn bỏ ra chia lợi ích ròng mỗi tháng.',
      related: [101, 103],
    },
    {
      id: 103,
      q: 'Với dữ liệu trên, hãy tính ROI trong 12 tháng.',
      type: 'calc',
      diff: 3,
      answer: `${DE_BAI}

**Cách 1 — ROI trên vốn đầu tư ban đầu** *(dùng net saving đã trừ chi phí vận hành)*
\`\`\`
Tổng lợi ích ròng 12 tháng = 61,8 × 12 = 741,6 triệu
Lợi nhuận thuần            = 741,6 − 200 = 541,6 triệu
ROI = 541,6 / 200 = 2,708 → ≈ 271%
\`\`\`

**Cách 2 — ROI trên tổng chi phí** *(gồm cả build lẫn vận hành cả năm)*
\`\`\`
Tổng lợi ích (gross) = 76,8 × 12 = 921,6 triệu
Tổng chi phí         = 200 + (15 × 12) = 200 + 180 = 380 triệu
ROI = (921,6 − 380) / 380 = 541,6 / 380 ≈ 142,5%
\`\`\`

**➡️ ROI 12 tháng ≈ 271%** (theo cách 1, cách hay dùng nhất) — hoặc **≈ 142%** nếu tính trên tổng chi phí.

**Điểm mấu chốt:** **lợi nhuận thuần là 541,6 triệu trong cả hai cách** — chỉ khác mẫu số. Khi trình bày, **phải nói rõ đang dùng công thức nào**, nếu không con số 271% dễ bị coi là thổi phồng. Cách an toàn nhất là trình bày cả hai, hoặc đơn giản là nêu **lợi nhuận thuần 541,6 triệu trên vốn đầu tư 200 triệu trong 12 tháng**.

**Kèm theo cho đầy đủ:**
- Payback ≈ 3,2 tháng.
- **Kịch bản thận trọng:** nếu AI chỉ đạt 70% hiệu quả kỳ vọng ⇒ labor saving 53,8tr, net 38,8tr/tháng ⇒ ROI ≈ 133% (cách 1), payback ≈ 5,2 tháng. **Vẫn dương** — đây là điều lãnh đạo muốn nghe.
- **Giả định phải nêu rõ:** 22 ngày làm việc/tháng; chất lượng dịch vụ (CSAT) không giảm; khối lượng ticket ổn định; và khoản tiết kiệm là *capacity saving*, thành tiền mặt thật tùy quyết định nhân sự (câu 104).`,
      points: [
        { id: 'p1', w: 3, text: 'Tổng lợi ích ròng 12 tháng = 61,8 × 12 = 741,6 triệu' },
        { id: 'p2', w: 3, text: 'Trừ vốn đầu tư 200 triệu ⇒ lợi nhuận thuần 541,6 triệu' },
        { id: 'p3', w: 3, text: 'ROI = 541,6 / 200 ≈ 271% (hoặc ≈ 142% nếu lấy mẫu số là tổng chi phí 380 triệu) và nói rõ đang dùng công thức nào' },
        { id: 'p4', w: 2, text: 'Nêu giả định (22 ngày/tháng, chất lượng không giảm) và/hoặc kịch bản thận trọng, kèm payback ~3,2 tháng' },
      ],
      why: 'ROI là con số bạn sẽ đưa lên slide đầu tiên. Nêu rõ công thức và giả định là thứ phân biệt một phân tích đáng tin với một con số marketing.',
      traps: [
        'Quên trừ vốn đầu tư ⇒ báo ROI 371%.',
        'Trộn lẫn hai công thức: lấy lợi ích gross chia cho vốn đầu tư.',
        'Không nêu giả định nào.',
      ],
      hook: '(Lợi ích − Chi phí) / Chi phí. Chốt trước "chi phí" là gì.',
      related: [101, 102, 104],
    },
    {
      id: 104,
      q: 'Nếu công ty vẫn giữ nguyên 8 nhân viên sau khi triển khai AI thì khoản saving trên có phải cash saving thực tế không? Giải thích.',
      type: 'judgment',
      diff: 3,
      answer: `**Không.** Vẫn trả đủ lương cho 8 người thì **dòng tiền chi ra không hề giảm** — 96 triệu/tháng vẫn ra khỏi tài khoản, cộng thêm **15 triệu/tháng chi phí vận hành AI**. Xét thuần dòng tiền, chi phí thậm chí **tăng 15 triệu/tháng**.

Khoản 76,8 triệu là **capacity saving / cost avoidance** — *năng lực được giải phóng*, không phải tiền mặt thu về.

**Nó biến thành giá trị thật khi:**
1. **Hấp thụ tăng trưởng mà không tuyển thêm.** Cùng 8 người nay xử lý được ~6.000 ticket/ngày thay vì 1.200. Nếu công ty đang tăng trưởng, đây là **cost avoidance thật**: khoản lương của những người *lẽ ra phải tuyển*.
2. **Dừng tuyển mới / không thay thế người nghỉ** (giảm tự nhiên) ⇒ dòng tiền giảm dần theo thời gian.
3. **Chuyển người sang việc tạo doanh thu**: chăm sóc khách VIP, bán thêm, giữ chân khách ⇒ giá trị hiện ra ở **doanh thu**, không ở cột chi phí.
4. **Cải thiện chỉ số dịch vụ** ⇒ giữ chân khách, tăng CSAT ⇒ doanh thu và uy tín, đo được nhưng gián tiếp.
5. **Xử lý được mùa cao điểm** mà không thuê thời vụ / trả lương ngoài giờ ⇒ đây là tiền mặt tiết kiệm được thật.
6. **Giảm nhân sự** — cách duy nhất tạo cash saving trực tiếp, nhưng kéo theo chi phí trợ cấp, rủi ro nhân sự và tinh thần đội ngũ, và thường không phải điều doanh nghiệp muốn nói ra.

**Cách trình bày trung thực với C-suite:**
> "76,8 triệu/tháng là **năng lực được giải phóng**, tương đương 6,4 nhân sự. Nếu giữ nguyên đội hình, chúng ta chưa giảm chi phí ngay, nhưng có thêm năng lực để phục vụ mức tăng trưởng dự kiến 3 lần trong 12 tháng mà **không cần tuyển thêm 6–7 người** — đó mới là khoản 76,8 triệu/tháng được hiện thực hóa. Ngoài ra, thời gian phản hồi giảm từ 4 giờ xuống 1 phút."

**Vì sao phải phân biệt rõ:** nếu bạn hứa "tiết kiệm 76,8 triệu tiền mặt mỗi tháng" mà bảng chi phí cuối quý không đổi, uy tín của bạn — và của mọi dự án AI tiếp theo — sẽ bị tổn hại. Nói đúng bản chất ngay từ đầu là cách bảo vệ dự án lâu dài.`,
      points: [
        { id: 'p1', w: 4, text: 'Không — vẫn trả đủ 8 lương thì dòng tiền chi ra không giảm; đây là capacity saving/cost avoidance chứ không phải cash saving' },
        { id: 'p2', w: 2, text: 'Thực tế chi phí còn tăng thêm 15 triệu/tháng chi phí vận hành AI nếu không có thay đổi nào khác' },
        { id: 'p3', w: 3, text: 'Nêu điều kiện để thành giá trị thật: hấp thụ tăng trưởng không tuyển thêm, ngừng tuyển/giảm tự nhiên, chuyển người sang việc tạo doanh thu, tránh thuê thời vụ mùa cao điểm' },
        { id: 'p4', w: 2, text: 'Nhấn mạnh phải trình bày trung thực với lãnh đạo về bản chất khoản tiết kiệm để giữ uy tín của dự án' },
      ],
      why: 'Đây là câu hỏi "trung thực tài chính" — phân biệt người hiểu bản chất kinh doanh với người chỉ biết nhân chia. Rất nhiều dự án AI mất uy tín đúng ở điểm này.',
      traps: [
        'Trả lời "có, vì đã tiết kiệm được thời gian" — thời gian tiết kiệm không tự thành tiền.',
        'Chỉ nói "không phải" mà không nêu điều kiện để nó trở thành giá trị thật.',
      ],
      hook: 'Không giảm người ⇒ không giảm tiền. Chỉ giảm được *nhu cầu tuyển thêm*.',
      related: [98, 100, 103],
    },
  ],
};
