// Tiện ích dựng giao diện + các biểu đồ nhỏ vẽ bằng SVG/CSS thuần.
import { esc } from './md.js';

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Tạo phần tử từ chuỗi HTML. */
export function frag(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content;
}

export function on(root, selector, event, handler) {
  root.addEventListener(event, (e) => {
    const target = e.target.closest(selector);
    if (target && root.contains(target)) handler(e, target);
  });
}

let toastTimer = null;
export function toast(msg, ms = 2600) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), ms);
}

export function modal(html) {
  const dlg = $('#modal');
  $('#modalBody').innerHTML = html;
  dlg.showModal();
  return dlg;
}
export const closeModal = () => $('#modal').close();

/* ------------------------------------------------------------- định dạng */
export const pct = (x) => Math.round(x * 100);
export const plural = (n, word) => `${n} ${word}`;

export function relTime(ms) {
  const d = ms - Date.now();
  if (d <= 0) return 'đến hạn';
  const min = d / 60000;
  if (min < 60) return `sau ${Math.round(min)} phút`;
  if (min < 1440) return `sau ${Math.round(min / 60)} giờ`;
  const days = min / 1440;
  if (days < 30) return `sau ${Math.round(days)} ngày`;
  if (days < 365) return `sau ${Math.round(days / 30)} tháng`;
  return `sau ${(days / 365).toFixed(1)} năm`;
}

export function fmtDuration(sec) {
  if (sec < 60) return `${Math.round(sec)} giây`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m} phút`;
  return `${Math.floor(m / 60)} giờ ${m % 60} phút`;
}

export const dayKey = (d) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};

/* ---------------------------------------------------------------- charts */

/** Vòng tròn điểm số. Màu theo mức: đỏ → vàng → xanh. */
export function scoreRing(score, size = 92) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const filled = (Math.max(0, Math.min(100, score)) / 100) * c;
  const color = score >= 90 ? 'var(--good)' : score >= 70 ? 'var(--accent)' : score >= 50 ? 'var(--warn)' : 'var(--bad)';
  return `
    <div class="score__ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}" aria-hidden="true">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--surface-3)" stroke-width="8"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="8"
                stroke-linecap="round" stroke-dasharray="${filled} ${c - filled}"/>
      </svg>
      <div class="score__num" style="color:${color}">${Math.round(score)}</div>
    </div>`;
}

/** Thanh mức độ thành thạo (thang tuần tự một màu, đậm dần theo mức). */
export function masteryBar(value, width = 100) {
  const v = Math.max(0, Math.min(1, value));
  const step = v === 0 ? 'var(--seq-0)' : v < 0.25 ? 'var(--seq-2)' : v < 0.5 ? 'var(--seq-3)' : v < 0.75 ? 'var(--seq-4)' : 'var(--seq-5)';
  return `<div class="bar" style="width:${width}px" role="img" aria-label="Thành thạo ${pct(v)}%">
            <div class="bar__fill" style="width:${Math.max(v * 100, v > 0 ? 4 : 0)}%;background:${step}"></div>
          </div>`;
}

/** Lịch nhiệt hoạt động: 7 hàng (thứ trong tuần) × N cột (tuần). */
export function heatmap(days, weeks = 18) {
  const cells = [];
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setDate(end.getDate() - (weeks * 7 - 1) - ((end.getDay() + 6) % 7));

  const max = Math.max(1, ...Object.values(days).map((d) => d.reviews || 0));
  for (let i = 0; i < weeks * 7 + 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    if (d > end) break;
    const key = dayKey(d);
    const n = days[key]?.reviews || 0;
    const lvl = n === 0 ? 0 : Math.min(5, Math.ceil((n / max) * 5));
    cells.push(
      `<div class="heat__cell" style="background:var(--seq-${lvl})" title="${key}: ${n} lượt ôn"></div>`,
    );
  }
  const legend = [0, 1, 2, 3, 4, 5]
    .map((l) => `<span class="legend__sw" style="background:var(--seq-${l})"></span>`)
    .join('');
  return `<div style="overflow-x:auto"><div class="heat">${cells.join('')}</div></div>
          <div class="legend" style="margin-top:10px"><span>ít</span>${legend}<span>nhiều</span></div>`;
}

/** Dự báo số thẻ đến hạn trong 14 ngày tới. */
export function forecast(cards, days = 14) {
  const buckets = new Array(days).fill(0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const c of Object.values(cards)) {
    if (c.stage === 'new') continue;
    const diff = Math.floor((c.due - now.getTime()) / 86400000);
    const idx = Math.max(0, Math.min(days - 1, diff));
    if (diff < days) buckets[idx]++;
  }
  const max = Math.max(1, ...buckets);
  const labels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const cols = buckets
    .map((n, i) => {
      const d = new Date(now.getTime() + i * 86400000);
      const h = (n / max) * 100;
      return `<div class="fcast__col" title="${dayKey(d)}: ${n} thẻ">
                <span class="tiny muted">${n || ''}</span>
                <div class="fcast__bar" style="height:${h}%;${n === 0 ? 'background:var(--surface-3)' : ''}"></div>
                <span class="fcast__lbl">${i === 0 ? 'nay' : labels[d.getDay()]}</span>
              </div>`;
    })
    .join('');
  return `<div class="fcast">${cols}</div>`;
}

export { esc };
