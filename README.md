# Lumen — Video Learning Workspace

Turn any lecture or video into chapters, slides, study notes, flashcards, quizzes, and a full learning report.

---

## How to Run

### Prerequisites
- **Node.js 18+** and **Bun** (or npm) for the frontend
- **Python 3.10+** for the backend
- A **free Gemini API key** from [aistudio.google.com](https://aistudio.google.com/) — no billing needed

---

### 1. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Open backend/.env and paste your GEMINI_API_KEY
```

**`backend/.env`:**
```
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-1.5-flash
```

**Start the backend:**
```bash
uvicorn main:app --reload --port 8000
```

---

### 2. Frontend Setup

In a new terminal, from the **project root**:

```bash
bun install       # or: npm install
bun run dev       # or: npm run dev
```

Opens at `http://localhost:3000`

---

## Fixing the 429 quota error

The error happens when using `gemini-2.5-flash` which only allows **20 free requests/day**.

This project now defaults to **`gemini-1.5-flash`** which allows **1500 free requests/day** — plenty for normal use with no billing required.

If you still see 429, make sure your `backend/.env` has:
```
GEMINI_MODEL=gemini-1.5-flash
```

---

## About slide images

Slide illustrations are fetched live from **Wikipedia Commons** using each slide's AI-generated image query. No API key needed. Works best for educational/scientific topics.

## About the side video

- **YouTube links** → embedded player (works fully)
- **Uploaded files** → shows a clean placeholder (browsers can't replay uploaded files after page reload)
