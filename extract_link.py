import re
import os

log_file = 'tunnel_fresh.log'
if not os.path.exists(log_file):
    print("Log file not found")
    exit(1)

data = open(log_file, 'rb').read()
encs = ['utf-16', 'utf-8', 'utf-16le', 'utf-16be', 'ascii']
found = False

for enc in encs:
    try:
        content = data.decode(enc, errors='ignore')
        match = re.search(r'https://[a-zA-Z0-9-]+\.trycloudflare\.com', content)
        if match:
            print('LINK_FOUND:' + match.group(0))
            found = True
            break
    except Exception as e:
        continue

if not found:
    print("No Cloudflare URL found in any encoding")
