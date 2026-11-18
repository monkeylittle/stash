// Pages every test iterates over. Add new top-level pages here.
const fs = require('fs');
const path = require('path');

const news = fs.readdirSync(path.join(__dirname, '../content/news'))
  .filter(f => f.endsWith('.md') && f !== '_index.md')
  .map(f => `/news/${f.replace(/\.md$/, '')}/`);

module.exports = { pages: ['/', '/about/', '/sponsors/', '/gallery/', '/news/', '/contact/', ...news] };
