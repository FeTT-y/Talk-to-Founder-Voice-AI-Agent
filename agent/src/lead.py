from __future__ import annotations

import datetime as _dt
import json
import pathlib
from typing import Any, Literal

from pydantic import BaseModel, Field

LeadField = Literal[
    "name",
    "company",
    "role",
    "email",
    "problem",
    "current_solution",
    "timeline",
    "budget",
    "decision_process",
    "notes",
]


class Lead(BaseModel):
    name: str | None = None
    company: str | None = None
    role: str | None = None
    email: str | None = None
    problem: str | None = None
    current_solution: str | None = None
    timeline: str | None = None
    budget: str | None = None
    decision_process: str | None = None
    notes: list[str] = Field(default_factory=list)


class LeadStore:
    def __init__(self, leads_dir: pathlib.Path) -> None:
        self.lead = Lead()
        self.leads_dir = leads_dir

    def update(self, field: LeadField, value: str) -> None:
        if field == "notes":
            self.lead.notes.append(value)
        else:
            setattr(self.lead, field, value)

    def write(self, transcript: list[dict[str, Any]]) -> pathlib.Path:
        self.leads_dir.mkdir(parents=True, exist_ok=True)
        ts = _dt.datetime.now(_dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        path = self.leads_dir / f"{ts}.json"
        payload = {
            "captured_at": ts,
            "lead": self.lead.model_dump(),
            "transcript": transcript,
        }
        path.write_text(
            json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8"
        )
        return path
