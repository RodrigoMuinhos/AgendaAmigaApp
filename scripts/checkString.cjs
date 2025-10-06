const fs = require('node:fs');
const text = fs.readFileSync('apps/frontend/src/screens/Relatorios.tsx', 'utf8');
const substring = 'Calmo e atento ';
const index = text.indexOf(substring);
console.log(index);
console.log(text.slice(index, index + 40));
console.log([...text.slice(index, index + 20)].map(ch => ch.charCodeAt(0)));
