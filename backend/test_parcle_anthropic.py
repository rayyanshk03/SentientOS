import asyncio
from anthropic import Anthropic

api_key = "ek_bb6df799eddd5ff2a0f1dcaaae0ffa654eac2e2f1556a98c9e71f6d2df2c8062"

client = Anthropic(
    api_key=api_key, 
    base_url="https://api.parcle.ai"
)

async def main():
    try:
        response = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=10,
            temperature=0.7,
            system="Say hi",
            messages=[{"role": "user", "content": "hi"}]
        )
        print("Success:", response.content[0].text)
    except Exception as e:
        print("Error:", str(e))

asyncio.run(main())
