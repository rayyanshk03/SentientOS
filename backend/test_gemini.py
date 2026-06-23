import asyncio
import os
import sys

# Add the directory containing backend code so we can import agent
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
from agent import call_gemini

async def main():
    try:
        res = await call_gemini("You are a helpful assistant", "say hi", [])
        print("Success:", res)
    except Exception as e:
        print("Failed:", str(e))

asyncio.run(main())
