import pytest
from livekit.agents import AgentSession

from agent import Assistant
from lead import LeadStore


@pytest.mark.asyncio
async def test_records_name_when_caller_introduces_themselves(tmp_path) -> None:
    store = LeadStore(leads_dir=tmp_path)
    async with AgentSession() as session:
        await session.start(Assistant(lead_store=store))

        result = await session.run(
            user_input="Hey Sara — I'm Alex Carter, head of product at Tessera."
        )

        result.expect.contains_function_call(name="update_lead_field")

    assert store.lead.name is not None, "expected name to be captured"
    assert "Alex" in store.lead.name


@pytest.mark.asyncio
async def test_lead_store_writes_json(tmp_path) -> None:
    store = LeadStore(leads_dir=tmp_path)
    store.update("name", "Alex Carter")
    store.update("company", "Tessera")
    store.update("notes", "Mentioned a Series A close in two months.")
    store.update("notes", "Loved our HR-tech case study.")

    path = store.write(
        transcript=[
            {"role": "assistant", "content": "Hey, this is Sara."},
            {"role": "user", "content": "Hi, I'm Alex from Tessera."},
        ]
    )

    assert path.exists()
    assert path.parent == tmp_path

    import json

    payload = json.loads(path.read_text(encoding="utf-8"))
    assert payload["lead"]["name"] == "Alex Carter"
    assert payload["lead"]["company"] == "Tessera"
    assert payload["lead"]["notes"] == [
        "Mentioned a Series A close in two months.",
        "Loved our HR-tech case study.",
    ]
    assert payload["transcript"][1]["content"] == "Hi, I'm Alex from Tessera."
