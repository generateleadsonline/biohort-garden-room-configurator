// Renders designs through the harness to PNGs: node tools/qa/render.mjs <outdir> <name>=<query> ...
// query is the harness query string, e.g. "view=plan#d=2~1~..." Uses shot.mjs (SwiftShader).
import {build} from 'esbuild';
import {createServer} from 'node:http';
import {readFile, mkdtemp, writeFile, mkdir} from 'node:fs/promises';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const run = promisify(execFile);
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const [outdir, ...jobs] = process.argv.slice(2);
await mkdir(outdir, {recursive: true});
const tmp = await mkdtemp(path.join(process.env.SHOT_TMP || os.tmpdir(), 'bh-render-'));
await build({entryPoints: [path.join(repo, 'tools/qa/harness.js')], outfile: path.join(tmp, 'harness.js'), bundle: true, format: 'esm', logLevel: 'silent'});
await writeFile(path.join(tmp, 'index.html'), '<!doctype html><meta charset="utf-8"><style>html,body{margin:0;height:100%}#scene{position:absolute;inset:0}.scene-overlay{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;font:600 12px sans-serif}.scene-overlay line{stroke:#1f3b3d;stroke-width:1.5}.scene-overlay .pill rect{fill:#fff;stroke:#1f3b3d}.scene-overlay text{fill:#1f3b3d;stroke:none}</style><div id="scene"></div><script type="module" src="harness.js"></script>');
const server = createServer(async (req, res) => {
  const file = path.join(tmp, new URL(req.url, 'http://x').pathname.replace(/\/$/, '/index.html'));
  try { const body = await readFile(file); res.writeHead(200, {'Content-Type': file.endsWith('.js') ? 'text/javascript' : 'text/html'}); res.end(body); } catch { res.writeHead(404); res.end(); }
}).listen(0, '127.0.0.1');
await new Promise(r => server.on('listening', r));
const port = server.address().port;
const W = process.env.W || '1200', H = process.env.H || '800';
for (let i = 0; i < jobs.length; i += 3) {
  await Promise.all(jobs.slice(i, i + 3).map(async job => {
    const [name, q] = [job.slice(0, job.indexOf('=')), job.slice(job.indexOf('=') + 1)];
    const [query, hash] = q.split('#');
    try {
      const {stdout} = await run('node', [path.join(repo, 'tools/qa/shot.mjs'), `http://127.0.0.1:${port}/?${query}${hash ? '#' + hash : ''}`, W, H, path.join(outdir, name + '.png'), '--wait', 'window.__ready', '--settle', process.env.SETTLE || '2500', '--timeout', '240000'], {env: {...process.env}, maxBuffer: 1e8});
      console.log(name, 'ok', stdout.trim().slice(0, 300));
    } catch (e) { console.log(name, 'FAILED', String(e.stderr || e).slice(0, 300)); }
  }));
}
server.close();
