const fs = require('fs');
const path = require('path');
const srcDir = path.resolve(__dirname, 'client/src');

function getAllFiles(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) results = results.concat(getAllFiles(fullPath));
        else if (entry.name.endsWith('.jsx')) results.push(fullPath);
    }
    return results;
}

const files = getAllFiles(srcDir);
let totalChanges = 0;

const replacements = [
    // Text colors
    [/text-platinum/g, 'text-primary'],
    [/text-white/g, 'text-primary'],
    [/text-amethyst/g, 'text-secondary'],
    [/text-violet-night/g, 'text-primary'],
    
    // Backgrounds replacing dark theme bg with light/editorial bg
    [/bg-violet-night/g, 'bg-background'],
    [/bg-amethyst/g, 'bg-accent'], // Accent is now soft black, buttons need this
    [/bg-imperial/g, 'bg-surface'],
    
    // Borders
    [/border-violet-night(\/\d+)?/g, 'border-black/15'],
    [/border-amethyst(\/\d+)?/g, 'border-black/15'],
    [/border-platinum(\/\d+)?/g, 'border-black/15'],
    [/border-white(\/\d+)?/g, 'border-black/15'],
    
    // Hover Effects
    [/hover:text-amethyst/g, 'hover:opacity-50'],
    [/hover:text-platinum/g, 'hover:opacity-50'],
    [/hover:text-white/g, 'hover:opacity-50'],
    [/group-hover:text-amethyst/g, 'group-hover:opacity-50'],
    [/hover:border-amethyst(\/\d+)?/g, 'hover:border-black/30'],
    [/hover:bg-violet-night(\/\d+)?/g, 'hover:bg-black/5'],
    
    // Shadows & Effects
    [/shadow-violet/g, ''],
    [/shadow-amethyst-glow/g, ''],
    [/shadow-premium/g, ''],
    [/drop-shadow-2xl/g, ''],
    [/glass/g, 'bg-surface border border-black/15'],
    [/gradient-border/g, 'border border-black/15'],
];

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;

    for (const [pattern, replacement] of replacements) {
        content = content.replace(pattern, replacement);
    }
    
    // Clean specific classes that might have trailing opacity rules we didn't catch 
    content = content.replace(/text-primary\/\d+/g, 'text-secondary'); 
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✓ ${path.relative(__dirname, filePath)}`);
        totalChanges++;
    }
}
console.log(`\n✅ Swept ${totalChanges} files to Editorial Minimalist (SAFE SWEEP).`);
