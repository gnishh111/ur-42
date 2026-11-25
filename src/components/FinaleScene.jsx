import { useEffect, useMemo } from 'react'
import { RotateCcw, Sparkles, Star } from 'lucide-react'
import { motion } from 'motion/react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../config'
import { sfx } from '../lib/sfx'

export function FinaleScene({ onReplay }) {
  const balloons = useMemo(
    () => [
      { left: '10%', color: '#E8B84B', delay: 0, size: 54 },
      { left: '26%', color: '#C86428', delay: 0.7, size: 46 },
      { left: '72%', color: '#5B8A72', delay: 0.3, size: 52 },
      { left: '86%', color: '#6B9AC4', delay: 1.1, size: 48 },
    ],
    [],
  )

  useEffect(() => {
    sfx.chime()
    const bursts = [0, 650, 1400].map((delay, idx) =>
      setTimeout(() => {
        confetti({
          particleCount: idx === 0 ? 75 : 45,
          angle: idx === 1 ? 60 : idx === 2 ? 120 : 90,
          spread: 70,
          origin: { x: idx === 1 ? 0.15 : idx === 2 ? 0.85 : 0.5, y: 0.62 },
          colors: CONFIG.partyColors,
        })
      }, delay),
    )
    return () => bursts.forEach(clearTimeout)
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden px-6 py-14 text-center text-[#F4EFE6]"
    >
      {/* Floating tactile balloons */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {balloons.map((b, idx) => (
          <motion.div
            key={idx}
            initial={{ y: '105dvh', opacity: 0.85 }}
            animate={{ y: '-25dvh' }}
            transition={{
              duration: 11 + idx * 1.4,
              delay: b.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{ left: b.left }}
            className="absolute flex flex-col items-center"
          >
            <div
              style={{
                width: b.size,
                height: Math.round(b.size * 1.18),
                background: `radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55), ${b.color} 68%)`,
              }}
              className="rounded-full shadow-lg"
            />
            <div className="h-14 w-px bg-white/25" />
          </motion.div>
        ))}
      </div>

      {/* Main Editorial Finale Card */}
      <div className="relative z-10 max-w-xl mx-auto">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#E8B84B]/35 bg-[#E8B84B]/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#E8B84B]">
          <Star className="h-3.5 w-3.5 fill-[#E8B84B]" />
          {CONFIG.finale.eyebrow}
        </span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65 }}
          className="font-display mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-[#FFFBF2] leading-[1.08]"
        >
          {CONFIG.finale.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-5 text-base sm:text-lg text-stone-200 leading-relaxed"
        >
          {CONFIG.finale.wish}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-7 rounded-3xl border border-white/12 bg-white/5 p-6 backdrop-blur-md space-y-2.5"
        >
          {CONFIG.finale.closing.map((line, idx) => (
            <p key={idx} className="font-hand text-2xl sm:text-3xl text-[#E8B84B]">
              {line}
            </p>
          ))}
        </motion.div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              sfx.sparkle()
              confetti({
                particleCount: 70,
                spread: 75,
                origin: { y: 0.65 },
                colors: CONFIG.partyColors,
              })
            }}
            className="inline-flex items-center gap-2 rounded-full bg-[#E8B84B] px-6 py-3 text-sm font-bold text-stone-950 shadow-lg hover:brightness-105 cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            <span>More Confetti ✦</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sfx.tap()
              onReplay?.()
            }}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-[#FFFBF2] hover:bg-white/15 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Replay From Start</span>
          </button>
        </div>
      </div>
    </motion.section>
  )
}
