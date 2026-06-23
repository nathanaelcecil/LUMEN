import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Upload, Cpu, BookOpen } from "lucide-react";

const steps = [
  {
    icon: Upload,
    number: "01",
    title: "Bring a video",
    body: "Upload an MP4 or paste a YouTube link. No account. No waiting room.",
  },
  {
    icon: Cpu,
    number: "02",
    title: "Lumen reads it",
    body: "Transcription, chaptering, and AI analysis run in the background — visibly, with live stage updates.",
  },
  {
    icon: BookOpen,
    number: "03",
    title: "Study, don't scroll",
    body: "Land on a workspace with chapters, notes, flashcards, slides, and a quiz — all ready to use.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  });
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how-it-works" ref={ref} className="border-t border-line py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grain opacity-40" />
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-xl text-center relative"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-[11px] font-mono uppercase tracking-widest text-ink-faint backdrop-blur">
            <span className="h-1 w-1 rounded-full bg-marker" /> The flow
          </div>
          <h2 className="mt-5 font-display text-[2.1rem] font-[600] tracking-[-0.04em] leading-[1.05] sm:text-[2.8rem]">
            How it works
          </h2>
          <p className="mt-4 text-[14.5px] text-ink-muted">
            Three steps, timed roughly the way they actually feel.
          </p>
        </motion.div>

        <div className="mt-20 mx-auto max-w-4xl relative">
          {/* Scroll-scrubbed progress line */}
          <div className="pointer-events-none absolute left-0 right-0 top-[20px] hidden sm:block">
            <div className="relative h-px w-full bg-line">
              <motion.div
                style={{ scaleX: lineScale, transformOrigin: "left" }}
                className="absolute inset-0 h-px"
              >
                <div className="h-full w-full bg-gradient-to-r from-marker via-marker to-transparent" />
              </motion.div>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 sm:gap-6 relative">
            {steps.map((s, i) => (
              <motion.div
                key={s.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-5 relative"
              >
                <div className="flex items-center gap-3 relative">
                  <div className="ember-node flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-canvas text-marker relative z-10">
                    <s.icon className="h-4 w-4" strokeWidth={1.75} />
                  </div>
                  <span className="font-mono text-[11px] font-medium text-ink-faint">{s.number}</span>
                </div>
                <div>
                  <h3 className="font-display text-[16.5px] font-[600] tracking-[-0.02em]">{s.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">{s.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
