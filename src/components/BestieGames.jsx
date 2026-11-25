import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Sparkles, Trophy, ArrowRight, Flame } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'
import { sfx } from '../lib/sfx'

export function BestieGames({ onComplete }) {
  const { quiz, popper } = CONFIG.games
  const [round, setRound] = useState('quiz') // 'quiz' | 'popper' | 'unlocked'
  const [qIdx, setQIdx] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [score, setScore] = useState(0)

  // Game 2: Floating tokens state
  const [popped, setPopped] = useState(0)
  const [bubbles, setBubbles] = useState([])
  const nextIdRef = useRef(1)

  const currentQuestion = quiz.rounds[qIdx]

  const handleOptionClick = (opt, idx) => {
    if (selectedOpt !== null) return
    setSelectedOpt(idx)
    if (opt.ok) {
      setScore((s) => s + 1)
      sfx.chime()
    } else {
      sfx.stamp()
    }
  }

  const handleNextQuestion = () => {
    sfx.tap()
    setSelectedOpt(null)
    if (qIdx + 1 < quiz.rounds.length) {
      setQIdx((i) => i + 1)
    } else {
      setRound('popper')
    }
  }

  // Spawn floating tokens during Round 2
  useEffect(() => {
    if (round !== 'popper') return

    const spawn = () => {
      const id = nextIdRef.current++
      const symbol = popper.tokens[id % popper.tokens.length]
      const left = 12 + Math.random() * 76
      const duration = 3.6 + Math.random() * 1.8
      setBubbles((prev) => [...prev.slice(-11), { id, symbol, left, duration }])
    }

    spawn()
    const interval = setInterval(spawn, 620)
    return () => clearInterval(interval)
  }, [round, popper.tokens])

  const handlePopBubble = (id) => {
    sfx.pop()
    setBubbles((prev) => prev.filter((b) => b.id !== id))
    setPopped((prev) => {
      const next = prev + 1
      if (next >= popper.targetCount && round === 'popper') {
        sfx.sparkle()
        confetti({
          particleCount: 55,
          spread: 65,
          origin: { y: 0.65 },
          colors: CONFIG.partyColors,
        })
        setTimeout(() => setRound('unlocked'), 350)
      }
      return next
    })
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.5 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-5 py-14"
    >
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-900/15 bg-white/80 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C86428]">
            <Flame className="h-3.5 w-3.5" />
            {CONFIG.games.badge}
          </span>
          <h2 className="font-display mt-3 text-2xl sm:text-4xl font-semibold text-stone-900">
            {CONFIG.games.title}
          </h2>
          <p className="mt-1.5 text-sm text-stone-600">{CONFIG.games.subtitle}</p>
        </div>

        <AnimatePresence mode="wait">
          {round === 'quiz' && currentQuestion && (
            <motion.div
              key={`q-${qIdx}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -18 }}
              className="rounded-3xl border border-stone-900/12 bg-[#FAF7F2] p-6 sm:p-8 shadow-xl shadow-stone-900/5"
            >
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-stone-500">
                <span>{quiz.title}</span>
                <span>
                  Question {qIdx + 1} / {quiz.rounds.length}
                </span>
              </div>

              <h3 className="font-display mt-4 text-lg sm:text-2xl font-medium text-stone-900 leading-snug">
                {currentQuestion.prompt}
              </h3>

              <div className="mt-5 space-y-3">
                {currentQuestion.options.map((opt, idx) => {
                  const isChosen = selectedOpt === idx
                  let cardStyle =
                    'border-stone-900/12 bg-white hover:border-[#C86428] hover:bg-amber-50/40'
                  if (selectedOpt !== null) {
                    if (isChosen && opt.ok) {
                      cardStyle = 'border-[#4A705C] bg-[#4A705C]/10 text-stone-900'
                    } else if (isChosen && !opt.ok) {
                      cardStyle = 'border-[#C86428] bg-[#C86428]/10 text-stone-900'
                    } else {
                      cardStyle = 'border-stone-900/10 bg-white/50 opacity-65'
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionClick(opt, idx)}
                      className={`w-full rounded-2xl border p-4 text-left text-sm sm:text-base font-medium transition-all cursor-pointer ${cardStyle}`}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>

              {selectedOpt !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-stone-900 px-4 py-3.5 text-[#F4EFE6]"
                >
                  <p className="text-xs sm:text-sm font-medium">
                    {currentQuestion.options[selectedOpt].verdict}
                  </p>
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#E8B84B] px-4 py-2 text-xs font-bold text-stone-950 shrink-0 cursor-pointer hover:brightness-105"
                  >
                    <span>{qIdx + 1 < quiz.rounds.length ? 'Next' : 'Round 02'}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {round === 'popper' && (
            <motion.div
              key="popper"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="rounded-3xl border border-stone-900/12 bg-[#FAF7F2] p-6 sm:p-7 shadow-xl shadow-stone-900/5"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg sm:text-xl font-semibold text-stone-900">
                    {popper.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600 mt-0.5">
                    {popper.instruction}
                  </p>
                </div>
                <div className="rounded-2xl bg-stone-900 px-3.5 py-2 text-center text-[#F4EFE6] shrink-0">
                  <span className="text-base font-bold tabular-nums text-[#E8B84B]">
                    {Math.min(popped, popper.targetCount)}
                  </span>
                  <span className="text-xs text-stone-400">/{popper.targetCount}</span>
                </div>
              </div>

              {/* Interactive arena */}
              <div className="relative mt-5 h-64 sm:h-72 w-full overflow-hidden rounded-2xl border border-stone-900/10 bg-gradient-to-b from-[#F4EFE6] to-[#EAE1D0]">
                {bubbles.map((b) => (
                  <motion.button
                    key={b.id}
                    type="button"
                    initial={{ y: 290, opacity: 0, scale: 0.7 }}
                    animate={{ y: -60, opacity: 1, scale: 1 }}
                    transition={{ duration: b.duration, ease: 'linear' }}
                    onAnimationComplete={() =>
                      setBubbles((prev) => prev.filter((item) => item.id !== b.id))
                    }
                    onClick={() => handlePopBubble(b.id)}
                    style={{ left: `${b.left}%` }}
                    className="absolute -translate-x-1/2 flex h-13 w-13 items-center justify-center rounded-full border border-stone-900/15 bg-white/95 text-xl shadow-md hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                    aria-label="Pop token"
                  >
                    {b.symbol}
                  </motion.button>
                ))}

                <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-[11px] font-medium text-stone-500">
                  Tap floating stars & chai cups to charge the wax seal!
                </div>
              </div>
            </motion.div>
          )}

          {round === 'unlocked' && (
            <motion.div
              key="unlocked"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-[#4A705C]/30 bg-[#FAF7F2] p-7 sm:p-9 text-center shadow-xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A705C]/15 text-[#4A705C]">
                <Trophy className="h-7 w-7" />
              </div>
              <h3 className="font-display mt-4 text-2xl sm:text-3xl font-semibold text-stone-900">
                Bestie Status: 100% Certified ✦
              </h3>
              <p className="mt-2 text-sm text-stone-600">
                Quiz Score {score}/{quiz.rounds.length} + All {popper.targetCount} seal tokens collected! Ab tera sealed mail unlock ho gaya hai.
              </p>

              <button
                type="button"
                onClick={() => {
                  sfx.paperRustle()
                  onComplete?.()
                }}
                className="mt-6 inline-flex items-center gap-2.5 rounded-full bg-stone-900 px-7 py-3.5 text-sm sm:text-base font-semibold text-[#F4EFE6] shadow-lg hover:bg-[#C86428] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4 text-[#E8B84B]" />
                <span>Open Sealed Mail</span>
                <Sparkles className="h-4 w-4 text-[#E8B84B]" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
