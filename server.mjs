// Server local cho hệ thống ôn tập. Zero-config: `npm install` rồi `npm start`.
// - Phục vụ file tĩnh trong public/
// - /api/content : 120 câu hỏi + đáp án + rubric (đọc từ content/questions/*.mjs)
// - /api/state   : lưu / đọc tiến độ học (data/progress.json)
// - /api/grade   : chấm câu tự luận theo rubric (OpenAI hoặc Anthropic - xem llm.mjs)
// - /api/coach   : hỏi thêm về một câu
import http from 'node:http';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

try {
  process.loadEnvFile(path.join(here, '.env'));
} catch {
  /* chưa có .env - vẫn chạy được, chỉ mất phần chấm bằng LLM */
}

// import sau khi nạp .env để llm.mjs đọc được biến môi trường
const llm = await import('./llm.mjs');

const PORT = Number(process.env.PORT || 5173);
const STATE_FILE = path.join(here, 'data', 'progress.json');

/* ---------------------------------------------------------------- nội dung */
async function loadContent() {
  const dir = path.join(here, 'content', 'questions');
  const files = (await fsp.readdir(dir)).filter((f) => f.endsWith('.mjs')).sort();
  const topics = [];
  for (const f of files) {
    const url = pathToFileURL(path.join(dir, f)).href + '?v=' + Date.now();
    const mod = await import(url);
    topics.push(mod.default);
  }
  const questions = topics.flatMap((t) =>
    t.questions.map((q) => ({ ...q, topic: t.id, topicName: t.name })),
  );
  return {
    topics: topics.map(({ questions: qs, ...rest }) => ({ ...rest, count: qs.length })),
    questions,
  };
}

let CONTENT = await loadContent();
let byId = new Map(CONTENT.questions.map((q) => [q.id, q]));

/* ------------------------------------------------------------------ tiến độ */
async function readState() {
  try {
    return JSON.parse(await fsp.readFile(STATE_FILE, 'utf8'));
  } catch {
    return null;
  }
}

let writeQueue = Promise.resolve();
function writeState(state) {
  writeQueue = writeQueue.then(async () => {
    await fsp.mkdir(path.dirname(STATE_FILE), { recursive: true });
    const tmp = STATE_FILE + '.tmp';
    await fsp.writeFile(tmp, JSON.stringify(state, null, 2), 'utf8');
    await fsp.rename(tmp, STATE_FILE); // ghi nguyên tử: không bao giờ để lại file rỗng
  });
  return writeQueue;
}

/* --------------------------------------------------------------------- HTTP */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ico': 'image/x-icon',
};

function sendJSON(res, status, data) {
  const buf = Buffer.from(JSON.stringify(data));
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': buf.length });
  res.end(buf);
}

function readBody(req, limit = 2000000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('BODY_QUA_LON'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const isSetupError = (code) => code === 'no_key' || code === 'no_sdk';

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const p = url.pathname;

  try {
    if (p === '/api/health') {
      return sendJSON(res, 200, { ...llm.state(), questionCount: CONTENT.questions.length });
    }

    if (p === '/api/content') {
      if (process.env.NODE_ENV !== 'production') {
        CONTENT = await loadContent(); // dev: sửa nội dung không cần restart
        byId = new Map(CONTENT.questions.map((q) => [q.id, q]));
      }
      return sendJSON(res, 200, CONTENT);
    }

    if (p === '/api/state' && req.method === 'GET') {
      return sendJSON(res, 200, (await readState()) ?? { empty: true });
    }

    if (p === '/api/state' && req.method === 'PUT') {
      await writeState(await readBody(req));
      return sendJSON(res, 200, { ok: true });
    }

    if (p === '/api/grade' && req.method === 'POST') {
      const { questionId, answer } = await readBody(req);
      const q = byId.get(questionId);
      if (!q) return sendJSON(res, 404, { code: 'not_found', message: 'Không tìm thấy câu hỏi.' });

      if (!answer || !answer.trim()) {
        return sendJSON(res, 200, {
          overall: 0,
          verdict: 'blank',
          points: q.points.map((pt, i) => ({ id: pt.id || 'p' + (i + 1), status: 'miss', evidence: '', note: 'Chưa trả lời.' })),
          misconceptions: [],
          missing_summary: 'Chưa có bài làm.',
          feedback: 'Bạn để trống câu trả lời. Đọc kỹ đáp án mẫu rồi thử viết lại bằng lời của mình.',
          upgrade: 'Lần sau cứ viết những gì nhớ được, dù chỉ một ý - chính nỗ lực nhớ lại mới tạo ra trí nhớ.',
          suggested_rating: 'again',
        });
      }

      try {
        return sendJSON(res, 200, await llm.grade(q, answer));
      } catch (err) {
        const payload = llm.errorPayload(err);
        return sendJSON(res, isSetupError(payload.code) ? 503 : 502, payload);
      }
    }

    if (p === '/api/drill-grade' && req.method === 'POST') {
      const { questionId, pointId, mode, answer } = await readBody(req);
      const q = byId.get(questionId);
      if (!q) return sendJSON(res, 404, { code: 'not_found', message: 'Không tìm thấy câu hỏi.' });
      const point = q.points.find((pt, i) => (pt.id || 'p' + (i + 1)) === pointId) || null;
      if (!point && mode !== 'skeleton') {
        return sendJSON(res, 404, { code: 'not_found', message: 'Không tìm thấy ý này.' });
      }
      if (!answer || !answer.trim()) {
        return sendJSON(res, 200, { score: 0, ok: false, matched: [], feedback: 'Bạn để trống. Cứ viết những gì nhớ được, dù một cụm từ.', hint: '' });
      }
      try {
        return sendJSON(res, 200, await llm.gradeDrill(q, point, mode || 'point', answer));
      } catch (err) {
        const payload = llm.errorPayload(err);
        return sendJSON(res, isSetupError(payload.code) ? 503 : 502, payload);
      }
    }

    if (p === '/api/coach' && req.method === 'POST') {
      const { questionId, question, history } = await readBody(req);
      const q = byId.get(questionId);
      if (!q) return sendJSON(res, 404, { code: 'not_found', message: 'Không tìm thấy câu hỏi.' });
      try {
        const answer = await llm.coach(q, question || 'Giải thích sâu hơn giúp mình.', history || []);
        return sendJSON(res, 200, { answer });
      } catch (err) {
        const payload = llm.errorPayload(err);
        return sendJSON(res, isSetupError(payload.code) ? 503 : 502, payload);
      }
    }

    if (p.startsWith('/api/')) return sendJSON(res, 404, { code: 'not_found', message: 'Không có endpoint này.' });

    /* --- file tĩnh --- */
    const rel = p === '/' ? 'index.html' : decodeURIComponent(p).replace(/^\/+/, '');
    const root = path.join(here, 'public');
    const file = path.join(root, rel);
    if (!file.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
        res.end('404 - không tìm thấy ' + rel);
        return;
      }
      res.writeHead(200, {
        'content-type': MIME[path.extname(file)] || 'application/octet-stream',
        'cache-control': 'no-cache',
      });
      res.end(data);
    });
  } catch (err) {
    sendJSON(res, 500, llm.errorPayload(err));
  }
});

server.listen(PORT, async () => {
  console.log('\n  Ôn tập AI Engineering - ' + CONTENT.questions.length + ' câu');
  console.log('  http://localhost:' + PORT);
  if (!llm.PROVIDER) {
    console.log('  Chấm bài: TỰ CHẤM (chưa có API key trong .env - vẫn học được đầy đủ)\n');
  } else {
    const model = await llm.resolveModel();
    console.log(`  Chấm bài: ${llm.PROVIDER} · model ${model}\n`);
  }
});
