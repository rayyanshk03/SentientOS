import asyncio, os
import sys
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
sys.path.append(os.path.dirname(__file__))

from agent import run_agent

async def on_step(msg):
    print("STEP:", msg, flush=True)

async def test():
    print("Testing gemini run_agent...", flush=True)
    try:
        res = await run_agent("test task", "architect", "gemini", on_step)
        print("Done:", res, flush=True)
    except Exception as e:
        print("Exception!", e, flush=True)

asyncio.run(test())
