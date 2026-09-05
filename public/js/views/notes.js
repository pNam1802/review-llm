// Sổ tay cá nhân — ngăn kéo bên phải, mở được ở bất kỳ màn hình nào.
//
// Vì sao đáng có: ghi chú TỰ VIẾT bằng lời của mình được nhớ tốt hơn hẳn đoạn
// chép lại nguyên văn (generation effect). Nên ở đây cố tình KHÔNG có nút
// "chép đáp án mẫu vào sổ" — chỉ có ô trống để bạn diễn đạt lại theo cách hiểu
// của mình. Đúng lúc bạn vừa quên rồi vừa được nhắc lại chính là lúc ghi chú
// đọng nhất.
import { state, notes, addNote, updateNote, deleteNote, notesFor } from '../store.js';
import { md } from '../md.js';
import { esc, toast } from '../ui.js';
import { normalize } from '../srs.js';

let filter = 'all'; // all | pinned | question
let query = '';
let editing = null; // id đang sửa

const fmtNgay = (t) => {
  const d = new Date(t);
  const homNay = new Date();
  const cungNgay = d.toDateString() === homNay.toDateString();
  return cungNgay
    ? `hôm nay ${d.toTimeString().slice(0, 5)}`
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

export function isOpen() {
  return state.ui.notesOpen;
}

export function toggleNotes(open, { qid } = {}) {
  state.ui.notesOpen = open ?? !state.ui.notesOpen;
  if (qid != null) {
    state.ui.qid = qid;
    filter = 'question';
  }
  paintNotes();
  if (state.ui.notesOpen) {
    setTimeout(() => document.querySelector('#noteInput')?.focus(), 120);
  }
}

/** Số ghi chú của câu đang mở — dùng để hiện chấm báo trên nút. */
export const countForCurrent = () => (state.ui.qid ? notesFor(state.ui.qid).length : 0);

export function paintNotes() {
  const host = document.querySelector('#notes');
  if (!host) return;
  const mo = state.ui.notesOpen;
  host.classList.toggle('notes--open', mo);
  document.body.classList.toggle('notes-open', mo);
  host.setAttribute('aria-hidden', String(!mo));
  document.querySelector('#notesBackdrop')?.classList.toggle('show', mo);

  const nut = document.querySelector('#notesBtn');
  if (nut) {
    const n = notes().length;
    nut.innerHTML = `<span class="ico" aria-hidden="true">📝</span><span>Sổ tay</span>${n ? `<span class="badge">${n}</span>` : ''}`;
    nut.setAttribute('aria-expanded', String(mo));
  }
  if (!mo) return;

  const qid = state.ui.qid;
  const q = qid ? state.byId.get(qid) : null;
  const tatCa = notes();
  let danhSach = tatCa;
  if (filter === 'pinned') danhSach = tatCa.filter((n) => n.pinned);
  if (filter === 'question') danhSach = qid ? notesFor(qid) : [];
  if (query.trim()) {
    const nq = normalize(query);
    danhSach = danhSach.filter((n) => normalize(n.text).includes(nq) || String(n.qid || '').includes(query.trim()));
  }
  danhSach = [...danhSach].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);

  host.innerHTML = `
    <div class="notes__head">
      <b>📝 Sổ tay</b>
      <span class="grow"></span>
      <span class="tiny muted">${tatCa.length} ghi chú</span>
      <button class="btn btn--ghost btn--sm" data-note="close" title="Đóng (Esc)">✕</button>
    </div>

    <div class="notes__new">
      ${q ? `<div class="tiny muted" style="margin-bottom:6px">Gắn vào <b>câu ${q.id}</b> — ${esc(q.q.slice(0, 60))}${q.q.length > 60 ? '…' : ''}</div>` : ''}
      <textarea id="noteInput" class="answer-area notes__input" rows="3"
        placeholder="${q ? 'Viết lại ý này bằng lời của bạn…' : 'Ghi nhanh một điều bạn muốn nhớ…'}"></textarea>
      <div class="row" style="margin-top:8px">
        <button class="btn btn--primary btn--sm" data-note="add">Lưu <span class="kbd">Ctrl↵</span></button>
        ${q ? `<label class="tiny muted" style="display:flex;align-items:center;gap:6px">
          <input type="checkbox" id="noteAttach" checked> gắn vào câu ${q.id}</label>` : ''}
        <span class="grow"></span>
        <span class="tiny muted">Viết bằng lời của mình sẽ nhớ lâu hơn chép lại</span>
      </div>
    </div>

    <div class="notes__tools">
      <input class="search" id="noteSearch" placeholder="Tìm trong sổ tay…" value="${esc(query)}">
      <div class="row" style="margin-top:8px">
        <button class="chip chip--sm" data-filter="all" aria-pressed="${filter === 'all'}">Tất cả</button>
        <button class="chip chip--sm" data-filter="pinned" aria-pressed="${filter === 'pinned'}">📌 Đã ghim</button>
        ${qid ? `<button class="chip chip--sm" data-filter="question" aria-pressed="${filter === 'question'}">Câu ${qid}</button>` : ''}
      </div>
    </div>

    <div class="notes__list">
      ${danhSach.length ? danhSach.map(item).join('') : trong()}
    </div>`;
}

const trong = () => `
  <div class="empty" style="padding:34px 16px">
    <div class="empty__icon">🗒️</div>
    <p class="small muted" style="max-width:30ch;margin:0 auto">
      ${query ? 'Không có ghi chú nào khớp.' : 'Chưa có ghi chú nào. Lúc vừa quên một câu rồi được nhắc lại chính là lúc ghi chú đọng nhất.'}
    </p>
  </div>`;

function item(n) {
  if (editing === n.id) {
    return `<article class="note note--edit">
      <textarea class="answer-area notes__input" data-edit="${n.id}" rows="4">${esc(n.text)}</textarea>
      <div class="row" style="margin-top:8px">
        <button class="btn btn--primary btn--sm" data-note="save" data-id="${n.id}">Lưu</button>
        <button class="btn btn--ghost btn--sm" data-note="cancel">Hủy</button>
      </div>
    </article>`;
  }
  const q = n.qid ? state.byId.get(n.qid) : null;
  return `<article class="note${n.pinned ? ' note--pin' : ''}">
    <div class="note__body md">${md(n.text)}</div>
    <div class="note__foot">
      ${q ? `<button class="badge badge--accent" data-note="open" data-id="${n.id}" title="${esc(q.q)}">Câu ${q.id}</button>` : ''}
      <span class="tiny muted">${fmtNgay(n.updated)}</span>
      <span class="grow"></span>
      <button class="note__act" data-note="pin" data-id="${n.id}" title="${n.pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}">${n.pinned ? '📌' : '📍'}</button>
      <button class="note__act" data-note="edit" data-id="${n.id}" title="Sửa">✎</button>
      <button class="note__act" data-note="del" data-id="${n.id}" title="Xóa">🗑</button>
    </div>
  </article>`;
}

/** Gắn một lần khi khởi động: mọi tương tác trong ngăn kéo đi qua đây. */
export function wireNotes(go) {
  const host = document.querySelector('#notes');
  if (!host) return;

  host.addEventListener('click', (e) => {
    const t = e.target.closest('[data-note], [data-filter]');
    if (!t) return;
    const id = t.dataset.id;
    if (t.dataset.filter) {
      filter = t.dataset.filter;
      return paintNotes();
    }
    switch (t.dataset.note) {
      case 'close': return toggleNotes(false);
      case 'add': {
        const el = host.querySelector('#noteInput');
        const text = el.value.trim();
        if (!text) return toast('Ghi chú đang trống.', 1500);
        const gan = host.querySelector('#noteAttach');
        addNote({ text, qid: gan && gan.checked ? state.ui.qid : null });
        el.value = '';
        toast('Đã lưu vào sổ tay.', 1400);
        return paintNotes();
      }
      case 'pin': {
        const n = notes().find((x) => x.id === id);
        updateNote(id, { pinned: !n?.pinned });
        return paintNotes();
      }
      case 'edit': editing = id; return paintNotes();
      case 'cancel': editing = null; return paintNotes();
      case 'save': {
        const el = host.querySelector(`[data-edit="${id}"]`);
        updateNote(id, { text: el.value.trim() });
        editing = null;
        return paintNotes();
      }
      case 'del': {
        const n = notes().find((x) => x.id === id);
        if (n && confirm('Xóa ghi chú này?')) deleteNote(id);
        return paintNotes();
      }
      case 'open': {
        const n = notes().find((x) => x.id === id);
        if (n?.qid) {
          toggleNotes(false);
          go('question', { id: n.qid });
        }
        return undefined;
      }
      default: return undefined;
    }
  });

  host.addEventListener('input', (e) => {
    if (e.target.id === 'noteSearch') {
      query = e.target.value;
      const list = host.querySelector('.notes__list');
      const nq = normalize(query);
      const rows = notes()
        .filter((n) => (filter === 'pinned' ? n.pinned : filter === 'question' ? n.qid === state.ui.qid : true))
        .filter((n) => !nq || normalize(n.text).includes(nq))
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
      if (list) list.innerHTML = rows.length ? rows.map(item).join('') : trong();
    }
  });

  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const nut = host.querySelector('[data-note="add"], [data-note="save"]');
      nut?.click();
    }
  });

  document.querySelector('#notesBackdrop')?.addEventListener('click', () => toggleNotes(false));
}
