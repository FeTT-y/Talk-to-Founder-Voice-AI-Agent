from __future__ import annotations

import json
import logging
import os
import pathlib
from typing import Any

import aiohttp
from livekit.agents import inference, llm

from lead import Lead

logger = logging.getLogger("agent.followup")

_SUMMARY_LLM_MODEL = "openai/gpt-4.1-mini"

_SUMMARY_SYSTEM_PROMPT = (
    "You write Slack messages summarizing voice calls for the Maneuver team. "
    "Output exactly three short sentences in a conversational, internal tone. "
    "Sentence 1: who the caller is and what they do. "
    "Sentence 2: the specific problem they want to solve, in concrete terms. "
    "Sentence 3: any next-step signal (timeline, budget, decision process), "
    'or "No clear next step yet." if none was captured. '
    "No bullet points, no field labels, no markdown headers, no emojis."
)


async def summarize_call(
    lead: Lead,
    transcript: list[dict[str, Any]],
    *,
    llm_model: str = _SUMMARY_LLM_MODEL,
) -> str:
    async with inference.LLM(model=llm_model) as my_llm:
        chat_ctx = llm.ChatContext()
        chat_ctx.add_message(role="system", content=_SUMMARY_SYSTEM_PROMPT)
        chat_ctx.add_message(
            role="user",
            content=(
                f"LEAD DATA (JSON):\n{json.dumps(lead.model_dump(), indent=2)}\n\n"
                "TRANSCRIPT (last few exchanges):\n"
                + "\n".join(
                    f"{t.get('role', '?')}: {t.get('content', '')}"
                    for t in transcript[-12:]
                )
            ),
        )
        response = await my_llm.chat(chat_ctx=chat_ctx).collect()
        return response.text.strip()


def build_slack_payload(
    lead: Lead, summary: str, lead_path: pathlib.Path | str
) -> dict[str, Any]:
    name = lead.name or "Anonymous caller"
    title_line = f"*New call — {name}*"
    if lead.company:
        title_line += f" · {lead.company}"

    fields: list[dict[str, str]] = []
    if lead.role:
        fields.append({"type": "mrkdwn", "text": f"*Role*\n{lead.role}"})
    if lead.email:
        fields.append({"type": "mrkdwn", "text": f"*Email*\n{lead.email}"})
    if lead.timeline:
        fields.append({"type": "mrkdwn", "text": f"*Timeline*\n{lead.timeline}"})
    if lead.budget:
        fields.append({"type": "mrkdwn", "text": f"*Budget*\n{lead.budget}"})
    if lead.decision_process:
        fields.append(
            {
                "type": "mrkdwn",
                "text": f"*Decision process*\n{lead.decision_process}",
            }
        )

    blocks: list[dict[str, Any]] = [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": f"{title_line}\n{summary}"},
        }
    ]
    if fields:
        blocks.append({"type": "section", "fields": fields})
    blocks.append(
        {
            "type": "context",
            "elements": [
                {"type": "mrkdwn", "text": f"Saved transcript: `{lead_path}`"}
            ],
        }
    )

    return {"text": f"New Talk-to-Founder call: {name}", "blocks": blocks}


async def _send_slack(webhook_url: str, payload: dict[str, Any]) -> None:
    async with (
        aiohttp.ClientSession() as http,
        http.post(webhook_url, json=payload) as resp,
    ):
        if resp.status >= 400:
            body = await resp.text()
            logger.warning("slack post failed: %s %s", resp.status, body)
        else:
            logger.info("slack follow-up posted")


async def post_followup(
    lead: Lead,
    transcript: list[dict[str, Any]],
    lead_path: pathlib.Path,
) -> None:
    webhook_url = os.getenv("SLACK_WEBHOOK_URL")
    if not webhook_url:
        logger.info("SLACK_WEBHOOK_URL not set; skipping follow-up")
        return
    try:
        summary = await summarize_call(lead, transcript)
    except Exception:
        logger.exception("failed to summarize call")
        return
    payload = build_slack_payload(lead, summary, lead_path)
    try:
        await _send_slack(webhook_url, payload)
    except Exception:
        logger.exception("failed to send slack message")
