import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, Presentation } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { SlideCard } from "@/components/dashboard/slides/slide-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

export function SlideViewer({ workspace }: { workspace: VideoWorkspace }) {
  const slides = workspace.slides;
  const [index, setIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<1 | -1>(1);
  const [presenting, setPresenting] = React.useState(false);

  const go = React.useCallback(
    (dir: 1 | -1) => {
      setDirection(dir);
      setIndex((i) => Math.min(slides.length - 1, Math.max(0, i + dir)));
    },
    [slides.length]
  );


  React.useEffect(() => {
    if (presenting) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [presenting]);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        go(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "Escape" && presenting) {
        setPresenting(false);
      } else if (e.key === "f" || e.key === "F") {
        setPresenting((p) => !p);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, presenting]);

  if (slides.length === 0) {
    return (
      <EmptyState
        icon={Presentation}
        accent="purple"
        title="No slides yet"
        description="Lumen will generate one slide per chapter — bullets, a key takeaway, and a quote where it fits."
      />
    );
  }

  const slide = slides[Math.min(index, slides.length - 1)];
  const progressPct = ((index + 1) / slides.length) * 100;

  const variants = {
    enter: (dir: 1 | -1) => ({ opacity: 0, x: dir * 36 }),
    center: { opacity: 1, x: 0 },
    exit: (dir: 1 | -1) => ({ opacity: 0, x: dir * -36 }),
  };

  const deck = (
    <div className={presenting ? "flex h-full w-full flex-col bg-canvas" : "flex flex-col"}>
      {presenting && (
        <div className="flex items-center justify-between px-6 py-4 sm:px-10">
          <span className="font-display text-sm text-ink-muted">{workspace.title}</span>
          <Button variant="ghost" size="icon" onClick={() => setPresenting(false)} aria-label="Exit presentation">
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div
        className={cn(
          "relative overflow-hidden",
          presenting
            ? "flex-1"
            : "h-[30rem] rounded-lg border border-line bg-surface sm:h-[26rem]"
        )}
      >
        <AnimatePresence custom={direction} mode="wait" initial={false}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <SlideCard slide={slide} presentation={presenting} />
          </motion.div>
        </AnimatePresence>

        {!presenting && (
          <>
            <button
              onClick={() => go(-1)}
              disabled={index === 0}
              aria-label="Previous slide"
              className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/90 text-ink-muted backdrop-blur transition-opacity hover:text-ink disabled:opacity-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => go(1)}
              disabled={index === slides.length - 1}
              aria-label="Next slide"
              className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-canvas/90 text-ink-muted backdrop-blur transition-opacity hover:text-ink disabled:opacity-0"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* controls */}
      <div className={cn("flex items-center gap-4", presenting ? "px-6 py-5 sm:px-10" : "mt-5")}>
        <Button variant="outline" size="icon" onClick={() => go(-1)} disabled={index === 0} aria-label="Previous">
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex-1">
          <div className="h-1 w-full overflow-hidden rounded-full bg-surface">
            <motion.div
              className="h-full bg-marker"
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[11px] text-ink-faint">
              {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
            </span>
            <div className="hidden gap-1.5 sm:flex">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    "h-1.5 w-1.5 rounded-full transition-all",
                    i === index ? "w-4 bg-marker" : "bg-line hover:bg-ink-faint"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        <Button variant="outline" size="icon" onClick={() => go(1)} disabled={index === slides.length - 1} aria-label="Next">
          <ChevronRight className="h-4 w-4" />
        </Button>

        <Button
          variant={presenting ? "outline" : "marker"}
          size="icon"
          onClick={() => setPresenting((p) => !p)}
          aria-label="Toggle presentation mode"
        >
          {presenting ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-ink-faint">AI-generated deck</p>
          <h3 className="mt-1 font-display text-lg">{slides.length} slide{slides.length !== 1 ? "s" : ""} · one per chapter</h3>
        </div>
        <p className="hidden text-xs text-ink-faint sm:block">
          Use <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">←</kbd>{" "}
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">→</kbd> or{" "}
          <kbd className="rounded border border-line bg-surface px-1.5 py-0.5 font-mono">F</kbd> to present
        </p>
      </div>

      {!presenting && deck}

      {presenting && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[100] bg-canvas">{deck}</div>,
            document.body
          )
        : null}
    </div>
  );
}
