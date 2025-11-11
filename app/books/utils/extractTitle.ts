export function extractTitle(query: string) {
  const trimmed = query.trim();
  if (!trimmed) return;

  const cleaned = trimmed
    // Remove trailing numbers with optional spaces (e.g., " 1", " 2", " 123")
    .replace(/\s+\d+$/, "")
    // Remove Roman numerals at the end (e.g., " II", " III")
    .replace(/\s+[IVX]+$/i, "")
    // Trim any remaining whitespace
    .trim();

  return cleaned;
}
