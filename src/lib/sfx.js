// Zero-asset WebAudio procedural sound effects — unlocked cleanly on first tap.
class SoundEngine {
  constructor() {
    this.ctx = null
    this.muted = false
    this.lastTypeAt = 0
    this.lastPencilAt = 0
  }

  unlock() {
    if (typeof window === 'undefined') return null
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return null
      this.ctx = new AudioCtx()
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }
    return this.ctx
  }

  setMuted(muted) {
    this.muted = Boolean(muted)
  }

  tone({ freq = 440, endFreq, duration = 0.12, type = 'sine', volume = 0.06, delay = 0 }) {
    if (this.muted) return
    const ctx = this.unlock()
    if (!ctx) return
    const now = ctx.currentTime + delay
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = type
    osc.frequency.setValueAtTime(freq, now)
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration)
    }
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(volume, now + Math.min(0.015, duration * 0.25))
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + duration + 0.02)
  }

  noise({ duration = 0.25, volume = 0.04, cutoff = 1200, filterType = 'bandpass' }) {
    if (this.muted) return
    const ctx = this.unlock()
    if (!ctx) return
    const len = Math.max(1, Math.floor(ctx.sampleRate * duration))
    const buffer = ctx.createBuffer(1, len, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < len; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.4)
    }
    const src = ctx.createBufferSource()
    src.buffer = buffer
    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = cutoff
    filter.Q.value = 1.4
    const gain = ctx.createGain()
    gain.gain.value = volume
    src.connect(filter).connect(gain).connect(ctx.destination)
    src.start()
  }

  tap() {
    this.tone({ freq: 520, endFreq: 740, duration: 0.07, type: 'triangle', volume: 0.05 })
  }

  type() {
    const now = performance.now()
    if (now - this.lastTypeAt < 46) return
    this.lastTypeAt = now
    this.tone({
      freq: 680 + Math.random() * 220,
      duration: 0.026,
      type: 'triangle',
      volume: 0.016,
    })
  }

  pencilScratch() {
    const now = performance.now()
    if (now - this.lastPencilAt < 175) return
    this.lastPencilAt = now
    this.noise({ duration: 0.085, volume: 0.011, cutoff: 2500, filterType: 'bandpass' })
  }

  pop() {
    this.tone({ freq: 340, endFreq: 780, duration: 0.13, type: 'sine', volume: 0.08 })
  }

  stamp() {
    this.tone({ freq: 190, endFreq: 85, duration: 0.14, type: 'triangle', volume: 0.09 })
    this.noise({ duration: 0.08, volume: 0.03, cutoff: 900, filterType: 'lowpass' })
  }

  paperRustle() {
    this.noise({ duration: 0.42, volume: 0.055, cutoff: 1900, filterType: 'bandpass' })
  }

  sparkle() {
    ;[784, 1046.5, 1318.5, 1568].forEach((f, idx) => {
      this.tone({ freq: f, duration: 0.42, type: 'sine', volume: 0.04, delay: idx * 0.065 })
    })
  }

  whoosh() {
    this.noise({ duration: 0.65, volume: 0.07, cutoff: 650, filterType: 'lowpass' })
    this.tone({ freq: 170, endFreq: 75, duration: 0.6, type: 'sine', volume: 0.035 })
  }

  tick() {
    this.tone({ freq: 720, duration: 0.07, type: 'sine', volume: 0.055 })
  }

  cut() {
    this.tone({ freq: 280, endFreq: 90, duration: 0.28, type: 'triangle', volume: 0.065 })
    this.noise({ duration: 0.22, volume: 0.045, cutoff: 2400, filterType: 'bandpass' })
  }

  chime() {
    ;[523.25, 659.25, 783.99, 1046.5].forEach((f, idx) => {
      this.tone({ freq: f, duration: 0.55, type: 'sine', volume: 0.055, delay: idx * 0.095 })
    })
  }
}

export const sfx = new SoundEngine()
