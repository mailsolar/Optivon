const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'client/src');

function getAllFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) results = results.concat(getAllFiles(fullPath));
        else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.css')) results.push(fullPath);
    }
    return results;
}

// ORDER MATTERS: longer matches first to avoid partial replacements
const replacements = [
    // Tiber-light → amethyst (MUST come before tiber)
    [/tiber-light/g, 'amethyst'],
    // Tiber → violet-night
    [/tiber(?!-)/g, 'violet-night'],
    // Mint → amethyst
    [/(?<![a-zA-Z])mint(?![a-zA-Z])/g, 'amethyst'],
    // Cream → platinum
    [/(?<![a-zA-Z])cream(?![a-zA-Z])/g, 'platinum'],
    // Shadow names
    [/shadow-forest/g, 'shadow-violet'],
    // Green hex codes → violet hex codes
    [/#06392f/gi, '#2D1C42'],
    [/#10b981/gi, '#6B4C9A'],
    [/#0a5e4d/gi, '#3D2A5C'],
    [/#032119/gi, '#1B102A'],
    // Green rgba → violet rgba
    [/rgba\(6,\s*57,\s*47/g, 'rgba(45, 28, 66'],
    [/rgba\(6, 57, 47/g, 'rgba(45, 28, 66'],
    [/rgba\(16,\s*185,\s*129/g, 'rgba(107, 76, 154'],
    [/rgba\(16, 185, 129/g, 'rgba(107, 76, 154'],
    // Glow shadows with green → violet
    [/shadow-\[0_0_8px_#10b981\]/gi, 'shadow-[0_0_8px_#6B4C9A]'],
    [/shadow-\[0_0_8px_#6B4C9A\]/gi, 'shadow-[0_0_8px_#6B4C9A]'],
    // Font references (Outfit → Inter)
    [/font-sans/g, 'font-sans'],
];

const files = getAllFiles(srcDir);
let totalChanges = 0;

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    for (const [pattern, replacement] of replacements) {
        content = content.replace(pattern, replacement);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✓ ${path.relative(__dirname, filePath)}`);
        totalChanges++;
    }
}
console.log(`\n✅ Swept ${totalChanges} files to Violet Imperial.`);
