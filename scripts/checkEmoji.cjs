const fs = require('node:fs');
const text = fs.readFileSync('apps/frontend/src/screens/Relatorios.tsx', 'utf8');
const match = text.match(/emoji: "(.+?)",/);
if (match) {
  console.log(match[1]);
}
