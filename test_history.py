import requests
import time

session_id = f"test-{int(time.time())}"
base_url = "http://localhost:3002/api/agent"

print("Sending 1: my name is rayyan")
resp1 = requests.post(base_url, json={"task": "my name is rayyan", "sessionId": session_id})
print(resp1.text)

print("Sending 2: what is my name?")
resp2 = requests.post(base_url, json={"task": "what is my name?", "sessionId": session_id})
print(resp2.text)
