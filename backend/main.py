"""
Lumina / Lumen – FastAPI Backend  (FIXED)
Powered by Google Gemini for transcription + analysis.
SQLite for workspace storage.

KEY FIX: Migrated from deprecated `google-generativeai` (0.8.x) to
the new `google-genai` (1.x) SDK.  The old SDK's upload_file() broke
in 0.8.x and is fully removed in favour of client.files.upload().
"""

import os
import uuid
import json
import time
import asyncio
import traceback
from pathlib import Path
from typing import Optional

import aiosqlite
import aiofiles
from fastapi import FastAPI, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

# ── New SDK ───────────────────────────────────────────────────────────────────
from google import genai
from google.genai import types

load_dotenv()

# ── Gemini setup ──────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
client: Optional[genai.Client] = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)

GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

# ── Database ──────────────────────────────────────────────────────────────────
DB_PATH   = Path("lumina.db")
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(title="Lumina Backend", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── DB helpers ────────────────────────────────────────────────────────────────
async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS workspaces (
                id          TEXT PRIMARY KEY,
                created_at  TEXT NOT NULL,
                status      TEXT NOT NULL DEFAULT 'processing',
                stage       TEXT NOT NULL DEFAULT 'uploading',
                error       TEXT,
                data        TEXT
            )
        """)
        await db.commit()


@app.on_event("startup")
async def startup():
    await init_db()


async def set_stage(ws_id: str, stage: str, status: str = "processing"):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE workspaces SET stage=?, status=? WHERE id=?",
            (stage, status, ws_id),
        )
        await db.commit()


async def save_workspace(ws_id: str, data: dict):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE workspaces SET data=?, status='done', stage='done' WHERE id=?",
            (json.dumps(data), ws_id),
        )
        await db.commit()


async def save_error(ws_id: str, error: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "UPDATE workspaces SET error=?, status='error' WHERE id=?",
            (error, ws_id),
        )
        await db.commit()


# ── Gemini pipeline ───────────────────────────────────────────────────────────
async def gemini_generate_with_retry(fn, max_retries: int = 4):
    """Run a synchronous Gemini generate_content() call (via run_in_executor)
    with exponential back-off on 429 RESOURCE_EXHAUSTED errors."""
    delay = 30  # initial wait in seconds (matches the retryDelay hint from the API)
    for attempt in range(max_retries):
        try:
            loop = asyncio.get_event_loop()
            return await loop.run_in_executor(None, fn)
        except Exception as exc:
            msg = str(exc)
            if "429" in msg or "RESOURCE_EXHAUSTED" in msg:
                if attempt < max_retries - 1:
                    print(f"[WARN] 429 rate-limit hit, retrying in {delay}s (attempt {attempt+1}/{max_retries})")
                    await asyncio.sleep(delay)
                    delay = min(delay * 2, 120)  # cap at 2 minutes
                    continue
            raise  # re-raise non-429 errors immediately
    raise RuntimeError("Gemini rate-limit retries exhausted — try again in a few minutes")


ANALYSIS_PROMPT = """
You are an expert educational content analyst. Analyse this video directly.
Your job is to transcribe it and extract rich, structured learning material from it in a single pass.

Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:

{
  "title": "string — concise video title",
  "summary": "string — 2-3 sentence plain-English summary",
  "duration": "string — estimated duration like '12:34', derive from transcript timestamps if possible",
  "thumbnail": "",
  "keyTakeaways": ["string", ...],
  "learningObjectives": ["string", ...],
  "chapters": [
    {
      "id": "c1",
      "timestamp": "0:00",
      "seconds": 0,
      "title": "string",
      "summary": "string"
    }
  ],
  "slides": [
    {
      "id": "s1",
      "index": 1,
      "chapterId": "c1",
      "chapterLabel": "Chapter 1 — <title>",
      "title": "string",
      "bullets": ["string", "string", "string", "string"],
      "keyTakeaway": "string",
      "quote": "string or omit",
      "imageQuery": "short search query for an illustration"
    }
  ],
  "report": {
    "executiveSummary": "string",
    "learningObjectives": ["string", ...],
    "chapterBreakdown": [{"chapterId": "c1", "narrative": "string"}, ...],
    "concepts": [
      {"id": "k1", "term": "string", "explanation": "string", "example": "string"}
    ],
    "realWorldApplications": ["string", ...],
    "quotes": [{"id": "q1", "quote": "string", "context": "string"}, ...],
    "keyInsights": ["string", ...],
    "actionableTakeaways": ["string", ...],
    "conclusion": "string"
  },
  "studyNotes": {
    "learningObjectives": ["string", ...],
    "keyConcepts": [{"heading": "string", "body": "string"}, ...],
    "definitions": [{"term": "string", "definition": "string"}, ...],
    "importantFacts": ["string", ...],
    "examples": [{"title": "string", "body": "string"}, ...],
    "revisionNotes": ["string", ...],
    "examTips": ["string", ...],
    "finalSummary": "string"
  },
  "flashcards": [
    {"id": "f1", "front": "string", "back": "string"}
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctIndex": 0
    }
  ],
  "transcript": [
    {"time": "0:00", "seconds": 0, "text": "string"}
  ],
  "knowledgeGraph": [
    {"id": "n1", "label": "string", "kind": "topic", "relatedTo": ["n2"]}
  ]
}

Rules:
- Generate chapters naturally based on when topics actually change (minimum 3, no artificial maximum).
- Generate ONE slide per chapter — no more, no fewer. Never force exactly 6 slides.
  The slide count should reflect the video's actual content density and complexity.
- Slide imageQuery: write a descriptive 5-10 word search query for a diagram, illustration, or photo
  that would genuinely help a student understand the slide's concept. Never leave it vague.
- Generate at least 8 flashcards and 5 quiz questions.
- Every chapter MUST have a corresponding slide with matching chapterId.
- Transcript lines should cover every ~30-60 seconds of content.
- knowledgeGraph: 6-12 nodes.
- studyNotes: when the content includes formulas, theorems, lemmas, definitions, or worked examples,
  include them explicitly. Only include what is genuinely present in the source — never fabricate.
  keyConcepts should be detailed paragraphs, not one-liners.
- report: include executiveSummary, full chapterBreakdown narratives, detailed concept explanations
  with real examples from the video, realWorldApplications, keyInsights, and actionableTakeaways.
  When a visual concept (diagram, chart, figure) is central to understanding a topic, describe it
  clearly in the narrative or concept explanation so it can be reproduced.
- Return ONLY the JSON object — nothing else.
"""


def _mime_for(path: Path) -> str:
    suffix = path.suffix.lower()
    if suffix in (".mp3", ".wav", ".m4a", ".ogg"):
        return f"audio/{suffix.lstrip('.')}"
    if suffix == ".mov":
        return "video/quicktime"
    if suffix == ".webm":
        return "video/webm"
    return "video/mp4"


async def transcribe_and_analyse(ws_id: str, file_path: Path, source_name: str):
    """Full Gemini pipeline: upload → transcribe → analyse → save."""
    gemini_file_name: Optional[str] = None
    try:
        if not client:
            raise RuntimeError("GEMINI_API_KEY not configured on server")

        await set_stage(ws_id, "transcribing")

        mime = _mime_for(file_path)
        print(f"=== GEMINI UPLOAD | ws={ws_id} file={file_path} size={file_path.stat().st_size} ===")

        # ── FIX: use new client.files.upload() ───────────────────────────────
        loop = asyncio.get_event_loop()
        gemini_file = await loop.run_in_executor(
            None,
            lambda: client.files.upload(
                file=str(file_path),
                config=types.UploadFileConfig(mime_type=mime, display_name=source_name),
            ),
        )
        gemini_file_name = gemini_file.name
        print(f"Upload success: {gemini_file_name}")

        # Wait for Gemini to finish processing the file
        while gemini_file.state.name == "PROCESSING":
            await asyncio.sleep(3)
            gemini_file = await loop.run_in_executor(
                None, lambda: client.files.get(name=gemini_file_name)
            )

        if gemini_file.state.name == "FAILED":
            raise RuntimeError("Gemini file processing failed — try re-encoding to H.264 MP4")

        await set_stage(ws_id, "analyzing")

        # ── Single pass: transcribe + full structured analysis ────────────────
        # Combining both into one call halves token usage and avoids hitting
        # the free-tier per-minute input-token quota (250k TPM).
        file_part = types.Part.from_uri(file_uri=gemini_file.uri, mime_type=mime)
        analysis_resp = await gemini_generate_with_retry(
            lambda: client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[file_part, ANALYSIS_PROMPT],
            )
        )

        await set_stage(ws_id, "structuring")
        raw = analysis_resp.text.strip()
        # Strip possible markdown fences
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rsplit("```", 1)[0].strip()

        workspace_data: dict = json.loads(raw)

        workspace_data["id"]        = ws_id
        workspace_data["createdAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        workspace_data["source"]    = source_name
        if not workspace_data.get("thumbnail"):
            workspace_data["thumbnail"] = ""

        await save_workspace(ws_id, workspace_data)

    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[ERROR] workspace {ws_id}: {exc}\n{tb}")
        await save_error(ws_id, str(exc))
    finally:
        # Clean up Gemini file
        if gemini_file_name and client:
            try:
                loop = asyncio.get_event_loop()
                await loop.run_in_executor(
                    None, lambda: client.files.delete(name=gemini_file_name)
                )
            except Exception:
                pass
        # Remove local temp file
        try:
            file_path.unlink(missing_ok=True)
        except Exception:
            pass


import re as _re

def _ydl_download(url: str, opts: dict):
    import yt_dlp  # noqa: PLC0415
    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([url])


def _extract_youtube_id(url: str):
    """Return the 11-char video ID from any YouTube URL, or None."""
    if not _re.search(r"(youtube\.com|youtu\.be)", url, _re.IGNORECASE):
        return None
    for pattern in [
        r"[?&]v=([0-9A-Za-z_-]{11})",
        r"youtu\.be/([0-9A-Za-z_-]{11})",
        r"/embed/([0-9A-Za-z_-]{11})",
        r"/shorts/([0-9A-Za-z_-]{11})",
        r"/v/([0-9A-Za-z_-]{11})",
    ]:
        m = _re.search(pattern, url)
        if m:
            return m.group(1)
    return None


def _fetch_youtube_transcript(video_id: str) -> str:
    """Fetch transcript via youtube-transcript-api v1.2.4 and return timestamped text."""
    from youtube_transcript_api import YouTubeTranscriptApi
    api = YouTubeTranscriptApi()
    try:
        fetched = api.fetch(video_id, languages=["en", "en-US", "en-GB"])
    except Exception:
        # Fall back to first available language
        transcript_list = api.list(video_id)
        fetched = next(iter(transcript_list)).fetch()
    lines = []
    for snippet in fetched:
        secs = int(snippet.start)
        mins, s = divmod(secs, 60)
        lines.append(f"[{mins}:{s:02d}] {snippet.text}")
    return "\n".join(lines)


TRANSCRIPT_PROMPT = """
You are an expert educational content analyst. Analyse this video transcript.
Return ONLY valid JSON (no markdown, no explanation) matching this exact schema:

{
  "title": "string",
  "summary": "string — 2-3 sentence summary",
  "duration": "string — e.g. '12:34', from last transcript timestamp",
  "thumbnail": "",
  "keyTakeaways": ["string"],
  "learningObjectives": ["string"],
  "chapters": [{"id":"c1","timestamp":"0:00","seconds":0,"title":"string","summary":"string"}],
  "slides": [{"id":"s1","index":1,"chapterId":"c1","chapterLabel":"string","title":"string","bullets":["string"],"keyTakeaway":"string","imageQuery":"string"}],
  "report": {
    "executiveSummary":"string","learningObjectives":["string"],
    "chapterBreakdown":[{"chapterId":"c1","narrative":"string"}],
    "concepts":[{"id":"k1","term":"string","explanation":"string","example":"string"}],
    "realWorldApplications":["string"],"quotes":[{"id":"q1","quote":"string","context":"string"}],
    "keyInsights":["string"],"actionableTakeaways":["string"],"conclusion":"string"
  },
  "studyNotes": {
    "learningObjectives":["string"],"keyConcepts":[{"heading":"string","body":"string"}],
    "definitions":[{"term":"string","definition":"string"}],"importantFacts":["string"],
    "examples":[{"title":"string","body":"string"}],"revisionNotes":["string"],
    "examTips":["string"],"finalSummary":"string"
  },
  "flashcards": [{"id":"f1","front":"string","back":"string"}],
  "quiz": [{"id":"q1","question":"string","options":["string","string","string","string"],"correctIndex":0}],
  "transcript": [{"time":"0:00","seconds":0,"text":"string"}],
  "knowledgeGraph": [{"id":"n1","label":"string","kind":"topic","relatedTo":["n2"]}]
}

Rules:
- Chapters: minimum 3, based on natural topic changes.
- Slides: one per chapter, no more no less.
- Flashcards: at least 8. Quiz: at least 5 questions.
- Populate transcript from the timestamped lines provided.
- knowledgeGraph: 6-12 nodes.
- Return ONLY the JSON object.

TRANSCRIPT:
"""


async def analyse_youtube_url(ws_id: str, url: str, video_id: str):
    """Use transcript API for YouTube — no video download needed."""
    try:
        if not client:
            raise RuntimeError("GEMINI_API_KEY not configured on server")

        await set_stage(ws_id, "transcribing")
        loop = asyncio.get_event_loop()
        transcript_text = await loop.run_in_executor(
            None, lambda: _fetch_youtube_transcript(video_id)
        )
        if not transcript_text.strip():
            raise RuntimeError("Transcript is empty — video may have no captions.")

        print(f"=== TRANSCRIPT FETCHED | ws={ws_id} chars={len(transcript_text)} ===")

        await set_stage(ws_id, "analyzing")
        analysis_resp = await gemini_generate_with_retry(
            lambda: client.models.generate_content(
                model=GEMINI_MODEL,
                contents=[TRANSCRIPT_PROMPT + transcript_text],
            )
        )

        await set_stage(ws_id, "structuring")
        raw = analysis_resp.text.strip()
        if raw.startswith("```"):
            raw = raw.split("```", 2)[1]
            if raw.startswith("json"):
                raw = raw[4:]
            raw = raw.rsplit("```", 1)[0].strip()

        workspace_data = json.loads(raw)
        workspace_data["id"]        = ws_id
        workspace_data["createdAt"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        workspace_data["source"]    = url
        workspace_data["thumbnail"] = workspace_data.get("thumbnail") or f"https://img.youtube.com/vi/{video_id}/hqdefault.jpg"

        await save_workspace(ws_id, workspace_data)

    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[ERROR] youtube workspace {ws_id}: {exc}\n{tb}")
        await save_error(ws_id, str(exc))


async def analyse_url(ws_id: str, url: str):
    """Route YouTube URLs to transcript path; everything else uses yt-dlp."""
    video_id = _extract_youtube_id(url)
    if video_id:
        print(f"=== YOUTUBE DETECTED | video_id={video_id} ===")
        await analyse_youtube_url(ws_id, url, video_id)
        return

    # Non-YouTube: download via yt-dlp as before
    try:
        await set_stage(ws_id, "uploading")

        tmp = UPLOAD_DIR / f"{ws_id}.mp4"
        ydl_opts = {
            "format": "bestvideo[ext=mp4][vcodec^=avc]+bestaudio[ext=m4a]/best[ext=mp4]/best",
            "outtmpl": str(tmp),
            "quiet": True,
            "no_warnings": True,
            "merge_output_format": "mp4",
        }
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(None, lambda: _ydl_download(url, ydl_opts))

        if not tmp.exists():
            candidates = list(UPLOAD_DIR.glob(f"{ws_id}.*"))
            if not candidates:
                raise RuntimeError(
                    "yt-dlp download produced no file — check the URL is public and ffmpeg is installed"
                )
            tmp = candidates[0]

        await transcribe_and_analyse(ws_id, tmp, url)

    except Exception as exc:
        tb = traceback.format_exc()
        print(f"[ERROR] url workspace {ws_id}: {exc}\n{tb}")
        await save_error(ws_id, str(exc))


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/health")
async def health():
    return {"status": "ok", "gemini_configured": bool(GEMINI_API_KEY)}


@app.post("/api/workspaces/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
):
    """Accept a video/audio file, kick off background processing, return workspace id."""
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured on server")

    ws_id  = f"ws_{uuid.uuid4().hex[:12]}"
    suffix = Path(file.filename or "video.mp4").suffix or ".mp4"
    dest   = UPLOAD_DIR / f"{ws_id}{suffix}"

    # Stream to disk
    async with aiofiles.open(dest, "wb") as f:
        while chunk := await file.read(1024 * 1024):   # 1 MB chunks
            await f.write(chunk)

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO workspaces (id, created_at, status, stage) VALUES (?,?,?,?)",
            (ws_id, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "processing", "uploading"),
        )
        await db.commit()

    background_tasks.add_task(transcribe_and_analyse, ws_id, dest, file.filename or "Uploaded video")
    return {"workspaceId": ws_id}


@app.post("/api/workspaces/url")
async def process_url(
    background_tasks: BackgroundTasks,
    payload: dict,
):
    """Accept a YouTube / video URL, download and process."""
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured on server")

    url = payload.get("url", "").strip()
    if not url:
        raise HTTPException(400, "url is required")

    ws_id = f"ws_{uuid.uuid4().hex[:12]}"

    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute(
            "INSERT INTO workspaces (id, created_at, status, stage) VALUES (?,?,?,?)",
            (ws_id, time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "processing", "uploading"),
        )
        await db.commit()

    background_tasks.add_task(analyse_url, ws_id, url)
    return {"workspaceId": ws_id}


@app.get("/api/workspaces/{ws_id}/status")
async def get_status(ws_id: str):
    """Poll this until status == 'done' or 'error'."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT status, stage, error FROM workspaces WHERE id=?", (ws_id,)
        ) as cur:
            row = await cur.fetchone()

    if not row:
        raise HTTPException(404, "Workspace not found")

    status, stage, error = row
    resp = {"workspaceId": ws_id, "status": status, "stage": stage}
    if error:
        resp["error"] = error
    return resp


@app.get("/api/workspaces/{ws_id}")
async def get_workspace(ws_id: str):
    """Return the full VideoWorkspace JSON once processing is done."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT status, stage, error, data FROM workspaces WHERE id=?", (ws_id,)
        ) as cur:
            row = await cur.fetchone()

    if not row:
        raise HTTPException(404, "Workspace not found")

    status, stage, error, data = row

    if status == "error":
        raise HTTPException(500, f"Processing failed: {error}")
    if status != "done":
        raise HTTPException(202, f"Still processing — stage: {stage}")

    return JSONResponse(json.loads(data))


@app.get("/api/workspaces")
async def list_workspaces():
    """Return a lightweight list of all workspaces."""
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute(
            "SELECT id, created_at, status, stage, error FROM workspaces ORDER BY created_at DESC"
        ) as cur:
            rows = await cur.fetchall()

    return [
        {"id": r[0], "createdAt": r[1], "status": r[2], "stage": r[3], "error": r[4]}
        for r in rows
    ]


@app.delete("/api/workspaces/{ws_id}")
async def delete_workspace(ws_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("DELETE FROM workspaces WHERE id=?", (ws_id,))
        await db.commit()
    return {"deleted": ws_id}
