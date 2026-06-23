import httpx
import asyncio

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"
headers = {"Authorization": f"Bearer {api_key}"}

urls = [
    "https://api.enter.pro",
    "https://api.enter.pro/v1",
    "https://enter.pro/v1",
    "https://enter.pro/api/v1",
    "https://enter.ai/v1"
]

async def main():
    async with httpx.AsyncClient(timeout=3.0) as client:
        for u in urls:
            try:
                r = await client.get(u, headers=headers)
                print(f"[{r.status_code}] {u}")
            except Exception as e:
                pass

asyncio.run(main())
