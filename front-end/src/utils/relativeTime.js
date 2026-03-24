/**
 * @param {number} tsMs - Past instant in ms
 * @param {number} [nowMs] - Reference "now" (for tests)
 */
export function formatRelativeAgo(tsMs, nowMs = Date.now()) {
  const diff = Math.max(0, nowMs - tsMs);
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}
