import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, Link2, FileVideo, ArrowRight, X, Sparkles } from "lucide-react";
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
      navigate({ to: "/processing", search: { url: url.trim() } });
      return;
    }
    if (!file) return;
    setPendingFile(file);
    navigate({ to: "/processing", search: { name: file.name } });
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10 rounded-lg border border-line bg-surface p-1">
          <TabsTrigger value="upload" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-canvas data-[state=active]:shadow-sm">
            <FileVideo className="h-3.5 w-3.5" /> Upload file
          </TabsTrigger>
          <TabsTrigger value="link" className="gap-2 text-[13px] rounded-md data-[state=active]:bg-canvas data-[state=active]:shadow-sm">
            <Link2 className="h-3.5 w-3.5" /> Paste link
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="mt-3">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative flex h-56 cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border-2 border-dashed text-center transition-all",
              isDragging
                ? "border-marker bg-marker/5 scale-[1.01]"
                : "border-line bg-surface/50 hover:border-line/70 hover:bg-surface"
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
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center gap-2.5 px-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-marker/30 bg-marker/10">
                    <FileVideo className="h-5 w-5 text-marker" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="max-w-xs truncate text-[14px] font-semibold">{file.name}</p>
                    <p className="mt-0.5 text-[12px] text-ink-faint">
                      {(file.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="inline-flex items-center gap-1 text-[12px] text-ink-muted hover:text-ink mt-1"
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
                    animate={isDragging ? { y: -4, scale: 1.05 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 22 }}
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface"
                  >
                    <UploadCloud className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
                  </motion.div>
                  <div>
                    <p className="text-[14px] font-medium">
                      Drop a video, or <span className="text-marker">browse</span>
                    </p>
                    <p className="mt-1 text-[12px] text-ink-faint">MP4, MOV, or MP3 · up to 2 GB</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </TabsContent>

        <TabsContent value="link" className="mt-3">
          <div className="flex h-56 flex-col items-center justify-center gap-5 rounded-xl border border-line bg-surface/50 px-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface">
              <Link2 className="h-5 w-5 text-ink-faint" strokeWidth={1.5} />
            </div>
            <div className="w-full">
              <p className="text-[14px] font-medium">Paste a YouTube URL</p>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="mt-3 w-full rounded-lg border border-line bg-canvas px-3.5 py-2.5 text-[13px] outline-none placeholder:text-ink-faint focus:border-marker focus:ring-2 focus:ring-marker/15 transition-all"
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
        className="mt-4 w-full h-11 gap-2 text-[14px] font-semibold"
      >
        <Sparkles className="h-4 w-4" />
        Generate my workspace
        <ArrowRight className="h-4 w-4 ml-auto" />
      </Button>

      <p className="mt-4 text-center text-[12px] text-ink-faint">
        Processing usually takes 1–3 minutes depending on video length.
      </p>
    </div>
  );
}
