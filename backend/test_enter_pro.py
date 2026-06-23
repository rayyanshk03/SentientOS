import asyncio
import os
from dotenv import dotenv_values
from anthropic import Anthropic

env_path = "/Users/rayyanshaikh/Desktop/SentientOS/.env"
config = dotenv_values(env_path)
api_key = config.get("ENTER_PRO_API_KEY")

for url in ["https://api.enter.pro", "https://api.enter.pro/v1", "https://api.enter-pro.com/v1", "https://api.parcle.ai/v1"]:
    try:
        client = Anthropic(api_key=api_key, base_url=url, max_retries=1, timeout=5)
        response = client.messages.create(
            model="claude-3-5-sonnet-latest",
            max_tokens=10,
            temperature=0.7,
            system="Say hi",
            messages=[{"role": "user", "content": "hi"}]
        )
        print(f"Success with {url}:", response.content[0].text)
        break
    except Exception as e:
        print(f"Failed with {url}: {e}")
