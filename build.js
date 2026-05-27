const fs = require('fs');
const path = require('path');

const src = path.join(__dirname);
const out = path.join(__dirname, 'dist');

function mkdirp(p) { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); }
function copyFile(s, d) { mkdirp(path.dirname(d)); fs.copyFileSync(s, d); }

function minifyHtml(html) {
  return html.replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();
}
function minifyCss(css) {
  return css.replace(/\/\*[^*]*\*+([^/][^*]*\*+)*\//g, '').replace(/\s{2,}/g, ' ').replace(/\s*([{}:;,])\s*/g, '$1').trim();
}
function minifyJs(js) {
  return js.replace(/\/\/.*$/mg, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s{2,}/g, ' ').trim();
}

function walk(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    const full = path.join(dir, f);
    const rel = path.relative(src, full);
    const outPath = path.join(out, rel);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) { walk(full); }
    else {
      const ext = path.extname(full).toLowerCase();
      if (ext === '.html') {
        const html = fs.readFileSync(full, 'utf8');
        fs.writeFileSync(outPath, minifyHtml(html), 'utf8');
      } else if (ext === '.css') {
        const css = fs.readFileSync(full, 'utf8');
        fs.writeFileSync(outPath, minifyCss(css), 'utf8');
      } else if (ext === '.js') {
        const js = fs.readFileSync(full, 'utf8');
        fs.writeFileSync(outPath, minifyJs(js), 'utf8');
      } else {
        copyFile(full, outPath);
      }
      console.log('Copied', rel);
    }
  });
}

if (fs.existsSync(out)) {
  fs.rmSync(out, { recursive: true, force: true });
}
mkdirp(out);
walk(src);
console.log('Frontend build complete. Output in frontend/dist');
