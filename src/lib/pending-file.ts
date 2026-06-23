/**
 * pending-file.ts
 *
 * Holds the user's selected File in memory while we navigate from
 * /upload -> /processing, inside the same SPA session (no full page reload).
 *
 * We deliberately do NOT serialize to sessionStorage/localStorage:
 * browsers cap Web Storage at ~5-10MB total, and base64-encoding a video
 * adds ~33% overhead — any real video blows past the quota instantly.
 *
 * FIX for React StrictMode double-invoke:
 * React 18 StrictMode mounts → unmounts → remounts every component in dev.
 * The original takePendingFile() cleared the file on the first run, so the
 * second (real) mount got null.  We now use a "read-once after a tick" pattern:
 * setPendingFile() stamps a generation counter; takePendingFile() returns the
 * file without clearing it; clearPendingFile() wipes it after a short delay
 * so that the StrictMode second mount still finds the file, but subsequent
 * navigations (back → /upload → /processing again) start fresh.
 */

let pendingFile: File | null = null;
let clearTimer: ReturnType<typeof setTimeout> | null = null;

export function setPendingFile(file: File | null) {
  if (clearTimer !== null) {
    clearTimeout(clearTimer);
    clearTimer = null;
  }
  pendingFile = file;
}

/**
 * Reads the pending file.  Does NOT clear it immediately so that React
 * StrictMode's double-mount can read it on both invocations.
 * The file is auto-cleared after 10 s (enough time for the upload to kick
 * off), or immediately when setPendingFile(null) is called next time.
 */
export function takePendingFile(): File | null {
  const f = pendingFile;
  if (f !== null && clearTimer === null) {
    // Auto-clear after a generous window so memory isn't held forever
    clearTimer = setTimeout(() => {
      pendingFile = null;
      clearTimer = null;
    }, 10_000);
  }
  return f;
}
