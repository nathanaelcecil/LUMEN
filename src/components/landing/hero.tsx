import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const mockY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const mockScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const mockOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.35]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  return (
    <section ref={ref} className="relative overflow-hidden pt-28 pb-24 sm:pt-32">
      {/* Mesh background */}
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-90" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-line to-transparent" />

      <motion.div style={{ y: textY }} className="container relative flex flex-col items-center text-center">
        {/* Pill */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3 py-1 text-[11.5px] font-medium text-ink-muted backdrop-blur"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-marker/60 animate-ping" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-marker" />
          </span>
          Lumen 1.0 — now in private preview
        </motion.div>

        {/* Headline — Linear-tight */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-3xl text-balance font-display text-[2.5rem] font-[600] leading-[1.02] tracking-[-0.045em] sm:text-[4.25rem]"
        >
          The learning operating system.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18 }}
          className="mt-6 max-w-xl text-balance text-[15.5px] leading-[1.55] text-ink-muted"
        >
          Drop in a lecture. Lumen produces notes, flashcards, quizzes, slides and a report —
          built the way you actually study.
        </motion.p>

        {/* CTAs — Raycast button + ⌘K hint */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.28 }}
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Button asChild size="lg" className="ember h-11 gap-2 px-5 text-[14px] font-semibold rounded-lg border-0">
            <Link to="/upload">
              Open Lumen
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Link
            to="/dashboard"
            className="group inline-flex items-center gap-2.5 rounded-lg border border-line bg-surface/40 px-3.5 py-2.5 text-[13px] font-medium text-ink-muted backdrop-blur transition-colors hover:text-ink hover:border-line/80"
          >
            See a live workspace
            <span className="flex items-center gap-1">
              <span className="kbd">⌘</span>
              <span className="kbd">K</span>
            </span>
          </Link>
        </motion.div>

        {/* Mockup — Raycast/Arc style window with parallax */}
        <motion.div
          style={{ y: mockY, scale: mockScale, opacity: mockOpacity }}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="relative mt-20 w-full max-w-5xl"
        >
          {/* Halo behind window */}
          <div className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-32 -z-10 blur-3xl"
               style={{ background: "radial-gradient(60% 60% at 50% 30%, hsl(var(--marker)/0.32), transparent 70%)" }} />

          <HeroWindow />
        </motion.div>
      </motion.div>
    </section>
  );
}

function HeroWindow() {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-surface/80 backdrop-blur-xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-line/80 bg-surface-raised/70 px-4 py-2.5">
        <span className="win-dots" />
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-line bg-canvas/60 px-2.5 py-1 text-[11px] text-ink-faint font-mono">
          <span className="text-marker">⌘</span> The Mathematics of Backpropagation — 18:42
        </div>
        <div className="flex items-center gap-1.5">
          <span className="kbd">⌘</span>
          <span className="kbd">K</span>
        </div>
      </div>

      <div className="grid grid-cols-[200px_1fr] min-h-[440px]">
        {/* Sidebar rail */}
        <aside className="border-r border-line/80 bg-canvas/40 p-3 flex flex-col gap-1 text-[12px]">
          <SidebarItem label="Transcript" />
          <SidebarItem label="Study Notes" active />
          <SidebarItem label="Flashcards" count="24" />
          <SidebarItem label="Quiz" count="12" />
          <SidebarItem label="Slides" count="11" />
          <SidebarItem label="Report" />
          <div className="mt-4 px-2 text-[10px] uppercase tracking-widest text-ink-faint">Recent</div>
          <SidebarItem label="Linear Algebra · Week 4" muted />
          <SidebarItem label="Neural Networks 101" muted />
        </aside>

        {/* Notes panel */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 border-b border-line/70 px-5 py-3">
            <span className="font-mono text-[10.5px] text-ink-faint">CHAPTER 3 — MEASURING ERROR</span>
          </div>
          <div className="px-6 py-6 flex flex-col gap-5">
            <div>
              <h3 className="font-display text-[18px] font-[600] tracking-[-0.02em] text-ink">Loss as a single scalar</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                The network's behaviour is judged by collapsing every prediction into one number. Optimisation only happens because this number is differentiable with respect to every weight.
              </p>
            </div>

            {/* Formula card */}
            <div className="rounded-lg border border-marker/30 bg-marker/5 px-4 py-3.5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-marker">
                <span>Formula</span>
                <span className="text-ink-faint">— Mean Squared Error</span>
              </div>
              <div className="mt-2 font-mono text-[15px] text-ink">
                L = (1/n) · Σ (yᵢ − ŷᵢ)²
              </div>
            </div>

            <div className="rounded-lg border border-line bg-canvas/40 px-4 py-3">
              <div className="text-[10px] uppercase tracking-widest text-ink-faint">Definition</div>
              <p className="mt-1.5 text-[12.5px] text-ink-muted">
                A <span className="text-ink">loss function</span> maps a prediction–truth pair to a non-negative number indicating disagreement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarItem({
  label, active, count, muted,
}: { label: string; active?: boolean; count?: string; muted?: boolean }) {
  return (
    <button
      className={
        "flex items-center justify-between rounded-md px-2.5 py-1.5 text-left transition-colors " +
        (active
          ? "bg-marker/15 text-ink ring-1 ring-marker/40"
          : muted
          ? "text-ink-faint hover:text-ink-muted hover:bg-surface-raised/60"
          : "text-ink-muted hover:text-ink hover:bg-surface-raised/60")
      }
    >
      <span className="truncate">{label}</span>
      {count && <span className="font-mono text-[10px] text-ink-faint">{count}</span>}
    </button>
  );
}
