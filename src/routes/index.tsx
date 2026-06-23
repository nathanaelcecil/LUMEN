import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/shared/site-nav";
import { Hero } from "@/components/landing/hero";
import { ScrollShowcase } from "@/components/landing/scroll-showcase";
import { BentoGrid } from "@/components/landing/bento-grid";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ClosingCta, SiteFooter } from "@/components/landing/closing-cta";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Lumen — Turn any video into a learning workspace" },
      {
        name: "description",
        content:
          "Drop in a video or paste a YouTube link. Lumen produces chapters, slides, study notes, flashcards and quizzes you can actually study from.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-canvas">
      <SiteNav />
      <main>
        <Hero />
        <ScrollShowcase />
        <BentoGrid />
        <HowItWorks />
        <FeaturesGrid />
        <ClosingCta />
      </main>
      <SiteFooter />
    </div>
  );
}
