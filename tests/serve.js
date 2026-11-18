// Builds the site with Hugo into .test-site/ and serves it on the given port.
const { execFileSync } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const out = path.join(root, '.test-site');
const hugo = process.env.HUGO || 'hugo';
const port = Number(process.argv[2] || 4173);

fs.rmSync(out, { recursive: true, force: true });
console.log(`Building site with ${hugo}...`);
execFileSync(hugo, ['--gc', '--minify', '--destination', out, '--baseURL', `http://127.0.0.1:${port}/`], { cwd: root, stdio: 'inherit' });

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.json': 'application/json' };

http.createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  let file = path.join(out, p);
  if (!file.startsWith(out)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404, { 'content-type': 'text/html' }); return res.end('Not found'); }
  res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`Serving ${out} on ${port}`));
