import * as React from "react";
import {
  Download,
  Check,
  Presentation,
  FileText,
  NotebookPen,
  Layers,
  ListChecks,
  Captions,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import type { VideoWorkspace } from "@/lib/types";
import { allExporters, downloadResource, type ExportResource } from "@/lib/exporters";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const meta: Record<
  ExportResource["key"],
  { icon: LucideIcon; accent: string; description: string }
> = {
  slides: {
    icon: Presentation,
    accent: "text-accent-purple bg-accent-purple/10",
    description: "One slide per chapter with bullets and a key takeaway.",
  },
  report: {
    icon: FileText,
    accent: "text-accent-emerald bg-accent-emerald/10",
    description: "Long-form learning report — objectives, concepts, applications.",
  },
  notes: {
    icon: NotebookPen,
    accent: "text-accent-amber bg-accent-amber/10",
    description: "Premium notebook with definitions, examples and revision tips.",
  },
  flashcards: {
    icon: Layers,
    accent: "text-accent-cyan bg-accent-cyan/10",
    description: "Question-and-answer cards for spaced repetition.",
  },
  quiz: {
    icon: ListChecks,
    accent: "text-accent-orange bg-accent-orange/10",
    description: "Multiple-choice questions with the correct answers marked.",
  },
  transcript: {
    icon: Captions,
    accent: "text-ink-muted bg-surface",
    description: "Full timestamped transcript of the video.",
  },
};

export function ExportMenu({ workspace }: { workspace: VideoWorkspace }) {
  const [open, setOpen] = React.useState(false);
  const [recent, setRecent] = React.useState<string | null>(null);

  function handle(key: ExportResource["key"]) {
    downloadResource(workspace, key, "md");
    setRecent(key);
    setTimeout(() => setRecent(null), 1800);
  }

  const available = (key: ExportResource["key"]): boolean => {
    switch (key) {
      case "slides": return workspace.slides.length > 0;
      case "flashcards": return workspace.flashcards.length > 0;
      case "quiz": return workspace.quiz.length > 0;
      case "transcript": return workspace.transcript.length > 0;
      case "report": return Boolean(workspace.report.executiveSummary || workspace.report.learningObjectives.length);
      case "notes": return Boolean(
        workspace.studyNotes.finalSummary ||
        workspace.studyNotes.keyConcepts.length ||
        workspace.studyNotes.learningObjectives.length
      );
      default: return false;
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Download className="h-3.5 w-3.5" /> Export
        </Button>
      </Dialog.Trigger>
      <AnimatePresence>
        {open && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm"
              />
            </Dialog.Overlay>
            <Dialog.Content asChild>
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="fixed left-1/2 top-1/2 z-[101] w-[min(38rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-[0_30px_80px_-20px_hsl(var(--ink)/0.35)]"
              >
                <div className="border-b border-line px-6 py-5">
                  <Dialog.Title className="font-display text-lg leading-snug">
                    Download your workspace
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-ink-muted">
                    Each resource exports as Markdown today. PDF and PPTX exports plug into the same architecture.
                  </Dialog.Description>
                </div>

                <div className="grid max-h-[60vh] gap-2 overflow-y-auto p-4 sm:grid-cols-2">
                  {allExporters.map((exp) => {
                    const m = meta[exp.key];
                    const ok = available(exp.key);
                    const justDone = recent === exp.key;
                    return (
                      <button
                        key={exp.key}
                        onClick={() => ok && handle(exp.key)}
                        disabled={!ok}
                        className={cn(
                          "group flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-left transition-all",
                          ok
                            ? "hover:-translate-y-0.5 hover:border-marker/30 hover:shadow-md"
                            : "cursor-not-allowed opacity-50"
                        )}
                      >
                        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", m.accent)}>
                          <m.icon className="h-4 w-4" strokeWidth={1.75} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-display text-sm leading-snug">{exp.label}</h3>
                            {justDone && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-marker/15 px-1.5 py-0.5 text-[10px] font-medium text-marker">
                                <Check className="h-2.5 w-2.5" /> Downloaded
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                            {ok ? m.description : "Not generated yet."}
                          </p>
                        </div>
                        <Download className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink-faint transition-colors group-hover:text-ink" />
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between border-t border-line bg-surface/50 px-6 py-3 text-xs text-ink-faint">
                  <span>PDF and PPTX exports coming soon.</span>
                  <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                    Close
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
