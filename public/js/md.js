// Markdown renderer tối giản, đủ cho nội dung bài học: heading, đậm/nghiêng,
// code inline + block, danh sách, bảng, blockquote, hr, link.
// Mọi thứ đều được escape trước, không chèn HTML thô từ nội dung.

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const OPEN = '';  // ký tự vùng dùng riêng - không xuất hiện trong nội dung thật
const CLOSE = '';

function inline(text) {
  let s = esc(text);
  // Giữ chỗ cho code inline trước, để các luật đậm/nghiêng không đụng vào nội dung code
  const codes = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => {
    codes.push(c);
    return OPEN + (codes.length - 1) + CLOSE;
  });
  s = s
    .replace(/==([^=]+)==/g, '<mark>$1</mark>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>')
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const re = new RegExp(OPEN + '(\\d+)' + CLOSE, 'g');
  s = s.replace(re, (_, i) => `<code>${codes[Number(i)]}</code>`);
  return s;
}

function renderTable(lines) {
  const cells = (row) => row.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
  const head = cells(lines[0]);
  const body = lines.slice(2).map(cells);
  const th = head.map((c) => `<th>${inline(c)}</th>`).join('');
  const tr = body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('');
  return `<div class="tablewrap"><table><thead><tr>${th}</tr></thead><tbody>${tr}</tbody></table></div>`;
}

export function md(src) {
  if (!src) return '';
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // code block
    if (/^```/.test(line)) {
      const buf = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(`<pre><code>${esc(buf.join('\n'))}</code></pre>`);
      continue;
    }

    // bảng (cần dòng phân cách kiểu | --- |)
    if (/\|/.test(line) && lines[i + 1] && /^\s*\|?[\s:-]*-[-\s|:]*\|/.test(lines[i + 1])) {
      const buf = [line];
      i++;
      while (i < lines.length && /\|/.test(lines[i])) buf.push(lines[i++]);
      out.push(renderTable(buf));
      continue;
    }

    // heading (# -> h2 để không đụng h1 của trang)
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      const lvl = Math.min(h[1].length + 1, 4);
      out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
      i++;
      continue;
    }

    // đường kẻ ngang
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      out.push('<hr>');
      i++;
      continue;
    }

    // trích dẫn
    if (/^>\s?/.test(line)) {
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) buf.push(lines[i++].replace(/^>\s?/, ''));
      out.push(`<blockquote>${md(buf.join('\n'))}</blockquote>`);
      continue;
    }

    // danh sách (hỗ trợ một cấp lồng bằng thụt lề 2+ dấu cách)
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const buf = [];
      while (i < lines.length && (/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        buf.push(lines[i++]);
      }
      const items = [];
      let cur = null;
      for (const raw of buf) {
        const m = raw.match(/^(\s*)([-*+]|\d+\.)\s+(.*)$/);
        if (m && m[1].length < 2) {
          if (cur) items.push(cur);
          cur = { text: m[3], sub: [] };
        } else if (cur) {
          cur.sub.push(raw.replace(/^\s{2,}/, ''));
        }
      }
      if (cur) items.push(cur);
      const html = items
        .map((it) => `<li>${inline(it.text)}${it.sub.length ? md(it.sub.join('\n')) : ''}</li>`)
        .join('');
      out.push(ordered ? `<ol>${html}</ol>` : `<ul>${html}</ul>`);
      continue;
    }

    // đoạn văn
    if (line.trim() === '') {
      i++;
      continue;
    }
    const buf = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^```/.test(lines[i]) &&
      !/^#{1,4}\s/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
      !/^\s*(---|\*\*\*|___)\s*$/.test(lines[i]) &&
      !/\|/.test(lines[i])
    ) {
      buf.push(lines[i++]);
    }
    if (buf.length) {
      out.push(`<p>${inline(buf.join(' '))}</p>`);
    } else {
      out.push(`<p>${inline(lines[i])}</p>`);
      i++;
    }
  }
  return out.join('\n');
}

export { esc };
