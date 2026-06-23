/**
 * processing-flow.tsx  —  PATCHED VERSION
 *
 * Drop this file into src/components/processing/ replacing the original.
 * It hits the real FastAPI backend instead of using a fake timer.
 *
 * Changes vs original:
 *  - Uploads the file (or URL) on mount via uploadVideo / submitUrl
 *  - Polls /api/workspaces/:id/status every 2.5 s
 *  - Stores the returned VideoWorkspace via setWorkspace()
 *  - Shows a real error state if processing fails
 */

import * as React from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  FileVideo,
  Captions,
  BrainCircuit,
  LayoutGrid,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { setWorkspace } from "@/lib/workspace-store";
import { uploadVideo, submitUrl, pollUntilDone } from "@/lib/api";
import { takePendingFile } from "@/lib/pending-file";
import type { ProcessingStatus } from "@/lib/api";

// Map backend stage names → UI step index
const STAGE_INDEX: Record<ProcessingStatus["stage"], number> = {
  uploading: 0,
  transcribing: 1,
  analyzing: 2,
  structuring: 3,
  done: 4,
};

const STAGES = [
  { key: "uploading", label: "Receiving video", icon: FileVideo },
  { key: "transcribing", label: "Transcribing audio", icon: Captions },
  { key: "analyzing", label: "Identifying key ideas", icon: BrainCircuit },
  { key: "structuring", label: "Building your workspace", icon: LayoutGrid },
] as const;

const tickerLines = [
  "Receiving your video and preparing the workspace…",
  "Listening for the structure of the conversation…",
  "Mapping ideas, examples, and quotable moments…",
  "Drafting slides, notes, flashcards, and a quiz…",
  "Almost there — assembling your study workspace…",
];

export function ProcessingFlow() {
  const navigate = useNavigate();

  // The upload panel passes ?name=<filename> or ?url=<youtube> in the search
  const search = useSearch({ strict: false }) as {
    name?: string;
    url?: string;
    // When the panel actually sends the File object through navigation state
    // (requires react-router state support), you can grab it here too.
    // For simplicity we re-read it from sessionStorage below.
  };

  const label = search.name || search.url || "your video";

  const [stageIndex, setStageIndex] = React.useState(0);
  const [lineIndex, setLineIndex] = React.useState(0);
  const [complete, setComplete] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Ticker
  React.useEffect(() => {
    const t = setInterval(
      () => setLineIndex((i) => (i + 1) % tickerLines.length),
      1900,
    );
    return () => clearInterval(t);
  }, []);

  // Main pipeline
  React.useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        // 1. Start the job on the backend
        let wsId: string;

        if (search.url) {
          wsId = await submitUrl(search.url);
        } else {
          // The upload panel hands the File off via setPendingFile() (in-memory,
          // no size limit) right before navigating here.
          // takePendingFile() is safe to call twice (React StrictMode) — it
          // does not clear the file on the first call; a timer cleans up later.
          const file = takePendingFile();
          if (!file) {
            throw new Error(
              "No file found — your browser may have reloaded the page. Please go back and re-select your file."
            );
          }
          wsId = await uploadVideo(file);
        }

        // 2. Poll for completion
        const workspace = await pollUntilDone(wsId, (stage) => {
          if (!cancelled) setStageIndex(STAGE_INDEX[stage] ?? 0);
        });

        if (cancelled) return;

        // 3. Store in localStorage (matches existing workspace-store.ts)
        setWorkspace(workspace);
        setComplete(true);

        setTimeout(() => {
          if (!cancelled) navigate({ to: "/dashboard" });
        }, 1100);
      } catch (err: any) {
        if (!cancelled) setError(err?.message ?? "Something went wrong");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressPct = Math.min(100, (stageIndex / STAGES.length) * 100);

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center text-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h2 className="font-display text-xl">Processing failed</h2>
        <p className="text-sm text-ink-muted">{error}</p>
        <button
          onClick={() => navigate({ to: "/upload" })}
          className="mt-2 rounded-md bg-marker px-5 py-2 text-sm font-medium text-marker-foreground"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
      <p className="truncate text-xs uppercase tracking-[0.18em] text-ink-faint">
        Processing
      </p>
      <h1 className="mt-2 max-w-xs truncate font-display text-2xl tracking-tight">
        {label}
      </h1>

      {/* orbiting ring */}
      <div className="relative my-10 flex h-32 w-32 items-center justify-center">
        <svg viewBox="0 0 120 120" className="absolute inset-0 -rotate-90">
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="hsl(var(--line))"
            strokeWidth="2"
          />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="hsl(var(--marker))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 52}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{
              strokeDashoffset: 2 * Math.PI * 52 * (1 - progressPct / 100),
            }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <AnimatePresence mode="wait">
          {complete ? (
            <motion.div
              key="done"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-marker text-marker-foreground"
            >
              <Check className="h-6 w-6" strokeWidth={2.5} />
            </motion.div>
          ) : (
            <motion.div
              key={stageIndex}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-surface text-marker"
            >
              {React.createElement(
                STAGES[Math.min(stageIndex, STAGES.length - 1)].icon,
                { className: "h-6 w-6", strokeWidth: 1.75 },
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* stage list */}
      <ol className="flex w-full flex-col gap-3">
        {STAGES.map((s, i) => {
          const state =
            i < stageIndex || complete
              ? "done"
              : i === stageIndex
                ? "active"
                : "pending";
          return (
            <li
              key={s.key}
              className={cn(
                "flex items-center gap-3 rounded-md border px-4 py-3 text-left transition-colors",
                state === "active" && "border-marker/40 bg-marker/5",
                state === "done" && "border-line bg-surface/60",
                state === "pending" && "border-line/60 bg-transparent opacity-50",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                  state === "done" &&
                    "border-marker bg-marker text-marker-foreground",
                  state === "active" && "border-marker text-marker",
                  state === "pending" && "border-line text-ink-faint",
                )}
              >
                {state === "done" ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-sm",
                  state === "pending" ? "text-ink-faint" : "text-ink",
                )}
              >
                {s.label}
              </span>
              {state === "active" && (
                <span className="ml-auto flex gap-1">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      className="h-1 w-1 rounded-full bg-marker"
                      animate={{ opacity: [0.2, 1, 0.2] }}
                      transition={{
                        duration: 1.1,
                        repeat: Infinity,
                        delay: d * 0.15,
                      }}
                    />
                  ))}
                </span>
              )}
            </li>
          );
        })}
      </ol>

      {/* live ticker */}
      <div className="mt-8 h-10 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={lineIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="font-mono text-xs italic leading-relaxed text-ink-faint"
          >
            &ldquo;{tickerLines[lineIndex]}&rdquo;
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
