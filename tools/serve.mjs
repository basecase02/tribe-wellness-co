#!/usr/bin/env node
// Local preview server: Netlify-style pretty URLs (/about → about.html), _redirects, 404.html,
// a stub for Netlify Forms POSTs, and the /api/gm GymMaster proxy (set GYMMASTER_API_KEY to use it).
// Usage: node tools/serve.mjs [port]   (default 8765)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.argv[2] || process.env.PORT || 8765);
const TYPES = { html: 'text/html; charset=utf-8', css: 'text/css; charset=utf-8', js: 'text/javascript; charset=utf-8', mjs: 'text/javascript; charset=utf-8', json: 'application/json; charset=utf-8', webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon', mp4: 'video/mp4', webmanifest: 'application/manifest+json', xml: 'application/xml', txt: 'text/plain; charset=utf-8', woff2: 'font/woff2', md: 'text/plain; charset=utf-8' };
const redirects = fs.existsSync(path.join(ROOT, '_redirects'))
  ? fs.readFileSync(path.join(ROOT, '_redirects'), 'utf8').split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#')).map(l => l.split(/\s+/))
  : [];
let gm = null;
try { gm = (await import('../netlify/functions/gm.mjs')).default; } catch (e) { console.warn('GymMaster proxy not loaded:', e.message); }

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const p = decodeURIComponent(url.pathname);
  try {
    if (p.startsWith('/api/gm/') && gm) {
      const body = req.method === 'POST' ? await new Promise(r => { let b = ''; req.on('data', c => b += c); req.on('end', () => r(b)); }) : undefined;
      const out = await gm(new Request(url, { method: req.method, headers: req.headers, body }));
      res.writeHead(out.status, Object.fromEntries(out.headers));
      res.end(Buffer.from(await out.arrayBuffer()));
      return;
    }
    if (req.method === 'POST') { res.writeHead(200, { 'content-type': TYPES.txt }); res.end('OK — in production Netlify Forms stores this submission.'); return; }
    for (const [from, to, code] of redirects) {
      if (!from.includes('*') && from === p) { res.writeHead(Number(code) || 301, { location: to }); res.end(); return; }
    }
    const candidates = p.endsWith('/') ? [p + 'index.html'] : [p, p + '.html', p + '/index.html'];
    let file = null;
    for (const c of candidates) {
      const f = path.normalize(path.join(ROOT, c));
      if (f.startsWith(ROOT) && fs.existsSync(f) && fs.statSync(f).isFile()) { file = f; break; }
    }
    if (!file) {
      const nf = path.join(ROOT, '404.html');
      res.writeHead(404, { 'content-type': TYPES.html });
      res.end(fs.existsSync(nf) ? fs.readFileSync(nf) : 'Not found');
      return;
    }
    const ext = path.extname(file).slice(1).toLowerCase();
    res.writeHead(200, { 'content-type': TYPES[ext] || 'application/octet-stream', 'cache-control': 'no-cache' });
    fs.createReadStream(file).pipe(res);
  } catch (e) {
    res.writeHead(500, { 'content-type': TYPES.txt }); res.end('Server error: ' + e.message);
  }
});
let port = PORT;
server.on('error', (e) => {
  if (e.code === 'EADDRINUSE' && port < PORT + 10) { console.warn(`Port ${port} is busy (another preview running?), trying ${port + 1}…`); port += 1; server.listen(port); }
  else { console.error(e.message); process.exit(1); }
});
server.on('listening', () => console.log(`Tribe Wellness Co → http://localhost:${port}`));
server.listen(port);
