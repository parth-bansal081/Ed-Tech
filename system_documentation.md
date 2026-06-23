# AeroLearn Architecture & System Documentation

AeroLearn is a highly optimized, AI-powered inclusive learning platform designed specifically to assist neurodivergent students (e.g., individuals with ADHD, Dyslexia, Autism Spectrum Disorder) and students with accessibility requirements (e.g., Deaf or Hard of Hearing students). 

By leveraging cutting-edge local AI models (such as `Qwen2.5-VL` and `OpenAI Whisper`) alongside premium cloud integrations (`AssemblyAI`, `HeyGen`, and `Supabase`), AeroLearn dynamically adapts complex academic materials, video lectures, and real-time transcripts into personalized layouts that minimize cognitive load, bypass processing barriers, and optimize retention.

---

## 1. Technological Stack

AeroLearn is structured as a decoupled microservice architecture consisting of a Next.js frontend and a FastAPI processing backend, integrated with background task queuing and containerized model runtimes.

| Layer | Technology | Primary Role / Responsibility | Reference Files |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14.1 (React 18) | Single Page App rendering, client-side wizard, markdown formatting. | [package.json](file:///c:/Codes/Ed-Tech/frontend/package.json) |
| **Styling & Motion** | Tailwind CSS & Framer Motion | Smooth, modern UI styling, dynamic animations, theme configuration. | [globals.css](file:///c:/Codes/Ed-Tech/frontend/app/globals.css) |
| **Database & Auth** | Supabase | User session management, profile tables persistence. | [supabaseClient.js](file:///c:/Codes/Ed-Tech/frontend/lib/supabaseClient.js) |
| **Backend Framework** | FastAPI (Python 3.12) | Asynchronous REST endpoints, upload buffering, routing matrix. | [main.py](file:///c:/Codes/Ed-Tech/processing/main.py) |
| **Task Queue** | Celery (v5.2) | Decouples heavy AI inference from the FastAPI server. | [celery_app.py](file:///c:/Codes/Ed-Tech/processing/celery_app.py) |
| **In-Memory Store** | Redis 7 | Message broker and result backend for Celery background tasks. | [docker-compose.yml](file:///c:/Codes/Ed-Tech/docker-compose.yml) |
| **Local LLM/VLM** | Ollama (`qwen2.5vl:3b`) | Core neural engine for OCR, text simplification, translation auditing. | [Dockerfile](file:///c:/Codes/Ed-Tech/processing/Dockerfile) |
| **Speech-to-Text** | Faster-Whisper (Base CPU) | Low-latency local transcription of spoken lectures. | [main.py](file:///c:/Codes/Ed-Tech/processing/main.py) |
| **Cloud Video Ingest** | AssemblyAI API | Segmenting video/audio tracks into semantic chapter timelines. | [video_processor.py](file:///c:/Codes/Ed-Tech/processing/video_processor.py) |
| **Sign Language Video** | HeyGen API | Generating and polling virtual sign language avatars from text scripts. | [heygen_video_generator.py](file:///c:/Codes/Ed-Tech/processing/heygen_video_generator.py) |
| **Orchestration** | Docker Compose | Multi-container system deployment (Next.js, FastAPI, Celery, Redis, Ollama). | [docker-compose.yml](file:///c:/Codes/Ed-Tech/docker-compose.yml) |

---

## 2. System Architecture & Component Mapping

The following diagram illustrates how requests flow through AeroLearn's client, database, API gateway, distributed task queue, and local/remote AI models.

```mermaid
graph TD
    subgraph Frontend [Next.js App - Port 3000]
        UI["User Interface / Control Deck"]
        Context["AccessibilityContext.js"]
        Onboard["OnboardingForm.jsx"]
        SupaClient["supabaseClient.js"]
    end

    subgraph Backend [FastAPI Core Engine - Port 8000]
        Main["main.py (FastAPI Server)"]
        TranslationRoute["routes/translation.py"]
        CeleryApp["celery_app.py (Client Configuration)"]
    end

    subgraph Queue [Task Broker & Workers]
        Redis["Redis (Broker & Result Store)"]
        Worker["tasks.py (Celery Worker Process)"]
    end

    subgraph LocalAI [Local Inference Systems]
        Ollama["Ollama (qwen2.5vl:3b VLM)"]
        Whisper["faster-whisper (Base Audio Decoder)"]
        Extractor["master_extractor.py (pdfplumber / PIL Fallback)"]
        Simplifier["reading_simplifier.py (Accommodations Prompt)"]
        Glossary["glossary_extractor.py (STEM Indexer)"]
        Auditor["translation_auditor.py (LaTeX & Causal Auditor)"]
    end

    subgraph RemoteCloud [Cloud Services]
        Supabase["Supabase DB (profiles table & Auth)"]
        AssemblyAI["AssemblyAI API (Auto-Chapters)"]
        HeyGen["HeyGen API (Video Avatar Generation)"]
    end

    %% Client Interactions
    UI -->|Reads/Writes Preferences| Context
    Context -->|Sync Auth & User Data| SupaClient
    SupaClient <-->|Supabase SQL / Auth Sync| Supabase
    Onboard -->|Upsert profile preferences| SupaClient

    %% Client API Interactions
    UI -->|POST /api/process-video| Main
    UI -->|POST /api/process-document| Main
    UI -->|POST /translation/upload| TranslationRoute

    %% Asynchronous Worker Delegation
    Main -->|Trigger Task| CeleryApp
    CeleryApp -->|Enqueue Job| Redis
    Worker -->|Fetch Job| Redis
    Worker -->|Execute Task| Extractor
    Worker -->|Execute Task| Simplifier

    %% Pipelines Details
    Main -->|1. Extract youtube audio| VideoProcessor["video_processor.py"]
    VideoProcessor -->|2. Transcribe locally| Whisper
    VideoProcessor -->|3. Auto-Chapters (Optional)| AssemblyAI
    VideoProcessor -->|4. Generate notes markdown| Ollama
    VideoProcessor -.->|5. Generate sign avatar script| HeyGen

    Main -->|Open image / pdf| Extractor
    Extractor -->|1. Try digital text parse| pdfplumber["pdfplumber (Native Vector)"]
    Extractor -->|2. Image OCR Fallback| Ollama

    TranslationRoute -->|Extract & Generate terms| Glossary
    TranslationRoute -->|Verify translations| Auditor
    Glossary --> Ollama
    Auditor --> Ollama
    Simplifier --> Ollama
```

---

## 3. Core Pipelines & Processing Logic

AeroLearn uses specialized processing pipelines to handle complex computational tasks while maintaining local data privacy and server stability.

### 3.1. Ingestion & Text Extraction (Master Extractor)
- **File**: [master_extractor.py](file:///c:/Codes/Ed-Tech/processing/master_extractor.py)
- **Role**: Extracts textual content from academic materials (documents, scanned worksheets, and textbook page images) while retaining complex layouts like math formulas, multi-column tables, and handwriting.
- **Workflow**:
  1. **Phase 1 (Vector PDF Extraction)**: Attempts a rapid programmatic text extract using `pdfplumber`.
  2. **Phase 2 (Trigger Threshold check)**: If the extracted text footprint is less than 50 characters (indicative of a scanned page, image-only PDF, or handwriting), the system flags the page for VLM processing.
  3. **Phase 3 (Neural Vision Fallback)**:
     - The page layout is rendered into a high-resolution PIL image object (300 DPI).
     - The image is converted to RGB mode and encoded into a Base64 string.
     - The payload is dispatched to the local Ollama instance running `qwen2.5vl:3b`.
  4. **Phase 4 (PIL Raster Fallback)**: If the file is not a valid PDF structure (such as a raw JPEG/PNG image), the pipeline catches the exception, opens the image via PIL, and routes it directly to the VLM OCR system.
  5. **VLM Prompts**: Instructs the model to output structural Markdown, preserve formatting, and maintain perfect LaTeX syntax (e.g., inline `$` or block `$$`) for mathematical formulas.

### 3.2. Cognitive Accommodations Layer (Reading Simplifier)
- **File**: [reading_simplifier.py](file:///c:/Codes/Ed-Tech/processing/reading_simplifier.py)
- **Role**: Rewrites dense technical academic text into specialized learning structures based on the student's needs.
- **Workflow**:
  - Toggles between three primary accommodation tiers:
    1. **`summary`**: A bulleted, high-contrast overview highlighting core formulas and critical concepts.
    2. **`simplified`**: A 5th-grade reading level adaptation that breaks down complex sentence structures while keeping STEM terminology and proper nouns intact.
    3. **`step_by_step`**: A sequential, linear numbered procedure to help students with tracking difficulties follow mathematical or scientific reasoning.
  - Generates structural JSON strings directly from Ollama via the format check constraint (`format='json'`).
  - Cleans rogue markdown code fences (e.g., ` ```json `) to ensure safe string parsing.
  - Return Schema:
    ```json
    {
      "tier_processed": "summary | simplified | step_by_step",
      "adapted_markdown": "Accessibility-adapted text content containing LaTeX formatting..."
    }
    ```

### 3.3. YouTube Video Ingestion Pipeline
- **Files**: [main.py](file:///c:/Codes/Ed-Tech/processing/main.py), [video_processor.py](file:///c:/Codes/Ed-Tech/processing/video_processor.py)
- **Role**: Automatically converts online video lectures into structured, readable academic notes.
- **Workflow**:
  1. **Audio Extraction**: Uses `yt-dlp` to extract the highest quality audio stream from a YouTube link, converting it into a local `192kbps MP3` file stored in `/downloads`.
  2. **Local Transcription**: The audio file is loaded by the globally initialized `faster-whisper` engine (Base model, int8 quantization, CPU execution), generating the full transcript.
  3. **Auto-Chaptering**: If a cloud key is configured, the system calls AssemblyAI's auto-chapters API (`TranscriptionConfig(auto_chapters=True)`) to segment the audio track by semantic topic timestamps.
  4. **AI Synthesis**: The semantic segments (or full text transcript) are compiled and sent to Ollama Qwen2.5-VL to be synthesized into formatted, friendly academic notes.
  5. **Housekeeping**: The temporary heavy MP3 files are deleted from the local disk.

### 3.4. Distributed Task Queue (Celery/Redis Buffer)
- **Files**: [celery_app.py](file:///c:/Codes/Ed-Tech/processing/celery_app.py), [tasks.py](file:///c:/Codes/Ed-Tech/processing/tasks.py)
- **Role**: Heavy local model operations (such as Whisper decoding and Qwen inference) are computationally expensive and can block threads for up to two minutes. If executed inside FastAPI's request-response loop, concurrent user uploads would exhaust the server thread pool, freezing the application.
- **Workflow**:
  1. FastAPI receives an HTTP request and immediately registers the task in Celery.
  2. The server returns a `202 Accepted` response with a `task_id` in under 5ms, freeing the web server thread.
  3. The task is queued in Redis.
  4. An isolated Celery worker retrieves the task and executes the CPU/GPU-heavy extraction or simplification.
  5. The result is stored back in Redis, allowing the frontend to poll for task completion.

### 3.5. Translation, Glossary & Causal Logic Audit
- **Files**: [routes/translation.py](file:///c:/Codes/Ed-Tech/processing/routes/translation.py), [glossary_extractor.py](file:///c:/Codes/Ed-Tech/processing/glossary_extractor.py), [translation_auditor.py](file:///c:/Codes/Ed-Tech/processing/translation_auditor.py)
- **Role**: Builds an interactive bilingual glossary and validates that translations do not corrupt STEM formulas or reverse scientific causal statements.
- **Workflow**:
  1. **Glossary Extraction**: Identifies the top 3-5 complex terms, translates them to the target language, and provides simple one-sentence definitions.
  2. **Bilingual Hover System**: The React frontend matches these terms to wrap them in tooltips, showing definitions on-demand without cluttering the screen.
  3. **Causal Logic Check**: Evaluates translations with Ollama to ensure:
     - LaTeX formulas are unchanged.
     - Causal logic is intact (e.g., ensuring "A causes B" is not mistranslated as "B causes A").
     - Returns a `logic_check_passed` boolean and a list of warnings if validation fails.

### 3.6. HeyGen AI Video Avatar Engine
- **File**: [heygen_video_generator.py](file:///c:/Codes/Ed-Tech/processing/heygen_video_generator.py)
- **Role**: Creates sign language video guides matching educational texts using the "Fire and Poll" pattern.
- **Workflow**:
  1. **Fire**: Sends a POST request to HeyGen with the script text and selected avatar/voice IDs. The API returns a `prediction_id`.
  2. **Poll**: Runs a background loop that queries HeyGen's status every 10 seconds.
  3. **Resolve**: Extracts and returns the final MP4 streaming URL when the status changes to `completed` or `success`.

---

## 4. Database Schema & State Management

AeroLearn uses Supabase for authentication and profile management, syncing accessibility preferences across devices.

### 4.1. Supabase Profiles Database Schema
The custom Postgres table `profiles` links directly to the Supabase authentication schema.

| Column Name | Data Type | Default | Constraints | Description |
| :--- | :--- | :--- | :--- | :--- |
| **`id`** | `uuid` | *None* | Primary Key, References `auth.users.id` | Connects the preference profile to the authenticated user. |
| **`full_name`** | `text` | `""` | *None* | The student's callsign/display name. |
| **`dyslexia_friendly`** | `boolean` | `false` | *None* | Enables Open-Dyslexic font and letter-spacing overrides. |
| **`high_contrast`** | `boolean` | `false` | *None* | Activates bright, high-contrast style overrides. |
| **`sign_language_preference`**| `boolean` | `false` | *None* | Synced preference to render ASL/sign language overlays. |
| **`updated_at`** | `timestamp` | `now()` | *None* | Tracks when user preferences were last modified. |

### 4.2. Accessibility Context (`AccessibilityContext.js`)
- **File**: [AccessibilityContext.js](file:///c:/Codes/Ed-Tech/frontend/context/AccessibilityContext.js)
- **State Properties**:
  - `profile.theme`: Toggles the core layout style (`cosmic-dark`, `high-contrast`, `low-sensory`, `eco-saver`).
  - `profile.dyslexia_friendly`: Boolean that toggles the global `.font-dyslexic` CSS class.
  - `profile.high_contrast`: Boolean that triggers pure slate, high-contrast borders and yellow indicators.
  - `profile.sign_language_preference`: Boolean to embed sign-language avatar panels.
- **Synchronization Logic**:
  - Uses **Optimistic UI Updates**: Changes are reflected locally immediately, then synced to Supabase in the background.
  - **Local Storage Fallback**: Stores theme preferences in `localStorage` (`aerolearn_theme`) for guest users.

---

## 5. UI Screen Architecture

The Next.js frontend is organized as a dynamic single-page wizard that coordinates login, onboarding settings, and the workspace dashboard.

```
[Entry: http://localhost:3000]
       │
       ▼
 ┌─────────────┐
 │ LoginScreen │  ◄── User Authentication (Login/Register)
 └──────┬──────┘
        │ (On Success)
        ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ Onboarding Wizard (Steps 1-4)                               │
 ├─────────────────────────────────────────────────────────────┤
 │ • Step 1: User Callsign Identification                      │
 │ • Step 2: Cockpit Theme Selection (Cosmic, Contrast, Muted) │
 │ • Step 3: Dyslexia & Sign Language Assistance               │
 │ • Step 4: Configuration Review & Launch Commit              │
 └──────────────────────────────┬──────────────────────────────┘
                                │ (On Commit)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │ Control Deck (Dashboard Hub)                                │
 ├─────────────────────────────────────────────────────────────┤
 │ Ingestion Labs & Accessibility Workspaces                   │
 │                                                             │
 │  ┌───────────────────────┐     ┌─────────────────────────┐  │
 │  │ Document Processing   │     │ YouTube Video Ingestion │  │
 │  │ (File upload & OCR)   │     │ (yt-dlp, transcript)    │  │
 │  └───────────────────────┘     └─────────────────────────┘  │
 │  ┌───────────────────────┐     ┌─────────────────────────┐  │
 │  │ Speech Transcription  │     │ Social Knowledge Hive   │  │
 │  │ (ASL & transcript)    │     │ (Shared summaries)      │  │
 │  └───────────────────────┘     └─────────────────────────┘  │
 └─────────────────────────────────────────────────────────────┘
```

---

## 6. Docker & Orchestration Architecture

The application is containerized using Docker Compose to orchestrate dependencies, local GPU acceleration, and service configurations.

- **File**: [docker-compose.yml](file:///c:/Codes/Ed-Tech/docker-compose.yml)
- **Exposed Ports**:
  - Frontend: `3000` (mapped to Next.js server).
  - Backend: `8000` (mapped to FastAPI).
  - Ollama: `11434` (local model server).
  - Redis: `6379` (task message broker).
- **Service Breakdown**:
  1. **`redis`**: Uses `redis:7-alpine` for message brokering and Celery task tracking, persisted via the `redis_data` volume.
  2. **`ollama`**: Runs the model server with NVIDIA GPU support configured via Docker's GPU reservations. Model parameters are persisted in the `ollama_data` volume.
  3. **`ollama-init`**: A startup container that polls Ollama until it is active, checks if `qwen2.5vl:3b` is present, and pulls it if missing.
  4. **`backend`**: Serves the FastAPI application, built from [processing/Dockerfile](file:///c:/Codes/Ed-Tech/processing/Dockerfile).
  5. **`worker`**: Runs the Celery background worker (`celery -A celery_app worker --loglevel=info`), sharing the backend's image and environment settings.
  6. **`frontend`**: Serves the Next.js frontend, built from [frontend/Dockerfile](file:///c:/Codes/Ed-Tech/frontend/Dockerfile), pre-configured with Supabase API keys.
