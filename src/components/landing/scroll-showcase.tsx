import { useRef, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "framer-motion";
import {
  FileText, BookOpen, Layers, CheckCircle2, Presentation, FileBarChart2,
} from "lucide-react";

type Stage = {
  id: string;
  kicker: string;
  title: string;
  body: string;
  icon: typeof FileText;
  render: () => ReactNode;
};

const STAGES: Stage[] = [
  {
    id: "transcript",
    kicker: "01 · Transcript",
    title: "Every word, time-coded.",
    body: "Lumen aligns speech to the second so chapters, notes and quizzes can point exactly where an idea begins.",
    icon: FileText,
    render: TranscriptPanel,
  },
  {
    id: "notes",
    kicker: "02 · Study Notes",
    title: "Notes that surface the math.",
    body: "Formulas, theorems and definitions come through verbatim — pulled out and laid down beside the explanation.",
    icon: BookOpen,
    render: NotesPanel,
  },
  {
    id: "flashcards",
    kicker: "03 · Flashcards",
    title: "Built for recall, not noise.",
    body: "Each key claim becomes a card in the video's own vocabulary. Density scales with the lecture.",
    icon: Layers,
    render: FlashcardsPanel,
  },
  {
    id: "quiz",
    kicker: "04 · Quiz",
    title: "Test understanding, not memory.",
    body: "Short questions that target conceptual gaps — generated from what the lecture actually proves.",
    icon: CheckCircle2,
    render: QuizPanel,
  },
  {
    id: "slides",
    kicker: "05 · Slides",
    title: "A presentation, ready to use.",
    body: "Dynamically sized deck — eleven slides for a forty-minute lecture, three for a five-minute primer.",
    icon: Presentation,
    render: SlidesPanel,
  },
  {
    id: "report",
    kicker: "06 · Report",
    title: "The executive summary.",
    body: "A long-form distillation: takeaways, formulas in context, and how chapters connect into one argument.",
    icon: FileBarChart2,
    render: ReportPanel,
  },
];

export function ScrollShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.4 });

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-line bg-canvas"
      style={{ height: `${STAGES.length * 90}vh` }}
    >
      {/* Section header */}
      <div className="container pt-20 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-marker">The workspace</p>
          <h2 className="mt-3 font-display text-[2.25rem] font-[600] tracking-[-0.035em] sm:text-[3rem] leading-[1.04]">
            Six surfaces. <span className="text-ink-muted">One video.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[14.5px] text-ink-muted leading-relaxed">
            Scroll through the workspace Lumen builds for every lecture you give it.
          </p>
        </motion.div>
      </div>

      {/* Sticky panel */}
      <div className="sticky top-20 mx-auto flex h-[78vh] max-w-6xl items-center px-6">
        <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          {/* Left: copy stack */}
          <div className="relative hidden lg:block">
            {STAGES.map((s, i) => (
              <StageCopy key={s.id} stage={s} index={i} progress={progress} />
            ))}
          </div>

          {/* Right: stacked panels */}
          <div className="relative h-[60vh] min-h-[420px]">
            <ProgressRail progress={progress} />
            {STAGES.map((s, i) => (
              <StagePanel key={s.id} stage={s} index={i} progress={progress} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function rangeOpacity(p: MotionValue<number>, i: number) {
  const step = 1 / STAGES.length;
  const start = i * step;
  const mid = start + step * 0.5;
  const end = start + step;
  return useTransform(
    p,
    [start - 0.06, start + 0.04, mid, end - 0.04, end + 0.06],
    [0, 1, 1, 1, 0],
  );
}

function StageCopy({
  stage, index, progress,
}: { stage: Stage; index: number; progress: MotionValue<number> }) {
  const opacity = rangeOpacity(progress, index);
  const y = useTransform(progress, [index / STAGES.length, (index + 1) / STAGES.length], [20, -20]);
  const Icon = stage.icon;
  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-0 flex flex-col justify-center gap-4"
    >
      <div className="inline-flex items-center gap-2 self-start">
        <div className="flex h-8 w-8 items-center justify-center rounded-md border border-marker/40 bg-marker/10 text-marker">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-ink-faint">{stage.kicker}</span>
      </div>
      <h3 className="font-display text-[2rem] font-[600] tracking-[-0.035em] leading-[1.05]">
        {stage.title}
      </h3>
      <p className="max-w-md text-[14.5px] leading-relaxed text-ink-muted">{stage.body}</p>
    </motion.div>
  );
}

function StagePanel({
  stage, index, progress,
}: { stage: Stage; index: number; progress: MotionValue<number> }) {
  const opacity = rangeOpacity(progress, index);
  const start = index / STAGES.length;
  const end = (index + 1) / STAGES.length;
  const scale = useTransform(progress, [start - 0.05, start + 0.05, end - 0.05, end + 0.05], [0.96, 1, 1, 0.96]);
  const y = useTransform(progress, [start, end], [30, -30]);
  return (
    <motion.div
      style={{ opacity, scale, y }}
      className="absolute inset-0 overflow-hidden rounded-2xl border border-line bg-surface/80 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.04)]"
    >
      <div className="flex items-center justify-between border-b border-line/70 bg-surface-raised/70 px-4 py-2.5">
        <span className="win-dots" />
        <span className="font-mono text-[10.5px] text-ink-faint">lumen / workspace · {stage.id}</span>
        <span className="opacity-0 win-dots" />
      </div>
      <div className="h-[calc(100%-44px)] overflow-hidden">{stage.render()}</div>
    </motion.div>
  );
}

function ProgressRail({ progress }: { progress: MotionValue<number> }) {
  const h = useTransform(progress, [0, 1], ["6%", "100%"]);
  return (
    <div className="pointer-events-none absolute -left-4 top-0 hidden h-full w-[2px] overflow-hidden rounded-full bg-line/80 sm:block">
      <motion.div style={{ height: h }} className="w-full origin-top bg-gradient-to-b from-marker via-marker/80 to-marker/30" />
    </div>
  );
}

/* =====================  Panels  ===================== */

function TranscriptPanel() {
  const lines = [
    ["0:00", "Most of what a neural network does traces back to one surprisingly simple idea."],
    ["0:18", "Instead of writing rules by hand, we let the network learn from examples."],
    ["2:14", "Let's zoom into a single neuron — it takes numbers in, weights each one, and sums."],
    ["5:40", "Imagine thousands of neurons arranged in layers, each one feeding the next."],
    ["9:05", "To know if the network is improving, we need to measure how wrong its guesses are."],
    ["12:30", "Backpropagation pushes the error signal backward through the network."],
    ["14:55", "Gradient descent updates each weight against the slope of the loss."],
  ];
  return (
    <div className="grid grid-cols-[180px_1fr] h-full">
      <aside className="border-r border-line/70 p-3 text-[11px] text-ink-faint font-mono space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-ink-faint/80">Chapters</div>
        {[ "Why networks", "Single neuron", "Stacking layers", "Measuring error", "Backprop", "Gradient descent" ].map((c, i) => (
          <div key={c} className={i === 3 ? "text-marker" : ""}>{String(i+1).padStart(2,"0")} · {c}</div>
        ))}
      </aside>
      <div className="overflow-hidden p-2">
        {lines.map(([t, x], i) => (
          <div key={i} className={"flex gap-4 rounded-md px-3 py-2 " + (i === 4 ? "bg-marker/10 ring-1 ring-marker/25" : "") }>
            <span className="shrink-0 pt-0.5 font-mono text-[10.5px] text-marker">{t}</span>
            <p className="text-[12.5px] leading-snug text-ink-muted">{x}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesPanel() {
  return (
    <div className="p-6 space-y-5 overflow-hidden">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Chapter 3 — Measuring Error</div>
        <h4 className="mt-2 font-display text-[18px] font-[600] tracking-[-0.02em]">Loss as a single scalar</h4>
        <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
          Collapse every prediction into one differentiable number — the only thing optimisation knows how to follow.
        </p>
      </div>
      <div className="rounded-lg border border-marker/30 bg-marker/5 px-4 py-3.5">
        <div className="text-[10px] uppercase tracking-widest text-marker">Formula · Mean Squared Error</div>
        <div className="mt-1.5 font-mono text-[15px] text-ink">L = (1/n) · Σ (yᵢ − ŷᵢ)²</div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-line bg-canvas/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint">Theorem</div>
          <p className="mt-1 text-[12px] text-ink-muted">Differentiable losses admit gradient updates that monotonically reduce L in expectation under SGD.</p>
        </div>
        <div className="rounded-lg border border-line bg-canvas/50 p-3">
          <div className="text-[10px] uppercase tracking-widest text-ink-faint">Definition</div>
          <p className="mt-1 text-[12px] text-ink-muted">A loss maps a prediction–truth pair to a non-negative scalar indicating disagreement.</p>
        </div>
      </div>
    </div>
  );
}

function FlashcardsPanel() {
  return (
    <div className="flex h-full items-center justify-center px-6">
      <div className="relative w-full max-w-md">
        {[2,1,0].map((z) => (
          <div
            key={z}
            className="absolute inset-0 rounded-xl border border-line bg-surface-raised/90"
            style={{ transform: `translateY(${z*8}px) scale(${1 - z*0.04})`, opacity: 1 - z*0.25, zIndex: 10 - z }}
          />
        ))}
        <div className="relative z-20 rounded-xl border border-marker/25 bg-surface px-6 py-7 shadow-[0_20px_60px_-20px_hsl(var(--marker)/0.4)]">
          <div className="font-mono text-[10px] uppercase tracking-widest text-marker">Question · 7 / 24</div>
          <p className="mt-3 text-[15px] leading-snug font-medium text-ink">What does a single artificial neuron compute?</p>
          <div className="mt-5 flex items-center justify-between text-[11px] text-ink-faint">
            <span>tap to reveal</span>
            <span className="flex items-center gap-1"><span className="kbd">␣</span> flip</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuizPanel() {
  return (
    <div className="p-6 space-y-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Question 3 of 12</div>
      <h4 className="text-[14.5px] font-medium text-ink leading-snug">What is the primary role of an activation function?</h4>
      <div className="mt-3 space-y-2">
        {[
          ["A", "To normalize the input data", false, false],
          ["B", "To introduce non-linearity into the network", true, true],
          ["C", "To initialize the weights randomly", false, false],
          ["D", "To reduce the number of layers", false, false],
        ].map(([k, txt, correct, picked]) => (
          <div
            key={k as string}
            className={
              "flex items-center justify-between rounded-md border px-3 py-2.5 text-[12.5px] " +
              (correct
                ? "border-emerald-500/40 bg-emerald-500/5 text-ink"
                : "border-line text-ink-muted")
            }
          >
            <div className="flex items-center gap-3">
              <span className="kbd">{k as string}</span>
              <span>{txt as string}</span>
            </div>
            {correct ? <CheckCircle2 className="h-4 w-4 text-emerald-400" /> : null}
            {(picked as boolean) && !(correct as boolean) ? <span className="text-[10px] text-marker">selected</span> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function SlidesPanel() {
  return (
    <div className="grid h-full grid-cols-[1fr_120px]">
      <div className="p-6">
        <div className="h-full rounded-xl border border-line bg-gradient-to-br from-surface-raised to-canvas p-6 flex flex-col">
          <div className="font-mono text-[10px] uppercase tracking-widest text-marker">Chapter 5 · Slide 5 of 11</div>
          <h3 className="mt-2 font-display text-[20px] font-[600] tracking-[-0.025em]">Backpropagation in one line</h3>
          <ul className="mt-3 space-y-2 text-[12.5px] text-ink-muted">
            <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-marker"/>Chain rule pushed backward through layers</li>
            <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-marker"/>Each weight's gradient = downstream error × local input</li>
            <li className="flex gap-2"><span className="mt-1.5 h-1 w-1 rounded-full bg-marker"/>One forward pass, one backward pass, one update</li>
          </ul>
          <div className="mt-auto rounded-md border border-line bg-canvas/60 p-3 font-mono text-[12px] text-ink">
            ∂L/∂wᵢⱼ = δⱼ · aᵢ
          </div>
        </div>
      </div>
      <div className="border-l border-line/70 p-3 flex flex-col gap-1.5 overflow-hidden">
        <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint mb-1">Deck · 11</div>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className={"h-10 rounded-md border " + (i === 4 ? "border-marker/50 bg-marker/10" : "border-line bg-canvas/40")} />
        ))}
      </div>
    </div>
  );
}

function ReportPanel() {
  return (
    <div className="p-6 overflow-hidden">
      <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">Executive Report</div>
      <h4 className="mt-1 font-display text-[20px] font-[600] tracking-[-0.025em]">The Mathematics of Backpropagation</h4>
      <p className="mt-2 text-[12.5px] leading-relaxed text-ink-muted">
        Networks learn by collapsing predictions into a single loss, then walking each weight against the loss's slope. Backpropagation makes this tractable across deep stacks via the chain rule.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {[
          ["Chapters", "6"],
          ["Slides", "11"],
          ["Quiz items", "12"],
          ["Flashcards", "24"],
          ["Formulas", "4"],
          ["Definitions", "9"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-md border border-line bg-canvas/50 px-3 py-2.5">
            <div className="font-mono text-[10px] uppercase tracking-widest text-ink-faint">{k}</div>
            <div className="mt-1 font-display text-[18px] font-[600] tracking-tight">{v}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-marker/25 bg-marker/5 p-3">
        <div className="text-[10px] uppercase tracking-widest text-marker">Key Takeaway</div>
        <p className="mt-1 text-[12.5px] text-ink-muted">Differentiability of the loss is the only thing optimisation actually needs.</p>
      </div>
    </div>
  );
}
