# CMC Call Center AI — Africa Distributor PoC (Phase 1)

AI knowledge search & answer support mock for African automotive distributor call centers.
This is a **demo mock**: all data is hard-coded sample data, and the "AI search" returns
scripted responses (no real LLM calls).

Design docs live in `docs/` (00–06). This build implements **Priority A** of
`docs/06_implementation_plan.md`:

- **Agent Assist** (`/assist`) — the core Phase 1 screen: intake → question input →
  AI search → answer candidates (multiple) / confirmation questions / references /
  next actions → outcome recording (required) → log saved
- **Manager Dashboard** (`/dashboard`) — KPIs, channel/language/outcome splits,
  category breakdown, recent interactions (all computed from the sample logs)
- **Demo sample data** — 40 inquiry logs weighted to reflect the real market
  (Toyota-heavy with Hilux on top, growing Suzuki, high grey-import ratio),
  including the **10 scripted demo cases** in `data/demoCases.ts`
  (engine no-start, warning lights, Bluetooth pairing, door lock, navigation
  language, service intervals, battery drain, TPMS, charging system, unknown
  service history)

Out of scope in this build (Priority B/C): `/analysis`, `/suggestions`, i18n switching.
The `/captions` screen from the original mock has been removed per the Phase 1 scope.

## Getting started

Requirements: Node.js 18.17+ (or 20+).

```bash
npm install
npm run dev
# open http://localhost:3000  (redirects to /dashboard)
```

Production build:

```bash
npm run build
npm run start
```

## Demo walkthrough (≈3 minutes)

Follows the flagship case in `docs/05_demo_scenario.md`:
a customer in Côte d'Ivoire asks about parts lead time for a grey-import Toyota Hilux via WhatsApp.

1. **Open `/dashboard`** — show the KPI row (total interactions, resolution rate,
   AI answer adoption, satisfaction, knowledge gaps) and point out the grey-import
   share and the French/English split.
2. **Go to `/assist`** — the intake defaults are already set for the demo case
   (Text channel / Côte d'Ivoire / Toyota Hilux / Grey import / Parts supply & lead time).
3. **Type the question**, e.g.:
   > How long is the lead time for Hilux front brake pads? The vehicle is a grey import.
4. **Click "Search with AI"** — a searching state appears, then the AI panel shows:
   - three **answer candidates** with confidence labels,
   - **confirmation questions** to ask the customer,
   - **references** (parts supply guide, grey-import FAQ),
   - **next actions**.
5. **Work the case**: tick the candidate(s) you used, type a short answer under a
   confirmation question, check a next action.
6. **Record the outcome** — note that **"Complete & save log" stays disabled until an
   outcome is selected** (this is what keeps the resolution-rate KPI trustworthy).
   Select **Resolved**, then complete.
7. **Show the saved banner** — explain that this log now feeds the analysis /
   FAQ-improvement cycle (Priority B screens `/analysis` and `/suggestions`).

### Scripted demo cases

The 10 cases in `data/demoCases.ts` are wired into the Assist screen via keyword
matching — paste any of the `customer_question` texts (or type something close,
e.g. "My car won't start, the starter just clicks") and the AI panel returns that
case's answer candidates, confirmation question, references and next actions.
Good ones to show live:

- **case_001** (engine no-start) — happy path, two candidates with different confidence
- **case_005** (Thai-language navigation on a grey import) — escalation path;
  its improvement hint is a natural bridge to the FAQ-improvement story
- **case_008** (TPMS warning after inflating tyres) — quick, relatable self-service win

These cases also appear as logs on the dashboard, so the story "today's interaction
becomes tomorrow's insight" holds up end-to-end.

Tip: type a question containing none of the demo keywords (e.g. "sunroof rattle")
to show the **fallback / knowledge-gap flow**, where the AI admits low confidence and
suggests escalation + gap logging.

## Language toggle (EN / 日本語)

The header has an **EN / 日本語** toggle. It switches the full UI *and* the scripted
content — answer candidates, confirmation questions, next actions, and reference
titles all have Japanese translations (`data/scenarioTranslations.ts`) so Japanese
stakeholders can verify the content. Categories and dashboard labels are also
bilingual.

## Verifying answers against the real manual

Answer candidates are shown **summarized** (first sentence as the headline, full text
under "Details"). Next to them, the **Manual excerpts** panel lists the retrieved
passages with section titles and page numbers, and each has a **"View page"** button
that opens the full text of that Owner's Manual page in a modal (with prev/next page
navigation). Page numbers match the printed/PDF manual, so an agent or reviewer can
cross-check the AI's suggestion against the source.

Note: the manual PDF's fonts are not embedded, so pages cannot be rendered as
images — the viewer shows the extracted page text instead, which is faithful to the
source and keeps the app lightweight.

## Manual RAG (lexical retrieval over the real Owner's Manual)

`data/manualChunks.json` contains 763 passages extracted from the actual
**HILUX Owner's Manual (Japanese, 468 pages)**, chunked by section. When the agent
clicks "Search with AI", the app also queries `/api/manual-search`, which runs a
lightweight lexical retrieval (English query → Japanese term expansion + bigram
matching) and shows the top passages in a **"Manual excerpts"** panel with section
titles and page numbers.

Scope notes for the demo:
- This is **retrieval-only ("RAG-lite")** — no LLM generates answers from the
  passages. In production, retrieval would be embedding-based and an LLM would
  translate/summarize the passages into the reply language.
- Excerpts are shown in Japanese (the manual's source language) — a good live
  talking point: "the AI layer will translate this for English/French agents."
- Try scene 1 with "the engine won't start, the starter clicks once" — the panel
  surfaces 「7-2. 緊急時の対処法 / エンジンがかからないときは」 (p.414) from the real manual.

## Project structure

```
app/
  assist/page.tsx       # Agent Assist (Phase 1 core screen)
  dashboard/page.tsx    # Manager Dashboard
  layout.tsx, page.tsx  # shared layout, redirect to /dashboard
lib/
  i18n.tsx              # EN/JA language context + UI dictionary
  manualSearch.ts       # lexical RAG: EN→JP term expansion + scoring
app/api/manual-search/  # retrieval endpoint (keeps the 1MB index server-side)
components/
  layout/Header.tsx     # top navigation
  ui/                   # Card, Badge, StatCard
data/
  types.ts              # data model (see docs/04_data_model.md)
  vehicleMaster.ts      # African-market vehicles & countries
  categoryMaster.ts     # 8 inquiry categories
  inquiryLogs.ts        # 40 demo interaction logs (drives all dashboard figures)
  demoCases.ts          # the 10 scripted demo cases (source of truth)
  manualChunks.json     # 763 passages extracted from the real HILUX Owner's Manual (JP)
  manualPages.json      # full page-by-page text (468 pages) for the page viewer
  scenarioTranslations.ts # Japanese translations of all scripted content
  assistScenarios.ts    # scripted AI responses: 10 demo cases + flagship scenarios
docs/                   # design documents 00–06
```

## Notes

- No extra libraries beyond Next.js / React / Tailwind CSS; charts are plain CSS bars.
- UI is bilingual EN/JA via the header toggle. FR is planned for Priority B.
- The dashboard aggregates directly from `data/inquiryLogs.ts`, so figures always match
  the history table.
