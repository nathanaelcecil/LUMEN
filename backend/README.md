# Lumina — FastAPI Backend

Full Python backend for the Lumina video-to-workspace app.  
Powers: transcription, chapter detection, slides, report, study notes, flashcards, quiz, and transcript — all via **Google Gemini 2.5 Flash**.

---

## Stack

| Layer | Choice |
|-------|--------|
| API framework | **FastAPI** + Uvicorn |
| AI | **Google Gemini 2.5 Flash** (via `google-genai` 1.x SDK) |
| Video download | **yt-dlp** (YouTube URLs) |
| Database | **SQLite** via `aiosqlite` |
| File uploads | multipart/form-data, stored locally |

---

## Setup (5 minutes)

### 1 · Project structure

```
lumina-ultimate/
├── src/                         ← React frontend (already patched)
├── backend/                     ← Python FastAPI backend
│   ├── main.py
│   ├── requirements.txt
│   ├── .env.example
│   └── uploads/                 ← temp video storage (auto-created)
├── .env                         ← VITE_API_URL=http://localhost:8000
└── package.json
```

### 2 · Get a Gemini API key

Go to <https://aistudio.google.com/app/apikey> → **Create API key** (free tier works).

### 3 · Create your `.env`

```bash
cd backend
cp .env.example .env
# Edit .env and paste your key:
# GEMINI_API_KEY=AIza...
```

### 4 · Install Python dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

> **Note:** `yt-dlp` requires `ffmpeg` on your PATH for some video formats.
> Install with `brew install ffmpeg` (Mac) or `apt install ffmpeg` (Linux).

### 5 · Run the backend

```bash
uvicorn main:app --reload --port 8000
```

The API is live at `http://localhost:8000`.  
Visit `http://localhost:8000/docs` for the Swagger UI.

---

## Running the frontend

In a separate terminal:

```bash
# From project root (lumina-ultimate/)
bun install
bun dev
```

Open `http://localhost:5173`, upload a video or paste a YouTube URL.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/workspaces/upload` | Upload a video file |
| `POST` | `/api/workspaces/url` | Submit a YouTube URL |
| `GET` | `/api/workspaces/{id}/status` | Poll processing status |
| `GET` | `/api/workspaces/{id}` | Get completed workspace JSON |
| `GET` | `/api/workspaces` | List all workspaces |
| `DELETE` | `/api/workspaces/{id}` | Delete a workspace |

### Quick test

```bash
# Health check
curl http://localhost:8000/health

# Upload a file
curl -X POST http://localhost:8000/api/workspaces/upload \
  -F "file=@lecture.mp4"
# → {"workspaceId": "ws_abc123..."}

# Submit a YouTube URL
curl -X POST http://localhost:8000/api/workspaces/url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://youtube.com/watch?v=..."}'
# → {"workspaceId": "ws_abc123..."}

# Poll status
curl http://localhost:8000/api/workspaces/ws_abc123/status
# → {"workspaceId":"ws_abc123","status":"processing","stage":"transcribing"}
```

---

## Processing stages

```
uploading → transcribing → analyzing → structuring → done
```

The frontend progress ring maps directly to these stages.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `GEMINI_API_KEY not configured` | Add key to `backend/.env` and restart |
| `yt-dlp download produced no file` | Install `ffmpeg`; check the URL is public |
| `Gemini file processing failed` | Video codec unsupported — try re-encoding to H.264 MP4 |
| Large files time out | Run with `uvicorn main:app --timeout-keep-alive 300` |
| File > 2 GB | Gemini Files API limit; trim video or use a shorter clip |

---

## Production deployment

1. Set CORS origins in `main.py` to your frontend domain instead of `"*"`.
2. Store `GEMINI_API_KEY` as a secret env var (Railway, Render, Fly.io all support this).
3. Mount a persistent volume at `/app/uploads` and `/app/lumina.db`.
4. Set `VITE_API_URL` in frontend build to your production backend URL.
