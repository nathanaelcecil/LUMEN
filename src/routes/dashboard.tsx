import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { Sparkles, Wand2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { DashboardTopbar } from "@/components/dashboard/dashboard-topbar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { OverviewTab } from "@/components/dashboard/overview-tab";
import { FlashcardsTab } from "@/components/dashboard/flashcards-tab";
import { QuizTab } from "@/components/dashboard/quiz-tab";
import { TranscriptTab } from "@/components/dashboard/transcript-tab";
import { SlideViewer } from "@/components/dashboard/slides/slide-viewer";
import { ReportView } from "@/components/dashboard/report/report-view";
import { StudyNotesView } from "@/components/dashboard/study-notes-view";
import {
  useWorkspace,
  loadDemoWorkspace,
  clearWorkspace,
} from "@/lib/workspace-store";
import { emptyWorkspace } from "@/lib/types";

const TABS = [
  { value: "overview", label: "Overview", accent: "accent-blue" },
  { value: "slides", label: "Slides", accent: "accent-purple" },
  { value: "report", label: "Report", accent: "accent-emerald" },
  { value: "notes", label: "Study Notes", accent: "accent-amber" },
  { value: "quiz", label: "Quiz", accent: "accent-orange" },
  { value: "flashcards", label: "Flashcards", accent: "accent-cyan" },
  { value: "transcript", label: "Transcript", accent: "accent-slate" },
] as const;

const searchSchema = z.object({
  demo: z.union([z.string(), z.number(), z.boolean()]).optional(),
});

export const Route = createFileRoute("/dashboard")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Workspace — Lumen" },
      { name: "description", content: "Your AI-powered learning workspace — chapters, slides, study notes, flashcards, quiz and transcript." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  // Load demo workspace into the store on first mount if ?demo=1.
  React.useEffect(() => {
    if (search.demo) {
      loadDemoWorkspace();
      navigate({ to: "/dashboard", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stored = useWorkspace();
  const workspace = stored ?? emptyWorkspace;

  const [activeChapter, setActiveChapter] = React.useState<string>(
    workspace.chapters[0]?.id ?? ""
  );
  const [tab, setTab] = React.useState<string>("overview");

  React.useEffect(() => {
    if (workspace.chapters[0] && !workspace.chapters.find((c) => c.id === activeChapter)) {
      setActiveChapter(workspace.chapters[0].id);
    }
  }, [workspace, activeChapter]);

  const activeSeconds =
    workspace.chapters.find((c) => c.id === activeChapter)?.seconds ?? 0;

  function jumpToSeconds(seconds: number) {
    const nearest = [...workspace.chapters].reverse().find((c) => c.seconds <= seconds);
    if (nearest) setActiveChapter(nearest.id);
  }

  const isEmpty = !stored;

  return (
    <div className="min-h-screen bg-canvas">
      <DashboardTopbar workspace={workspace} />

      {isEmpty && <EmptyWorkspaceBanner />}

      <main className="container grid gap-8 py-8 lg:grid-cols-[280px_1fr] lg:gap-10 lg:py-10">
        <DashboardSidebar
          workspace={workspace}
          activeChapter={activeChapter}
          onSelectChapter={setActiveChapter}
        />

        <div className="min-w-0">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0">
              <TabsList>
                {TABS.map((t) => (
                  <TabsTrigger key={t.value} value={t.value}>
                    {t.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <TabsContent value="overview">
              <OverviewTab
                workspace={workspace}
                activeChapter={activeChapter}
                onNavigate={(t) => setTab(t)}
              />
            </TabsContent>
            <TabsContent value="slides">
              <SlideViewer workspace={workspace} />
            </TabsContent>
            <TabsContent value="report">
              <ReportView workspace={workspace} />
            </TabsContent>
            <TabsContent value="notes">
              <StudyNotesView workspace={workspace} />
            </TabsContent>
            <TabsContent value="quiz">
              <QuizTab workspace={workspace} />
            </TabsContent>
            <TabsContent value="flashcards">
              <FlashcardsTab workspace={workspace} />
            </TabsContent>
            <TabsContent value="transcript">
              <TranscriptTab
                workspace={workspace}
                activeSeconds={activeSeconds}
                onJump={jumpToSeconds}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function EmptyWorkspaceBanner() {
  const navigate = useNavigate();
  return (
    <div className="border-b border-line bg-gradient-to-br from-marker/[0.06] via-canvas to-canvas">
      <div className="container flex flex-col items-start justify-between gap-3 py-4 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-marker/15 text-marker">
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium">No workspace yet</p>
            <p className="text-xs text-ink-muted">
              Upload a video to generate slides, notes, flashcards and a quiz — or load a demo workspace to explore.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              loadDemoWorkspace();
            }}
          >
            <Wand2 className="h-3.5 w-3.5" /> Load demo
          </Button>
          <Button size="sm" variant="marker" onClick={() => navigate({ to: "/upload" })}>
            Upload a video
          </Button>
        </div>
      </div>
    </div>
  );
}

// Used to keep the import live for potential debugging utilities.
export { clearWorkspace };
