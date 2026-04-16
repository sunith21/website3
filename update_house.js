const fs = require('fs');
const path = require('path');

const htmlDir = __dirname;
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

let count = 0;
for (const file of htmlFiles) {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('house2.avif')) {
        content = content.replace(/house2\.avif/g, 'house2.webp');
        fs.writeFileSync(filePath, content);
        count++;
    }
}

console.log(`Updated house2 path in ${count} files.`);
