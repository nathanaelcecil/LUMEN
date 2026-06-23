import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FileText, Sparkles, Layers, Zap, Brain, GaugeCircle } from "lucide-react";

export function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const glowY = useTransform(scrollYProgress, [0, 1], ["-20%", "20%"]);

  return (
    <section ref={ref} className="relative border-t border-line py-24 overflow-hidden">
      <motion.div
        style={{ y: glowY }}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        aria-hidden
      >
        <div className="h-full w-full" style={{ background: "radial-gradient(closest-side, hsl(var(--marker)/0.18), transparent 70%)" }} />
      </motion.div>

      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-ink-faint backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-marker" /> Built for depth
          </div>
          <h2 className="mt-5 font-display text-[2.1rem] font-[600] tracking-[-0.04em] leading-[1.05] sm:text-[2.8rem]">
            One video. <span className="text-ink-muted">Six surfaces of</span> understanding.
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-ink-muted">
            Every artifact links back to the source moment. Nothing hallucinated, nothing lost.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-12 gap-4 max-w-6xl mx-auto">
          <BentoCard className="col-span-12 md:col-span-7 row-span-2 min-h-[320px]" delay={0}>
            <div className="flex h-full flex-col justify-between gap-6">
              <div className="flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-marker">
                  <FileText className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Notes · Markdown</span>
              </div>
              <div>
                <h3 className="font-display text-[20px] font-[600] tracking-[-0.02em]">Study notes that read like a textbook</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
                  Chapters, definitions, formulas inline, diagram callouts described in prose. Export to Markdown or PDF.
                </p>
              </div>
              <div className="rounded-lg border border-line bg-canvas/60 p-4 font-mono text-[11.5px] leading-relaxed text-ink-muted">
                <span className="text-marker">##</span> Chapter 3 — Backprop<br />
                <span className="text-ink-faint">The gradient is computed in a single backward pass…</span><br />
                <span className="text-marker">$$</span> ∂L/∂wᵢⱼ = δⱼ · aᵢ <span className="text-marker">$$</span>
              </div>
            </div>
          </BentoCard>

          <BentoCard className="col-span-12 md:col-span-5 min-h-[150px]" delay={0.08}>
            <Stat icon={Brain} label="Concepts surfaced" value="47" suffix=" / video" />
          </BentoCard>

          <BentoCard className="col-span-12 md:col-span-5 min-h-[150px]" delay={0.16}>
            <Stat icon={GaugeCircle} label="Time to workspace" value="~90" suffix="s" accent />
          </BentoCard>

          <BentoCard className="col-span-6 md:col-span-4 min-h-[180px]" delay={0.24}>
            <FeatureMini icon={Layers} title="Slides" body="Auto-paginated decks with speaker notes." />
          </BentoCard>

          <BentoCard className="col-span-6 md:col-span-4 min-h-[180px]" delay={0.32}>
            <FeatureMini icon={Sparkles} title="Flashcards" body="Spaced-repetition ready, exportable to Anki." />
          </BentoCard>

          <BentoCard className="col-span-12 md:col-span-4 min-h-[180px]" delay={0.4}>
            <FeatureMini icon={Zap} title="Quiz" body="Calibrated to density — easy, medium, hard." />
          </BentoCard>
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  children, className = "", delay = 0,
}: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      className={
        "group relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 backdrop-blur-sm " +
        "transition-colors hover:border-line/80 " + className
      }
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
           style={{ background: "radial-gradient(400px circle at var(--mx,50%) var(--my,0%), hsl(var(--marker)/0.08), transparent 40%)" }} />
      <div className="relative h-full">{children}</div>
    </motion.div>
  );
}

function Stat({ icon: Icon, label, value, suffix, accent }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string; value: string; suffix?: string; accent?: boolean;
}) {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <div className={"flex h-9 w-9 items-center justify-center rounded-lg border border-line " + (accent ? "bg-marker/10 text-marker" : "bg-surface text-ink-muted")}>
          <Icon className="h-4 w-4" strokeWidth={1.75} />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={"font-display text-[3.2rem] font-[600] leading-none tracking-[-0.04em] " + (accent ? "text-marker" : "text-ink")}>{value}</span>
        {suffix && <span className="font-mono text-[13px] text-ink-faint">{suffix}</span>}
      </div>
    </div>
  );
}

function FeatureMini({ icon: Icon, title, body }: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string; body: string;
}) {
  return (
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-marker">
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-[14px] font-semibold tracking-[-0.015em]">{title}</h3>
        <p className="mt-1 text-[12.5px] leading-relaxed text-ink-muted">{body}</p>
      </div>
    </div>
  );
}