/**
 * Reusable export architecture.
 *
 * Each exporter takes the workspace and returns either a plain string (txt/md)
 * or a Blob (future: pdf/pptx). Today everything is exported as Markdown / TXT
 * so downloads work without a backend. PDF and PPTX adapters can be plugged
 * into the same `Exporter` interface later.
 */

import type { VideoWorkspace } from "@/lib/types";

export type ExportFormat = "md" | "txt" | "json";

export interface ExportResource {
  key: "slides" | "report" | "notes" | "flashcards" | "quiz" | "transcript";
  label: string;
  filenameBase: string;
  build: (ws: VideoWorkspace, format: ExportFormat) => string;
}

function hr() {
  return "\n\n---\n\n";
}

function bullets(items: string[]) {
  return items.map((i) => `- ${i}`).join("\n");
}

function numbered(items: string[]) {
  return items.map((i, n) => `${n + 1}. ${i}`).join("\n");
}

export const exporters: Record<ExportResource["key"], ExportResource> = {
  slides: {
    key: "slides",
    label: "AI Slides",
    filenameBase: "lumen-slides",
    build: (ws) => {
      const lines: string[] = [`# ${ws.title} — Slide Deck`, ""];
      ws.slides.forEach((s) => {
        lines.push(`## Slide ${s.index} — ${s.chapterLabel}`);
        lines.push(`### ${s.title}`);
        lines.push("");
        lines.push(bullets(s.bullets));
        if (s.quote) {
          lines.push("", `> ${s.quote}`);
        }
        lines.push("", `**Key takeaway:** ${s.keyTakeaway}`, hr());
      });
      return lines.join("\n");
    },
  },
  report: {
    key: "report",
    label: "Professional Report",
    filenameBase: "lumen-report",
    build: (ws) => {
      const r = ws.report;
      const parts: string[] = [
        `# ${ws.title} — Learning Report`,
        `_Source: ${ws.source} • ${ws.duration} • ${ws.chapters.length} chapters_`,
        "",
        "## Executive Summary",
        r.executiveSummary,
        "",
        "## Learning Objectives",
        bullets(r.learningObjectives),
        "",
        "## Chapter Breakdown",
        r.chapterBreakdown
          .map((c) => {
            const ch = ws.chapters.find((x) => x.id === c.chapterId);
            return `### ${ch?.timestamp ?? ""} — ${ch?.title ?? c.chapterId}\n\n${c.narrative}`;
          })
          .join("\n\n"),
        "",
        "## Core Concepts",
        r.concepts
          .map(
            (c) => `### ${c.term}\n\n${c.explanation}\n\n_Example — ${c.example}_`
          )
          .join("\n\n"),
        "",
        "## Real-World Applications",
        bullets(r.realWorldApplications),
        "",
        "## Important Quotes",
        r.quotes.map((q) => `> ${q.quote}\n>\n> — _${q.context}_`).join("\n\n"),
        "",
        "## Key Insights",
        bullets(r.keyInsights),
        "",
        "## Actionable Takeaways",
        numbered(r.actionableTakeaways),
        "",
        "## Conclusion",
        r.conclusion,
      ];
      return parts.join("\n");
    },
  },
  notes: {
    key: "notes",
    label: "Study Notes",
    filenameBase: "lumen-study-notes",
    build: (ws) => {
      const n = ws.studyNotes;
      const parts: string[] = [
        `# ${ws.title} — Study Notes`,
        "",
        "## Learning Objectives",
        bullets(n.learningObjectives),
        "",
        "## Key Concepts",
        n.keyConcepts.map((c) => `### ${c.heading}\n\n${c.body}`).join("\n\n"),
        "",
        "## Definitions",
        n.definitions.map((d) => `- **${d.term}** — ${d.definition}`).join("\n"),
        "",
        "## Important Facts",
        bullets(n.importantFacts),
        "",
        "## Examples",
        n.examples.map((e) => `### ${e.title}\n\n${e.body}`).join("\n\n"),
        "",
        "## Revision Notes",
        numbered(n.revisionNotes),
        "",
        "## Exam Tips",
        bullets(n.examTips),
        "",
        "## Final Summary",
        n.finalSummary,
      ];
      return parts.join("\n");
    },
  },
  flashcards: {
    key: "flashcards",
    label: "Flashcards",
    filenameBase: "lumen-flashcards",
    build: (ws, format) => {
      if (format === "json") return JSON.stringify(ws.flashcards, null, 2);
      const parts: string[] = [`# ${ws.title} — Flashcards`, ""];
      ws.flashcards.forEach((c, i) => {
        parts.push(`### ${i + 1}. ${c.front}`);
        parts.push("");
        parts.push(`**Answer:** ${c.back}`, "");
      });
      return parts.join("\n");
    },
  },
  quiz: {
    key: "quiz",
    label: "Quiz",
    filenameBase: "lumen-quiz",
    build: (ws, format) => {
      if (format === "json") return JSON.stringify(ws.quiz, null, 2);
      const parts: string[] = [`# ${ws.title} — Quiz`, ""];
      ws.quiz.forEach((q, qi) => {
        parts.push(`### ${qi + 1}. ${q.question}`);
        q.options.forEach((o, oi) => {
          const marker = oi === q.correctIndex ? "✓" : " ";
          parts.push(`- [${marker}] ${o}`);
        });
        parts.push("");
      });
      return parts.join("\n");
    },
  },
  transcript: {
    key: "transcript",
    label: "Transcript",
    filenameBase: "lumen-transcript",
    build: (ws) => {
      const parts: string[] = [`# ${ws.title} — Transcript`, ""];
      ws.transcript.forEach((line) => {
        parts.push(`**${line.time}** — ${line.text}`);
      });
      return parts.join("\n\n");
    },
  },
};

const mimeMap: Record<ExportFormat, string> = {
  md: "text/markdown;charset=utf-8",
  txt: "text/plain;charset=utf-8",
  json: "application/json;charset=utf-8",
};

export function downloadResource(
  workspace: VideoWorkspace,
  key: ExportResource["key"],
  format: ExportFormat = "md"
) {
  if (typeof window === "undefined") return;
  const exp = exporters[key];
  const content = exp.build(workspace, format);
  const slug = workspace.title
    ? workspace.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60)
    : "workspace";
  const filename = `${exp.filenameBase}-${slug || "untitled"}.${format}`;
  const blob = new Blob([content], { type: mimeMap[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export const allExporters: ExportResource[] = Object.values(exporters);
