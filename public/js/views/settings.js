import { state, save, exportData, importData, resetProgress } from '../store.js';
import { toast, esc } from '../ui.js';

export function renderSettings(go, setTheme) {
  const s = state.data.settings;
  const h = state.health;
  const root = document.createElement('div');
  root.className = 'wrap fade-in';

  root.innerHTML = `
    <div class="page-head">
      <h1>Cài đặt</h1>
      <p>Mặc định đã được chọn theo các nghiên cứu về trí nhớ. Chỉ nên đổi khi bạn có lý do cụ thể.</p>
    </div>

    <section class="card">
      <div class="card__title">Nhịp học mỗi ngày</div>
      <div class="grid grid--2">
        <div class="field">
          <label for="maxNew">Số câu MỚI mỗi ngày</label>
          <input type="number" id="maxNew" min="1" max="40" value="${s.maxNew}">
          <span class="tiny muted">8–10 là hợp lý. Mỗi câu mới hôm nay sẽ quay lại nhiều lần trong các ngày sau, nên nhận nhiều quá sẽ dồn ứ.</span>
        </div>
        <div class="field">
          <label for="maxReview">Số câu ÔN LẠI tối đa mỗi buổi</label>
          <input type="number" id="maxReview" min="5" max="120" value="${s.maxReview}">
          <span class="tiny muted">Để trần vừa phải giúp buổi học không quá dài; phần còn lại tự dồn sang hôm sau.</span>
        </div>
      </div>
    </section>

    <section class="card" style="margin-top:16px">
      <div class="card__title">Cách học</div>
      <label class="switch"><input type="checkbox" id="askConfidence" ${s.askConfidence ? 'checked' : ''}>
        <span><b>Hỏi mức tự tin trước khi trả lời</b><br>
        <span class="small dim">Giúp phát hiện “ảo giác thông thạo”. Tốn thêm 2 giây mỗi câu nhưng rất đáng.</span></span></label>
      <label class="switch"><input type="checkbox" id="showTimer" ${s.showTimer ? 'checked' : ''}>
        <span><b>Hiện đồng hồ khi làm bài</b><br>
        <span class="small dim">Chỉ để tự quan sát; không có giới hạn thời gian.</span></span></label>
      <label class="switch"><input type="checkbox" id="useLLM" ${s.useLLM ? 'checked' : ''} ${h.hasKey ? '' : 'disabled'}>
        <span><b>Chấm tự luận bằng LLM</b>${h.hasKey ? '' : ' <span class="badge badge--warn">chưa có API key</span>'}<br>
        <span class="small dim">Chấm theo ngữ nghĩa: bạn viết khác câu chữ nhưng đúng ý vẫn được tính điểm. Tắt đi thì hệ thống chỉ so khớp từ khóa và bạn tự chấm.</span></span></label>
    </section>

    <section class="card" style="margin-top:16px">
      <div class="card__title">Kết nối chấm bài</div>
      ${h.hasKey
        ? `<p class="small"><span class="badge badge--good">Đã kết nối</span>
             Nhà cung cấp: <b>${h.provider === 'openai' ? 'OpenAI' : 'Anthropic'}</b> ·
             Model: <b>${esc(h.model)}</b>${h.provider === 'anthropic' ? ` · độ sâu suy luận: <b>${esc(h.effort)}</b>` : ''}</p>
           <p class="tiny muted">Model để trống trong <code>.env</code> thì hệ thống tự chọn bản tốt nhất mà key của bạn dùng được.
             Muốn cố định (hoặc muốn rẻ hơn), đặt <code>GRADER_MODEL=...</code> rồi khởi động lại server.</p>`
        : `<p class="small"><span class="badge badge--warn">Chưa có API key</span> Hệ thống vẫn học được bình thường, chỉ là bạn tự chấm theo rubric.</p>
           <ol class="small dim" style="padding-left:20px">
             <li>Sao chép <code>.env.example</code> thành <code>.env</code></li>
             <li>Điền <code>OPENAI_API_KEY=sk-...</code> (hoặc <code>ANTHROPIC_API_KEY=sk-ant-...</code>)</li>
             <li>Chạy <code>npm install</code> rồi khởi động lại <code>npm start</code></li>
           </ol>`}
      ${h.sdkError ? `<p class="tiny" style="color:var(--bad)">SDK: ${esc(h.sdkError)}</p>` : ''}
    </section>

    <section class="card" style="margin-top:16px">
      <div class="card__title">Dữ liệu học tập</div>
      <p class="small dim">Tiến độ được lưu tại <code>data/progress.json</code> trên máy bạn, kèm một bản sao trong trình duyệt.</p>
      <div class="row">
        <button class="btn btn--sm" data-act="export">Tải file sao lưu</button>
        <button class="btn btn--sm" data-act="import">Nạp từ file sao lưu</button>
        <button class="btn btn--sm" data-act="reset" style="color:var(--bad)">Xóa toàn bộ tiến độ</button>
      </div>
      <input type="file" id="importFile" accept="application/json" hidden>
    </section>

    <section class="card" style="margin-top:16px">
      <div class="card__title">Phím tắt</div>
      <div class="grid grid--2 small dim">
        <div><span class="kbd">Ctrl</span> + <span class="kbd">↵</span> — nộp bài</div>
        <div><span class="kbd">1</span>…<span class="kbd">4</span> — đánh giá mức nhớ</div>
        <div><span class="kbd">T</span> — đổi giao diện sáng/tối</div>
        <div><span class="kbd">N</span> — mở / đóng sổ tay</div>
        <div><span class="kbd">Esc</span> — thoát buổi học</div>
      </div>
    </section>
  `;

  root.addEventListener('change', (e) => {
    const id = e.target.id;
    if (['maxNew', 'maxReview'].includes(id)) {
      s[id] = Math.max(1, Number(e.target.value) || 1);
    } else if (['askConfidence', 'useLLM', 'showTimer'].includes(id)) {
      s[id] = e.target.checked;
    } else if (id === 'importFile') {
      const file = e.target.files?.[0];
      if (file) {
        file.text().then(async (txt) => {
          try {
            await importData(txt);
            toast('Đã nạp tiến độ từ file sao lưu.');
            go('home');
          } catch {
            toast('File không hợp lệ.');
          }
        });
      }
      return;
    } else return;
    save();
    toast('Đã lưu cài đặt.');
  });

  root.addEventListener('click', (e) => {
    const t = e.target.closest('[data-act]');
    if (!t) return;
    if (t.dataset.act === 'export') {
      const blob = new Blob([exportData()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `on-tap-ai-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    }
    if (t.dataset.act === 'import') root.querySelector('#importFile').click();
    if (t.dataset.act === 'reset') {
      if (confirm('Xóa toàn bộ lịch sử ôn tập và bắt đầu lại từ đầu?')) {
        resetProgress().then(() => {
          toast('Đã đặt lại tiến độ.');
          go('home');
        });
      }
    }
  });

  // giữ tham chiếu để app.js dùng chung nút đổi giao diện
  root.setTheme = setTheme;
  return root;
}
