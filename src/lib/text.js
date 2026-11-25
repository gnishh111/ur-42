export function splitGraphemes(text) {
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    return Array.from(
      new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text),
      (part) => part.segment,
    )
  }
  return Array.from(text)
}

export function parseHighlightedSegments(line) {
  const parts = line.split(/(\*[^*]+\*)/g)
  return parts.filter(Boolean).map((part) => {
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return { text: part.slice(1, -1), highlight: true }
    }
    return { text: part, highlight: false }
  })
}
