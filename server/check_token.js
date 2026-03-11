const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, 'upstox_token.json');

if (fs.existsSync(tokenPath)) {
    try {
        const stats = fs.statSync(tokenPath);
        console.log(`Token file last modified: ${stats.mtime}`);

        const data = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        console.log('Token data keys:', Object.keys(data));
        // Don't log the full token, just length or expiry if present
        if (data.access_token) {
            console.log(`Access Token present (length: ${data.access_token.length})`);
        } else {
            console.log('Access Token MISSING');
        }

    } catch (e) {
        console.error('Error reading token file:', e.message);
    }
} else {
    console.log('Token file does not exist.');
}
