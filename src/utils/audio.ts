// Authentic Procedural Mechanical Keyboard Sound Engine (Web Audio API)
// Provides realistic mechanical switch clacks, deep spacebar thocks, and game audio cues

class SoundEffectsEngine {
  private ctx: AudioContext | null = null
  private enabled: boolean = true
  private volume: number = 0.9

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock()
      }
      window.addEventListener('pointerdown', unlockAudio, { once: true, passive: true })
      window.addEventListener('keydown', unlockAudio, { once: true, passive: true })
      window.addEventListener('touchstart', unlockAudio, { once: true, passive: true })
    }
  }

  public unlock() {
    const ctx = this.getAudioContext()
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch((e) => console.warn('Audio resume failed:', e))
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    return this.ctx
  }

  private getSafeContext(): AudioContext | null {
    const ctx = this.getAudioContext()
    if (!ctx) return null
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {})
    }
    return ctx
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol))
  }

  public getVolume(): number {
    return this.volume
  }

  // Helper: generates subtle pitch jitter so rapid typing sounds natural like real mechanical keys
  private getJitter(variance = 0.05): number {
    return 1 + (Math.random() * 2 - 1) * variance
  }

  // 🔉 Soft key click: Realistic Mechanical Switch Click & Bottom-out
  public playCorrectClick() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const jitter = this.getJitter(0.04)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume, now)
    masterGain.connect(ctx.destination)

    // 1. High frequency tactile click leaf transient
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.016), ctx.sampleRate)
    const noiseData = noiseBuffer.getChannelData(0)
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (noiseData.length * 0.25))
    }

    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer

    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'bandpass'
    noiseFilter.frequency.setValueAtTime(3100 * jitter, now)
    noiseFilter.Q.setValueAtTime(2.8, now)

    const noiseGain = ctx.createGain()
    noiseGain.gain.setValueAtTime(0.7, now)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02)

    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(masterGain)

    // 2. Plastic keycap bottom-out body (warm tactile thock)
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(520 * jitter, now)
    osc.frequency.exponentialRampToValueAtTime(160 * jitter, now + 0.045)

    oscGain.gain.setValueAtTime(0.85, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(oscGain)
    oscGain.connect(masterGain)

    // 3. Subtle sub-chassis resonance
    const subOsc = ctx.createOscillator()
    const subGain = ctx.createGain()
    subOsc.type = 'sine'
    subOsc.frequency.setValueAtTime(230 * jitter, now)
    subOsc.frequency.exponentialRampToValueAtTime(80, now + 0.035)

    subGain.gain.setValueAtTime(0.4, now)
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04)

    subOsc.connect(subGain)
    subGain.connect(masterGain)

    try {
      noiseSource.start(now)
      noiseSource.stop(now + 0.025)
      osc.start(now)
      osc.stop(now + 0.055)
      subOsc.start(now)
      subOsc.stop(now + 0.045)
    } catch (e) {
      console.warn('Click audio error:', e)
    }
  }

  // 🔉 Slightly deeper click: Deep Mechanical Spacebar "Thock"
  public playSpaceClick() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const jitter = this.getJitter(0.03)

    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume * 1.05, now)
    masterGain.connect(ctx.destination)

    // 1. Deep spacebar acoustic chamber body
    const osc = ctx.createOscillator()
    const oscGain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(240 * jitter, now)
    osc.frequency.exponentialRampToValueAtTime(65 * jitter, now + 0.075)

    oscGain.gain.setValueAtTime(1.1, now)
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

    osc.connect(oscGain)
    oscGain.connect(masterGain)

    // 2. Metal stabilizer wire tick
    const stabOsc = ctx.createOscillator()
    const stabGain = ctx.createGain()
    stabOsc.type = 'triangle'
    stabOsc.frequency.setValueAtTime(1350 * jitter, now)
    stabOsc.frequency.exponentialRampToValueAtTime(320 * jitter, now + 0.03)

    stabGain.gain.setValueAtTime(0.35, now)
    stabGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03)

    stabOsc.connect(stabGain)
    stabGain.connect(masterGain)

    // 3. Spacebar bottom-out thud
    const thudOsc = ctx.createOscillator()
    const thudGain = ctx.createGain()
    thudOsc.type = 'triangle'
    thudOsc.frequency.setValueAtTime(160 * jitter, now)
    thudOsc.frequency.exponentialRampToValueAtTime(80, now + 0.065)

    thudGain.gain.setValueAtTime(0.7, now)
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07)

    thudOsc.connect(thudGain)
    thudGain.connect(masterGain)

    try {
      osc.start(now)
      osc.stop(now + 0.085)
      stabOsc.start(now)
      stabOsc.stop(now + 0.035)
      thudOsc.start(now)
      thudOsc.stop(now + 0.075)
    } catch (e) {
      console.warn('Space click audio error:', e)
    }
  }

  // ❌ Short error sound: Distinctive Error Cue (Typing stopped immediately)
  public playWrongSound() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume * 0.9, now)
    masterGain.connect(ctx.destination)

    // Low dual-tone buzzer
    const osc1 = ctx.createOscillator()
    const osc2 = ctx.createOscillator()
    const gain = ctx.createGain()

    osc1.type = 'sawtooth'
    osc2.type = 'sawtooth'

    osc1.frequency.setValueAtTime(155, now)
    osc1.frequency.exponentialRampToValueAtTime(115, now + 0.13)

    osc2.frequency.setValueAtTime(235, now)
    osc2.frequency.exponentialRampToValueAtTime(175, now + 0.13)

    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, now)

    gain.gain.setValueAtTime(0.85, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

    osc1.connect(filter)
    osc2.connect(filter)
    filter.connect(gain)
    gain.connect(masterGain)

    try {
      osc1.start(now)
      osc2.start(now)
      osc1.stop(now + 0.15)
      osc2.stop(now + 0.15)
    } catch (e) {
      console.warn('Error sound error:', e)
    }
  }

  // ↩️ Backspace / retry: Crisp mechanical latch click
  public playBackspaceClick() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume * 0.9, now)
    masterGain.connect(ctx.destination)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(980, now)
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.045)

    gain.gain.setValueAtTime(1.0, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05)

    osc.connect(gain)
    gain.connect(masterGain)

    try {
      osc.start(now)
      osc.stop(now + 0.055)
    } catch (e) {
      console.warn('Backspace audio error:', e)
    }
  }

  // ✨ Success sound when phrase is completed: Ascending Arpeggio Chime
  public playPhraseComplete() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume * 0.85, now)
    masterGain.connect(ctx.destination)

    const notes = [523.25, 659.25, 783.99, 1046.5]
    const stepDuration = 0.09

    notes.forEach((freq, index) => {
      const noteTime = now + index * stepDuration
      const osc = ctx.createOscillator()
      const noteGain = ctx.createGain()

      osc.type = index === notes.length - 1 ? 'triangle' : 'sine'
      osc.frequency.setValueAtTime(freq, noteTime)

      const duration = index === notes.length - 1 ? 0.45 : 0.25
      noteGain.gain.setValueAtTime(0, noteTime)
      noteGain.gain.linearRampToValueAtTime(0.7, noteTime + 0.015)
      noteGain.gain.exponentialRampToValueAtTime(0.001, noteTime + duration)

      osc.connect(noteGain)
      noteGain.connect(masterGain)

      try {
        osc.start(noteTime)
        osc.stop(noteTime + duration + 0.05)
      } catch (e) {
        console.warn('Phrase complete audio error:', e)
      }
    })
  }

  // 🏆 Completion sound when all phrases are completed: Victory Fanfare
  public playGameComplete() {
    if (!this.enabled) return
    const ctx = this.getSafeContext()
    if (!ctx) return

    const now = ctx.currentTime
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(this.volume * 0.95, now)
    masterGain.connect(ctx.destination)

    const chords = [
      { notes: [349.23, 440.0, 523.25], start: 0, dur: 0.25 },
      { notes: [392.0, 493.88, 587.33], start: 0.22, dur: 0.28 },
      { notes: [523.25, 659.25, 783.99, 1046.5], start: 0.50, dur: 0.95 },
    ]

    chords.forEach((chord) => {
      chord.notes.forEach((freq, idx) => {
        const chordTime = now + chord.start
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()

        osc.type = idx === chord.notes.length - 1 ? 'triangle' : 'sine'
        osc.frequency.setValueAtTime(freq, chordTime)

        gain.gain.setValueAtTime(0, chordTime)
        gain.gain.linearRampToValueAtTime(0.6 / chord.notes.length, chordTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, chordTime + chord.dur)

        osc.connect(gain)
        gain.connect(masterGain)

        try {
          osc.start(chordTime)
          osc.stop(chordTime + chord.dur + 0.05)
        } catch (e) {
          console.warn('Game complete audio error:', e)
        }
      })
    })
  }
}

export const soundEffects = new SoundEffectsEngine()
