import * as React from "react";
import { motion } from "framer-motion";
import {
  ListTree, Sparkles, Layers, BookOpenCheck,
  FileText, Presentation, RotateCw, CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: ListTree,
    title: "Automatic chaptering",
    body: "Lumen finds where ideas actually change — not fixed intervals, but real structure.",
  },
  {
    icon: Sparkles,
    title: "Distilled summaries",
    body: "Every chapter gets a tight, accurate summary and a short list of takeaways worth remembering.",
  },
  {
    icon: Layers,
    title: "Flashcards, generated",
    body: "Key claims become spaced-repetition-ready flashcards, in your video's own vocabulary.",
  },
  {
    icon: BookOpenCheck,
    title: "Quizzes that check understanding",
    body: "Short questions test whether ideas stuck — not whether you can recall a timestamp.",
  },
];

const TABS = [
  { id: "transcript", label: "Transcript" },
  { id: "notes",      label: "Study Notes" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz",       label: "Quiz" },
  { id: "slides",     label: "Slides" },
] as const;

type TabId = typeof TABS[number]["id"];

function PreviewTranscript() {
  const lines = [
    { t: "0:00",  text: "Most of what a neural network does traces back to one surprisingly simple idea." },
    { t: "0:18",  text: "Instead of writing rules by hand, we let the network learn from examples." },
    { t: "2:14",  text: "Let's zoom into a single neuron — it takes numbers in, weights each one, and sums." },
    { t: "5:40",  text: "Imagine thousands of neurons arranged in layers, each one feeding the next." },
    { t: "9:05",  text: "To know if the network is improving, we need to measure how wrong its guesses are." },
    { t: "12:30", text: "Backpropagation pushes the error signal backward through the network, layer by layer." },
  ];
  return (
    <div className="flex flex-col divide-y divide-line">
      {lines.map((l) => (
        <div key={l.t} className="flex gap-4 px-5 py-3">
          <span className="shrink-0 font-mono text-[11px] text-marker pt-0.5">{l.t}</span>
          <p className="text-[13px] leading-relaxed text-ink-muted">{l.text}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewNotes() {
  const concepts = [
    { h: "The single neuron", b: "Each neuron computes a weighted sum of inputs, adds a bias, and passes through a non-linear activation. Non-linearity is the essential ingredient." },
    { h: "Depth as composition", b: "Stacking layers lets early features combine into increasingly abstract representations. Depth is compositional power, not just extra computation." },
    { h: "Loss and gradients", b: "A loss function turns 'wrong' into a single optimizable number. Gradients describe how each weight should change to reduce it." },
  ];
  return (
    <div className="flex flex-col gap-4 px-5 py-4">
      {concepts.map((c) => (
        <div key={c.h}>
          <h4 className="text-[13px] font-semibold text-ink">{c.h}</h4>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">{c.b}</p>
        </div>
      ))}
    </div>
  );
}

function PreviewFlashcards() {
  const [flipped, setFlipped] = React.useState(false);
  return (
    <div className="flex flex-col items-center gap-4 px-5 py-6">
      <div
        className="w-full max-w-sm h-36 cursor-pointer [perspective:1000px]"
        onClick={() => setFlipped(f => !f)}
      >
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="relative h-full w-full [transform-style:preserve-3d]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface p-5 text-center [backface-visibility:hidden]">
            <span className="text-[10px] uppercase tracking-widest text-ink-faint">Question</span>
            <p className="text-[13px] font-medium text-ink leading-snug">What does a single artificial neuron compute?</p>
            <span className="flex items-center gap-1 text-[10px] text-ink-faint mt-1"><RotateCw className="h-2.5 w-2.5" /> tap to flip</span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-5 text-center [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
            <span className="text-[10px] uppercase tracking-widest text-accent-cyan">Answer</span>
            <p className="text-[13px] text-ink leading-snug">A weighted sum of its inputs plus a bias, passed through a non-linear activation function.</p>
          </div>
        </motion.div>
      </div>
      <p className="text-[11px] text-ink-faint">Card 1 of 8</p>
    </div>
  );
}

function PreviewQuiz() {
  const [selected, setSelected] = React.useState<number | null>(null);
  const correct = 1;
  const opts = [
    "To normalize the input data",
    "To introduce non-linearity into the network",
    "To initialize the weights",
    "To reduce the number of layers",
  ];
  return (
    <div className="flex flex-col gap-3 px-5 py-4">
      <p className="text-[13px] font-medium text-ink">What is the primary role of an activation function?</p>
      <div className="flex flex-col gap-2 mt-1">
        {opts.map((o, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={cn(
              "flex items-center justify-between rounded-lg border px-3.5 py-2.5 text-left text-[12px] transition-all",
              selected === null && "border-line hover:border-line/80 hover:bg-canvas text-ink-muted",
              selected !== null && i === correct && "border-accent-emerald/60 bg-accent-emerald/10 text-ink",
              selected !== null && i === selected && i !== correct && "border-destructive/50 bg-destructive/5 text-ink",
              selected !== null && i !== correct && i !== selected && "border-line text-ink-faint opacity-60",
            )}
          >
            {o}
            {selected !== null && i === correct && <CheckCircle2 className="h-3.5 w-3.5 text-accent-emerald shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function PreviewSlides() {
  return (
    <div className="px-5 py-5">
      <div className="rounded-xl border border-line bg-gradient-to-br from-surface to-canvas p-6 min-h-[11rem] flex flex-col justify-between">
        <div>
          <span className="font-mono text-[10px] text-marker">Chapter 2 — The single neuron</span>
          <h3 className="mt-2 font-display text-[15px] font-semibold tracking-tight text-ink">Inside one artificial neuron</h3>
          <ul className="mt-3 flex flex-col gap-1.5">
            {[
              "Each input is multiplied by a learned weight",
              "Weighted inputs are summed with a bias term",
              "The sum passes through a non-linear activation",
              "Non-linearity gives the network expressive power",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2 text-[12px] text-ink-muted">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-marker" />
                {b}
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-4 text-[11px] text-ink-faint border-t border-line pt-3">
          Key takeaway: A neuron is a weighted sum + bias → activation.
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="font-mono text-[11px] text-ink-faint">02 / 06</span>
        <div className="flex gap-1">
          {[0,1,2,3,4,5].map(i => (
            <span key={i} className={cn("h-1.5 rounded-full transition-all", i === 1 ? "w-4 bg-marker" : "w-1.5 bg-line")} />
          ))}
        </div>
      </div>
    </div>
  );
}

const PREVIEW_CONTENT: Record<TabId, React.ReactNode> = {
  transcript: <PreviewTranscript />,
  notes:      <PreviewNotes />,
  flashcards: <PreviewFlashcards />,
  quiz:       <PreviewQuiz />,
  slides:     <PreviewSlides />,
};

export function FeaturesGrid() {
  const [activeTab, setActiveTab] = React.useState<TabId>("transcript");

  return (
    <>
      {/* Feature cards */}
      <section id="features" className="border-t border-line py-20">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-xl text-center"
          >
            <h2 className="font-display text-[1.85rem] font-[650] tracking-[-0.025em] sm:text-[2.2rem]">
              From footage to fluency
            </h2>
            <p className="mt-3 text-[14px] text-ink-muted">
              Four conversions happen the moment you upload.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                className="group flex flex-col gap-4 bg-canvas p-6"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-surface text-marker transition-colors group-hover:bg-marker/10 group-hover:border-marker/30">
                  <f.icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold tracking-[-0.01em]">{f.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">{f.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Product preview */}
      <section className="border-t border-line py-20 bg-surface/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mx-auto max-w-xl text-center mb-10"
          >
            <h2 className="font-display text-[1.85rem] font-[650] tracking-[-0.025em] sm:text-[2.2rem]">
              See what you get
            </h2>
            <p className="mt-3 text-[14px] text-ink-muted">
              Every output, generated from the same video — interactable, exportable, usable.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl overflow-hidden rounded-xl border border-line bg-surface shadow-lg"
          >
            {/* Tab bar */}
            <div className="flex border-b border-line bg-surface/50 px-1 pt-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-4 py-2.5 text-[12px] font-medium transition-colors rounded-t-lg",
                    activeTab === tab.id ? "text-ink" : "text-ink-faint hover:text-ink-muted"
                  )}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="tab-underline"
                      className="absolute inset-x-1 bottom-0 h-0.5 rounded-full bg-marker"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Preview content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="min-h-[15rem]"
            >
              {PREVIEW_CONTENT[activeTab]}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
