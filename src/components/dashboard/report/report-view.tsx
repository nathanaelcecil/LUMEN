import { CheckCircle2, Quote, Lightbulb, Compass, BookOpen, FileText } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/empty-state";

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 pb-1 pt-2">
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent-emerald">{label}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function ReportView({ workspace }: { workspace: VideoWorkspace }) {
  const w = workspace;
  const r = w.report;
  const chapterById = Object.fromEntries(w.chapters.map((c) => [c.id, c]));

  if (!r.executiveSummary && r.learningObjectives.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        accent="emerald"
        title="No learning report yet"
        description="A long-form professional report — executive summary, concepts, applications and takeaways — will be generated from your video."
      />
    );
  }


  return (
    <div className="flex flex-col gap-10 pb-4">
      {/* cover */}
      <div className="overflow-hidden rounded-lg border border-line bg-surface">
        <div
          className="relative flex flex-col gap-3 px-7 py-10 sm:px-10"
          style={{
            background:
              "radial-gradient(640px circle at 15% 0%, hsl(var(--accent-emerald) / 0.10), transparent 60%)",
          }}
        >
          <Badge variant="emerald" className="w-max">Learning Report</Badge>
          <h1 className="max-w-2xl text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl">
            {w.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span>{w.source}</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint" />
            <span>{w.duration}</span>
            <span className="h-1 w-1 rounded-full bg-ink-faint" />
            <span>{w.chapters.length} chapters</span>
          </div>
        </div>
      </div>

      {/* executive summary */}
      <section>
        <SectionDivider label="Executive Summary" />
        <p className="text-sm leading-relaxed text-ink-muted sm:text-base">{r.executiveSummary}</p>
      </section>

      {/* learning objectives */}
      <section>
        <SectionDivider label="Learning Objectives" />
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {r.learningObjectives.map((o, i) => (
            <li key={i} className="flex items-start gap-2.5 rounded-md border border-line bg-surface px-3.5 py-3 text-sm leading-relaxed">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald" strokeWidth={1.75} />
              {o}
            </li>
          ))}
        </ul>
      </section>

      {/* chapter breakdown */}
      <section>
        <SectionDivider label="Chapter Breakdown" />
        <div className="flex flex-col gap-4">
          {r.chapterBreakdown.map((entry, i) => {
            const chapter = chapterById[entry.chapterId];
            return (
              <Card key={entry.chapterId} className="transition-shadow hover:shadow-sm">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line font-mono text-[11px] text-ink-faint">
                    {i + 1}
                  </span>
                  <div>
                    <span className="font-mono text-[11px] text-accent-emerald">{chapter?.timestamp}</span>
                    <CardTitle className="mt-0.5 text-base">{chapter?.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-ink-muted">{entry.narrative}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* core concepts */}
      <section>
        <SectionDivider label="Core Concepts" />
        <div className="grid gap-4 sm:grid-cols-2">
          {r.concepts.map((c) => (
            <Card key={c.id} className="flex flex-col transition-shadow hover:shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-2 text-accent-emerald">
                  <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span className="text-xs font-medium uppercase tracking-wide">Concept</span>
                </div>
                <CardTitle className="text-base">{c.term}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <p className="text-sm leading-relaxed text-ink-muted">{c.explanation}</p>
                <div className="mt-auto rounded-md bg-canvas px-3.5 py-2.5 text-xs leading-relaxed text-ink-muted">
                  <span className="font-medium text-ink">Example — </span>
                  {c.example}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* applications */}
      <section>
        <SectionDivider label="Real-World Applications" />
        <ul className="flex flex-col gap-2.5">
          {r.realWorldApplications.map((a, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-ink-muted">
              <Compass className="mt-0.5 h-4 w-4 shrink-0 text-ink-faint" strokeWidth={1.75} />
              {a}
            </li>
          ))}
        </ul>
      </section>

      {/* quotes */}
      {r.quotes.length > 0 && (
        <section>
          <SectionDivider label="Important Quotes" />
          <div className="grid gap-4 sm:grid-cols-2">
            {r.quotes.map((q) => (
              <div key={q.id} className="rounded-lg border border-line bg-surface px-5 py-4">
                <Quote className="h-4 w-4 text-accent-emerald" strokeWidth={1.75} />
                <p className="mt-2 font-display text-base italic leading-relaxed">{q.quote}</p>
                <p className="mt-2 text-xs text-ink-faint">{q.context}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* key insights */}
      <section>
        <SectionDivider label="Key Insights" />
        <div className="grid gap-3 sm:grid-cols-2">
          {r.keyInsights.map((k, i) => (
            <div key={i} className="flex gap-3 rounded-md border border-accent-emerald/25 bg-accent-emerald/[0.05] px-4 py-3.5">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent-emerald" strokeWidth={1.75} />
              <p className="text-sm leading-relaxed text-ink">{k}</p>
            </div>
          ))}
        </div>
      </section>

      {/* takeaways */}
      <section>
        <SectionDivider label="Actionable Takeaways" />
        <ol className="flex flex-col gap-2.5">
          {r.actionableTakeaways.map((t, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
              <span className="font-mono text-xs text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              {t}
            </li>
          ))}
        </ol>
      </section>

      {/* conclusion */}
      <section>
        <SectionDivider label="Conclusion" />
        <p className="text-sm leading-relaxed text-ink-muted sm:text-base">{r.conclusion}</p>
      </section>
    </div>
  );
}
