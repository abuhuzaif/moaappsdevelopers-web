// Mirrors the "timeago" style used in the Flutter app's listing cards
// (e.g. "2 hours ago", "Yesterday", "3 days ago").
export function timeAgo(createdAt?: { seconds: number; nanoseconds: number } | null): string {
  if (!createdAt) return "";

  const date = new Date(createdAt.seconds * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  // Older than a month — show an actual date (e.g. "12 Jul 2026")
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
