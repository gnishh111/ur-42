import { useEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import { sfx } from '../lib/sfx'

// Draws a realistic angled wooden & graphite pencil right at the active stroke tip
function drawPencilNib(ctx, x, y, timeSec) {
  const jitterX = Math.sin(timeSec * 38) * 1.1
  const jitterY = Math.cos(timeSec * 44) * 0.9
  const px = x + jitterX
  const py = y + jitterY

  ctx.save()
  ctx.translate(px, py)
  ctx.rotate(-0.62) // ~35 deg natural artist grip angle

  // Subtle soft contact shadow on paper
  ctx.fillStyle = 'rgba(28, 25, 23, 0.14)'
  ctx.beginPath()
  ctx.ellipse(18, 9, 22, 4, 0.15, 0, Math.PI * 2)
  ctx.fill()

  // Graphite lead tip (0 to 14px)
  ctx.fillStyle = '#1C1917'
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(14, -3.4)
  ctx.lineTo(14, 3.4)
  ctx.closePath()
  ctx.fill()

  // Sharpened cedar wood cone (14 to 42px)
  const woodGrad = ctx.createLinearGradient(14, -9, 14, 9)
  woodGrad.addColorStop(0, '#E6C29F')
  woodGrad.addColorStop(0.55, '#CFA074')
  woodGrad.addColorStop(1, '#A6754B')
  ctx.fillStyle = woodGrad
  ctx.beginPath()
  ctx.moveTo(14, -3.4)
  ctx.lineTo(42, -8.5)
  ctx.lineTo(42, 8.5)
  ctx.lineTo(14, 3.4)
  ctx.closePath()
  ctx.fill()

  // Matte charcoal/amber hexagonal barrel (42 to 135px)
  const bodyGrad = ctx.createLinearGradient(42, -8.5, 42, 8.5)
  bodyGrad.addColorStop(0, '#3F3A36')
  bodyGrad.addColorStop(0.35, '#262220')
  bodyGrad.addColorStop(1, '#141210')
  ctx.fillStyle = bodyGrad
  ctx.fillRect(42, -8.5, 95, 17)

  // Gold foil stripe detail
  ctx.fillStyle = '#E8B84B'
  ctx.fillRect(42, -8.5, 4, 17)

  ctx.restore()
}

export function WireDraw({
  artboard,
  audioRef,
  active,
  completed,
  onComplete,
}) {
  const displayCanvasRef = useRef(null)
  const maskCanvasRef = useRef(null)
  const guideCanvasRef = useRef(null)
  const lastDrawnUnitRef = useRef(0)
  const doneCalledRef = useRef(false)

  const [progress, setProgress] = useState(completed ? 1 : 0)
  const [caption, setCaption] = useState('')

  // Initialize offscreen mask & guide canvases whenever artboard loads
  useEffect(() => {
    if (!artboard) return
    const { width, height } = artboard

    const mask = document.createElement('canvas')
    mask.width = width
    mask.height = height
    const mctx = mask.getContext('2d')
    mctx.lineCap = 'round'
    mctx.lineJoin = 'round'
    maskCanvasRef.current = mask

    const guide = document.createElement('canvas')
    guide.width = width
    guide.height = height
    const gctx = guide.getContext('2d')
    gctx.lineCap = 'round'
    gctx.lineJoin = 'round'
    guideCanvasRef.current = guide

    lastDrawnUnitRef.current = 0

    // If already completed (e.g., quiet pause phase), reveal 100% of original PNG immediately
    if (completed) {
      mctx.fillStyle = '#000'
      mctx.fillRect(0, 0, width, height)
      const disp = displayCanvasRef.current
      if (disp) {
        const dctx = disp.getContext('2d')
        dctx.clearRect(0, 0, width, height)
        dctx.drawImage(artboard.sourceCanvas, 0, 0)
      }
    }
  }, [artboard, completed])

  useEffect(() => {
    if (!artboard) return
    const { width, height, sourceCanvas, strokes, totalUnits } = artboard

    if (completed) {
      setProgress(1)
      const disp = displayCanvasRef.current
      if (disp) {
        const dctx = disp.getContext('2d')
        dctx.clearRect(0, 0, width, height)
        dctx.drawImage(sourceCanvas, 0, 0)
      }
      return
    }

    if (!active) return

    doneCalledRef.current = false
    let rafId = 0
    const startTime = performance.now()
    const audio = audioRef?.current

    const renderFrame = (ratio, nowMs) => {
      const disp = displayCanvasRef.current
      const mask = maskCanvasRef.current
      const guide = guideCanvasRef.current
      if (!disp || !mask || !guide) return

      const dctx = disp.getContext('2d')
      const mctx = mask.getContext('2d')
      const gctx = guide.getContext('2d')

      const targetUnit = ratio * totalUnits
      const prevUnit = lastDrawnUnitRef.current
      let nibX = width * 0.5
      let nibY = height * 0.45

      if (ratio >= 0.996) {
        // Final lock-in: reveal 100% of original PNG cleanly
        mctx.fillStyle = '#000'
        mctx.fillRect(0, 0, width, height)
      } else if (targetUnit > prevUnit) {
        // Paint incremental pencil strokes onto maskCanvas & guideCanvas
        for (let i = 0; i < strokes.length; i++) {
          const s = strokes[i]
          const sEnd = s.startUnit + s.units
          if (sEnd <= prevUnit) continue
          if (s.startUnit > targetUnit) break

          const localStart = Math.max(0, prevUnit - s.startUnit)
          const localEnd = Math.min(s.units, targetUnit - s.startUnit)
          const idx0 = Math.max(0, Math.floor((localStart / s.units) * (s.pts.length - 1)))
          const idx1 = Math.min(
            s.pts.length - 1,
            Math.ceil((localEnd / s.units) * (s.pts.length - 1)),
          )

          if (idx1 >= idx0) {
            const radiusPx = Math.max(3.5, s.brushRadius * Math.min(width, height))

            // 1) Draw crisp initial graphite construction line on guideCanvas
            if (s.isLine) {
              gctx.strokeStyle = 'rgba(28, 25, 23, 0.28)'
              gctx.lineWidth = Math.max(1.1, width * 0.0022)
              gctx.beginPath()
              gctx.moveTo(s.pts[idx0][0] * width, s.pts[idx0][1] * height)
              for (let k = idx0 + 1; k <= idx1; k++) {
                gctx.lineTo(s.pts[k][0] * width, s.pts[k][1] * height)
              }
              gctx.stroke()
            }

            // 2) Reveal exact PNG pixels smoothly along the stroke path
            mctx.strokeStyle = 'rgba(0, 0, 0, 0.92)'
            mctx.lineWidth = radiusPx * 2
            mctx.beginPath()
            mctx.moveTo(s.pts[idx0][0] * width, s.pts[idx0][1] * height)
            for (let k = idx0 + 1; k <= idx1; k++) {
              mctx.lineTo(s.pts[k][0] * width, s.pts[k][1] * height)
            }
            mctx.stroke()

            // Feathered outer edge for natural graphite pencil grain
            mctx.strokeStyle = 'rgba(0, 0, 0, 0.32)'
            mctx.lineWidth = radiusPx * 2.7
            mctx.stroke()

            nibX = s.pts[idx1][0] * width
            nibY = s.pts[idx1][1] * height
          }
        }
        lastDrawnUnitRef.current = targetUnit
      }

      // Composite final display frame:
      // 1) Original PNG masked by pencil strokes
      dctx.clearRect(0, 0, width, height)
      dctx.globalCompositeOperation = 'source-over'
      dctx.drawImage(mask, 0, 0)
      dctx.globalCompositeOperation = 'source-in'
      dctx.drawImage(sourceCanvas, 0, 0)

      // 2) Subtle initial pencil guide lines underneath unshaded areas
      dctx.globalCompositeOperation = 'destination-over'
      dctx.drawImage(guide, 0, 0)

      // 3) Live wooden pencil nib on top while actively drawing
      dctx.globalCompositeOperation = 'source-over'
      if (ratio > 0.005 && ratio < 0.996) {
        drawPencilNib(dctx, nibX, nibY, nowMs / 1000)
      }
    }

    const finish = () => {
      if (doneCalledRef.current) return
      doneCalledRef.current = true
      renderFrame(1, performance.now())
      setProgress(1)
      onComplete?.()
    }

    const tick = (nowMs) => {
      let ratio = 0
      let currentSec = 0

      if (
        CONFIG.drawSeconds === 'audio' &&
        audio &&
        Number.isFinite(audio.duration) &&
        audio.duration > 1 &&
        !audio.paused
      ) {
        currentSec = audio.currentTime
        ratio = Math.min(1, currentSec / audio.duration)
      } else {
        const totalSec =
          typeof CONFIG.drawSeconds === 'number'
            ? CONFIG.drawSeconds
            : CONFIG.fallbackDrawSeconds
        currentSec = (nowMs - startTime) / 1000
        ratio = Math.min(1, currentSec / totalSec)
      }

      renderFrame(ratio, nowMs)
      setProgress(ratio)

      if (ratio > 0.01 && ratio < 0.99) {
        sfx.pencilScratch()
      }

      const activeCap = CONFIG.voiceCaptions.find(
        (c) => currentSec >= c.start && currentSec < c.end,
      )
      setCaption(activeCap ? activeCap.text : '')

      if (ratio >= 0.998 || (audio && audio.ended)) {
        finish()
        return
      }
      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [artboard, active, completed, audioRef, onComplete])

  const pct = Math.round(progress * 100)
  const canvasW = artboard?.width || 452
  const canvasH = artboard?.height || 678
  const paperBg = artboard?.paperColor || '#FAF7F2'

  return (
    <div className="relative flex flex-col items-center justify-center w-full px-4">
      {/* Archival sketchbook artboard matching exact PNG aspect ratio & paper tone */}
      <div
        style={{ backgroundColor: paperBg, aspectRatio: artboard?.aspectRatio || '452 / 678' }}
        className="relative w-[min(80vw,390px)] sm:w-[min(46vw,420px)] max-h-[68dvh] rounded-2xl border border-stone-900/12 p-2.5 sm:p-3.5 shadow-[0_24px_60px_-18px_rgba(28,25,23,0.22)]"
      >
        {/* Subtle masking tape accent */}
        <div className="pointer-events-none absolute -top-2.5 left-1/2 -translate-x-1/2 h-5 w-20 rounded-xs bg-[#E8B84B]/50 backdrop-blur-xs border border-amber-900/10" />

        <canvas
          ref={displayCanvasRef}
          width={canvasW}
          height={canvasH}
          className="h-full w-full rounded-xl object-contain"
          aria-label="Live pencil sketch portrait"
        />
      </div>

      {/* Synced voiceover caption + delicate progress line */}
      {active && !completed && (
        <div className="mt-5 flex flex-col items-center max-w-md text-center">
          <p className="font-display italic text-sm sm:text-base text-stone-700 min-h-[2.6em] leading-snug px-2 transition-opacity duration-300">
            {caption || 'Listening & sketching line by line...'}
          </p>
          <div className="mt-2.5 flex items-center gap-3 w-56">
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-stone-900/10">
              <div
                className="h-full rounded-full bg-[#C86428] transition-[width] duration-150"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold tabular-nums text-stone-500">
              {pct}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
