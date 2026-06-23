import asyncio
from openai import AsyncOpenAI

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"
base_url = "https://api.enter.pro/v1"

client = AsyncOpenAI(api_key=api_key, base_url=base_url, max_retries=1)

async def main():
    try:
        response = await client.chat.completions.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=10,
            temperature=0.7,
            messages=[{"role": "user", "content": "hi"}]
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())
