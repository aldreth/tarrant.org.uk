const decodeText = value =>
  String(value || '')
    .replace(/&amp;/g, '&')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&quot;/g, '"');

/** Plain-text comment body, split into paragraphs. */
export const commentParagraphs = value =>
  decodeText(value)
    .split(/\n\s*\n/)
    .map(paragraph => paragraph.replace(/[ \t]*\n[ \t]*/g, ' ').trim())
    .filter(Boolean);

export {decodeText};
