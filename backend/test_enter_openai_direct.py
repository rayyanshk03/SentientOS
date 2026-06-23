import asyncio
from openai import AsyncOpenAI

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"

client = AsyncOpenAI(api_key=api_key)

async def main():
    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            max_tokens=10,
            temperature=0.7,
            messages=[{"role": "user", "content": "hi"}]
        )
        print("Success:", response.choices[0].message.content)
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())
