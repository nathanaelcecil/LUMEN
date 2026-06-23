import * as React from "react";
import type { VideoWorkspace } from "@/lib/types";
import { emptyWorkspace, demoWorkspace } from "@/lib/types";

const STORAGE_KEY = "lumen.workspace.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

let cachedRaw: string | null = null;
let cachedValue: VideoWorkspace | null = null;

function readStorage(): VideoWorkspace | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === cachedRaw) return cachedValue;
    cachedRaw = raw;
    cachedValue = raw ? (JSON.parse(raw) as VideoWorkspace) : null;
    return cachedValue;
  } catch {
    return null;
  }
}

function writeStorage(ws: VideoWorkspace | null) {
  if (typeof window === "undefined") return;
  try {
    if (ws) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ws));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function getWorkspace(): VideoWorkspace | null {
  return readStorage();
}

export function setWorkspace(ws: VideoWorkspace | null) {
  writeStorage(ws);
}

export function clearWorkspace() {
  writeStorage(null);
}

export function loadDemoWorkspace() {
  writeStorage(demoWorkspace);
}

/**
 * Create a skeleton workspace from an uploaded source.
 * Backend integration: replace this with the real AI pipeline response.
 */
export function initializeWorkspaceFromSource(input: { name?: string; url?: string }) {
  const title =
    input.name?.replace(/\.[a-z0-9]+$/i, "") ||
    (input.url ? "Video from link" : "Untitled video");
  const ws: VideoWorkspace = {
    ...emptyWorkspace,
    id: `ws_${Date.now()}`,
    title,
    source: input.url || input.name || "Uploaded video",
    createdAt: new Date().toISOString(),
  };
  writeStorage(ws);
}

export function useWorkspace(): VideoWorkspace | null {
  const subscribe = React.useCallback((cb: Listener) => {
    listeners.add(cb);
    return () => {
      listeners.delete(cb);
    };
  }, []);
  const getSnapshot = React.useCallback(() => readStorage(), []);
  const getServerSnapshot = React.useCallback(() => null, []);
  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
