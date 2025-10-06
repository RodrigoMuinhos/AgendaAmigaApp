const fs = require('node:fs');
const text = fs.readFileSync('apps/frontend/src/screens/Relatorios.tsx', 'utf8');
const index = text.indexOf('label: "Sens');
const snippet = text.slice(index, index + 20);
console.log(snippet);
console.log([...snippet].map((ch) => ch.charCodeAt(0)));
