import * as React from "react";
import { motion } from "framer-motion";
import { Play, Film, ExternalLink } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { cn } from "@/lib/utils";

function VideoPreview({ workspace }: { workspace: VideoWorkspace }) {
  const [videoError, setVideoError] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  // Try to detect if source is a YouTube URL and build embed
  const src = workspace.source || "";
  const ytMatch = src.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  );
  const ytId = ytMatch?.[1];

  if (ytId) {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
          title={workspace.title || "Video preview"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  // If there's a thumbnail image
  if (workspace.thumbnail && !imgError) {
    return (
      <div className="relative aspect-video bg-gradient-to-br from-surface-raised to-surface">
        <img
          src={workspace.thumbnail}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg">
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          </div>
        </div>
        {workspace.duration && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[10px] text-white">
            {workspace.duration}
          </span>
        )}
      </div>
    );
  }

  // Fallback: show a nice placeholder with link to source if available
  return (
    <div className="relative aspect-video flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-surface-raised to-surface text-ink-faint">
      <Film className="h-8 w-8" strokeWidth={1.5} />
      <p className="text-[11px] text-ink-faint">Video preview</p>
      {workspace.source && workspace.source.startsWith("http") && (
        <a
          href={workspace.source}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-marker hover:underline"
        >
          Open source <ExternalLink className="h-2.5 w-2.5" />
        </a>
      )}
    </div>
  );
}

export function DashboardSidebar({
  workspace,
  activeChapter,
  onSelectChapter,
}: {
  workspace: VideoWorkspace;
  activeChapter: string;
  onSelectChapter: (id: string) => void;
}) {
  const w = workspace;
  const hasChapters = w.chapters.length > 0;

  return (
    <aside className="flex flex-col gap-5">
      {/* Video / thumbnail card */}
      <div className="overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
        <VideoPreview workspace={w} />
        <div className="px-4 py-3.5">
          <h2 className="font-display text-[14px] font-semibold leading-snug tracking-[-0.01em]">
            {w.title || "Your workspace"}
          </h2>
          <p className="mt-1 truncate text-[11px] text-ink-faint">{w.source || "No source"}</p>
        </div>
      </div>

      {/* Chapters */}
      <div>
        <p className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          Chapters
        </p>
        {hasChapters ? (
          <ol className="flex flex-col gap-0.5">
            {w.chapters.map((c, i) => {
              const active = c.id === activeChapter;
              return (
                <li key={c.id} className="relative">
                  <button
                    onClick={() => onSelectChapter(c.id)}
                    className={cn(
                      "group flex w-full items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all",
                      active ? "bg-marker/[0.07]" : "hover:bg-surface"
                    )}
                  >
                    <span className="relative flex flex-col items-center pt-1">
                      <span className={cn(
                        "h-1.5 w-1.5 rounded-full transition-colors",
                        active ? "bg-marker" : "bg-line group-hover:bg-ink-faint"
                      )} />
                      {i < w.chapters.length - 1 && (
                        <span className="mt-1 h-full min-h-[1.25rem] w-px bg-line" />
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className={cn("block font-mono text-[10px]", active ? "text-marker" : "text-ink-faint")}>
                        {c.timestamp}
                      </span>
                      <span className={cn(
                        "mt-0.5 block text-[12px] leading-snug",
                        active ? "text-ink font-medium" : "text-ink-muted"
                      )}>
                        {c.title}
                      </span>
                    </span>
                  </button>
                  {active && (
                    <motion.div
                      layoutId="chapter-highlight"
                      className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-inset ring-marker/20"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="rounded-lg border border-dashed border-line px-3 py-4 text-[12px] leading-relaxed text-ink-faint">
            Chapters appear here once Lumen finishes analysing your video.
          </p>
        )}
      </div>
    </aside>
  );
}
