/**
 * api.ts — thin client that talks to the FastAPI backend.
 *
 * Drop this file into src/lib/ in your frontend project.
 *
 * Set the env variable VITE_API_URL in your .env to point at the backend
 * (default: http://localhost:8000).
 */

const BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";

export interface ProcessingStatus {
  workspaceId: string;
  status: "processing" | "done" | "error";
  stage: "uploading" | "transcribing" | "analyzing" | "structuring" | "done";
  error?: string;
}

/** Upload a local video/audio file. Returns the new workspace id. */
export async function uploadVideo(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${BASE}/api/workspaces/upload`, {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.workspaceId as string;
}

/** Submit a YouTube / video URL. Returns the new workspace id.
 *  Pass `transcript` (plain timestamped text) to skip server-side fetching. */
export async function submitUrl(url: string, transcript?: string): Promise<string> {
  const res = await fetch(`${BASE}/api/workspaces/url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url, ...(transcript ? { transcript } : {}) }),
  });
  if (!res.ok) throw new Error(`URL submit failed: ${res.status} ${await res.text()}`);
  const json = await res.json();
  return json.workspaceId as string;
}

/** Poll processing status. */
export async function getStatus(wsId: string): Promise<ProcessingStatus> {
  const res = await fetch(`${BASE}/api/workspaces/${wsId}/status`);
  if (!res.ok) throw new Error(`Status check failed: ${res.status}`);
  return res.json();
}

/** Fetch the completed workspace. Throws if not done yet. */
export async function getWorkspace(wsId: string): Promise<import("./types").VideoWorkspace> {
  const res = await fetch(`${BASE}/api/workspaces/${wsId}`);
  if (!res.ok) throw new Error(`Workspace fetch failed: ${res.status} ${await res.text()}`);
  return res.json();
}

/** Poll until done (or error), calling onStage on each change. */
export async function pollUntilDone(
  wsId: string,
  onStage: (stage: ProcessingStatus["stage"]) => void,
  intervalMs = 2500,
): Promise<import("./types").VideoWorkspace> {
  return new Promise((resolve, reject) => {
    const iv = setInterval(async () => {
      try {
        const status = await getStatus(wsId);
        onStage(status.stage);
        if (status.status === "done") {
          clearInterval(iv);
          const ws = await getWorkspace(wsId);
          resolve(ws);
        } else if (status.status === "error") {
          clearInterval(iv);
          reject(new Error(status.error ?? "Processing failed"));
        }
      } catch (err) {
        clearInterval(iv);
        reject(err);
      }
    }, intervalMs);
  });
}
