import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { z } from "zod";
import { SiteNav } from "@/components/shared/site-nav";
import { ProcessingFlow } from "@/components/processing/processing-flow";

const searchSchema = z.object({
  name: z.string().optional(),
  url: z.string().optional(),
});

export const Route = createFileRoute("/processing")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Processing — Lumen" },
      { name: "description", content: "Lumen is preparing your learning workspace." },
    ],
  }),
  component: ProcessingPage,
});

function ProcessingPage() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(560px circle at 50% 30%, hsl(var(--marker) / 0.10), transparent 70%)",
        }}
      />
      <SiteNav />
      <main className="container relative flex flex-1 items-center justify-center py-20">
        <Suspense fallback={null}>
          <ProcessingFlow />
        </Suspense>
      </main>
    </div>
  );
}
