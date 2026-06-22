import asyncio
import json
import urllib.request
from parcle import BASE_URL, DEFAULT_USER_ID, get_api_key

def _get(url):
    api_key = get_api_key()
    req = urllib.request.Request(
        url,
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read().decode("utf-8"))

try:
    print(_get(f"{BASE_URL}/v1/users/{DEFAULT_USER_ID}/sessions/sess_9kv0EKCyYkmrha1jdHcvVGug/messages"))
except Exception as e:
    print("Error 1:", e)

try:
    print(_get(f"{BASE_URL}/v1/sessions/sess_9kv0EKCyYkmrha1jdHcvVGug/messages"))
except Exception as e:
    print("Error 2:", e)

try:
    print(_get(f"{BASE_URL}/v1/memories/sessions/sess_9kv0EKCyYkmrha1jdHcvVGug"))
except Exception as e:
    print("Error 3:", e)

