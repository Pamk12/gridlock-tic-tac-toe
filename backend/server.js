import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBestMove } from './src/ai/minimax.js';
import { getWinner, isValidBoard } from '../shared/gameRules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const staticRoot = path.resolve(__dirname, '..', 'dist');
const port = Number(process.env.PORT || 3001);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 10_000) reject(new Error('Request body is too large.'));
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('Request body must be valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function serveStaticFile(request, response, pathname) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.resolve(staticRoot, `.${requestedPath}`);

  if (!filePath.startsWith(staticRoot)) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  const fallback = path.join(staticRoot, 'index.html');
  const target = fs.existsSync(filePath) ? filePath : fallback;

  if (!fs.existsSync(target)) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Frontend build not found. Run npm run build first.');
    return;
  }

  const extension = path.extname(target);
  response.writeHead(200, {
    'Cache-Control': 'no-cache',
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
  });
  fs.createReadStream(target).pipe(response);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`);

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    });
    response.end();
    return;
  }

  if (request.method === 'GET' && requestUrl.pathname === '/api/health') {
    sendJson(response, 200, { ok: true, service: 'gridlock-backend' });
    return;
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/ai/move') {
    try {
      const { board } = await readJson(request);

      if (!isValidBoard(board) || getWinner(board)) {
        sendJson(response, 400, { error: 'Send an unfinished 3x3 board.' });
        return;
      }

      const xCount = board.filter((mark) => mark === 'X').length;
      const oCount = board.filter((mark) => mark === 'O').length;

      if (xCount !== oCount + 1) {
        sendJson(response, 400, { error: 'The AI can move only after player X.' });
        return;
      }

      sendJson(response, 200, { index: findBestMove(board) });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'GET') {
    serveStaticFile(request, response, requestUrl.pathname);
    return;
  }

  sendJson(response, 404, { error: 'Not found.' });
});

server.listen(port, () => {
  console.log(`Gridlock backend listening on http://localhost:${port}`);
});
