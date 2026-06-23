import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/shared/site-nav";
import { UploadPanel } from "@/components/upload/upload-panel";
import { motion } from "framer-motion";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — Lumen" },
      { name: "description", content: "Upload a video file or paste a YouTube link to generate your Lumen learning workspace." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <div className="pointer-events-none fixed inset-0 dot-grid opacity-20" />
      <SiteNav />
      <main className="container relative flex flex-1 flex-col items-center justify-center py-16">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-9 text-center"
        >
          <h1 className="font-display text-[2rem] font-[650] tracking-[-0.025em] sm:text-[2.4rem]">
            Bring a video
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[14px] text-ink-muted">
            Upload a file or paste a YouTube link. Lumen does the rest.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <UploadPanel />
        </motion.div>
      </main>
    </div>
  );
}
