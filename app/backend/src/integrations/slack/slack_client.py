import os
import httpx

SLACK_TOKEN = os.getenv("SLACK_BOT_TOKEN")
SLACK_CHANNEL = os.getenv("SLACK_ALERT_CHANNEL")

async def send_slack_message(text: str):

    url = "https://slack.com/api/chat.postMessage"

    headers = {
        "Authorization": f"Bearer {SLACK_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "channel": SLACK_CHANNEL,
        "text": text,
    }

    async with httpx.AsyncClient() as client:
        await client.post(url, headers=headers, json=payload)