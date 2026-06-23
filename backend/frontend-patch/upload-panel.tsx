/**
 * upload-panel.tsx  —  PATCHED VERSION
 *
 * Drop this file into src/components/upload/ replacing the original.
 *
 * Key change: before navigating to /processing, the selected File is handed
 * off via the in-memory pending-file store (see src/lib/pending-file.ts) so
 * that ProcessingFlow can retrieve it and send it to the backend (File
 * objects can't travel through URL query params, and they're too large for
 * sessionStorage/localStorage once base64-encoded).
 */

import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Link2, FileVideo, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { setPendingFile } from "@/lib/pending-file";

export function UploadPanel() {
  const navigate = useNavigate();
  const [isDragging, setDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [url, setUrl] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const canSubmit = Boolean(file) || url.trim().length > 6;

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit() {
    if (!canSubmit) return;

    if (url.trim()) {
      // URL path — no file storage needed
      navigate({ to: "/processing", search: { url: url.trim() } });
      return;
    }

    if (!file) return;

    // Hand the File object off in memory (no size limit, no encoding cost).
    // ProcessingFlow reads it back via takePendingFile() on mount.
    setPendingFile(file);
    navigate({ to: "/processing", search: { name: file.name } });
  }

  return (
    <div className="mx-auto w-full max-w-xl">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="gap-2">
            <FileVideo className="h-3.5 w-3.5" /> Upload a file
          </TabsTrigger>
          <TabsTrigger value="link" className="gap-2">
            <Link2 className="h-3.5 w-3.5" /> Paste a link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative flex h-64 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-lg border border-dashed text-center transition-colors",
              isDragging
                ? "border-marker bg-marker/5"
                : "border-line bg-surface hover:bg-surface/70",
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="video/*,audio/*"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            <AnimatePresence mode="wait">
              {file ? (
                <motion.div
                  key="file"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="flex flex-col items-center gap-2 px-6"
                >
                  <FileVideo
                    className="h-7 w-7 text-marker"
                    strokeWidth={1.5}
                  />
                  <p className="max-w-xs truncate text-sm font-medium">
                    {file.name}
                  </p>
                  <p className="text-xs text-ink-faint">
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                    className="mt-1 inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink"
                  >
                    <X className="h-3 w-3" /> Remove
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 px-6"
                >
                  <motion.div
                    animate={isDragging ? { y: -4 } : { y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <UploadCloud
                      className="h-7 w-7 text-ink-faint"
                      strokeWidth={1.5}
                    />
                  </motion.div>
                  <div>
                    <p className="text-sm font-medium">
                      Drop a video, or{" "}
                      <span className="text-marker">browse</span>
                    </p>
                    <p className="mt-1 text-xs text-ink-faint">
                      MP4, MOV, or MP3 — up to 2GB
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="link">
          <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-lg border border-line bg-surface px-8 text-center">
            <Link2 className="h-7 w-7 text-ink-faint" strokeWidth={1.5} />
            <div className="w-full">
              <p className="text-sm font-medium">Paste a YouTube URL</p>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-3 w-full rounded-md border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none placeholder:text-ink-faint focus:border-marker"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        size="lg"
        variant="marker"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className="mt-6 w-full"
      >
        Generate my workspace
        <ArrowRight className="h-4 w-4" />
      </Button>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Processing usually takes 1–3 minutes depending on video length.
      </p>
    </div>
  );
}
