// Sổ tay cá nhân — ngăn kéo bên phải, mở được ở bất kỳ màn hình nào.
//
// Vì sao đáng có: ghi chú TỰ VIẾT bằng lời của mình được nhớ tốt hơn hẳn đoạn
// chép lại nguyên văn (generation effect). Nên ở đây cố tình KHÔNG có nút
// "chép đáp án mẫu vào sổ" — chỉ có ô trống để bạn diễn đạt lại theo cách hiểu
// của mình. Đúng lúc bạn vừa quên rồi vừa được nhắc lại chính là lúc ghi chú
// đọng nhất.
//
// Tiêu đề + nhãn màu là để QUÉT được: sổ tay chỉ hữu ích khi mở ra là thấy ngay
// cái mình cần, không phải đọc lại từ đầu. Nhãn cũng là một cách phân loại có
// ý nghĩa học tập (hiểu ra / dễ nhầm / phải nhớ / còn thắc mắc) chứ không phải
// màu mè cho vui.
import { state, notes, addNote, updateNote, deleteNote, notesFor } from '../store.js';
import { md } from '../md.js';
import { esc, toast } from '../ui.js';
import { normalize } from '../srs.js';

export const TAGS = {
  note: { label: 'Ghi chú', icon: '📝', color: 'var(--line-strong)' },
  insight: { label: 'Hiểu ra', icon: '💡', color: 'var(--good)' },
  confuse: { label: 'Dễ nhầm', icon: '⚠️', color: 'var(--warn)' },
  must: { label: 'Phải nhớ', icon: '🔥', color: 'var(--bad)' },
  ask: { label: 'Còn thắc mắc', icon: '❓', color: 'var(--accent)' },
};
const TAG_IDS = Object.keys(TAGS);

let filter = 'all'; // all | pinned | question | tag:<id>
let query = '';
let editing = null;
let newTag = 'note';
let expanded = new Set();

const fmtNgay = (t) => {
  const d = new Date(t);
  const cungNgay = d.toDateString() === new Date().toDateString();
  return cungNgay
    ? `hôm nay ${d.toTimeString().slice(0, 5)}`
    : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
};

/** Không có tiêu đề thì lấy tạm dòng đầu, để danh sách vẫn quét được. */
const tieuDe = (n) => {
  if (n.title) return n.title;
  const dong = String(n.text || '').split('\n').find((l) => l.trim());
  return (dong || '').replace(/^[#>\-*\s]+/, '').replace(/[*=`]/g, '').slice(0, 70) || '(chưa có nội dung)';
};

export const isOpen = () => state.ui.notesOpen;

export function toggleNotes(open, { qid } = {}) {
  state.ui.notesOpen = open ?? !state.ui.notesOpen;
  if (qid != null) {
    state.ui.qid = qid;
    filter = 'question';
  }
  paintNotes();
  if (state.ui.notesOpen) setTimeout(() => document.querySelector('#noteTitle')?.focus(), 120);
}

export const countForCurrent = () => (state.ui.qid ? notesFor(state.ui.qid).length : 0);

function locDanhSach() {
  const qid = state.ui.qid;
  let ds = notes();
  if (filter === 'pinned') ds = ds.filter((n) => n.pinned);
  else if (filter === 'question') ds = qid ? notesFor(qid) : [];
  else if (filter.startsWith('tag:')) ds = ds.filter((n) => (n.tag || 'note') === filter.slice(4));
  if (query.trim()) {
    const nq = normalize(query);
    ds = ds.filter((n) => normalize(`${n.title || ''} ${n.text}`).includes(nq) || String(n.qid || '').includes(query.trim()));
  }
  return [...ds].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updated - a.updated);
}

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
  const ds = locDanhSach();
  const dem = (id) => tatCa.filter((n) => (n.tag || 'note') === id).length;

  host.innerHTML = `
    <div class="notes__head">
      <b>📝 Sổ tay</b>
      <span class="grow"></span>
      <span class="tiny muted">${tatCa.length} ghi chú</span>
      <button class="btn btn--ghost btn--sm" data-note="close" title="Đóng (Esc)">✕</button>
    </div>

    <div class="notes__new">
      ${q ? `<div class="tiny muted" style="margin-bottom:6px">Gắn vào <b>câu ${q.id}</b> — ${esc(q.q.slice(0, 55))}${q.q.length > 55 ? '…' : ''}</div>` : ''}
      <input class="search notes__title" id="noteTitle" placeholder="Tiêu đề — để trống cũng được" maxlength="90">
      <textarea id="noteInput" class="answer-area notes__input" rows="3"
        placeholder="${q ? 'Viết lại ý này bằng lời của bạn…' : 'Ghi nhanh một điều bạn muốn nhớ…'}"></textarea>
      <div class="tagpick">
        ${TAG_IDS.map((id) => `<button class="tagchip tagchip--${id}" data-newtag="${id}" aria-pressed="${newTag === id}"
          style="--tag:${TAGS[id].color}">${TAGS[id].icon} ${TAGS[id].label}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn btn--primary btn--sm" data-note="add">Lưu <span class="kbd">Ctrl↵</span></button>
        ${q ? `<label class="tiny muted" style="display:flex;align-items:center;gap:6px">
          <input type="checkbox" id="noteAttach" checked> gắn vào câu ${q.id}</label>` : ''}
        <span class="grow"></span>
        <span class="tiny muted" title="Bọc bằng hai dấu bằng để tô sáng">Dùng <code>==tô sáng==</code></span>
      </div>
    </div>

    <div class="notes__tools">
      <input class="search" id="noteSearch" placeholder="Tìm trong sổ tay…" value="${esc(query)}">
      <div class="row" style="margin-top:8px">
        <button class="chip chip--sm" data-filter="all" aria-pressed="${filter === 'all'}">Tất cả ${tatCa.length}</button>
        <button class="chip chip--sm" data-filter="pinned" aria-pressed="${filter === 'pinned'}">📌 ${tatCa.filter((n) => n.pinned).length}</button>
        ${qid ? `<button class="chip chip--sm" data-filter="question" aria-pressed="${filter === 'question'}">Câu ${qid}</button>` : ''}
      </div>
      <div class="row" style="margin-top:6px">
        ${TAG_IDS.filter((id) => dem(id)).map((id) => `<button class="chip chip--sm" data-filter="tag:${id}"
          aria-pressed="${filter === `tag:${id}`}">${TAGS[id].icon} ${TAGS[id].label} ${dem(id)}</button>`).join('')}
      </div>
    </div>

    <div class="notes__list">${ds.length ? ds.map(item).join('') : trong()}</div>`;
}

const trong = () => `
  <div class="empty" style="padding:34px 16px">
    <div class="empty__icon">🗒️</div>
    <p class="small muted" style="max-width:32ch;margin:0 auto">
      ${query || filter !== 'all'
    ? 'Không có ghi chú nào khớp.'
    : 'Chưa có ghi chú nào. Lúc vừa quên một câu rồi được nhắc lại chính là lúc ghi chú đọng nhất.'}
    </p>
  </div>`;

function item(n) {
  const tag = TAGS[n.tag] || TAGS.note;
  if (editing === n.id) {
    return `<article class="note note--edit" style="--tag:${tag.color}">
      <input class="search notes__title" data-edit-title="${n.id}" value="${esc(n.title || '')}" placeholder="Tiêu đề">
      <textarea class="answer-area notes__input" data-edit="${n.id}" rows="5">${esc(n.text)}</textarea>
      <div class="tagpick">
        ${TAG_IDS.map((id) => `<button class="tagchip" data-edittag="${id}" data-id="${n.id}"
          aria-pressed="${(n.tag || 'note') === id}" style="--tag:${TAGS[id].color}">${TAGS[id].icon} ${TAGS[id].label}</button>`).join('')}
      </div>
      <div class="row" style="margin-top:10px">
        <button class="btn btn--primary btn--sm" data-note="save" data-id="${n.id}">Lưu</button>
        <button class="btn btn--ghost btn--sm" data-note="cancel">Hủy</button>
      </div>
    </article>`;
  }
  const q = n.qid ? state.byId.get(n.qid) : null;
  const mo = expanded.has(n.id);
  // Không đặt tiêu đề thì dòng đầu đã được dùng làm tiêu đề rồi — bỏ nó khỏi
  // phần nội dung để khỏi hiện hai lần.
  const than = n.title ? n.text : String(n.text || '').split('\n').slice(1).join('\n').trim();
  const dai = than.length > 220;
  return `<article class="note${n.pinned ? ' note--pin' : ''}" style="--tag:${tag.color}">
    <div class="note__top">
      <span class="note__tag" title="${tag.label}">${tag.icon}</span>
      <h3 class="note__title">${esc(tieuDe(n))}</h3>
      ${n.pinned ? '<span class="note__pinned" title="Đã ghim">📌</span>' : ''}
    </div>
    ${than ? `<div class="note__body md${dai && !mo ? ' note__body--clamp' : ''}" ${dai ? `data-toggle="${n.id}"` : ''}>${md(than)}</div>` : ''}
    ${dai ? `<button class="note__more" data-toggle="${n.id}">${mo ? 'Thu gọn' : 'Xem thêm'}</button>` : ''}
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
    const t = e.target.closest('[data-note], [data-filter], [data-newtag], [data-edittag], [data-toggle]');
    if (!t) return;
    const id = t.dataset.id;

    if (t.dataset.filter) {
      filter = t.dataset.filter;
      return paintNotes();
    }
    if (t.dataset.newtag) {
      newTag = t.dataset.newtag;
      return paintNotes();
    }
    if (t.dataset.edittag) {
      updateNote(t.dataset.id, { tag: t.dataset.edittag });
      return paintNotes();
    }
    if (t.dataset.toggle) {
      const k = t.dataset.toggle;
      if (expanded.has(k)) expanded.delete(k);
      else expanded.add(k);
      return paintNotes();
    }

    switch (t.dataset.note) {
      case 'close': return toggleNotes(false);
      case 'add': {
        const el = host.querySelector('#noteInput');
        const tt = host.querySelector('#noteTitle');
        const text = el.value.trim();
        if (!text && !tt.value.trim()) return toast('Ghi chú đang trống.', 1500);
        const gan = host.querySelector('#noteAttach');
        addNote({ text, title: tt.value, tag: newTag, qid: gan && gan.checked ? state.ui.qid : null });
        el.value = '';
        tt.value = '';
        newTag = 'note';
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
        updateNote(id, {
          text: host.querySelector(`[data-edit="${id}"]`).value.trim(),
          title: host.querySelector(`[data-edit-title="${id}"]`).value.trim(),
        });
        editing = null;
        return paintNotes();
      }
      case 'del': {
        if (confirm('Xóa ghi chú này?')) deleteNote(id);
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
    if (e.target.id !== 'noteSearch') return;
    query = e.target.value;
    const list = host.querySelector('.notes__list');
    const ds = locDanhSach();
    if (list) list.innerHTML = ds.length ? ds.map(item).join('') : trong();
  });

  host.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      host.querySelector('[data-note="add"], [data-note="save"]')?.click();
    }
    // Enter ở ô tiêu đề thì nhảy xuống phần nội dung cho liền mạch
    if (e.key === 'Enter' && e.target.id === 'noteTitle') {
      e.preventDefault();
      host.querySelector('#noteInput')?.focus();
    }
  });

  document.querySelector('#notesBackdrop')?.addEventListener('click', () => toggleNotes(false));
}
