const fs = require('fs');
const file = process.argv[2] || './ui_5554.xml';
const xml = fs.readFileSync(file, 'utf8');
const lines = xml.split('><');
console.log('=== FILE:', file);
lines.forEach(l => {
  if (l.includes('EditText') || l.includes('Gửi')) {
    const cls = l.match(/class="([^"]+)"/)?.[1];
    const desc = l.match(/content-desc="([^"]+)"/)?.[1];
    const bounds = l.match(/bounds="([^"]+)"/)?.[1];
    console.log(cls, '|', desc, '|', bounds);
  }
});
