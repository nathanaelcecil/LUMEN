import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { LumenMark } from "@/components/shared/site-nav";

export function ClosingCta() {
  return (
    <section className="border-t border-line py-24 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 dot-grid opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-radial-[at_50%_50%] from-transparent via-canvas/70 to-canvas" />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container relative flex flex-col items-center text-center"
      >
        <h2 className="max-w-md text-balance font-display text-[1.85rem] font-[650] tracking-[-0.025em] sm:text-[2.2rem]">
          Your next video is fifteen minutes long. Your notes don't have to take that long.
        </h2>
        <Button asChild size="lg" className="ember mt-8 h-11 gap-2 px-6 text-[14px] font-semibold rounded-md border-0">
          <Link to="/upload">
            Start with a video
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line py-8">
      <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-2 text-[13px] text-ink-muted">
          <LumenMark />
          <span>Lumen — a calmer way to watch and learn.</span>
        </div>
        <p className="text-[11px] text-ink-faint">Built as a foundation, not a finished product.</p>
      </div>
    </footer>
  );
}
