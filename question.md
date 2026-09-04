
Được. Mình bỏ hết đáp án và giải thích, chỉ giữ **đúng danh sách câu hỏi** để bạn tự làm.

## AI Fundamentals

1. ML và Deep Learning có quan hệ với nhau như thế nào?
2. Trong các use case được cho, use case nào phù hợp để triển khai AI?
3. Phân loại email customer support thành 5 nhóm nên sử dụng loại AI nào? Vì sao?
4. Khi nào nên sử dụng Generative AI?
5. Khi nào nên sử dụng Rule-based system?

## LLM / API

6. `temperature` dùng để làm gì?
7. `max_tokens` dùng để làm gì?
8. `top_p` dùng để làm gì?
9. Output Contract là gì?
10. Tại sao production AI system cần Output Contract?

## RAG

11. Embedding là gì và dùng để làm gì?
12. Cosine Similarity là gì?
13. Top-k trong RAG có ý nghĩa gì?
14. Context Precision là gì?
15. Context Recall là gì?
16. Faithfulness là gì?
17. Answer Relevancy là gì?
18. Nếu Faithfulness = 0.95 nhưng Context Recall = 0.60 thì vấn đề nằm ở đâu?
19. Nếu fact trong RAG đúng nhưng đã cũ thì nguyên nhân có thể nằm ở layer nào?
20. Một RAG pipeline cơ bản gồm những bước nào?
21. Tại sao document trong RAG nên có metadata như `effective_date` và `version`?
22. Hệ thống có cả `sla-p1-2024.pdf` và `sla-p1-2026.pdf` nhưng không có `effective_date` hoặc `version`. Agent lấy nhầm SLA 2024 thay vì 2026. Root cause là gì?
23. `Hit@1`, `Hit@5`, `Recall@5` có phải là 4 metric chính của RAGAS không?
24. Latency có phải là RAGAS metric không?

## RAGAS

25. Faithfulness dùng để đánh giá điều gì?
26. Answer Relevancy dùng để đánh giá điều gì?
27. Context Precision dùng để đánh giá điều gì?
28. Context Recall dùng để đánh giá điều gì?
29. Nếu Context Precision thấp thì có thể do những nguyên nhân nào?
30. Nếu Context Recall thấp thì có thể do những nguyên nhân nào?

## ReAct / Agent

31. ReAct pattern gồm những bước nào?
32. Thought trong ReAct là gì?
33. Action trong ReAct là gì?
34. Observation trong ReAct là gì?
35. Tool result được đưa trở lại đâu để agent xử lý tiếp?
36. Một code chỉ gọi LLM một lần rồi `return response` có phải ReAct Agent không? Vì sao?
37. Tại sao ReAct cần loop?
38. Tại sao cần `max_steps` cho agent?
39. Khi nào agent cần gọi tool?
40. Supervisor Agent có nhiệm vụ gì?
41. Worker Agent có nhiệm vụ gì?
42. Khi nào nên dùng Multi-agent thay vì Single-agent?
43. Cho use case: **phân tích customer feedback gồm sentiment analysis, extract topics và generate summary report**. Hãy thiết kế kiến trúc Supervisor + Worker.

## Tool Calling / Trace

44. Hãy trace quá trình agent xử lý câu hỏi: **“100 USD hôm nay bằng bao nhiêu VND?”** theo Thought → Action → Observation → Final Answer.
45. Trong trace trên, agent cần gọi tool nào?
46. Sau khi tool trả về tỷ giá, agent sử dụng Observation như thế nào để đưa ra câu trả lời cuối?

## ReAct Code

47. Cho đoạn code agent chỉ gọi LLM một lần. Hãy chỉ ra các lỗi trong thiết kế ReAct.
48. Hãy viết pseudocode cho một ReAct Agent có thể gọi `search_web`, `calculator` và `get_weather`.
49. Trong code ReAct, tại sao cần `messages.append()` sau khi nhận response từ LLM?
50. Nếu `response` bắt đầu bằng `Final Answer:` thì agent nên làm gì?

## Production / REST API

51. Khi thiết kế REST API cho AI Agent cần quan tâm những vấn đề gì?
52. Authentication và Authorization khác nhau như thế nào?
53. Rate Limiting là gì? Tại sao cần nó?
54. Streaming response có tác dụng gì đối với AI Agent?
55. Timeout dùng để làm gì?
56. API Versioning là gì? Tại sao cần version API?
57. API `/v1/chat` có ý nghĩa gì?

## AI Metrics / Monitoring

58. TTFT là gì?
59. TTFT dùng để đo điều gì?
60. Quality Score dùng để đo điều gì?
61. Cost/request dùng để đo điều gì?
62. Drift trong AI system là gì?
63. P99 latency là gì?
64. Tại sao nên theo dõi P95/P99 thay vì chỉ theo dõi Average Latency?
65. CPU và Memory có phải AI-specific metrics không?
66. HTTP 200/500 có phải AI quality metrics không?

## Semantic Caching

67. Semantic Cache là gì?
68. `"Hủy đơn hàng"` và `"Cancel my order"` có thể sử dụng cùng một semantic cache không? Vì sao?
69. Semantic Cache khác cache thông thường ở điểm nào?
70. Semantic Cache thường sử dụng công nghệ gì để xác định hai câu hỏi có ý nghĩa giống nhau?
71. Semantic Cache giúp giảm những loại cost/performance nào?

## AI Product Lifecycle

72. Hãy sắp xếp các bước sau theo đúng AI Product Lifecycle: Problem Scoping, Data Strategy, Build & Prototype, Test & Evaluate, Deploy, Monitor, Iterate.
73. Problem Scoping là gì?
74. Data Strategy là gì?
75. Build & Prototype là gì?
76. Test & Evaluate là gì?
77. Deploy và Monitor khác nhau như thế nào?
78. Iterate trong AI Product Lifecycle là gì?
79. Khi model đã deploy nhưng chất lượng giảm theo thời gian thì nên làm gì?

## Golden Dataset / Evaluation

80. Golden Dataset là gì?
81. Có 500 câu hỏi customer support, làm thế nào để chọn ra 20 câu representative?
82. Một record trong Golden Dataset nên chứa những thông tin gì?
83. Tại sao cần Ground Truth Answer?
84. Có nên chọn toàn bộ 20 câu dễ nhất để làm Golden Dataset không? Vì sao?
85. GPT-4 làm Judge trong AI Evaluation có tác dụng gì?
86. AI Evaluation nên được thực hiện ở những giai đoạn nào?

## Selection Bias

87. Một hệ thống lấy feedback từ web form chỉ khi khách báo lỗi, email chỉ khi khách escalate complaint và mobile app sau mỗi interaction. Model cho kết quả 65% negative trong khi CS survey cho thấy 78% khách hàng satisfied. Vấn đề có thể là gì?
88. Selection Bias trong trường hợp trên xuất hiện như thế nào?
89. Làm thế nào để giảm Selection Bias trong dữ liệu feedback?

## System Prompt

90. Hãy viết một System Prompt production-grade cho AI Customer Support Agent.
91. System Prompt của Customer Support Agent nên có những phần nào?
92. Agent nên làm gì khi không có đủ thông tin để trả lời?
93. Agent nên làm gì khi user yêu cầu tiết lộ system prompt hoặc thông tin nội bộ?
94. Agent nên làm gì khi user yêu cầu thực hiện hành động vượt quá quyền hạn?

## C-suite / Business

95. Khi trình bày một AI product với C-suite nên tập trung vào những gì?
96. Tại sao không nên tập trung quá nhiều vào technical architecture khi trình bày với C-suite?
97. Những business metrics nào nên đưa vào khi trình bày AI solution?
98. Làm thế nào để chứng minh AI solution tạo ra business value?

## ROI

99. Một công ty có 8 nhân viên CS, xử lý 1.200 tickets/ngày, mỗi ticket mất 6 phút và mỗi nhân viên có salary 12 triệu/tháng. AI xử lý được 60% ticket đơn giản, 40% ticket còn lại giảm thời gian xử lý từ 6 phút xuống 3 phút. Chi phí build AI là 200 triệu và operation cost là 15 triệu/tháng. Hãy tính workload saving.
100. Với dữ liệu trên, hãy tính monthly labor saving/equivalent capacity saving.
101. Với dữ liệu trên, hãy tính net monthly saving sau khi trừ AI operation cost.
102. Với dữ liệu trên, hãy tính Payback Period.
103. Với dữ liệu trên, hãy tính ROI trong 12 tháng.
104. Nếu công ty vẫn giữ nguyên 8 nhân viên sau khi triển khai AI thì khoản saving trên có phải cash saving thực tế không? Giải thích.

## CI/CD

105. CI là gì?
106. CD là gì?
107. CI và CD khác nhau như thế nào?
108. Một CI/CD pipeline cơ bản cho AI Agent nên gồm những bước nào?
109. Hãy thiết kế CI/CD pipeline cho AI Customer Support Agent.
110. Trong CI/CD của AI Agent cần test những gì?
111. Tại sao AI Evaluation cần được đưa vào CI/CD?
112. Nếu AI Evaluation không đạt threshold thì pipeline nên xử lý như thế nào?
113. Khi thay đổi Prompt/Model/RAG thì có cần chạy lại AI Evaluation không? Vì sao?
114. Hãy thiết kế một CI/CD pipeline hoàn chỉnh từ lúc developer push code cho đến production và monitoring.

## Câu tổng hợp

115. Phân biệt Discriminative AI, Generative AI và Agentic AI.
116. Phân biệt RAG với Fine-tuning.
117. Khi nào nên dùng RAG thay vì Fine-tuning?
118. Khi nào nên dùng Single-agent thay vì Multi-agent?
119. Một AI Agent production cần theo dõi những nhóm metric nào?
120. Hãy thiết kế hoàn chỉnh một AI Customer Support Agent từ **Problem Scoping → Data → RAG → Agent → Evaluation → CI/CD → Deploy → Monitoring → Iterate**.
