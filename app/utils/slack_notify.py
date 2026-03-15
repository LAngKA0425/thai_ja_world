import requests
import json

SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/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"

def send_slack(message):
    payload = {"text": message}

    requests.post(
        SLACK_WEBHOOK_URL,
        data=json.dumps(payload),
        headers={"Content-Type": "application/json"}
    )