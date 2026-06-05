const fs = require('fs');
const path = require('path');

// Files to process (all remaining .jsx files with old accent references)
const srcDir = path.resolve(__dirname, 'client/src');

function getAllJsx(dir) {
    let results = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results = results.concat(getAllJsx(fullPath));
        } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.css')) {
            results.push(fullPath);
        }
    }
    return results;
}

const replacements = [
    // === COLOR CLASS REPLACEMENTS ===
    // bg-accent → bg-tiber (solid backgrounds)
    [/bg-accent(?=[\s"'`/])/g, 'bg-tiber'],
    // bg-accent/ → bg-tiber/ (with opacity)
    [/bg-accent\//g, 'bg-tiber/'],
    
    // text-accent → text-mint
    [/text-accent(?=[\s"'`/\)])/g, 'text-mint'],
    [/text-accent\//g, 'text-mint/'],
    
    // border-accent → border-tiber-light
    [/border-accent(?=[\s"'`/\)])/g, 'border-tiber-light'],
    [/border-accent\//g, 'border-tiber-light/'],
    
    // hover:text-accent → hover:text-mint
    [/hover:text-accent/g, 'hover:text-mint'],
    // hover:bg-accent → hover:bg-tiber
    [/hover:bg-accent/g, 'hover:bg-tiber'],
    // hover:border-accent → hover:border-mint
    [/hover:border-accent/g, 'hover:border-mint'],
    
    // focus:border-accent → focus:border-mint
    [/focus:border-accent/g, 'focus:border-mint'],
    
    // shadow with #C50022 → #10b981
    [/#C50022/g, '#06392f'],
    [/rgba\(197,\s*0,\s*34/g, 'rgba(6, 57, 47'],
    [/rgba\(197, 0, 34/g, 'rgba(6, 57, 47'],
    
    // border-white/5 → border-tiber/20 (only in specific contexts)
    [/border-white\/5(?=[\s"'`\)])/g, 'border-tiber/20'],
    [/border-white\/\[0\.05\]/g, 'border-tiber/[0.15]'],
    
    // shadow-premium with old colors
    [/shadow-\[0_0_8px_#C50022\]/g, 'shadow-[0_0_8px_#10b981]'],
    [/shadow-\[0_0_15px_rgba\(197,0,34,0\.15\)\]/g, 'shadow-[0_0_15px_rgba(6,57,47,0.2)]'],
    
    // text-white → text-cream (selective - only for non-functional text)
    // NOT doing this globally as some contexts like chart overlays need pure white
    
    // tracking-tighter → tracking-tight (Playfair looks better with slightly looser tracking)
    [/tracking-tighter/g, 'tracking-tight'],
];

const files = getAllJsx(srcDir);
let totalChanges = 0;

for (const filePath of files) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    
    for (const [pattern, replacement] of replacements) {
        content = content.replace(pattern, replacement);
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        const relPath = path.relative(__dirname, filePath);
        console.log(`✓ Updated: ${relPath}`);
        totalChanges++;
    }
}

console.log(`\n✅ Done! Updated ${totalChanges} files.`);
