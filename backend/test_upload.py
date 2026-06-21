import requests

with open("test.txt", "wb") as f:
    f.write(b"This is a dummy test file to check the ingestion pipeline. It has some words in it.")

files = {'file': open('test.txt', 'rb')}
data = {'projectId': 'test-project'}
response = requests.post("http://127.0.0.1:3001/api/upload", files=files, data=data)

print(response.status_code)
print(response.json())
