const fs = require('fs');
const path = require('path');
const movies = require('./movies.json');

const outDir = path.join(__dirname, '../../client/public/posters');
fs.mkdirSync(outDir, { recursive: true });

const palettes = [
  ['#1e3c72', '#2a5298'], ['#232526', '#414345'], ['#42275a', '#734b6d'],
  ['#134e5e', '#71b280'], ['#614385', '#516395'], ['#c0392b', '#8e44ad'],
  ['#0f2027', '#2c5364'], ['#b24592', '#f15f79'], ['#4b6cb7', '#182848'],
  ['#e65c00', '#b8860b'], ['#16222a', '#3a6073'],
];

const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const wrap = (text, max = 14) => {
  const lines = [];
  let line = '';
  for (const w of text.split(' ')) {
    if ((line + ' ' + w).trim().length > max) {
      if (line) lines.push(line);
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
  }
  if (line) lines.push(line);
  return lines;
};

movies.forEach((m, i) => {
  const [c1, c2] = palettes[i % palettes.length];
  const lines = wrap(m.title);
  const startY = 225 - (lines.length - 1) * 20;
  const title = lines
    .map(
      (l, k) =>
        `<text x="150" y="${startY + k * 40}" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" font-weight="700" fill="#ffffff">${esc(l)}</text>`
    )
    .join('');
  const genres = esc((m.genres || []).join(' · '));
  const badge = m.status === 'now' ? 'ĐANG CHIẾU' : 'SẮP CHIẾU';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
  </defs>
  <rect width="300" height="450" fill="url(#g)"/>
  <rect x="12" y="12" width="276" height="426" fill="none" stroke="#ffffff" stroke-opacity="0.4" stroke-width="2"/>
  <text x="150" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" letter-spacing="3" fill="#ffffff" fill-opacity="0.8">${badge}</text>
  ${title}
  <text x="150" y="410" text-anchor="middle" font-family="Arial, sans-serif" font-size="15" fill="#ffffff" fill-opacity="0.85">${genres}</text>
</svg>`;

  fs.writeFileSync(path.join(outDir, `p${i + 1}.svg`), svg);
});

console.log(`Đã tạo ${movies.length} poster trong client/public/posters`);