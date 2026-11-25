import { Component, Suspense, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Wind, Mic, Sparkles, ArrowRight, Utensils } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { CONFIG } from '../../config'
import { sfx } from '../../lib/sfx'
import { LightingRig } from './LightingRig'
import { CameraRig } from './CameraRig'
import { RealisticCake } from './RealisticCake'
import { CakeKnife3D } from './CakeKnife3D'
import { SparkleField } from './SparkleField'

class WebGLBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-3xl border border-amber-500/20 bg-stone-900/80 p-8 text-center text-[#F4EFE6]">
          <p className="font-display text-2xl">3D Studio Preview Unavailable</p>
          <p className="mt-2 text-sm text-stone-400">
            Your browser disabled WebGL — tap below to continue the birthday celebration!
          </p>
        </div>
      )
    }
    return this.props.children
  }
}

export function CakeScene({ onComplete }) {
  const [selectedCake, setSelectedCake] = useState(CONFIG.cakes[0])
  const [step, setStep] = useState('pick') // 'pick' | 'blow' | 'wish' | 'cut' | 'done'
  const [countdown, setCountdown] = useState(3)
  const [cutting, setCutting] = useState(false)
  const [quoteIdx, setQuoteIdx] = useState(0)
  const [micListening, setMicListening] = useState(false)
  const micStreamRef = useRef(null)

  const candleLit = step === 'pick' || step === 'blow'
  const sliced = step === 'done'

  const triggerBlow = () => {
    if (step !== 'blow') return
    stopMic()
    sfx.whoosh()
    setStep('wish')
    setCountdown(3)
  }

  const stopMic = () => {
    setMicListening(false)
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop())
      micStreamRef.current = null
    }
  }

  // Optional real microphone blow detection
  const enableMicBlow = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = stream
      setMicListening(true)
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      const ctx = new AudioCtx()
      const src = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      src.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      const check = () => {
        if (!micStreamRef.current) return
        analyser.getByteFrequencyData(data)
        let avg = 0
        for (let i = 0; i < 24; i++) avg += data[i]
        avg /= 24
        if (avg > 68) {
          ctx.close().catch(() => {})
          triggerBlow()
          return
        }
        requestAnimationFrame(check)
      }
      requestAnimationFrame(check)
    } catch {
      // Fallback gracefully to tap button
      triggerBlow()
    }
  }

  useEffect(() => () => stopMic(), [])

  // 3-2-1 Wish countdown
  useEffect(() => {
    if (step !== 'wish') return
    sfx.tick()
    if (countdown <= 0) {
      setStep('cut')
      return
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 950)
    return () => clearTimeout(t)
  }, [step, countdown])

  const handleSliceCake = () => {
    if (step !== 'cut' || cutting) return
    setCutting(true)
    sfx.cut()
    setTimeout(() => {
      sfx.chime()
      confetti({
        particleCount: 80,
        spread: 75,
        origin: { y: 0.6 },
        colors: CONFIG.partyColors,
      })
      setStep('done')
    }, 520)
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-between px-4 py-8 sm:py-10 text-[#F4EFE6]"
    >
      {/* Top Stage Header */}
      <div className="relative z-10 text-center max-w-lg">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#E8B84B]/30 bg-[#E8B84B]/10 px-3.5 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-[#E8B84B]">
          <Sparkles className="h-3.5 w-3.5" />
          3D ARTISANAL CAKE STUDIO
        </span>
        <h2 className="font-display mt-2.5 text-2xl sm:text-4xl font-semibold text-[#FFFBF2]">
          {step === 'pick' && 'Apna Favorite Cake Choose Karo'}
          {step === 'blow' && 'Make a Wish & Candle Bujhao'}
          {step === 'wish' && `Aankhein Band Karke Wish Maango... ${countdown > 0 ? countdown : '✦'}`}
          {step === 'cut' && 'Ab Cake Kaatne Ki Baari!'}
          {step === 'done' && CONFIG.cakeQuotes[quoteIdx]}
        </h2>
      </div>

      {/* Interactive 3D WebGL Canvas */}
      <div className="relative my-2 h-[46dvh] sm:h-[52dvh] w-full max-w-3xl rounded-3xl border border-white/10 bg-black/25 shadow-[0_30px_90px_rgba(0,0,0,0.65)] overflow-hidden">
        <WebGLBoundary>
          <Canvas
            shadows
            dpr={[1, 2]}
            camera={{ position: [0, 2.75, 6.2], fov: 38 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <Suspense fallback={null}>
              <LightingRig candleLit={candleLit} />
              <CameraRig stage={step} />
              <RealisticCake cake={selectedCake} candleLit={candleLit} sliced={sliced} />
              <CakeKnife3D visible={step === 'cut' || step === 'done'} cutting={cutting || sliced} />
              <SparkleField active={sliced} color={selectedCake.accent} count={72} />
            </Suspense>
          </Canvas>
        </WebGLBoundary>

        <div className="pointer-events-none absolute bottom-3 inset-x-0 text-center text-[11px] tracking-wider uppercase text-stone-400/80">
          Drag to rotate 3D cake · Porcelain & 24K gold stand
        </div>
      </div>

      {/* Bottom Interactive Controls */}
      <div className="relative z-10 w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 'pick' && (
            <motion.div
              key="ctrl-pick"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
                {CONFIG.cakes.map((c) => {
                  const active = c.id === selectedCake.id
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        sfx.tap()
                        setSelectedCake(c)
                      }}
                      className={`rounded-2xl border p-3 text-left transition-all cursor-pointer ${
                        active
                          ? 'border-[#E8B84B] bg-[#E8B84B]/15 shadow-md'
                          : 'border-white/10 bg-white/5 hover:border-white/25'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-3.5 w-3.5 rounded-full shrink-0 border border-white/30"
                          style={{ backgroundColor: c.drip }}
                        />
                        <span className="text-xs sm:text-sm font-semibold text-[#FFFBF2] truncate">
                          {c.name}
                        </span>
                      </div>
                      <p className="mt-1 text-[11px] text-stone-400 line-clamp-1">{c.subtitle}</p>
                    </button>
                  )
                })}
              </div>

              <button
                type="button"
                onClick={() => {
                  sfx.tap()
                  setStep('blow')
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#E8B84B] px-7 py-3.5 text-sm font-bold text-stone-950 shadow-lg hover:brightness-105 cursor-pointer"
              >
                <span>Lock This Cake</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          {step === 'blow' && (
            <motion.div
              key="ctrl-blow"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={triggerBlow}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#E8B84B] px-7 py-3.5 text-sm sm:text-base font-bold text-stone-950 shadow-lg hover:brightness-105 cursor-pointer"
              >
                <Wind className="h-4 w-4" />
                <span>Tap to Blow Candle</span>
              </button>

              {!micListening ? (
                <button
                  type="button"
                  onClick={enableMicBlow}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-3.5 text-xs sm:text-sm font-semibold text-[#FFFBF2] hover:bg-white/15 cursor-pointer"
                >
                  <Mic className="h-4 w-4 text-[#E8B84B]" />
                  <span>Ya Mic me phoonk maaro</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-[#E8B84B]/40 bg-[#E8B84B]/15 px-4 py-2.5 text-xs font-semibold text-[#E8B84B]">
                  <Mic className="h-3.5 w-3.5 animate-pulse" />
                  Listening... phone ke mic par blow karo!
                </span>
              )}
            </motion.div>
          )}

          {step === 'wish' && (
            <motion.div
              key="ctrl-wish"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-sm text-stone-300"
            >
              Smoke rising... 3D stainless steel knife taiyaar ho raha hai ✦
            </motion.div>
          )}

          {step === 'cut' && (
            <motion.div
              key="ctrl-cut"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <button
                type="button"
                onClick={handleSliceCake}
                className="inline-flex items-center gap-2.5 rounded-full bg-[#C86428] px-8 py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#C86428]/30 hover:brightness-110 cursor-pointer"
              >
                <Utensils className="h-4 w-4" />
                <span>Slice the Cake ✦</span>
              </button>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="ctrl-done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <button
                type="button"
                onClick={() => {
                  sfx.tap()
                  setQuoteIdx((i) => (i + 1) % CONFIG.cakeQuotes.length)
                }}
                className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-xs sm:text-sm font-semibold text-[#FFFBF2] hover:bg-white/15 cursor-pointer"
              >
                Next Bestie Quote ↻
              </button>

              <button
                type="button"
                onClick={() => {
                  sfx.chime()
                  onComplete?.()
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#E8B84B] px-7 py-3 text-xs sm:text-sm font-bold text-stone-950 shadow-lg hover:brightness-105 cursor-pointer"
              >
                <span>Grand Finale</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
