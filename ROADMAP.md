# Roadmap — "Talk to Founder" Voice AI Agent for Maneuver

**Stack target:** LiveKit Agents (Python) + agent-starter-react frontend
**Budget:** 5 days / ~10–15 focused hours
**North star:** A visitor lands on the page, clicks once, and has a natural founder-style conversation. While the agent speaks, the UI reacts live (slides, lead panel updates).

---

## Guiding principles

- **Ship the baseline first.** A clean voice loop + lead capture beats a half-broken app with every bonus.
- **Latency is a feature.** Pick providers and a pipeline architecture that keep end-to-end response under ~1s.
- **The visuals are the differentiator.** Once the voice loop works, the bonus visual layer is where to spend marginal hours.
- **Treat it like a product.** Founder tone, graceful silences/interruptions, and a polished first-frame matter.

---

## Phase 0 — Setup & decisions (Day 1, ~1.5h)

Get the dev loop running before writing any logic.

- [x] Install tooling: Python 3.12, Node 24, pnpm, **uv** (the starter uses uv, not pip).
- [x] Clone `agent-starter-python` into `agent/`, `agent-starter-react` into `web/`.
- [x] Top-level git repo, root `.gitignore`, `.env.local` stubs in both folders.
- [x] Install deps: `uv sync` in `agent/`, `pnpm install` in `web/`.
- [x] Download VAD + turn-detector models: `uv run --project agent python -m livekit.agents download-files`.
- [x] Sign up at [LiveKit Cloud](https://cloud.livekit.io/) → create project → fill `LIVEKIT_URL`/`LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` into both `.env.local` files. (Shortcut: install `lk` CLI then `lk cloud auth && lk app env -w -d .env.local` inside each folder.)
- [ ] Smoke test: `uv run --project agent python agent/src/agent.py console` — speak to the agent in the terminal.

**Provider stack (default: LiveKit Inference):**
The starter ships with [LiveKit Inference](https://docs.livekit.io/agents/models/inference), which proxies STT/LLM/TTS through LiveKit's infra — **one set of creds, no per-provider keys needed**. Default routing under the hood uses Deepgram (STT), OpenAI (LLM), Cartesia (TTS). We can swap to direct plugins later (`livekit-plugins-openai`, `-deepgram`, `-cartesia`, `-elevenlabs`) if we want finer control, lower markup, or a specific voice. Document whichever stack we ship with in the README.

**VAD/turn detection:** LiveKit's built-in Silero + turn-detector plugin — already wired in the starter.

**Exit criteria:** "Hello world" voice loop — you speak, agent answers in the terminal (`console` mode) or browser (`dev` mode + `pnpm dev`).

---

## Phase 1 — Knowledge base + persona (Day 1, ~1h)

Before writing the agent, lock down what it *knows* and *sounds like*.

- [ ] Write `knowledge/maneuver.md` — short, opinionated content:
  - Who Maneuver is (one-paragraph positioning)
  - Services (4–6 bullets, each with one-line elaboration)
  - Process (discovery → scoping → build → handoff, or similar)
  - Pricing model (project-based, retainer, equity-friendly — invent something credible)
  - Team / founder voice notes
  - 1–2 invented case studies
- [ ] Draft the system prompt:
  - Persona: warm, curious, direct — founder, not concierge.
  - Discovery objectives: name, company, role, problem, current solution, timeline, budget, decision process.
  - Behavior rules: ask one question at a time, mirror what the user said, switch to Q&A mode if asked, return to discovery gracefully.
  - Format constraints: keep responses short (1–3 sentences) — long monologues kill voice UX.

**Exit criteria:** Prompt + KB committed. Read it aloud — does it sound like a person?

---

## Phase 2 — Core voice agent (Day 2, ~3h)

This is the must-have. Don't move past it until it's clean.

- [x] STT→LLM→TTS pipeline (already in starter — Deepgram Nova-3, GPT-5.2, Cartesia Sonic-3).
- [x] KB injected into the system prompt (Phase 1).
- [x] Turn detection: Silero VAD + LiveKit multilingual turn detector (already in starter).
- [x] Interruption handling: `preemptive_generation=True` in the AgentSession (already in starter; verify in live test).
- [x] Agent opens the call proactively — `session.generate_reply(...)` after `ctx.connect()`.
- [x] **Live smoke test** (needs LiveKit creds): `uv run --project agent python agent/src/agent.py console` then talk for 3 min covering discovery + a "what services?" flip + an interruption.

**Exit criteria:** A 3-minute call with the agent feels natural. No awkward overlaps, no dead air longer than ~1s.

---

## Phase 3 — Lead capture (Day 2–3, ~1.5h)

The agent needs to *remember* what it heard.

- [x] Define a `Lead` schema (Pydantic): `name`, `company`, `role`, `email`, `problem`, `current_solution`, `timeline`, `budget`, `decision_process`, `notes`. Transcript captured alongside on persist.
- [x] Add an `update_lead_field(field, value)` LLM tool — the agent calls it as it learns each fact. Persona instructs it to call silently.
- [x] On call end (room disconnect), persist to `agent/leads/<timestamp>.json` via `ctx.add_shutdown_callback`.
- [ ] ~~Add a `GET /leads` endpoint (FastAPI sidecar)~~ — skipped. Frontend will subscribe over LiveKit RPC in Phase 4 instead of a parallel HTTP plumb.
- [x] Behavioral test (`tests/test_lead_capture.py`) — agent calls `update_lead_field` on intro; store writes valid JSON.

**Exit criteria:** Have a real discovery call, hang up, find a JSON file with the right fields filled in.

---

## Phase 4 — Synchronized visual layer (Day 3–4, ~3–4h) — **the differentiator**

This is what separates a strong submission. Don't skip it unless time is gone.

### 4a — Plumbing
- [x] Define LLM tools the agent calls to drive the UI: `show_services`, `show_service_detail(service)`, `show_process`, `show_pricing`, `clear_visual`. (`update_lead_field` from Phase 3 also broadcasts.)
- [x] Forward via **LiveKit data channel** (broadcast, topics `visual` and `lead`) — chosen over RPC because it doesn't need destination-identity lookup and fire-and-forget matches the "show this slide now" semantics.
- [x] React side: `FounderProvider` (Context + reducer) holding `{ activeView, lead, lastUpdatedField }`, subscribed via `useFounderDataChannel` hook listening on `RoomEvent.DataReceived`.

### 4b — Components
- [x] `<ServicesSlide />`, `<ServiceDetail />`, `<ProcessDiagram />`, `<PricingCard />` — consistent card style, motion staggered entry.
- [x] `<LeadPanel />` — persistent right-side panel; flashes the just-updated field for ~1.5s.
- [ ] `<AgentStateBadge />` — listening / thinking / speaking pill. (Skipped — visualizer already animates with agent state. Add if remaining time.)
- [x] `<Transcript />` — already in starter via chat toggle.

### 4c — "Visuals appear *with* the voice"
- [x] Persona prompt instructs agent to call visual tool BEFORE speaking. User confirmed slides land in good time.
- [x] Motion fade+slide-up transitions, 220ms cubic ease.

### Latency tuning (added during Phase 4 testing)
- [x] LLM swapped `gpt-5.2-chat-latest` → `gpt-4.1-mini` (~3× faster TTFT for tool-calling).
- [x] TTS speed `1.0` → `0.9` for more natural founder pace.
- [x] Endpointing `min_delay` 0.5s → 0.2s.
- [x] `preemptive_tts=True` so audio is ready the instant the turn commits.

**Exit criteria:** Ask "what services do you offer?" — the services slide appears before the second sentence of the answer. ✓ Verified live.

---

## Phase 5 — Polish & error states (Day 4, ~1.5h)

Cheap wins that move the perceived quality bar a lot.

- [x] Silent user → after 10s, agent gently re-engages via `user_state_changed` → `away` hook in `my_agent`.
- [x] Rude/off-topic user → already handled by persona ("stay composed, steer back warmly").
- [x] Mic permission denied / disconnected → handled by starter's `<StartAudioButton />` and browser permission flow.
- [x] Connection lost → toast via `useAgentErrors` on `agent.state === 'failed'`; copy rewritten for Maneuver tone.
- [x] First-frame UX: welcome view rewritten to "Talk to the founder of Maneuver" with single CTA "Talk to Sara".
- [ ] Mobile: lead panel hidden on `<md`; slides remain responsive. Acceptable for desktop demo, not a phone-first experience.

**Exit criteria:** Deliberately try to break the app. None of the failures look like crashes. — Trust-but-verify during the live demo recording.

---

## Phase 6 — README, demo, submission (Day 5, ~1.5h)

- [x] **README** sections: what it is, stack with rationale per row, mermaid architecture, repo layout, run instructions, decisions/trade-offs, "what I'd do next".
- [ ] **Demo video** (≤5 min, hard cap): real call (discovery + Q&A flip + interruption) → visual layer reacting → 30s architecture tour. *User to record.*
- [ ] Commit the JSON lead file from a real demo call to `demo/lead.json`. *User to capture during the demo recording.*
- [ ] Final commit, push, share repo link + Loom. *User-driven.*

---

## Stretch picks (only if Phases 0–6 are solid)

Pick **one**, not all — depth over breadth.

- **Multi-agent handoff** — discovery agent hands off to a "scheduling" agent that books a slot (mock Calendly tool). Demonstrates LiveKit agent composition.
- [x] **Follow-up Slack ping** — at call end, the agent generates a 3-sentence LLM summary and POSTs to a Slack Incoming Webhook (configured via `SLACK_WEBHOOK_URL`). Real, not mocked. See `agent/src/followup.py`.
- **Founder admin view** — `/admin` route lists past calls with transcript + captured fields. Compelling for a "real product" framing.
- **RAG over case studies** — vectorize 2–3 longer case studies, retrieve on Q&A. Worth it only if you can show it improves answer quality on demo.

---

## Risk register

| Risk | Mitigation |
|---|---|
| Latency too high (>1.5s round trip) | Switch LLM to `gpt-4o-mini`, use Cartesia (lowest TTFB), keep system prompt short |
| Agent rambles, kills voice UX | Hard constraint in prompt: max 2 sentences per turn unless asked for detail |
| Mode switching feels jarring | Don't gate with explicit state — let the LLM do it; just describe both behaviors in one prompt |
| RPC visual sync flaky | Fall back to agent state sync as a backup channel; render on whichever arrives first |
| Spending 5h debugging audio | Timebox: if voice loop isn't clean by end of Day 2, simplify provider stack before optimizing |

---

## Time budget (target)

| Phase | Hours | Cumulative |
|---|---|---|
| 0 — Setup | 1.5 | 1.5 |
| 1 — KB + persona | 1.0 | 2.5 |
| 2 — Core voice agent | 3.0 | 5.5 |
| 3 — Lead capture | 1.5 | 7.0 |
| 4 — Visual layer | 3.5 | 10.5 |
| 5 — Polish | 1.5 | 12.0 |
| 6 — README + demo | 1.5 | 13.5 |
| **Slack** | **1.5** | **15.0** |

If Phase 2 slips, cut Phase 4c (optimistic rendering) and one stretch — never cut Phases 0–3 or 6.
