import { useState } from 'react'
import { MessageCircle, MapPin, Calendar, ArrowRight, Sparkles, CheckCheck } from 'lucide-react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'
import { sfx } from '../lib/sfx'

export function MemoriesScene({ onComplete }) {
  const { eyebrow, title, subtitle, chatCard, stats, timeline } = CONFIG.memories
  const [activeIdx, setActiveIdx] = useState(0)

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.55 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center px-4 sm:px-6 pt-20 pb-14"
    >
      <div className="w-full max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-stone-900/15 bg-white/80 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C86428]">
            <Sparkles className="h-3.5 w-3.5" />
            {eyebrow}
          </span>
          <h2 className="font-display mt-3 text-2xl sm:text-4xl font-semibold text-stone-900 leading-tight">
            {title}
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-stone-600">{subtitle}</p>
        </div>

        {/* Live Friendship Stats Strip */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-stone-900/10 bg-[#FAF7F2]/90 px-4 py-3 text-center shadow-xs"
            >
              <div className="font-display text-xl sm:text-2xl font-bold text-[#C86428]">
                {st.value}
              </div>
              <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-stone-500">
                {st.label}
              </div>
            </div>
          ))}
        </div>

        {/* Main 2-Column Scrapbook Grid: Origin Chat Flashback + 4 Meets Timeline */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left: WhatsApp Origin Chat Card ("who is jenishh" -> "I'm.") */}
          <div className="lg:col-span-5 rounded-3xl border border-stone-900/15 bg-[#1C1917] p-5 text-[#F4EFE6] shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A705C] text-white shrink-0">
                  <MessageCircle className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#FFFBF2] truncate">
                    {chatCard.groupName}
                  </p>
                  <p className="text-[11px] text-stone-400 truncate">{chatCard.groupMeta}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2.5">
                {chatCard.events.map((ev, idx) => {
                  if (ev.type === 'system') {
                    return (
                      <div key={idx} className="text-center">
                        <span className="inline-block rounded-lg bg-white/8 px-2.5 py-1 text-[10px] text-stone-300">
                          {ev.text}
                        </span>
                      </div>
                    )
                  }
                  const isOut = ev.type === 'outgoing'
                  return (
                    <div
                      key={idx}
                      className={`flex flex-col ${isOut ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-sm shadow-xs ${
                          isOut
                            ? 'bg-[#4A705C] text-white rounded-br-xs'
                            : 'bg-[#2B2623] text-[#FAF7F2] rounded-bl-xs'
                        }`}
                      >
                        <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-75">
                          {ev.sender}
                        </span>
                        <p className="font-medium mt-0.5">{ev.text}</p>
                        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70">
                          {ev.time}
                          {isOut && <CheckCheck className="h-3 w-3 text-[#E8B84B]" />}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <p className="font-hand mt-4 pt-3 border-t border-white/10 text-lg text-[#E8B84B] leading-snug">
              {chatCard.caption}
            </p>
          </div>

          {/* Right: Interactive 4-Meet & Insta Journey Cards */}
          <div className="lg:col-span-7 rounded-3xl border border-stone-900/12 bg-[#FAF7F2] p-5 sm:p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-1.5">
                {timeline.map((item, idx) => {
                  const isSelected = idx === activeIdx
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        sfx.tap()
                        setActiveIdx(idx)
                      }}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-[#F4EFE6] shadow-xs'
                          : 'bg-stone-900/6 text-stone-600 hover:bg-stone-900/12'
                      }`}
                    >
                      {idx === 0 ? '05 Apr · Insta' : `Meet 0${idx}`}
                    </button>
                  )
                })}
              </div>

              <motion.div
                key={activeIdx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-5 rounded-2xl border border-stone-900/10 bg-white p-5 sm:p-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#C86428]">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {timeline[activeIdx].tag}
                  </span>
                  <span className="inline-flex items-center gap-1 text-stone-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {timeline[activeIdx].place}
                  </span>
                </div>

                <h3 className="font-display mt-2.5 text-xl sm:text-2xl font-semibold text-stone-900">
                  {timeline[activeIdx].title}
                </h3>

                <p className="mt-2.5 text-sm sm:text-base text-stone-700 leading-relaxed">
                  {timeline[activeIdx].detail}
                </p>
              </motion.div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {timeline.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    aria-label={`View memory ${idx + 1}`}
                    onClick={() => {
                      sfx.tap()
                      setActiveIdx(idx)
                    }}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === activeIdx ? 'w-6 bg-[#C86428]' : 'w-2 bg-stone-900/20'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  sfx.tap()
                  onComplete?.()
                }}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900 px-6 py-3 text-xs sm:text-sm font-semibold text-[#F4EFE6] shadow-md hover:bg-[#C86428] transition-colors cursor-pointer"
              >
                <span>Play Bestie Games</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
