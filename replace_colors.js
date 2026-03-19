const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDir = fs.statSync(dirPath).isDirectory();
        if (isDir) {
            walk(dirPath);
        } else if (dirPath.endsWith('.jsx') || dirPath.endsWith('.css')) {
            let content = fs.readFileSync(dirPath, 'utf8');
            if (content.includes('#C5A059') || content.includes('#c5a059')) {
                let newContent = content.replace(/#C5A059/ig, '#C50022');
                fs.writeFileSync(dirPath, newContent);
                console.log(`Updated ${dirPath}`);
            }
        }
    });
}
walk('c:\\Users\\deepa\\OneDrive\\Documents\\project\\Optivon\\client\\src');
