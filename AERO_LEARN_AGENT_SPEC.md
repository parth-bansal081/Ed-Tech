# AeroLearn — Full Build Specification for AI Coding Agent

**Purpose of this document:** This is the single source of truth for building AeroLearn — an accessibility-first, multilingual learning platform. An AI coding agent (or human developer) should be able to read this document top to bottom and write the entire codebase without needing clarification. Every feature, data model, API contract, edge case, and acceptance criterion is specified explicitly. Where a decision was made (e.g. "use GPT-4 not a local model"), the reasoning is given so the agent does not silently substitute a different choice.

**Mandatory technology constraint (non-negotiable):** The stack MUST use **Whisper** (speech-to-text), **ElevenLabs** (text-to-speech), and **GPT-4** (all reasoning/text/vision tasks: OCR, translation, auditing, simplification, explanation generation). Do not substitute local models (Ollama, etc.) for these three roles under any circumstance, even as a "fallback" — if a key is missing, fail loudly with a clear error rather than silently degrading to a different model.

---

## 1. Problem Statement (verbatim context)

> Accessibility & Inclusive Learning — Multilingual tutors, tools for learners with disabilities, solutions for students in under-resourced settings. Quality education remains inaccessible to hundreds of millions of students because of language, disability, geography, or economic circumstance.

Every feature below must trace back to one of these four barriers: **language**, **disability**, **geography**, **economic circumstance**. If a proposed feature doesn't reduce one of these, it's scope creep — flag it, don't build it without confirmation.

---

## 2. High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                        │
│  - Auth & Onboarding flow                                        │
│  - Upload UI (file / YouTube link)                                │
│  - Blind Mode UI (voice-first, minimal visual chrome)            │
│  - Deaf Mode UI (split-screen avatar + highlighted text)         │
│  - Standard Mode UI (notes + AI explanations + images)           │
│  - Knowledge Hive (shared notes feed)                             │
└──────────────────────────────────────────────────────────────────┘
                              │  REST + WebSocket
┌──────────────────────────────────────────────────────────────────┐
│                     BACKEND (FastAPI, Python)                    │
│  routes/        — HTTP & WebSocket endpoints                     │
│  services/      — business logic, third-party API clients        │
│  workers/        — Celery tasks for long-running jobs             │
│  models/        — Pydantic schemas + DB models                   │
└──────────────────────────────────────────────────────────────────┘
       │              │               │              │
       ▼              ▼               ▼              ▼
  ┌─────────┐   ┌──────────┐   ┌────────────┐  ┌──────────────┐
  │ Supabase │   │  Redis   │   │  GPT-4 API │  │ ElevenLabs   │
  │ (Postgres│   │ (Celery  │   │  (OpenAI)  │  │ API          │
  │ + Auth + │   │  broker  │   └────────────┘  └──────────────┘
  │ Storage) │   │ + session│   ┌────────────┐
  └─────────┘   │  state)  │   │ Whisper    │
                └──────────┘   │ (local,    │
                                │ faster-    │
                                │ whisper)   │
                                └────────────┘
```

**Why Celery + Redis:** File processing (OCR, translation, TTS generation for a whole document) takes 10s of seconds to minutes. These must run as background jobs, not block an HTTP request. The frontend polls a job-status endpoint or listens on a WebSocket for completion.

**Why Supabase:** Gives Postgres + Auth + Row-Level Security + file storage in one product, which matters a lot for the Knowledge Hive's access-control requirement (point 8 below) — RLS policies enforce "only users with disability X or language Y can see this note" at the database level, not just in application code.

---

## 3. Tech Stack (exact, no substitutions)

| Layer | Technology | Notes |
|---|---|---|
| Frontend framework | React + TypeScript | Vite, not CRA |
| Styling | Tailwind CSS | |
| Backend framework | FastAPI (Python 3.11+) | async throughout |
| Background jobs | Celery + Redis | Redis also used for ephemeral session/narration state |
| Database + Auth + Storage | Supabase (Postgres) | RLS enabled on all tables from day one |
| Speech-to-text | **Whisper** — `faster-whisper` (local, CPU/GPU) for batch video/audio transcription; **OpenAI Whisper API** acceptable for the live mic loop if local latency is too high | Mandatory tech #1 |
| Text-to-speech | **ElevenLabs API** (`eleven_multilingual_v2` model — supports non-English narration) | Mandatory tech #2 |
| Reasoning / OCR / translation / explanation generation | **GPT-4** (`gpt-4o` for vision+text) via OpenAI API | Mandatory tech #3 |
| Document parsing | `pdfplumber` (primary, text-layer PDFs) → `pytesseract` (OCR fallback for scanned/image PDFs) → GPT-4o vision (final fallback for handwriting/complex layouts pdfplumber+tesseract both fail on) | Three-tier extraction, cheapest first |
| Sign language avatar | HeyGen API (optional/supplementary — not a mandatory tech, can be deferred if time-constrained) | |
| Video chapter detection | AssemblyAI (optional/supplementary) | |
| Noise filtering (mic input) | `noisereduce` Python library | spectral-gating noise reduction before STT |

---

## 4. Database Schema (Supabase / Postgres)

Agent must create these tables with RLS enabled. Column types are illustrative — use appropriate Postgres types.

### `users` (extends Supabase auth.users via a profile table)
```
profiles
  id                 uuid PK, references auth.users
  preferred_languages text[]        -- e.g. ['hi', 'en'] ordered by preference
  disabilities        text[]        -- e.g. ['blind'], ['deaf'], ['dyslexia'], [] for none
  display_name        text
  created_at          timestamptz
```

### `documents`
```
documents
  id              uuid PK
  owner_id        uuid FK -> profiles.id
  title           text
  source_type     text         -- 'upload' | 'youtube'
  source_url      text null    -- youtube link if applicable
  original_lang   text
  target_lang     text
  status          text         -- 'pending' | 'extracting' | 'translating' | 'auditing' | 'ready' | 'failed'
  raw_text         text        -- extracted, pre-translation
  translated_text  text
  audit_warnings   jsonb        -- output of gpt4.audit_translation
  created_at       timestamptz
```

### `topics`
```
topics
  id            uuid PK
  document_id   uuid FK -> documents.id
  order_index   int
  title         text
  explanation   text
  image_query   text
  image_url     text null
  audio_path    text null    -- ElevenLabs-generated narration for this topic
  sign_video_url text null   -- HeyGen output if used
```

### `knowledge_hive_notes`
```
knowledge_hive_notes
  id                 uuid PK
  document_id        uuid FK -> documents.id
  uploader_id        uuid FK -> profiles.id
  visible_to_disabilities text[]   -- which disability groups can see this
  visible_to_languages    text[]   -- which language groups can see this
  upvotes             int default 0
  created_at          timestamptz
```
**RLS policy requirement:** a row is selectable by a user only if the user's `profiles.disabilities` intersects `visible_to_disabilities` OR the user's `profiles.preferred_languages` intersects `visible_to_languages`. Write the Postgres RLS policy using `auth.uid()` to look up the requesting user's profile row, then array-overlap (`&&`) operators against the note's visibility columns.

### `narration_sessions` (Redis, not Postgres — ephemeral)
```
key: narration_session:{session_id}
value (JSON): { playing: bool, topic_index: int, total_topics: int, document_id: str }
TTL: 4 hours
```

---

## 5. Feature Specifications (build each exactly as described)

### 5.1 Onboarding & Registration

**Flow:**
1. Standard email/password or OAuth signup via Supabase Auth.
2. Immediately after account creation (before dashboard access), force a 2-step onboarding wizard:
   - **Step A — Language:** multi-select list of supported languages, user ranks them by comfort (drag-to-reorder or simple "primary / secondary" picker). Store as ordered array in `profiles.preferred_languages`.
   - **Step B — Accessibility needs:** multi-select: Blind / Low Vision, Deaf / Hard of Hearing, Dyslexia, ADHD, Autism-spectrum sensory sensitivity, None. Store in `profiles.disabilities`.
3. If "Blind / Low Vision" is selected → immediately prompt for microphone permission, explain via both visible text AND spoken ElevenLabs audio why it's needed, and run a 5-second calibration recording used to establish the noise floor for that user's environment (stored client-side only, not persisted server-side — privacy).
4. On completion, route to the mode-appropriate dashboard (see 5.3/5.4 below — UI differs structurally per disability, not just styling).

**Acceptance criteria:**
- A user cannot reach any document-upload screen without having completed both onboarding steps.
- Changing `preferred_languages` or `disabilities` later is possible from a settings page and immediately changes which UI mode loads on next login.

---

### 5.2 Document Ingestion Pipeline (shared by ALL modes)

This pipeline runs identically regardless of disability — it's the common substrate that every mode's UI sits on top of.

**Step 1 — Input acceptance.** Two entry points:
- **File upload:** PDF, DOCX, or image (JPG/PNG) of study material.
- **YouTube link:** validate it's a reachable, public video before queuing.

**Step 2 — Extraction (three-tier, cheapest-first):**
1. Try `pdfplumber` text-layer extraction. If it returns non-trivial text (length above a sane threshold, not just whitespace/garbage) → done, use this.
2. If pdfplumber returns nothing/garbage (scanned image PDF) → run `pytesseract` OCR on rendered page images.
3. If tesseract's confidence score is below a threshold, OR the content includes complex layouts/handwriting/diagrams with embedded text → fall back to **GPT-4o vision** (`gpt4.extract_text_from_image`) on the page image, which is more expensive but far more accurate for non-trivial cases.

For **YouTube videos**: download audio track, run through Whisper (`faster-whisper`, local) for full transcript, separately consider extracting key video frames at scene-change points for an "and visuals" pass (point 1 of original spec: "using its audio and visuals") — pass frames + transcript segment to GPT-4o vision for a combined topic-by-topic note-build, not just a flat transcript dump.

**Step 3 — Translation.** If `documents.original_lang != target_lang` (target = user's top `preferred_languages` entry):
- Call `gpt4.translate(text, target_language, source_language)`.
- Critically: formulas (LaTeX) must pass through completely unchanged, and causal/scientific relationships must not be reversed. This is enforced by the next step, not assumed.

**Step 4 — Logic/Translation Audit (mandatory, cannot be skipped even to save API cost):**
- Call `gpt4.audit_translation(original, translated)`.
- If `logic_check_passed` is `false`, do NOT silently publish the result. Surface the warnings to the user clearly with a "this translation may need review" flag, and store warnings in `documents.audit_warnings`. The user explicitly opted into a system that re-checks AI output — never bypass this step for speed.

**Step 5 — PDF generation.** Render the translated, audited text into a clean PDF (preserve headings, tables, LaTeX as rendered math, not raw `$...$` syntax) for download.

**Step 6 — Optional: AI Explanations.** After the PDF is ready, prompt the user: "Want AI to explain this topic by topic?" If yes → call `gpt4.break_into_topics(translated_text)`, which returns an ordered list of `{title, explanation, image_query}`. For each topic, fetch a supporting image via an image search API using `image_query`, and store everything in the `topics` table linked to the document.

**Step 7 — Branch by disability mode** into 5.3 (Blind), 5.4 (Deaf), or 5.5 (Standard/other accommodations) for how the topic list is actually delivered to the user.

**Failure handling:** every step writes its in-progress status to `documents.status` so the frontend can show real progress ("Extracting text…", "Translating…", "Checking translation accuracy…") rather than a generic spinner. If any step fails irrecoverably, set status to `failed` and surface the specific failure reason — never fail silently.

---

### 5.3 Blind / Low Vision Workflow

**Core principle:** the entire interaction is voice-first. Visual UI exists only as a fallback/companion, never as the primary interaction surface.

**Speaking (output) — ElevenLabs:**
- Every screen transition, button focus, and content block is spoken aloud automatically via ElevenLabs TTS (`eleven_multilingual_v2`, so it can speak in the user's preferred language, not just English).
- Use the **streaming** TTS endpoint (not the file endpoint) for anything longer than a sentence, so playback starts within ~1 second rather than waiting for full generation.
- Topic explanations from `topics.explanation` are queued and spoken one at a time, in order.

**Listening (input) — Whisper + noise filtering:**
- After registration grants mic access, the frontend continuously streams short audio chunks (recommend 2-3 second windows, using the browser's `MediaRecorder`) over a WebSocket to the backend.
- Backend pipeline per chunk: `noisereduce` spectral gating (using the calibration noise floor where available) → `faster-whisper` transcription → return transcript text to frontend.
- Frontend matches transcript against a small fixed command grammar (don't attempt open-ended NLU for navigation — that's a different failure mode than topic content; keep navigation commands simple and deterministic): commands like "next", "repeat", "go back", "explain again", "upload", "read notes", "stop".
- **Continuous listening**, not push-to-talk — the mic stream stays open for the whole session once granted, per the original spec ("listen to them continuously").

**Pause/Resume (space bar):**
- Pressing the space bar toggles a `playing` boolean in the narration session state (Redis-backed, keyed by session id).
- Frontend's `<audio>` element (or streaming buffer) listens to this state and pauses/resumes the actual audio playback accordingly — the backend state is the source of truth so it stays in sync even if, say, the user also used a voice command to pause.

**Full blind-mode flow for one document:**
1. User uploads file or gives YouTube link (via voice command or, if easier, the file picker — accessible file pickers are normally screen-reader-navigable so this doesn't require a custom voice-driven uploader).
2. System speaks progress updates as the ingestion pipeline (5.2) runs.
3. Once ready, system asks (spoken): "Would you like me to explain this topic by topic?" User answers via voice ("yes"/"no") — Whisper transcribes, matched against yes/no grammar.
4. If yes: topics are narrated one at a time. Space bar pauses/resumes. Voice command "next" advances early; "repeat" replays the current topic.
5. Translation note: if the source document's language differs from the user's preferred language, translation happens automatically as part of the standard pipeline (5.2 step 3) before narration — no separate blind-specific translation path needed.

---

### 5.4 Deaf / Hard of Hearing Workflow

**Core principle:** split-screen, fully visual, two synchronized channels — sign language avatar + highlighted readable text. No audio dependency anywhere in this mode's critical path.

**Screen layout:**
- Left/top pane: AI-generated avatar performing sign language for the current topic's explanation (HeyGen-generated video, or an equivalent avatar service — this is the one piece allowed to remain a "best effort" component since sign-language avatar tech is genuinely limited; document this constraint, don't pretend it's solved perfectly).
- Right/bottom pane: the same topic's explanation as readable text in the user's preferred language, with **word-or-phrase-level highlighting that progresses in sync with the avatar's signing**.

**Synchronization approach:**
- When a topic's avatar video is generated, also generate (or estimate) a timestamp map of which text segment corresponds to which point in the video's duration. If the avatar API doesn't provide word-level timing, approximate evenly across the video's total duration divided by sentence count — document this as an approximation, not a guarantee, in code comments.
- Frontend video player's `timeupdate` event drives which text segment is currently highlighted.

**Pause/Resume (space bar):** identical mechanism to blind mode — same `/audio/narration/toggle` endpoint and Redis session state — except here pressing space pauses the **avatar video element**, and the highlight freezes on the current segment rather than pausing an audio stream.

**Ingestion:** identical to 5.2 — same upload/YouTube/translate/audit pipeline. The only difference from blind mode is the delivery mechanism in step 7.

---

### 5.5 Other Accommodations (Dyslexia / ADHD / Autism-spectrum sensory needs)

These don't need a fully separate workflow — they need the **Reading Simplifier** (`gpt4.simplify_for_accommodation`) applied as an extra pass after translation/audit, before the document is marked `ready`:
- Dyslexia: shorter sentences, simpler vocabulary where it doesn't lose precision, increased line spacing in the rendered PDF (a frontend/PDF-rendering concern, flag to whichever agent builds the PDF renderer).
- ADHD: break dense paragraphs into smaller chunks/bullets, more frequent subheadings.
- Autism-spectrum sensory sensitivity: low-sensory UI mode — reduced animation, muted color palette, no autoplay video/audio without explicit user action (this directly conflicts with the blind mode's "speak everything automatically" pattern, so if a user selects BOTH blind and autism-sensory accommodations, the agent must default to **explicit confirmation before autoplay** rather than fully automatic narration — flag this conflict resolution rule explicitly in the settings UI).

---

### 5.6 Multilingual Notes — Core Feature (applies across all modes)

Already covered structurally in 5.2. Two additional pieces to build:

**Glossary hover terms:** for the standard (non-blind, non-deaf) reading view, call `gpt4.extract_glossary(text, target_language)` and render the 3-5 returned terms as hoverable/tappable inline elements showing the original term, translation, and a one-sentence definition.

**YouTube video → notes (point 1 of original spec, detailed):**
1. Validate URL, extract video ID.
2. Download audio-only stream.
3. Run `faster-whisper` for a full transcript with timestamps.
4. Extract frames at detected scene changes (use a simple frame-difference heuristic, not a heavy scene-detection model — this is a supplementary signal, not the core deliverable).
5. Pass transcript segments + corresponding frames to GPT-4o vision, prompting it to produce topic-by-topic notes that incorporate what's visually shown (e.g., diagrams, written equations on a whiteboard) alongside what's spoken.
6. Feed the resulting notes through the same translate → audit → topic-breakdown pipeline as an uploaded document.

---

### 5.7 Knowledge Hive (Social Layer)

**Purpose:** once a user has a translated/processed document, let them optionally publish it so others with the same disability or language preference benefit — "social media of multilingual notes."

**Publish flow:**
1. From a ready document, user taps "Share to Knowledge Hive."
2. User selects (or system pre-fills from their own profile) which disability groups and which language groups should be able to see it.
3. Insert row into `knowledge_hive_notes` with those visibility arrays.

**Browse flow:**
1. Feed query selects from `knowledge_hive_notes` — RLS automatically filters to only rows visible to the requesting user (see schema section 4 for the exact policy logic).
2. Sort by upvotes/recency, simple feed UI, tapping a note opens the underlying `documents`/`topics` content in whichever mode (blind/deaf/standard) matches the viewer's own profile — i.e., a blind user opening someone else's shared note still gets the full ElevenLabs narration experience, not a raw text dump.

**Moderation note (flag for product decision, don't silently build or skip):** user-generated content shared publicly needs at least a basic report/flag mechanism before this goes beyond a hackathon demo. Build a minimal `reports` table and a report button now so it's not a gap later, even if active moderation tooling is deferred.

---

## 6. API Contract Summary (for agent's reference while building routes)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/onboarding` | Save languages + disabilities to profile |
| POST | `/documents/upload` | Accept file, kick off Celery ingestion task |
| POST | `/documents/youtube` | Accept YouTube URL, kick off ingestion task |
| GET | `/documents/{id}/status` | Poll ingestion progress |
| GET | `/documents/{id}` | Fetch ready document (text, audit warnings, PDF link) |
| POST | `/topics/breakdown` | Generate topic list from notes text |
| POST | `/topics/narrate` | Generate ElevenLabs audio for one topic |
| POST | `/audio/speak` | General-purpose TTS (file or stream) |
| WS | `/audio/ws/voice-command` | Continuous mic → noise-filter → Whisper loop |
| POST | `/audio/narration/start` | Initialize a pause/resume session |
| POST | `/audio/narration/toggle/{session_id}` | Space-bar pause/resume |
| POST | `/audio/narration/advance/{session_id}` | Move to next topic |
| GET | `/audio/narration/state/{session_id}` | Poll current narration state |
| POST | `/hive/publish` | Share a document to the Knowledge Hive |
| GET | `/hive/feed` | RLS-filtered feed of visible shared notes |
| POST | `/hive/report/{note_id}` | Flag inappropriate content |

---

## 7. Non-Negotiable Quality Bars (acceptance criteria the agent must self-check against)

1. **No silent model substitution.** If `OPENAI_API_KEY` or `ELEVENLABS_API_KEY` is missing, the relevant service must raise a clear, explicit error — never fall back to a different model without it being a deliberate, documented decision.
2. **Translation audit cannot be skipped.** Every translated document passes through `audit_translation` before being marked `ready`, no exceptions for "speed."
3. **Disability-mode branching happens at the data layer too, not just UI.** The Knowledge Hive RLS policies must actually enforce visibility in Postgres — a determined user inspecting network requests should not be able to see notes outside their disability/language group by bypassing frontend filtering.
4. **Space-bar pause/resume state is server-tracked**, not purely client-side `useState`, so it survives reconnects and could later support cross-device resume.
5. **Every long-running operation reports granular status**, not a generic spinner — extraction, translation, audit, and topic-breakdown are each distinct, user-visible states.
6. **Accommodation conflicts are resolved explicitly**, not by whichever code path happens to run first (see 5.5's blind+autism-sensory example).

---

## 8. Explicitly Out of Scope (do not build unless re-prompted)

- Payment/subscription logic.
- Admin moderation dashboard (only the report-flagging mechanism is in scope, not a full moderation UI).
- Mobile native apps — web-responsive only.
- Real-time multi-user collaborative note editing.

---

*End of specification. If any requirement above is ambiguous when actually implementing, the agent should make the most reasonable assumption consistent with the four core barriers in Section 1, document the assumption in a code comment, and proceed — do not block implementation on a clarifying question for non-critical ambiguity.*
