import { Headphones, Sparkles, ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'

export function StartGate({ ready, onStart }) {
  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 py-12 text-center"
    >
      {/* Corner registration marks like an artist sketchbook */}
      <div className="pointer-events-none absolute inset-5 sm:inset-8 border border-stone-900/10 rounded-3xl" />

      <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-stone-900/15 bg-white/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-600 shadow-xs backdrop-blur-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#C86428]" />
          {CONFIG.editionTag}
        </span>

        <h1 className="font-display mt-6 text-4xl sm:text-6xl font-semibold tracking-tight text-stone-900 leading-[1.08]">
          Ek chota sa surprise,{' '}
          <span className="italic font-normal text-[#C86428]">{CONFIG.friendName}</span> ke liye.
        </h1>

        <p className="mt-4 max-w-md text-sm sm:text-base text-stone-600 leading-relaxed">
          Pehle ek live pencil sketch draw hogi real voiceover ke saath — uske baad games, ek sealed mail aur cake ceremony.
        </p>

        <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-stone-900/10 bg-[#FAF7F2]/90 px-4 py-2.5 text-xs sm:text-sm text-stone-700 shadow-xs">
          <Headphones className="h-4 w-4 text-[#C86428] shrink-0" />
          <span>Best experience ke liye volume on ya earphones laga lo</span>
        </div>

        <button
          type="button"
          disabled={!ready}
          onClick={onStart}
          className="group mt-8 inline-flex items-center gap-3 rounded-full bg-stone-900 px-8 py-4 text-sm sm:text-base font-semibold text-[#F4EFE6] shadow-lg shadow-stone-900/15 transition-all duration-200 hover:bg-[#C86428] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 cursor-pointer"
        >
          <span>{ready ? 'Open Sketchbook' : 'Preparing Ink & Audio...'}</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        <span className="font-hand mt-5 text-lg text-stone-500">
          Zero cheesy drama · 100% bestie edition
        </span>
      </div>
    </motion.section>
  )
}
