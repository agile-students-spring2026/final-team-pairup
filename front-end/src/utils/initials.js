/** Initials for avatar circles — matches Discover card behavior. */
export function initialsFromDisplayName(name) {
  return String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("");
}
