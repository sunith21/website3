const fs = require('fs');
const path = require('path');

const dir = '.';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    let cp = path.join(dir, file);
    let content = fs.readFileSync(cp, 'utf8');
    
    // Replace CSS
    content = content.replace(/assets\/css\/style\.css/g, 'assets/css/style.min.css');
    // Replace JS
    content = content.replace(/assets\/js\/site\.js/g, 'assets/js/site.min.js');
    
    fs.writeFileSync(cp, content);
    console.log(`Updated ${file}`);
});
