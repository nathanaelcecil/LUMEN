import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon: Icon,
  title,
  description,
  accent = "marker",
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: "marker" | "blue" | "purple" | "emerald" | "amber" | "orange" | "cyan" | "slate";
  action?: React.ReactNode;
  className?: string;
}) {
  const accentStyles: Record<string, string> = {
    marker: "text-marker bg-marker/10 ring-marker/20",
    blue: "text-accent-blue bg-accent-blue/10 ring-accent-blue/20",
    purple: "text-accent-purple bg-accent-purple/10 ring-accent-purple/20",
    emerald: "text-accent-emerald bg-accent-emerald/10 ring-accent-emerald/20",
    amber: "text-accent-amber bg-accent-amber/10 ring-accent-amber/20",
    orange: "text-accent-orange bg-accent-orange/10 ring-accent-orange/20",
    cyan: "text-accent-cyan bg-accent-cyan/10 ring-accent-cyan/20",
    slate: "text-ink-muted bg-surface ring-line",
  };

  return (
    <div
      className={cn(
        "flex min-h-[18rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-line bg-surface/40 px-6 py-12 text-center",
        className
      )}
    >
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-2xl ring-1",
          accentStyles[accent]
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={1.6} />
      </div>
      <div className="max-w-sm">
        <h3 className="font-display text-lg leading-snug">{title}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
