import { motion } from "framer-motion";

const markers = [
  { t: "0:00",  pct: 2,  label: "Why neural networks" },
  { t: "2:14",  pct: 18, label: "The single neuron" },
  { t: "5:40",  pct: 38, label: "Stacking layers" },
  { t: "9:05",  pct: 58, label: "Measuring error" },
  { t: "12:30", pct: 76, label: "Backpropagation" },
  { t: "16:02", pct: 94, label: "Gradient descent" },
];

export function HeroTimeline() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-4xl select-none">
      {/* Chapter cards */}
      <div className="relative hidden h-28 sm:block">
        {markers.map((m, i) => (
          <motion.div
            key={m.t}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ left: `${m.pct}%` }}
            className="absolute bottom-0 -translate-x-1/2"
          >
            <div className={`flex w-max max-w-[9rem] flex-col gap-1 rounded-lg border border-line bg-surface/90 px-3 py-2.5 text-left shadow-sm backdrop-blur ${i % 2 === 0 ? "" : "translate-y-3"}`}>
              <span className="font-mono text-[10px] font-medium text-marker">{m.t}</span>
              <span className="text-[11px] leading-tight text-ink-muted">{m.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Track */}
      <div className="relative mt-6 h-px w-full bg-line">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ transformOrigin: "left" }}
          className="absolute inset-y-0 left-0 h-px w-full bg-gradient-to-r from-marker/80 to-marker/40"
        />

        {markers.map((m) => (
          <div
            key={m.t}
            style={{ left: `${m.pct}%` }}
            className="absolute top-1/2 h-2.5 w-px -translate-x-1/2 -translate-y-1/2 bg-line"
          />
        ))}

        {/* Animated playhead */}
        <motion.div
          className="absolute top-1/2 -translate-y-1/2"
          animate={{ left: ["2%", "94%"] }}
          transition={{ duration: 10, ease: "linear", repeat: Infinity, repeatType: "loop" }}
        >
          <div className="h-3 w-3 rounded-full bg-marker" style={{ boxShadow: "0 0 0 3px hsl(var(--marker) / 0.20), 0 0 10px 2px hsl(var(--marker) / 0.30)" }} />
        </motion.div>
      </div>

      <div className="mt-2 flex justify-between font-mono text-[11px] text-ink-faint">
        <span>0:00</span>
        <span>18:42</span>
      </div>
    </div>
  );
}
