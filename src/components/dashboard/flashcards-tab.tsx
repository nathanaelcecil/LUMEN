import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, RotateCw, Layers } from "lucide-react";
import type { VideoWorkspace } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/dashboard/empty-state";

export function FlashcardsTab({ workspace }: { workspace: VideoWorkspace }) {
  const cards = workspace.flashcards;
  const [index, setIndex] = React.useState(0);
  const [flipped, setFlipped] = React.useState(false);

  if (cards.length === 0) {
    return (
      <EmptyState
        icon={Layers}
        accent="cyan"
        title="No flashcards yet"
        description="Lumen will turn the key claims of your video into spaced-repetition-ready flashcards."
      />
    );
  }

  const card = cards[Math.min(index, cards.length - 1)];

  function go(dir: 1 | -1) {
    setFlipped(false);
    setIndex((i) => (i + dir + cards.length) % cards.length);
  }

  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex items-center gap-2 text-xs text-ink-faint">
        Card {index + 1} of {cards.length}
      </div>

      <div className="h-2 w-40 overflow-hidden rounded-full bg-surface">
        <motion.div
          className="h-full bg-accent-cyan"
          animate={{ width: `${((index + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="relative mt-8 h-64 w-full max-w-md [perspective:1200px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 cursor-pointer"
            onClick={() => setFlipped((f) => !f)}
          >
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full [transform-style:preserve-3d]"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-line bg-surface p-8 text-center shadow-sm [backface-visibility:hidden]">
                <span className="text-xs uppercase tracking-wide text-ink-faint">Question</span>
                <p className="font-display text-lg leading-snug">{card.front}</p>
                <span className="absolute bottom-4 flex items-center gap-1.5 text-xs text-ink-faint">
                  <RotateCw className="h-3 w-3" /> Tap to flip
                </span>
              </div>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl border border-accent-cyan/30 bg-accent-cyan/[0.06] p-8 text-center shadow-sm [backface-visibility:hidden]"
                style={{ transform: "rotateY(180deg)" }}
              >
                <span className="text-xs uppercase tracking-wide text-accent-cyan">Answer</span>
                <p className="text-base leading-relaxed text-ink">{card.back}</p>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => go(-1)} aria-label="Previous card">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" onClick={() => setFlipped((f) => !f)} className="w-28">
          Flip
        </Button>
        <Button variant="outline" size="icon" onClick={() => go(1)} aria-label="Next card">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
