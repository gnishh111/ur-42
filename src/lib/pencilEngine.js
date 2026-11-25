// High-precision As-Is PNG Pencil Reveal Engine:
// 1) Loads the exact PNG (e.g. Gemini_Generated_Image_g1cacg1cacg1cacg.png) at full crisp resolution.
// 2) Extracts natural artist contour chains & shading zones directly from the image's ink ridges.
// 3) Progressively reveals the exact original PNG pixels stroke-by-stroke with a tapered graphite brush + live pencil nib.

export async function preparePencilArtboard(imageSrc) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const natW = img.naturalWidth || img.width || 452
      const natH = img.naturalHeight || img.height || 678

      // High-res source canvas preserving exact original PNG artwork
      const maxRenderDim = 1100
      const renderScale = Math.min(1, maxRenderDim / Math.max(natW, natH))
      const rw = Math.max(1, Math.round(natW * renderScale))
      const rh = Math.max(1, Math.round(natH * renderScale))

      const sourceCanvas = document.createElement('canvas')
      sourceCanvas.width = rw
      sourceCanvas.height = rh
      const sctx = sourceCanvas.getContext('2d', { willReadFrequently: true })
      sctx.imageSmoothingEnabled = true
      sctx.imageSmoothingQuality = 'high'
      sctx.drawImage(img, 0, 0, rw, rh)

      // Fast analysis grid (340px wide) to trace artist stroke paths & detect paper tone
      const aw = 340
      const ah = Math.max(1, Math.round((natH / natW) * aw))
      const aCanvas = document.createElement('canvas')
      aCanvas.width = aw
      aCanvas.height = ah
      const actx = aCanvas.getContext('2d', { willReadFrequently: true })
      actx.drawImage(img, 0, 0, aw, ah)
      const { data } = actx.getImageData(0, 0, aw, ah)

      // Estimate paper background color from outer border pixels
      let bgR = 0
      let bgG = 0
      let bgB = 0
      let borderCount = 0
      for (let x = 0; x < aw; x++) {
        for (const y of [0, 1, ah - 2, ah - 1]) {
          if (y < 0 || y >= ah) continue
          const idx = (y * aw + x) * 4
          if (data[idx + 3] > 200) {
            bgR += data[idx]
            bgG += data[idx + 1]
            bgB += data[idx + 2]
            borderCount++
          }
        }
      }
      const paperColor =
        borderCount > 0
          ? `rgb(${Math.round(bgR / borderCount)}, ${Math.round(bgG / borderCount)}, ${Math.round(bgB / borderCount)})`
          : '#F4EFE6'
      const bgLum =
        borderCount > 0
          ? (0.299 * bgR + 0.587 * bgG + 0.114 * bgB) / borderCount
          : 238

      // Compute ink darkness map relative to paper background
      const ink = new Float32Array(aw * ah)
      for (let i = 0; i < aw * ah; i++) {
        const idx = i * 4
        const alpha = data[idx + 3] / 255
        if (alpha < 0.08) {
          ink[i] = 0
          continue
        }
        const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]
        const diff = Math.max(0, bgLum - lum) * alpha
        ink[i] = diff
      }

      // Compute Sobel edge strength so primary linework draws BEFORE soft shading
      const edge = new Float32Array(aw * ah)
      for (let y = 1; y < ah - 1; y++) {
        for (let x = 1; x < aw - 1; x++) {
          const p = y * aw + x
          const gx =
            -ink[p - aw - 1] + ink[p - aw + 1] -
            2 * ink[p - 1] + 2 * ink[p + 1] -
            ink[p + aw - 1] + ink[p + aw + 1]
          const gy =
            -ink[p - aw - 1] - 2 * ink[p - aw] - ink[p - aw + 1] +
            ink[p + aw - 1] + 2 * ink[p + aw] + ink[p + aw + 1]
          edge[p] = Math.hypot(gx, gy)
        }
      }

      const dirs = [
        [-1, -1], [0, -1], [1, -1],
        [-1, 0],           [1, 0],
        [-1, 1],  [0, 1],  [1, 1],
      ]

      // 1) Trace crisp line-art chains along ink & edge ridges
      const visited = new Uint8Array(aw * ah)
      const rawChains = []
      const inkThreshold = 16

      for (let y = 1; y < ah - 1; y++) {
        for (let x = 1; x < aw - 1; x++) {
          const startIdx = y * aw + x
          if (visited[startIdx] || ink[startIdx] < inkThreshold) continue

          const pts = []
          let cx = x
          let cy = y
          let pdx = 0
          let pdy = 0
          let sumEdge = 0
          let sumInk = 0

          while (pts.length < 220) {
            const p = cy * aw + cx
            visited[p] = 1
            pts.push([cx / aw, cy / ah])
            sumEdge += edge[p]
            sumInk += ink[p]

            let best = null
            let bestScore = -999
            for (const [dx, dy] of dirs) {
              const nx = cx + dx
              const ny = cy + dy
              if (nx <= 0 || nx >= aw - 1 || ny <= 0 || ny >= ah - 1) continue
              const np = ny * aw + nx
              if (visited[np] || ink[np] < inkThreshold * 0.85) continue
              const dirBonus = (dx * pdx + dy * pdy) * 18
              const score = dirBonus + edge[np] * 0.35 + ink[np] * 0.25
              if (score > bestScore) {
                bestScore = score
                best = [nx, ny, dx, dy]
              }
            }
            if (!best) break
            ;[cx, cy, pdx, pdy] = best
          }

          if (pts.length >= 4) {
            const avgEdge = sumEdge / pts.length
            const avgInk = sumInk / pts.length
            const isPrimaryLine = avgEdge > 52 || (avgInk > 45 && pts.length > 16)
            // Focal center boost (middle 60% of portrait)
            const midPt = pts[Math.floor(pts.length / 2)]
            const distFromCenter = Math.hypot(midPt[0] - 0.45, midPt[1] - 0.45)
            const stage =
              isPrimaryLine && distFromCenter < 0.34
                ? 0
                : isPrimaryLine
                  ? 1
                  : 2

            rawChains.push({
              pts,
              stage,
              score: avgEdge + avgInk,
              y: midPt[1],
              brushRadius: isPrimaryLine ? 0.014 : 0.022,
              isLine: isPrimaryLine,
            })
          }
        }
      }

      // Sort artist strokes: Stage 0 (focal contours) -> Stage 1 (outer lines) -> Stage 2 (shading)
      rawChains.sort((a, b) => {
        if (a.stage !== b.stage) return a.stage - b.stage
        if (a.stage <= 1) return b.score - a.score
        return a.y - b.y
      })

      // 2) Add final diagonal graphite shading sweeps across any remaining inked regions
      // so 100% of the user's PNG is cleanly revealed by the end of the 28.34s!
      const sweepStepY = 8
      for (let sy = 2; sy < ah - 2; sy += sweepStepY) {
        let seg = []
        for (let sx = 2; sx < aw - 2; sx += 3) {
          const p = sy * aw + sx
          if (ink[p] > 8) {
            seg.push([sx / aw, sy / ah])
          } else if (seg.length >= 2) {
            rawChains.push({
              pts: seg,
              stage: 3,
              score: 10,
              y: sy / ah,
              brushRadius: 0.036,
              isLine: false,
            })
            seg = []
          } else {
            seg = []
          }
        }
        if (seg.length >= 2) {
          rawChains.push({
            pts: seg,
            stage: 3,
            score: 10,
            y: sy / ah,
            brushRadius: 0.036,
            isLine: false,
          })
        }
      }

      // Flatten strokes with cumulative normalized timeline weights [0..1]
      let totalUnits = 0
      const strokes = rawChains.map((ch) => {
        const units = Math.max(3, ch.pts.length)
        const startUnit = totalUnits
        totalUnits += units
        return {
          ...ch,
          startUnit,
          units,
        }
      })

      resolve({
        width: rw,
        height: rh,
        aspectRatio: `${natW} / ${natH}`,
        paperColor,
        sourceCanvas,
        strokes,
        totalUnits: Math.max(1, totalUnits),
      })
    }

    img.onerror = () => resolve(null)
    img.src = imageSrc
  })
}
