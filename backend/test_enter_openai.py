import httpx
import asyncio

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"
project_id = "gen-lang-client-0135267128"

headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "x-project-id": project_id,
    "project-id": project_id
}

payload = {
    "model": "claude-3-5-sonnet-latest",
    "messages": [{"role": "user", "content": "hi"}],
    "max_tokens": 10
}

url = "https://api.enter.pro/v1/chat/completions"

async def main():
    async with httpx.AsyncClient(timeout=10.0) as client:
        try:
            r = await client.post(url, headers=headers, json=payload)
            print(f"[{r.status_code}] -> {r.text[:200]}")
        except Exception as e:
            print(f"Failed: {type(e).__name__} - {e}")

asyncio.run(main())
