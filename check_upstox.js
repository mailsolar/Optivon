const https = require('https');
const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, 'server/upstox_token.json');
if (!fs.existsSync(tokenPath)) {
    console.log('Token file not found');
    process.exit(1);
}

const token = JSON.parse(fs.readFileSync(tokenPath, 'utf8')).access_token;
const instrument = encodeURIComponent('NSE_INDEX|Nifty 50');

const options = {
    hostname: 'api.upstox.com',
    port: 443,
    path: `/v2/market-quote/ltp?instrument_key=${instrument}`,
    method: 'GET',
    headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
    }
};

console.log('Testing Upstox API...');
const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('Status:', res.statusCode);
        console.log('Response:', data);
    });
});

req.on('error', (e) => console.error('Error:', e.message));
req.end();
