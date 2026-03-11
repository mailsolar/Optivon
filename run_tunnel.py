import subprocess
import time
import re

print("Starting cloudflared tunnel...")
process = subprocess.Popen(
    [r"C:\Users\Dhanish Nair\AppData\Roaming\npm\cloudflared.cmd", "tunnel", "--url", "http://localhost:5173"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    creationflags=subprocess.CREATE_NO_WINDOW
)

url_pattern = re.compile(r'(https://[a-zA-Z0-9-]+\.trycloudflare\.com)')

print("Looking for Cloudflare URL...")
start_time = time.time()
while time.time() - start_time < 15:
    line = process.stdout.readline()
    if not line:
        continue
    print(f"Log: {line.strip()}")
    match = url_pattern.search(line)
    if match:
        url = match.group(1)
        print(f"SUCCESS_URL: {url}")
        
        # Save it to a file for easy reading
        with open("link_final_v2.txt", "w") as f:
            f.write(url)
        break

print("Operation completed.")
