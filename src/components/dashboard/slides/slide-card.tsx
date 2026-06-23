import * as React from "react";
import { Quote } from "lucide-react";
import type { Slide } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

/**
 * Fetches an image from Wikipedia Commons via their open API.
 * No API key needed. Great for educational/diagram content.
 */
async function fetchWikiImage(query: string): Promise<string | null> {
  try {
    // Step 1: search Wikipedia for pages matching the query
    const searchUrl =
      `https://en.wikipedia.org/w/api.php?action=query&list=search` +
      `&srsearch=${encodeURIComponent(query)}&srlimit=3&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    const pages: { pageid: number; title: string }[] =
      searchData?.query?.search ?? [];

    if (pages.length === 0) return null;

    // Step 2: get page images for the top result
    const pageIds = pages
      .slice(0, 3)
      .map((p) => p.pageid)
      .join("|");
    const imgUrl =
      `https://en.wikipedia.org/w/api.php?action=query&pageids=${pageIds}` +
      `&prop=pageimages&pithumbsize=600&format=json&origin=*`;
    const imgRes = await fetch(imgUrl);
    const imgData = await imgRes.json();
    const pagesObj = imgData?.query?.pages ?? {};

    for (const page of Object.values(pagesObj) as any[]) {
      if (page?.thumbnail?.source) return page.thumbnail.source;
    }
    return null;
  } catch {
    return null;
  }
}

function SlideImage({ query }: { query: string }) {
  const [src, setSrc] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ok" | "error">("loading");

  React.useEffect(() => {
    if (!query) { setStatus("error"); return; }
    setStatus("loading");
    setSrc(null);

    fetchWikiImage(query).then((found) => {
      if (found) {
        setSrc(found);
        setStatus("ok");
      } else {
        setStatus("error");
      }
    });
  }, [query]);

  if (status === "loading") {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4">
        <div className="h-10 w-10 rounded-full border-2 border-line border-t-marker animate-spin" />
        <p className="text-[11px] text-ink-faint text-center leading-snug">{query}</p>
      </div>
    );
  }

  if (status === "error" || !src) {
    // Beautiful illustrated fallback — styled card matching the slide aesthetic
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl border border-marker/30 bg-marker/[0.08]">
          <IllustrationGlyph />
        </div>
        <p className="text-[11px] leading-snug text-ink-faint max-w-[140px]">{query}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={query}
      onError={() => setStatus("error")}
      className="h-full w-full object-cover"
    />
  );
}

function IllustrationGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-marker">
      <rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="8.5" cy="9.5" r="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 15l5-4 4 3 5-5 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SlideCard({
  slide,
  presentation = false,
}: {
  slide: Slide;
  presentation?: boolean;
}) {
  return (
    <div
      className={
        presentation
          ? "flex h-full w-full flex-col justify-center gap-10 px-6 py-10 sm:px-16 lg:flex-row lg:items-center lg:gap-16 lg:px-24"
          : "flex h-full flex-col gap-8 p-6 sm:p-10 lg:flex-row lg:items-center lg:gap-10"
      }
    >
      {/* Left — text content */}
      <div className="flex-1">
        <Badge variant="marker" className="mb-4 w-max">
          {slide.chapterLabel}
        </Badge>

        <h2
          className={
            presentation
              ? "text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-5xl"
              : "text-balance font-display text-2xl font-medium leading-tight tracking-tight sm:text-3xl"
          }
        >
          {slide.title}
        </h2>

        <ul className="mt-7 flex flex-col gap-3">
          {slide.bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-base"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-marker" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        {slide.quote && (
          <div className="mt-7 flex gap-3 rounded-md border border-line bg-surface px-4 py-3.5">
            <Quote className="h-4 w-4 shrink-0 text-marker" strokeWidth={1.75} />
            <p className="font-display text-sm italic leading-relaxed text-ink-muted sm:text-base">
              {slide.quote}
            </p>
          </div>
        )}

        <div className="mt-7 rounded-md border border-marker/30 bg-marker/[0.06] px-4 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-marker">
            Key takeaway
          </p>
          <p className="mt-1 text-sm leading-relaxed text-ink sm:text-base">
            {slide.keyTakeaway}
          </p>
        </div>
      </div>

      {/* Right — illustration from Wikipedia */}
      <div
        className={
          presentation
            ? "flex aspect-square w-full max-w-xs shrink-0 overflow-hidden rounded-xl border border-line bg-surface/60 lg:max-w-sm"
            : "flex aspect-video w-full shrink-0 overflow-hidden rounded-lg border border-line bg-surface/60 lg:aspect-square lg:max-w-[14rem]"
        }
      >
        <SlideImage query={slide.imageQuery} />
      </div>
    </div>
  );
}
