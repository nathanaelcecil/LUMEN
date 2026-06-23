import type { VideoWorkspace } from "@/lib/types";
import { Captions } from "lucide-react";
import { EmptyState } from "@/components/dashboard/empty-state";
import { cn } from "@/lib/utils";

export function TranscriptTab({
  workspace,
  activeSeconds,
  onJump,
}: {
  workspace: VideoWorkspace;
  activeSeconds: number;
  onJump: (seconds: number) => void;
}) {
  if (workspace.transcript.length === 0) {
    return (
      <EmptyState
        icon={Captions}
        accent="slate"
        title="No transcript yet"
        description="The full transcript with timestamps will appear here once Lumen finishes transcribing."
      />
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-line bg-surface/40 p-3">
      {workspace.transcript.map((line) => {
        const active = line.seconds === activeSeconds;
        return (
          <button
            key={line.seconds}
            onClick={() => onJump(line.seconds)}
            className={cn(
              "flex gap-4 rounded-lg px-3 py-2.5 text-left transition-colors",
              active ? "bg-ink/[0.06]" : "hover:bg-surface"
            )}
          >
            <span className={cn("shrink-0 font-mono text-xs", active ? "text-ink" : "text-ink-faint")}>
              {line.time}
            </span>
            <span className={cn("text-sm leading-relaxed", active ? "text-ink" : "text-ink-muted")}>
              {line.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
