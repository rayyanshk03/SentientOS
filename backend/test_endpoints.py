import httpx
import asyncio

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}

payload = {
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "hi"}],
    "max_tokens": 10
}

urls = [
    "https://api.enter.pro/v1/chat/completions",
    "https://api.enter.ai/v1/chat/completions",
    "https://api.enter.cloud/v1/chat/completions",
    "https://api.enter-pro.com/v1/chat/completions",
    "https://api.parcle.ai/v1/chat/completions",
    "https://api.enter.io/v1/chat/completions",
    "https://api.enter.net/v1/chat/completions",
]

async def main():
    async with httpx.AsyncClient(timeout=3.0) as client:
        for url in urls:
            try:
                r = await client.post(url, headers=headers, json=payload)
                print(f"[{r.status_code}] {url} -> {r.text[:50]}")
            except Exception as e:
                print(f"Failed {url}: {type(e).__name__}")

asyncio.run(main())
