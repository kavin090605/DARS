const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'frontend', 'src');
const fromUrl = 'https://dars-3-ixzc.onrender.com';
const toUrl = 'http://localhost:5000';

function replaceInDir(currentDir) {
    const files = fs.readdirSync(currentDir);
    for (const file of files) {
        const fullPath = path.join(currentDir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(fromUrl)) {
                content = content.replace(new RegExp(fromUrl, 'g'), toUrl);
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

replaceInDir(dir);
console.log('Done');
