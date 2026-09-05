// Thứ tự đúng của các quy trình — dùng cho dạng bài "Sắp xếp".
// Tách riêng khỏi file câu hỏi để dễ thêm/sửa mà không đụng vào nội dung chính.
// Server sẽ gắn mảng này vào đúng câu (`question.sequence`) khi nạp nội dung.
//
// Chỉ đưa vào đây những quy trình mà thứ tự THỰC SỰ mang nghĩa: mỗi bước tạo ra
// đầu vào cho bước sau. Sắp đúng nghĩa là hiểu quan hệ nhân quả, không phải học thuộc.
export default {
  // RAG pipeline
  20: [
    'Load & parse tài liệu',
    'Chunking + gắn metadata',
    'Embedding từng chunk',
    'Lưu vào Vector DB',
    'Embed câu hỏi của người dùng',
    'Retrieve top-k + rerank',
    'Ghép prompt kèm context',
    'LLM sinh câu trả lời + citation',
  ],

  // Vòng lặp ReAct
  31: ['Thought (nghĩ)', 'Action (gọi tool)', 'Observation (nhận kết quả)', 'Thought tiếp theo', 'Final Answer'],

  // Trace quy đổi 100 USD sang VND
  44: [
    'Thought: tỷ giá là dữ liệu thời gian thực, không được đoán',
    'Action: get_exchange_rate(USD, VND)',
    'Observation: rate = 25.430',
    'Thought: đã có tỷ giá, cần nhân với 100',
    'Action: calculator(100 × 25430)',
    'Final Answer: ≈ 2.543.000 VND kèm nguồn và ngày',
  ],

  // AI Product Lifecycle
  72: ['Problem Scoping', 'Data Strategy', 'Build & Prototype', 'Test & Evaluate', 'Deploy', 'Monitor', 'Iterate'],

  // CI/CD cho AI Agent
  108: [
    'Trigger (push / đổi prompt / đổi KB)',
    'Lint + build',
    'Unit & integration test',
    'Contract test (output schema)',
    'Eval nhanh trên tập nhỏ',
    'Deploy staging',
    'AI Evaluation đầy đủ trên golden dataset',
    'Quality gate',
    'Canary ra production',
    'Monitor + auto-rollback',
  ],

  // Bài toán ROI
  99: [
    'Tính khối lượng công việc hiện tại (1.200 × 6 phút)',
    'Tính khối lượng sau khi có AI (60% về 0, 40% còn nửa thời gian)',
    'Lấy hiệu ra workload saving (80%)',
    'Quy 80% thành số nhân sự tương đương (6,4 FTE)',
    'Nhân với lương ra labor saving (76,8tr)',
    'Trừ chi phí vận hành ra net saving (61,8tr)',
    'Lấy vốn đầu tư chia net saving ra payback (3,2 tháng)',
  ],

  // Xử lý khi chất lượng giảm theo thời gian
  79: ['Xác nhận & đo lường', 'Chẩn đoán loại drift', 'Khắc phục đúng nguyên nhân', 'Phòng ngừa (monitor + eval định kỳ)'],
};
