import { useCallback, useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX, FastForward } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { CONFIG } from './config'
import { sfx } from './lib/sfx'
import { preparePencilArtboard } from './lib/pencilEngine'
import { StartGate } from './components/StartGate'
import { WireDraw } from './components/WireDraw'
import { QuietPause } from './components/QuietPause'
import { TypeLines } from './components/TypeLines'
import { MemoriesScene } from './components/MemoriesScene'
import { BestieGames } from './components/BestieGames'
import { LetterScene } from './components/LetterScene'
import { CakeScene } from './components/cake/CakeScene'
import { FinaleScene } from './components/FinaleScene'

const STAGE_ORDER = ['start', 'draw', 'quiet', 'intro', 'memories', 'games', 'letter', 'cakes', 'finale']

export default function App() {
  const [stage, setStage] = useState('start')
  const [ready, setReady] = useState(false)
  const [muted, setMuted] = useState(false)
  const [artboard, setArtboard] = useState(null)
  const audioRef = useRef(null)

  // Load exact PNG artboard (public/images/face.png) + audio metadata
  useEffect(() => {
    let alive = true
    const fallbackTimer = setTimeout(() => {
      if (alive) setReady(true)
    }, 3000)

    preparePencilArtboard(CONFIG.imageSrc).then((board) => {
      if (!alive) return
      if (board) setArtboard(board)
      setReady(true)
    })

    return () => {
      alive = false
      clearTimeout(fallbackTimer)
    }
  }, [])

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    sfx.setMuted(next)
    if (audioRef.current) {
      audioRef.current.muted = next
    }
  }

  // Stage 1 -> Stage 2: Unlock WebAudio + start 28.34s voiceover synced with live sketch
  const handleStart = () => {
    sfx.unlock()
    sfx.tap()
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.muted = muted
      audio.play().catch(() => {})
    }
    setStage('draw')
  }

  const handleDrawComplete = useCallback(() => {
    setStage('quiet')
  }, [])

  const handleQuietComplete = useCallback(() => {
    setStage('intro')
  }, [])

  const handleIntroComplete = useCallback(() => {
    setStage('memories')
  }, [])

  const handleMemoriesComplete = useCallback(() => {
    setStage('games')
  }, [])

  const handleGamesComplete = useCallback(() => {
    setStage('letter')
  }, [])

  const handleLetterComplete = useCallback(() => {
    setStage('cakes')
  }, [])

  const handleCakesComplete = useCallback(() => {
    setStage('finale')
  }, [])

  const handleReplay = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
    setStage('start')
  }, [])

  const handleSkipCurrent = () => {
    sfx.tap()
    if (stage === 'draw') {
      if (audioRef.current) audioRef.current.pause()
      setStage('quiet')
    } else if (stage === 'quiet') {
      setStage('intro')
    } else if (stage === 'intro') {
      setStage('memories')
    } else if (stage === 'memories') {
      setStage('games')
    } else if (stage === 'games') {
      setStage('letter')
    }
  }

  const isDarkStage = stage === 'cakes' || stage === 'finale'
  const showSketchLayer = stage === 'draw' || stage === 'quiet'
  const canSkip =
    stage === 'draw' ||
    stage === 'quiet' ||
    stage === 'intro' ||
    stage === 'memories' ||
    stage === 'games'
  const currentIdx = STAGE_ORDER.indexOf(stage)

  return (
    <main
      className={`relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-700 ${
        isDarkStage ? 'studio-backdrop' : 'paper-grain'
      }`}
    >
      <audio ref={audioRef} src={CONFIG.audioSrc} preload="auto" playsInline />

      {/* Top minimal HUD: Stage dots + Mute + Skip */}
      {stage !== 'start' && (
        <header className="fixed top-4 inset-x-4 z-40 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-current/10 bg-white/10 px-3 py-1.5 backdrop-blur-md">
            {STAGE_ORDER.slice(1).map((s, idx) => {
              const active = idx + 1 <= currentIdx
              return (
                <span
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    active
                      ? isDarkStage
                        ? 'w-4 bg-[#E8B84B]'
                        : 'w-4 bg-[#C86428]'
                      : isDarkStage
                        ? 'w-1.5 bg-white/25'
                        : 'w-1.5 bg-stone-900/20'
                  }`}
                />
              )
            })}
          </div>

          <div className="pointer-events-auto flex items-center gap-2">
            {canSkip && (
              <button
                type="button"
                onClick={handleSkipCurrent}
                className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-colors cursor-pointer ${
                  isDarkStage
                    ? 'border-white/15 bg-white/10 text-stone-200 hover:bg-white/20'
                    : 'border-stone-900/15 bg-white/75 text-stone-700 hover:bg-stone-900 hover:text-white'
                }`}
              >
                <span>Skip</span>
                <FastForward className="h-3 w-3" />
              </button>
            )}

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? 'Unmute audio' : 'Mute audio'}
              className={`flex h-8 w-8 items-center justify-center rounded-full border backdrop-blur-md transition-colors cursor-pointer ${
                isDarkStage
                  ? 'border-white/15 bg-white/10 text-stone-200 hover:bg-white/20'
                  : 'border-stone-900/15 bg-white/75 text-stone-700 hover:bg-stone-900 hover:text-white'
              }`}
            >
              {muted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
            </button>
          </div>
        </header>
      )}

      {/* Persistent Sketch Portrait layer for 'draw' & 'quiet' stages */}
      <AnimatePresence>
        {showSketchLayer && (
          <motion.section
            key="sketch-stage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.6 }}
            className="flex min-h-[100dvh] w-full flex-col items-center justify-center py-12"
          >
            <WireDraw
              artboard={artboard}
              audioRef={audioRef}
              active={stage === 'draw'}
              completed={stage === 'quiet'}
              onComplete={handleDrawComplete}
            />
            {stage === 'quiet' && <QuietPause onDone={handleQuietComplete} />}
          </motion.section>
        )}
      </AnimatePresence>

      {/* Remaining Sequential Stages */}
      <AnimatePresence mode="wait">
        {stage === 'start' && <StartGate key="start" ready={ready} onStart={handleStart} />}
        {stage === 'intro' && <TypeLines key="intro" onComplete={handleIntroComplete} />}
        {stage === 'memories' && (
          <MemoriesScene key="memories" onComplete={handleMemoriesComplete} />
        )}
        {stage === 'games' && <BestieGames key="games" onComplete={handleGamesComplete} />}
        {stage === 'letter' && <LetterScene key="letter" onComplete={handleLetterComplete} />}
        {stage === 'cakes' && <CakeScene key="cakes" onComplete={handleCakesComplete} />}
        {stage === 'finale' && <FinaleScene key="finale" onReplay={handleReplay} />}
      </AnimatePresence>
    </main>
  )
}
