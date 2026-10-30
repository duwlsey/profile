const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = process.argv[2];
if (!root) throw new Error('Provide the prepared site directory');
const indexPath = path.join(root, 'index.html');
let html = fs.readFileSync(indexPath, 'utf8');
for (const file of ['style.css', 'refinement.css', 'tools.js', 'app.js', 'logo.js', 'character.js']) {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0, 12);
  html = html.replaceAll(`"${file}"`, `"${file}?v=${hash}"`);
}
fs.writeFileSync(indexPath, html);
