import pathlib

import pytest

from followup import build_slack_payload, summarize_call
from lead import Lead


def test_build_slack_payload_with_full_lead() -> None:
    lead = Lead(
        name="Alex Carter",
        company="Tessera",
        role="Head of Product",
        email="alex@tessera.ai",
        problem="Onboarding flow takes 22 minutes per new user",
        timeline="Want a prototype by end of Q2",
        budget="Around fifty thousand for the prototype",
        decision_process="Me and the CTO",
    )
    payload = build_slack_payload(
        lead, summary="Alex runs product at Tessera. ...", lead_path="leads/foo.json"
    )

    assert payload["text"] == "New Talk-to-Founder call: Alex Carter"
    header_text = payload["blocks"][0]["text"]["text"]
    assert "Alex Carter" in header_text
    assert "Tessera" in header_text
    assert "Alex runs product at Tessera. ..." in header_text
    fields = payload["blocks"][1]["fields"]
    field_texts = [f["text"] for f in fields]
    assert any("Head of Product" in t for t in field_texts)
    assert any("alex@tessera.ai" in t for t in field_texts)
    assert any("Q2" in t for t in field_texts)
    assert any("fifty thousand" in t for t in field_texts)
    assert any("CTO" in t for t in field_texts)
    footer_text = payload["blocks"][-1]["elements"][0]["text"]
    assert "leads/foo.json" in footer_text


def test_build_slack_payload_anonymous_caller() -> None:
    payload = build_slack_payload(Lead(), summary="No name captured.", lead_path="x")
    assert payload["text"] == "New Talk-to-Founder call: Anonymous caller"
    block_types = [b["type"] for b in payload["blocks"]]
    assert block_types == ["section", "context"]


@pytest.mark.asyncio
async def test_summarize_call_produces_short_summary() -> None:
    lead = Lead(
        name="Alex Carter",
        company="Tessera",
        role="Head of Product",
        problem="Onboarding takes 22 minutes — need to cut it in half",
        timeline="Prototype by end of Q2",
    )
    transcript = [
        {"role": "assistant", "content": "Hey, this is Sara. Who am I talking to?"},
        {
            "role": "user",
            "content": "Hi, I'm Alex Carter, head of product at Tessera.",
        },
        {"role": "assistant", "content": "Great. What are you trying to solve?"},
        {
            "role": "user",
            "content": "Our onboarding takes 22 minutes per user. We want it in half.",
        },
    ]
    summary = await summarize_call(lead, transcript)
    assert summary, "expected non-empty summary"
    assert "Alex" in summary
    sentence_endings = sum(summary.count(c) for c in ".!?")
    assert 2 <= sentence_endings <= 6, (
        f"expected ~3 sentences, got {sentence_endings}: {summary!r}"
    )


def test_no_pathlib_in_payload_strings() -> None:
    payload = build_slack_payload(
        Lead(name="X"), "summary", pathlib.Path("leads/abc.json")
    )
    footer = payload["blocks"][-1]["elements"][0]["text"]
    assert "PosixPath" not in footer
    assert "WindowsPath" not in footer
