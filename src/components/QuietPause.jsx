import { useEffect, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { motion } from 'motion/react'
import { CONFIG } from '../config'
import { sfx } from '../lib/sfx'

export function QuietPause({ onDone }) {
  const total = CONFIG.quietSeconds
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const started = performance.now()
    const id = setInterval(() => {
      const sec = (performance.now() - started) / 1000
      setElapsed(sec)
      if (sec >= total) {
        clearInterval(id)
        onDone?.()
      }
    }, 200)
    return () => clearInterval(id)
  }, [total, onDone])

  const remaining = Math.max(0, Math.ceil(total - elapsed))
  const canContinueEarly = elapsed >= (CONFIG.quietUnlockAfter ?? 5)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
      className="mt-5 flex flex-col items-center text-center"
    >
      <p className="font-hand text-xl sm:text-2xl text-stone-600">
        “Deep down to her soul.”
      </p>
      <p className="mt-1 text-xs tracking-[0.2em] uppercase text-stone-400">
        Stillness · {remaining}s
      </p>

      {canContinueEarly && (
        <motion.button
          type="button"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => {
            sfx.tap()
            onDone?.()
          }}
          className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-stone-900/15 bg-white/75 px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-900 hover:text-white transition-colors cursor-pointer"
        >
          <span>Aage badhein</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      )}
    </motion.div>
  )
}
