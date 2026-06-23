# AeroLearn Docker Deployment Implementation Plan

## 1. Goal

Deploy three parts on Docker Desktop:

1. Frontend (Next.js)
2. Backend API + Celery worker (FastAPI/Python)
3. LLM service (Ollama model runtime)

This document is a beginner-focused implementation plan with the exact order of work, why each step exists, and how to validate each layer.

---

## 2. Current Repo State (verified)

Current folders found in workspace root:

- frontend
- processing

Docker deployment files are currently missing and will need to be created:

- docker-compose.yml (repo root)
- frontend/Dockerfile
- frontend/.dockerignore
- processing/Dockerfile
- processing/.dockerignore

---

## 3. Target Docker Architecture

We will run these containers:

1. frontend
- Next.js app exposed on host port 3000

2. backend
- FastAPI app exposed on host port 8000
- Connects to Redis and Ollama by service name inside Docker network

3. worker
- Celery worker process using the same backend image
- Consumes jobs from Redis

4. redis
- Message broker/result backend for Celery

5. ollama
- Model runtime endpoint for backend
- Exposed to backend using internal URL http://ollama:11434

6. ollama-init (one-shot job)
- Pulls the selected model on startup so app calls do not fail due to missing model

All services communicate through the Docker Compose default network.

---

## 4. Deployment Strategy

We will use a staged implementation to reduce confusion and avoid large failure surfaces.

### Stage A: Containerize frontend and backend only

Why first: easier debugging before adding model runtime complexity.

Deliverables:

- frontend Dockerfile + .dockerignore
- processing Dockerfile + .dockerignore
- docker-compose.yml with frontend, backend, worker, redis

Validation:

- docker compose up --build
- Frontend loads at localhost:3000
- Backend health endpoint responds (to be confirmed from main.py route)
- Worker connects to Redis without broker errors

### Stage B: Add Ollama container + model preload

Why second: model pull/download time is long and often causes first-run confusion.

Deliverables:

- compose service: ollama
- compose service: ollama-init to run model pull
- backend env updated to point to ollama service URL

Validation:

- docker logs ollama shows service healthy
- ollama-init exits successfully after pulling model
- backend can call model endpoint

### Stage C: Production hardening basics

Deliverables:

- restart policies
- persistent volumes for Redis and Ollama models
- clear environment variable strategy (.env example)

Validation:

- stop/start Docker Desktop and verify persistence

---

## 5. Environment Variables Plan

We should define a root .env file for Docker Compose (or .env.docker) with non-secret defaults and placeholders.

Expected variables (initial proposal):

- FRONTEND_PORT=3000
- BACKEND_PORT=8000
- REDIS_URL=redis://redis:6379/0
- OLLAMA_BASE_URL=http://ollama:11434
- OLLAMA_MODEL=qwen2.5:7b (example; final choice depends on your machine)

Backend service-specific variables likely needed by your existing code:

- ASSEMBLYAI_API_KEY
- HEYGEN_API_KEY
- Any Supabase keys used by backend routes

Note:

Secrets must not be committed to git. We should provide placeholders only.

---

## 6. LLM Model Sizing Guidance (important for beginners)

Pick model size based on hardware:

- 3B to 7B model: typical laptop-friendly starting point
- 8B to 14B model: better output but much higher RAM/VRAM demand
- Vision models require significantly more resources

For first success, use a smaller model first, then scale up.

---

## 7. Windows + Docker Desktop Prerequisites

Required:

1. Docker Desktop installed and running
2. WSL2 backend enabled in Docker Desktop settings
3. At least 16 GB RAM recommended if using LLM + app services together
4. Enough disk for model layers (10+ GB often required)

If using GPU acceleration for Ollama in containers:

1. NVIDIA GPU + recent drivers
2. WSL GPU support enabled
3. Docker Desktop GPU support configured

If GPU is unavailable, Ollama will run on CPU (slower but functional).

---

## 8. File-by-File Implementation Plan

### File: frontend/Dockerfile

Plan:

- Multi-stage build with Node LTS
- Install dependencies using package-lock.json
- Build Next.js app
- Run with next start on port 3000

### File: frontend/.dockerignore

Plan:

- Exclude node_modules, .next, logs, local env artifacts

### File: processing/Dockerfile

Plan:

- Use python:3.12-slim
- Install system packages needed by media stack (ffmpeg, gcc if required)
- pip install -r requirements.txt
- Default command for API process

### File: processing/.dockerignore

Plan:

- Exclude caches, venv, pyc, local data folders not needed for image build

### File: docker-compose.yml

Plan:

- Define services: frontend, backend, worker, redis, ollama, ollama-init
- Attach shared network
- Add volumes:
  - redis_data
  - ollama_data
- Add dependency ordering and restart policies

---

## 9. Backend Code Alignment Requirements

Current celery configuration uses localhost Redis URL. Inside Docker, localhost points to the same container, not Redis.

Required adaptation during implementation:

- Read Redis URL from environment variable
- Default to redis://redis:6379/0 when running in Docker

Similarly, Ollama client usage should read OLLAMA_BASE_URL from environment, not localhost.

---

## 10. Deployment Commands (planned)

From repo root:

1. docker compose build
2. docker compose up -d
3. docker compose ps
4. docker compose logs -f backend
5. docker compose logs -f worker
6. docker compose logs -f ollama-init

Functional checks:

1. Open frontend in browser at localhost:3000
2. Hit backend health/test route at localhost:8000
3. Trigger one backend task and verify worker consumption
4. Trigger one LLM call and confirm response

---

## 11. Common Beginner Issues and Fixes

1. Backend cannot connect to Redis
- Cause: using localhost in container
- Fix: use redis service hostname in env

2. Ollama model not found
- Cause: model not pulled yet
- Fix: run ollama-init pull step and check logs

3. Container exits immediately
- Cause: wrong CMD/entrypoint or missing env var
- Fix: check docker compose logs SERVICE

4. Build takes too long
- Cause: large dependency and model layers
- Fix: use build cache, smaller model first

5. Port already in use
- Cause: host process using 3000 or 8000
- Fix: remap ports in compose file

---

## 12. Acceptance Criteria

This implementation is complete when all items pass:

1. docker compose up -d starts all required services
2. frontend accessible on configured port
3. backend API reachable and stable
4. celery worker connected and consuming tasks
5. ollama service reachable from backend container
6. selected model is present and usable
7. restart of stack preserves Redis/Ollama data via volumes

---

## 13. What We Will Do Next (after your approval)

1. Create all missing Docker files
2. Update backend Redis/Ollama configuration to environment-driven values
3. Build and run stack with Docker Compose
4. Validate end-to-end with logs and one real task call
5. Provide you a short daily-use command cheat sheet
