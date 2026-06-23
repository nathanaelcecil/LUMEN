import { Link } from "@tanstack/react-router";
import { ArrowLeft, Share2 } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ExportMenu } from "@/components/dashboard/export-menu";
import { LumenMark } from "@/components/shared/site-nav";

export function DashboardTopbar({ workspace }: { workspace: VideoWorkspace }) {
  async function handleShare() {
    if (typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `Lumen — ${workspace.title || "Workspace"}`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
    } catch {}
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-canvas/90 backdrop-blur-xl">
      <div className="container flex h-13 items-center justify-between gap-3 py-0" style={{ height: "52px" }}>
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Link>
          <span className="hidden h-3.5 w-px bg-line sm:block" />
          <Link to="/" className="hidden items-center gap-2 sm:flex group">
            <LumenMark className="transition-transform group-hover:scale-105" />
            <span className="font-display text-[14px] font-semibold tracking-[-0.02em]">Lumen</span>
          </Link>
          {workspace.title && (
            <>
              <span className="hidden h-3.5 w-px bg-line sm:block" />
              <span className="hidden max-w-[24rem] truncate text-[13px] text-ink-muted sm:block">
                {workspace.title}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" size="sm" className="gap-1.5 text-[12px] text-ink-muted h-8 px-3" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" /> Share
          </Button>
          <ExportMenu workspace={workspace} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
