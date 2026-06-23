import * as React from "react";
import { motion } from "framer-motion";
import {
  NotebookPen,
  Target,
  BookOpen,
  Sparkles,
  Lightbulb,
  ListChecks,
  GraduationCap,
  Quote,
} from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Badge } from "@/components/ui/badge";

export function StudyNotesView({ workspace }: { workspace: VideoWorkspace }) {
  const n = workspace.studyNotes;
  const hasContent =
    n.learningObjectives.length > 0 ||
    n.keyConcepts.length > 0 ||
    n.definitions.length > 0 ||
    n.finalSummary.length > 0;

  if (!hasContent) {
    return (
      <EmptyState
        icon={NotebookPen}
        accent="amber"
        title="No study notes yet"
        description="Lumen will write a full notebook — objectives, key concepts, definitions, facts, examples, revision notes and exam tips."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-6">
      {/* Notebook cover */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-sm"
      >
        <div
          className="relative px-7 py-9 sm:px-10"
          style={{
            background:
              "radial-gradient(700px circle at 10% 0%, hsl(var(--accent-amber) / 0.12), transparent 60%)",
          }}
        >
          <Badge variant="amber" className="w-max">
            <NotebookPen className="h-3 w-3" /> Study Notes
          </Badge>
          <h1 className="mt-3 max-w-2xl text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {workspace.title || "Your study notes"}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            A teacher-written notebook distilled from the video — designed to be skimmed
            before the exam and to actually stick.
          </p>
        </div>
      </motion.div>

      <NotebookSection
        icon={Target}
        label="Learning Objectives"
        description="What you should be able to do by the end of this video."
      >
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {n.learningObjectives.map((o, i) => (
            <li
              key={i}
              className="flex items-start gap-2.5 rounded-lg border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-amber/15 font-mono text-[10px] text-accent-amber">
                {i + 1}
              </span>
              {o}
            </li>
          ))}
        </ul>
      </NotebookSection>

      <NotebookSection
        icon={BookOpen}
        label="Key Concepts"
        description="The core ideas, in the order they're introduced."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {n.keyConcepts.map((c, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-line bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <h4 className="font-display text-base leading-snug">{c.heading}</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{c.body}</p>
              <span className="absolute left-0 top-0 h-full w-0.5 bg-gradient-to-b from-accent-amber/70 to-transparent" />
            </div>
          ))}
        </div>
      </NotebookSection>

      <NotebookSection icon={Sparkles} label="Definitions" description="Precise meanings to memorise.">
        <dl className="grid gap-x-6 gap-y-0 sm:grid-cols-[10rem_1fr]">
          {n.definitions.map((d, i) => (
            <React.Fragment key={i}>
              <dt className="border-b border-dashed border-line py-3 font-display text-sm font-medium text-ink">
                {d.term}
              </dt>
              <dd className="border-b border-dashed border-line py-3 text-sm leading-relaxed text-ink-muted">
                {d.definition}
              </dd>
            </React.Fragment>
          ))}
        </dl>
      </NotebookSection>

      <NotebookSection
        icon={Quote}
        label="Important Facts"
        description="Punchy statements worth highlighting in pen."
      >
        <ul className="flex flex-col gap-2.5">
          {n.importantFacts.map((f, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border border-accent-amber/25 bg-accent-amber/[0.06] px-4 py-3 text-sm leading-relaxed text-ink"
            >
              <span className="mt-0.5 font-mono text-xs text-accent-amber">★</span>
              {f}
            </li>
          ))}
        </ul>
      </NotebookSection>

      <NotebookSection
        icon={Lightbulb}
        label="Examples"
        description="Concrete illustrations of the ideas in action."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {n.examples.map((e, i) => (
            <div key={i} className="rounded-xl border border-line bg-surface p-5 shadow-sm">
              <p className="text-[11px] font-medium uppercase tracking-wide text-accent-amber">
                Example {i + 1}
              </p>
              <h4 className="mt-1 font-display text-base">{e.title}</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{e.body}</p>
            </div>
          ))}
        </div>
      </NotebookSection>

      <NotebookSection
        icon={ListChecks}
        label="Revision Notes"
        description="The cheat-sheet version, for the night before."
      >
        <ol className="flex flex-col gap-2.5">
          {n.revisionNotes.map((r, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg bg-surface px-4 py-3 text-sm leading-relaxed text-ink"
            >
              <span className="font-mono text-xs text-ink-faint">
                {String(i + 1).padStart(2, "0")}
              </span>
              {r}
            </li>
          ))}
        </ol>
      </NotebookSection>

      <NotebookSection
        icon={GraduationCap}
        label="Exam Tips"
        description="What to say — and what not to say — under pressure."
      >
        <ul className="flex flex-col gap-2.5">
          {n.examTips.map((t, i) => (
            <li
              key={i}
              className="flex gap-3 rounded-lg border-l-2 border-accent-amber bg-surface px-4 py-3 text-sm leading-relaxed text-ink"
            >
              <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-accent-amber" strokeWidth={1.75} />
              {t}
            </li>
          ))}
        </ul>
      </NotebookSection>

      {n.finalSummary && (
        <NotebookSection
          icon={NotebookPen}
          label="Final Summary"
          description="Read this once, the morning of the exam."
        >
          <div className="rounded-2xl border border-accent-amber/30 bg-gradient-to-br from-accent-amber/[0.07] to-transparent p-6">
            <p className="font-display text-base italic leading-relaxed text-ink sm:text-lg">
              {n.finalSummary}
            </p>
          </div>
        </NotebookSection>
      )}
    </div>
  );
}

function NotebookSection({
  icon: Icon,
  label,
  description,
  children,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-sm sm:p-8">
      <header className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-amber/10 text-accent-amber">
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-snug tracking-tight">{label}</h2>
          {description && (
            <p className="mt-0.5 text-xs text-ink-faint">{description}</p>
          )}
        </div>
      </header>
      {children}
    </section>
  );
}
