import { motion } from "framer-motion";
import { Presentation, FileText, ArrowRight, Sparkles, NotebookPen } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";

type Tab = "overview" | "slides" | "report" | "notes" | "flashcards" | "quiz" | "transcript";

export function OverviewTab({
  workspace,
  activeChapter,
  onNavigate,
}: {
  workspace: VideoWorkspace;
  activeChapter: string;
  onNavigate?: (tab: Tab) => void;
}) {
  const w = workspace;
  const chapter = w.chapters.find((c) => c.id === activeChapter) ?? w.chapters[0];

  if (!w.summary && w.chapters.length === 0) {
    return (
      <EmptyState
        icon={Sparkles}
        accent="blue"
        title="Your workspace is empty"
        description="Upload a video or paste a YouTube link to generate chapters, slides, notes, flashcards, and a quiz."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {w.summary && (
        <Card className="overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-blue/60 to-transparent"
            aria-hidden
          />
          <CardHeader>
            <Badge variant="blue" className="w-max">Summary</Badge>
            <CardTitle className="mt-1">What this video covers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-ink-muted">{w.summary}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <ShortcutCard
          icon={Presentation}
          accent="purple"
          title="Slide deck"
          body={`${w.slides.length} AI-generated slides, ready to present.`}
          cta="Open slides"
          onClick={() => onNavigate?.("slides")}
        />
        <ShortcutCard
          icon={FileText}
          accent="emerald"
          title="Learning report"
          body="Objectives, concepts, applications and takeaways."
          cta="Read report"
          onClick={() => onNavigate?.("report")}
        />
        <ShortcutCard
          icon={NotebookPen}
          accent="amber"
          title="Study notes"
          body="A premium teacher-written notebook for revision."
          cta="Open notes"
          onClick={() => onNavigate?.("notes")}
        />
      </div>

      {w.keyTakeaways.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key takeaways</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {w.keyTakeaways.map((t, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex gap-3 text-sm leading-relaxed text-ink"
                >
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-marker" />
                  {t}
                </motion.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {chapter && (
        <motion.div
          key={chapter.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <Card className="border-marker/30 bg-marker/[0.04]">
            <CardHeader>
              <span className="font-mono text-xs text-marker">{chapter.timestamp}</span>
              <CardTitle>{chapter.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-ink-muted">{chapter.summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

function ShortcutCard({
  icon: Icon,
  accent,
  title,
  body,
  cta,
  onClick,
}: {
  icon: React.ElementType;
  accent: "purple" | "emerald" | "amber";
  title: string;
  body: string;
  cta: string;
  onClick?: () => void;
}) {
  const accentMap: Record<string, { tile: string; cta: string; border: string; shadow: string }> = {
    purple: {
      tile: "bg-accent-purple/10 text-accent-purple",
      cta: "text-accent-purple",
      border: "hover:border-accent-purple/30",
      shadow: "hover:shadow-accent-purple/10",
    },
    emerald: {
      tile: "bg-accent-emerald/10 text-accent-emerald",
      cta: "text-accent-emerald",
      border: "hover:border-accent-emerald/30",
      shadow: "hover:shadow-accent-emerald/10",
    },
    amber: {
      tile: "bg-accent-amber/10 text-accent-amber",
      cta: "text-accent-amber",
      border: "hover:border-accent-amber/30",
      shadow: "hover:shadow-accent-amber/10",
    },
  };
  const a = accentMap[accent];

  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-start gap-3 rounded-xl border border-line bg-surface p-5 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg ${a.border} ${a.shadow}`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.tile}`}>
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="font-display text-base">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{body}</p>
      </div>
      <span className={`mt-auto inline-flex items-center gap-1 text-xs font-medium ${a.cta}`}>
        {cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}
