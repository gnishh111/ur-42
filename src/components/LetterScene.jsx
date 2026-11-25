import { useEffect, useMemo, useState } from 'react'
import { MailOpen, Sparkles, ArrowRight, Quote } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'
import { splitGraphemes } from '../lib/text'
import { sfx } from '../lib/sfx'

export function LetterScene({ onComplete }) {
  const [stage, setStage] = useState('sealed') // 'sealed' | 'reading' | 'bestLine'
  const [typedChars, setTypedChars] = useState(0)

  const { greeting, paragraphs, bestLine, bestLineTag, signOff, typeSpeed } = CONFIG.letter

  const fullText = useMemo(() => paragraphs.join('\n\n'), [paragraphs])
  const graphemes = useMemo(() => splitGraphemes(fullText), [fullText])

  const handleOpenEnvelope = () => {
    if (stage !== 'sealed') return
    sfx.stamp()
    setTimeout(() => sfx.paperRustle(), 160)
    setStage('reading')
  }

  useEffect(() => {
    if (stage !== 'reading') return
    if (typedChars < graphemes.length) {
      const t = setTimeout(() => {
        setTypedChars((c) => Math.min(graphemes.length, c + 2))
        sfx.type()
      }, typeSpeed)
      return () => clearTimeout(t)
    }
  }, [stage, typedChars, graphemes.length, typeSpeed])

  const isTypingDone = typedChars >= graphemes.length
  const visibleBody = graphemes.slice(0, typedChars).join('')

  const handleExtractBestLine = () => {
    sfx.sparkle()
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#E8B84B', '#C86428', '#4A705C'],
    })
    setStage('bestLine')
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 py-14"
    >
      <AnimatePresence mode="wait">
        {stage === 'sealed' && (
          <motion.div
            key="envelope"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04, y: -20 }}
            transition={{ duration: 0.45 }}
            className="w-full max-w-md flex flex-col items-center text-center"
          >
            <span className="text-[11px] font-semibold tracking-[0.24em] uppercase text-stone-500">
              {CONFIG.letter.envelopeLabel}
            </span>

            {/* Tactile Envelope Card with Star Wax Seal */}
            <button
              type="button"
              onClick={handleOpenEnvelope}
              className="group relative mt-6 w-full aspect-[16/11] rounded-3xl border border-stone-900/15 bg-[#EFE6D5] shadow-[0_26px_60px_-16px_rgba(28,25,23,0.28)] overflow-hidden transition-transform duration-300 hover:-translate-y-1 cursor-pointer"
            >
              {/* Envelope flap geometric fold */}
              <div
                className="absolute inset-x-0 top-0 h-[56%] bg-[#E5D9C3] border-b border-stone-900/10 transition-transform duration-500 origin-top group-hover:scale-y-95"
                style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
              />
              {/* Bottom pocket fold */}
              <div
                className="absolute inset-x-0 bottom-0 h-[58%] bg-[#F6EFE2]"
                style={{ clipPath: 'polygon(0 100%, 50% 18%, 100% 100%)' }}
              />

              {/* Star Wax Seal (Zero Hearts) */}
              <div className="relative z-10 flex h-full flex-col items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#B94E1E] text-[#FBE7B2] shadow-lg ring-4 ring-[#B94E1E]/25 transition-transform duration-300 group-hover:scale-110">
                  <span className="text-2xl leading-none">✦</span>
                </div>
                <span className="font-hand mt-3 text-xl text-stone-800">
                  For {CONFIG.friendName}
                </span>
              </div>
            </button>

            <p className="mt-4 inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-stone-600">
              <MailOpen className="h-4 w-4 text-[#C86428]" />
              <span>{CONFIG.letter.sealHint}</span>
            </p>
          </motion.div>
        )}

        {stage === 'reading' && (
          <motion.div
            key="letter-paper"
            initial={{ opacity: 0, y: 36 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-2xl rounded-3xl border border-stone-900/15 lined-paper p-6 sm:p-10 pl-12 sm:pl-14 shadow-[0_28px_70px_-18px_rgba(28,25,23,0.25)]"
          >
            <div className="flex items-center justify-between border-b border-stone-900/10 pb-3">
              <span className="font-hand text-2xl sm:text-3xl font-bold text-[#C86428]">
                {greeting}
              </span>
              {!isTypingDone && (
                <button
                  type="button"
                  onClick={() => setTypedChars(graphemes.length)}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  Read full →
                </button>
              )}
            </div>

            <div className="mt-4 whitespace-pre-line text-sm sm:text-base text-stone-800 leading-[2rem]">
              {visibleBody}
              {!isTypingDone && <span className="type-cursor" />}
            </div>

            {isTypingDone && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-4 border-t border-stone-900/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <p className="font-hand text-2xl text-stone-700">— {signOff}</p>

                <button
                  type="button"
                  onClick={handleExtractBestLine}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-xs sm:text-sm font-semibold text-[#F4EFE6] shadow-md hover:bg-[#C86428] transition-colors cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#E8B84B]" />
                  <span>Mail me se Best Line nikalo</span>
                </button>
              </motion.div>
            )}
          </motion.div>
        )}

        {stage === 'bestLine' && (
          <motion.div
            key="best-line-card"
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl rounded-3xl border-2 border-[#E8B84B] bg-[#1C1917] p-7 sm:p-10 text-[#F4EFE6] shadow-[0_32px_80px_-15px_rgba(28,25,23,0.45)] text-center relative overflow-hidden"
          >
            <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-80 rounded-full bg-[#E8B84B]/18 blur-2xl" />

            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8B84B]/35 bg-[#E8B84B]/10 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8B84B]">
              <Quote className="h-3.5 w-3.5" />
              {bestLineTag}
            </span>

            <blockquote className="font-display italic mt-6 text-xl sm:text-3xl leading-relaxed text-[#FFFBF2]">
              {bestLine}
            </blockquote>

            <p className="font-hand mt-5 text-xl text-[#E8B84B]">
              — Saved permanently in {CONFIG.friendName}’s Birthday Archive
            </p>

            <button
              type="button"
              onClick={() => {
                sfx.tap()
                onComplete?.()
              }}
              className="mt-8 inline-flex items-center gap-2.5 rounded-full bg-[#E8B84B] px-8 py-3.5 text-sm sm:text-base font-bold text-stone-950 shadow-lg hover:brightness-105 transition-all cursor-pointer"
            >
              <span>Chalo Ab Cake Kaatein</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  )
}
