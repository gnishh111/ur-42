import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'
import { parseHighlightedSegments, splitGraphemes } from '../lib/text'
import { sfx } from '../lib/sfx'

export function TypeLines({ onComplete }) {
  const lines = CONFIG.intro.lines
  const [lineIdx, setLineIdx] = useState(0)
  const [charCount, setCharCount] = useState(0)

  const parsedLines = useMemo(
    () =>
      lines.map((raw) => {
        const segments = parseHighlightedSegments(raw)
        const graphemes = []
        segments.forEach((seg) => {
          splitGraphemes(seg.text).forEach((ch) => {
            graphemes.push({ ch, highlight: seg.highlight })
          })
        })
        return graphemes
      }),
    [lines],
  )

  useEffect(() => {
    const current = parsedLines[lineIdx]
    if (!current) return

    if (charCount < current.length) {
      const t = setTimeout(() => {
        setCharCount((c) => c + 1)
        sfx.type()
      }, CONFIG.intro.speed)
      return () => clearTimeout(t)
    }

    const isLast = lineIdx >= parsedLines.length - 1
    const t = setTimeout(() => {
      if (isLast) {
        onComplete?.()
      } else {
        setLineIdx((i) => i + 1)
        setCharCount(0)
      }
    }, isLast ? CONFIG.intro.tail : CONFIG.intro.gap)

    return () => clearTimeout(t)
  }, [lineIdx, charCount, parsedLines, onComplete])

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="w-full max-w-2xl space-y-6">
        {parsedLines.slice(0, lineIdx + 1).map((graphemes, idx) => {
          const isCurrent = idx === lineIdx
          const visible = isCurrent ? graphemes.slice(0, charCount) : graphemes
          return (
            <p
              key={idx}
              className={`font-display text-xl sm:text-3xl leading-snug transition-all duration-500 ${
                isCurrent
                  ? 'text-stone-900 scale-[1.01]'
                  : 'text-stone-500/80 scale-[0.98]'
              }`}
            >
              {visible.map((g, gi) =>
                g.highlight ? (
                  <span
                    key={gi}
                    className="font-semibold italic text-[#C86428] underline decoration-[#E8B84B]/70 decoration-2 underline-offset-4"
                  >
                    {g.ch}
                  </span>
                ) : (
                  <span key={gi}>{g.ch}</span>
                ),
              )}
              {isCurrent && <span className="type-cursor" />}
            </p>
          )
        })}
      </div>
    </motion.section>
  )
}
