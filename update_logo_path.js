const fs = require('fs');
const path = require('path');

const htmlDir = __dirname;
const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));

let count = 0;
for (const file of htmlFiles) {
    const filePath = path.join(htmlDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('logo_tagline_closer.webp')) {
        content = content.replace(/logo_tagline_closer\.webp/g, 'logo_tagline_closer_horizontal.webp');
        fs.writeFileSync(filePath, content);
        count++;
    }
}

console.log(`Updated logo path in ${count} files.`);
