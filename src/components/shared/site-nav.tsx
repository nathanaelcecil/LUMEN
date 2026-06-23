import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/60 bg-canvas/85 backdrop-blur-xl">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <LumenMark className="transition-transform duration-300 group-hover:scale-[1.06]" />
          <span className="font-display text-[15px] font-semibold tracking-[-0.02em]">LUMEN</span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-ink-muted md:flex">
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="transition-colors hover:text-ink"
          >
            How it works
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="transition-colors hover:text-ink"
          >
            Features
          </button>
          <Link to="/dashboard" className="transition-colors hover:text-ink">Example</Link>
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button asChild size="sm" className="ember ml-1.5 hidden sm:inline-flex h-8 text-[13px] font-semibold px-3.5 rounded-md border-0">
            <Link to="/upload">Try Lumen</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Lumen mark — the eclipse ring logo from the original design.
 * A glowing orange/crimson ring (total solar eclipse shape) on dark background.
 */
export function LumenMark({
  className = "",
  size = 28,
}: {
  className?: string;
  size?: number;
}) {
  const id = "lumen-eclipse";
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Outer ambient glow */}
      <span
        className="pointer-events-none absolute inset-[-30%] rounded-full"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, hsl(var(--marker-glow, var(--marker)) / 0.4), transparent 70%)",
          filter: "blur(6px)",
        }}
      />
      <svg
        width={size}
        height={size}
        viewBox="0 0 28 28"
        fill="none"
        className="relative"
      >
        <defs>
          {/* The glowing ring gradient — orange-to-red like an eclipse corona */}
          <radialGradient id={`${id}-ring`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF8C42" stopOpacity="0" />
            <stop offset="60%" stopColor="#FF6B1A" stopOpacity="0.6" />
            <stop offset="80%" stopColor="#E84B1A" stopOpacity="1" />
            <stop offset="100%" stopColor="#B83010" stopOpacity="0.8" />
          </radialGradient>
          {/* Glow filter for the ring */}
          <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FF8040" />
            <stop offset="40%" stopColor="#E85020" />
            <stop offset="100%" stopColor="#A02010" />
          </linearGradient>
        </defs>

        {/* Dark disc (the moon / occulting body) */}
        <circle cx="14" cy="14" r="13" fill="hsl(240 6% 6%)" />

        {/* Eclipse glow halo — soft outer corona */}
        <circle
          cx="14"
          cy="14"
          r="10"
          fill="none"
          stroke="url(#lumen-eclipse-ring)"
          strokeWidth="3.5"
          opacity="0.35"
          filter={`url(#${id}-glow)`}
        />

        {/* Main eclipse ring — the crisp glowing edge */}
        <circle
          cx="14"
          cy="14"
          r="8.5"
          fill="none"
          stroke="url(#lumen-eclipse-stroke)"
          strokeWidth="2"
          filter={`url(#${id}-glow)`}
        />

        {/* Inner dark core */}
        <circle cx="14" cy="14" r="7" fill="hsl(240 6% 4%)" />

        {/* Tiny bright corona flares at top */}
        <circle cx="14" cy="5.8" r="0.7" fill="#FFB060" opacity="0.9" />
        <circle cx="11" cy="6.5" r="0.4" fill="#FF8040" opacity="0.7" />
        <circle cx="17" cy="6.5" r="0.4" fill="#FF8040" opacity="0.7" />
      </svg>
    </span>
  );
}
