export type BlogContentBlock = { heading?: string; paragraphs: string[] };

// Parses a simple format:
//   ## Heading Text        <- starts a new block with this heading
//   Paragraph one.
//
//   Paragraph two (blank line separates paragraphs within a block).
export function parseBlogContent(raw: string): BlogContentBlock[] {
  const lines = raw.split("\n");
  const blocks: BlogContentBlock[] = [];
  let currentHeading: string | undefined = undefined;
  let currentText: string[] = [];

  function flush() {
    const text = currentText.join("\n").trim();
    if (text) {
      const paragraphs = text
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (paragraphs.length > 0) {
        blocks.push({ heading: currentHeading, paragraphs });
      }
    }
    currentText = [];
  }

  for (const line of lines) {
    if (line.startsWith("## ")) {
      flush();
      currentHeading = line.slice(3).trim();
    } else {
      currentText.push(line);
    }
  }
  flush();

  return blocks;
}
