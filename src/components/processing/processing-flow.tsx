import * as React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Brain, Mic2, Layers, Wand2, Puzzle, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { setWorkspace } from "@/lib/workspace-store";
import { uploadVideo, submitUrl, pollUntilDone } from "@/lib/api";
import { takePendingFile } from "@/lib/pending-file";
import type { ProcessingStatus } from "@/lib/api";

// ─── Extension configuration ────────────────────────────────────────────────
// Replace this with your published extension's ID from the Chrome Web Store.
// During development, copy the ID from chrome://extensions after loading unpacked.
const EXTENSION_ID = (import.meta as any).env?.VITE_LUMEN_EXTENSION_ID ?? "YOUR_EXTENSION_ID_HERE";

const EXTENSION_TIMEOUT_MS = 15_000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extract YouTube video ID from any YouTube URL, or return null. */
function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([0-9A-Za-z_-]{11})/,
    /youtu\.be\/([0-9A-Za-z_-]{11})/,
    /\/embed\/([0-9A-Za-z_-]{11})/,
    /\/shorts\/([0-9A-Za-z_-]{11})/,
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Check whether the Lumen Companion Chrome extension is installed and responding. */
async function isExtensionInstalled(): Promise<boolean> {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) return false;
  try {
    const result = await Promise.race<any>([
      new Promise((resolve) =>
        chrome.runtime.sendMessage(EXTENSION_ID, { type: "PING" }, (response) => {
          if (chrome.runtime.lastError) resolve(null);
          else resolve(response);
        })
      ),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("timeout")), 2_000)
      ),
    ]);
    // Any non-null response (even an error object) means the extension is installed
    return result !== null && result !== undefined;
  } catch {
    return false;
  }
}

/**
 * Ask the Lumen Companion extension to fetch the YouTube transcript.
 * Returns the transcript string on success.
 * Throws an error whose message starts with "NO_CAPTIONS" if the video
 * has no captions, or "EXTENSION_MISSING" if the extension isn't installed.
 */
async function fetchTranscriptFromExtension(videoId: string): Promise<string> {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) {
    throw new Error("EXTENSION_MISSING: Chrome extension API not available.");
  }

  const response = await Promise.race<any>([
    new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        EXTENSION_ID,
        { type: "GET_TRANSCRIPT", videoId },
        (res) => {
          if (chrome.runtime.lastError) {
            reject(new Error("EXTENSION_MISSING: " + chrome.runtime.lastError.message));
          } else {
            resolve(res);
          }
        }
      );
    }),
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("EXTENSION_MISSING: Extension did not respond in time.")),
        EXTENSION_TIMEOUT_MS
      )
    ),
  ]);

  if (!response) {
    throw new Error("EXTENSION_MISSING: No response from extension.");
  }

  if (!response.success) {
    const msg: string = response.error || "Unknown extension error";
    if (msg.startsWith("NO_CAPTIONS")) throw new Error(msg);
    throw new Error("EXTENSION_MISSING: " + msg);
  }

  if (!response.transcript) {
    throw new Error("NO_CAPTIONS: Transcript returned by extension was empty.");
  }

  return response.transcript as string;
}

// ─── Stage config ─────────────────────────────────────────────────────────────

const STAGE_INDEX: Record<ProcessingStatus["stage"], number> = {
  uploading: 0,
  transcribing: 1,
  analyzing: 2,
  structuring: 3,
  done: 4,
};

const STAGES = [
  { key: "uploading",    label: "Receiving your video",          sublabel: "Preparing the workspace",              icon: Layers },
  { key: "transcribing", label: "Listening to every word",       sublabel: "Timestamped transcript in progress",   icon: Mic2 },
  { key: "analyzing",    label: "Identifying concepts",          sublabel: "Mapping ideas, examples, and moments", icon: Brain },
  { key: "structuring",  label: "Building study materials",      sublabel: "Notes, slides, flashcards, quiz",      icon: Wand2 },
] as const;

const tickerLines = [
  "Understanding the structure of your video…",
  "Listening for the ideas that matter…",
  "Mapping concepts, examples, and key moments…",
  "Drafting slides, notes, flashcards, and a quiz…",
  "Finalizing your study workspace…",
];

// ─── Extension-missing card ───────────────────────────────────────────────────

function ExtensionRequiredCard({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-marker/30 bg-marker/10 text-marker">
        <Puzzle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold">Extension required</h2>
        <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">
          The <strong>Lumen Companion</strong> Chrome extension is required to fetch
          YouTube transcripts. It fetches captions directly from YouTube on your behalf,
          bypassing server-side IP blocks.
        </p>
      </div>
      <a
        href="https://chrome.google.com/webstore/detail/lumen-companion/YOUR_EXTENSION_ID_HERE"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 rounded-lg bg-marker px-5 py-2.5 text-[13px] font-semibold text-marker-foreground hover:opacity-90 transition-opacity"
      >
        <Download className="h-4 w-4" />
        Install Extension
      </a>
      <p className="text-[11px] text-ink-faint">
        Already installed?{" "}
        <button
          onClick={onDismiss}
          className="underline underline-offset-2 hover:text-ink transition-colors"
        >
          Try again
        </button>
      </p>
      <p className="text-[11px] text-ink-faint -mt-2">
        Or go back and{" "}
        <a href="/upload" className="underline underline-offset-2 hover:text-ink transition-colors">
          upload the video file
        </a>{" "}
        directly.
      </p>
    </div>
  );
}

// ─── No-captions card ─────────────────────────────────────────────────────────

function NoCaptionsCard() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
        <AlertCircle className="h-6 w-6" />
      </div>
      <div>
        <h2 className="font-display text-lg font-semibold">No captions available</h2>
        <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">
          This video has no captions available. Please upload the video file directly
          so Lumen can transcribe the audio using Gemini.
        </p>
      </div>
      <a
        href="/upload"
        className="rounded-lg bg-marker px-5 py-2.5 text-[13px] font-semibold text-marker-foreground hover:opacity-90 transition-opacity"
      >
        Upload video file
      </a>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

type ErrorKind = "generic" | "extension_missing" | "no_captions";

export function ProcessingFlow() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { name?: string; url?: string };
  const label = search.name || search.url || "your video";

  const [stageIndex, setStageIndex] = React.useState(0);
  const [lineIndex, setLineIndex] = React.useState(0);
  const [complete, setComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [errorKind, setErrorKind] = React.useState<ErrorKind>("generic");
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const t = setInterval(() => setLineIndex((i) => (i + 1) % tickerLines.length), 2200);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        let wsId: string;

        if (search.url) {
          const videoId = extractYouTubeId(search.url);

          let transcript: string | undefined;

          if (videoId) {
            // Always use the extension for YouTube URLs
            try {
              transcript = await fetchTranscriptFromExtension(videoId);
            } catch (e: any) {
              const msg: string = e?.message ?? "";

              if (msg.startsWith("NO_CAPTIONS")) {
                if (!cancelled) {
                  setError(msg);
                  setErrorKind("no_captions");
                }
                return;
              }

              if (msg.startsWith("EXTENSION_MISSING")) {
                if (!cancelled) {
                  setError(msg);
                  setErrorKind("extension_missing");
                }
                return;
              }

              // Unexpected extension error — surface it
              throw e;
            }
          }

          wsId = await submitUrl(search.url, transcript);
        } else {
          const file = takePendingFile();
          if (!file) {
            throw new Error("No file found. Please go back and re-select.");
          }
          wsId = await uploadVideo(file);
        }

        const workspace = await pollUntilDone(wsId, (stage) => {
          if (!cancelled) setStageIndex(STAGE_INDEX[stage] ?? 0);
        });

        if (cancelled) return;
        setWorkspace(workspace);
        setComplete(true);
        setTimeout(() => {
          if (!cancelled) navigate({ to: "/dashboard" });
        }, 900);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message ?? "Something went wrong");
          setErrorKind("generic");
        }
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const progressPct = complete ? 100 : Math.min(95, (stageIndex / STAGES.length) * 100);

  // ── Error states ──────────────────────────────────────────────────────────

  if (error && errorKind === "extension_missing") {
    return (
      <ExtensionRequiredCard
        onDismiss={() => {
          setError(null);
          setErrorKind("generic");
          setRetryCount((c) => c + 1);
        }}
      />
    );
  }

  if (error && errorKind === "no_captions") {
    return <NoCaptionsCard />;
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10 text-destructive">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold">Processing failed</h2>
          <p className="mt-2 text-[13px] text-ink-muted leading-relaxed">{error}</p>
        </div>
        <button
          onClick={() => navigate({ to: "/upload" })}
          className="rounded-lg bg-marker px-5 py-2.5 text-[13px] font-semibold text-marker-foreground hover:opacity-90 transition-opacity"
        >
          Try again
        </button>
      </div>
    );
  }

  // ── Processing UI ─────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center text-center">
      <p className="text-[11px] uppercase tracking-[0.14em] text-ink-faint">Processing</p>
      <h1 className="mt-2 max-w-xs truncate font-display text-[1.3rem] font-semibold tracking-tight">
        {label}
      </h1>

      {/* Progress ring */}
      <div className="relative my-10 flex h-28 w-28 items-center justify-center">
        <svg viewBox="0 0 112 112" className="absolute inset-0 -rotate-90">
          <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--line))" strokeWidth="2" />
          <motion.circle
            cx="56" cy="56" r="48"
            fill="none"
            stroke="hsl(var(--marker))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 48}
            initial={{ strokeDashoffset: 2 * Math.PI * 48 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 48 * (1 - progressPct / 100) }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        {/* Subtle red glow ring behind */}
        <div
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: "0 0 28px 4px hsl(var(--marker) / 0.12)" }}
        />
        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-marker text-marker-foreground"
            >
              <Check className="h-5 w-5" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key={stageIndex}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-marker"
            >
              {React.createElement(
                STAGES[Math.min(stageIndex, STAGES.length - 1)].icon,
                { className: "h-5 w-5", strokeWidth: 1.75 }
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stage list */}
      <ol className="flex w-full flex-col gap-2.5">
        {STAGES.map((s, i) => {
          const state = i < stageIndex || complete ? "done" : i === stageIndex ? "active" : "pending";
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-300",
                state === "active"  && "border-marker/30 bg-marker/5",
                state === "done"    && "border-line bg-surface/60",
                state === "pending" && "border-line/50 bg-transparent opacity-40",
              )}
            >
              <span className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px]",
                state === "done"    && "border-marker bg-marker text-marker-foreground",
                state === "active"  && "border-marker text-marker",
                state === "pending" && "border-line text-ink-faint",
              )}>
                {state === "done" ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className={cn("block text-[13px] font-medium", state === "pending" ? "text-ink-faint" : "text-ink")}>
                  {s.label}
                </span>
                {state === "active" && (
                  <span className="block text-[11px] text-ink-faint mt-0.5">{s.sublabel}</span>
                )}
              </div>
              {state === "active" && (
                <span className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1 w-1 rounded-full bg-marker"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{ duration: 1.1, repeat: Infinity, delay: d * 0.18 }}
                    />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* Ticker */}
      <div className="mt-8 h-8 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="font-mono text-[11px] italic text-ink-faint"
          >
            {tickerLines[lineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
