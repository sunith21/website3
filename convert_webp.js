const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const imgDir = path.join(__dirname, 'assets', 'img');
const htmlDir = __dirname;

async function doWork() {
    console.log('Starting conversion...');
    const files = fs.readdirSync(imgDir);
    const convertedMap = {}; // oldName -> newName
    
    // 1. Convert Images
    for (const file of files) {
        if (!file.match(/\.(jpg|jpeg|png)$/i)) continue;
        
        const oldFile = path.join(imgDir, file);
        // Avoid double converting. Extname returns e.g. ".jpg"
        const ext = path.extname(file);
        const newName = file.slice(0, -ext.length) + '.webp';
        const newFile = path.join(imgDir, newName);
        
        console.log(`Converting ${file} ...`);
        
        try {
            await sharp(oldFile)
                .webp({ quality: 80 })
                .toFile(newFile);
                
            console.log(` -> Success: ${newName}`);
            convertedMap[file] = newName;
            
            // Delete old file to save huge amounts of space
            fs.unlinkSync(oldFile);
        } catch (e) {
            console.error(`Failed to convert ${file}`, e);
        }
    }
    
    // 2. Update HTML
    const htmlFiles = fs.readdirSync(htmlDir).filter(f => f.endsWith('.html'));
    let replaceCount = 0;
    
    for (const hf of htmlFiles) {
        const hp = path.join(htmlDir, hf);
        let content = fs.readFileSync(hp, 'utf8');
        let modified = false;
        
        for (const [oldName, newName] of Object.entries(convertedMap)) {
            // Because names might be URL-encoded in HTML (e.g., %20 for space),
            // and we need a reliable replace, we'll do global replace on literal and url encoded:
            
            const oldEncoded = encodeURIComponent(oldName).replace(/%20/g, '(?:%20| )');
            const safeOldLiteral = oldName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
            
            const regex = new RegExp(`(${safeOldLiteral}|${encodeURIComponent(oldName).replace(/%20/g, ' ')}|${encodeURIComponent(oldName)})`, 'g');
            
            if (regex.test(content)) {
                content = content.replace(regex, encodeURI(newName)); // use standard encodeURI just in case
                modified = true;
            }
        }
        
        if (modified) {
            // simple catch all for extensions that might have been hardcoded
            // like: src="assets/img/foo.jpg"
            // actually the above loop already safely replaces the filenames.
            fs.writeFileSync(hp, content);
            replaceCount++;
        }
    }
    console.log(`Updated images in ${replaceCount} HTML files!`);
    
    // 3. Update CSS
    const cssPath = path.join(htmlDir, 'assets', 'css', 'style.css');
    if (fs.existsSync(cssPath)) {
        let cssContent = fs.readFileSync(cssPath, 'utf8');
        let cssMod = false;
        for (const [oldName, newName] of Object.entries(convertedMap)) {
             // In CSS it's either in url('...') or literal
             const regex = new RegExp(oldName.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'g');
             if (regex.test(cssContent)) {
                 cssContent = cssContent.replace(regex, newName);
                 cssMod = true;
             }
        }
        if (cssMod) {
            fs.writeFileSync(cssPath, cssContent);
            console.log('Updated CSS file');
        }
    }
}

doWork().catch(console.error);
