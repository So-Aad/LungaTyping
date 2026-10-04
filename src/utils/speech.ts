// Web Speech API wrapper for clear, slow English pronunciation

export interface SpeechVoiceOption {
  voice: SpeechSynthesisVoice
  name: string
  lang: string
  isEnglish: boolean
}

class SpeechEngine {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private preferredVoice: SpeechSynthesisVoice | null = null
  private rate: number = 0.8 // Slow and clear by default as requested
  private pitch: number = 1.0
  private volume: number = 1.0
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return
    this.voices = this.synth.getVoices()
    
    // Auto-pick the best English voice available
    if (!this.preferredVoice && this.voices.length > 0) {
      const englishVoices = this.voices.filter(v => v.lang.startsWith('en'))
      
      // Look for natural / premium sounding voices first
      const naturalVoice = englishVoices.find(v => 
        v.name.includes('Natural') || 
        v.name.includes('Google') || 
        v.name.includes('Samantha') || 
        v.name.includes('Daniel') || 
        v.name.includes('Jenny') || 
        v.name.includes('Guy') ||
        v.name.includes('Aria')
      )
      
      this.preferredVoice = naturalVoice || englishVoices[0] || this.voices[0]
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.loadVoices()
    }
    return this.voices
  }

  public getEnglishVoices(): SpeechSynthesisVoice[] {
    const all = this.getVoices()
    const english = all.filter(v => v.lang.toLowerCase().startsWith('en'))
    return english.length > 0 ? english : all
  }

  public setVoiceByURI(uri: string) {
    const v = this.voices.find(voice => voice.voiceURI === uri)
    if (v) {
      this.preferredVoice = v
    }
  }

  public getPreferredVoice(): SpeechSynthesisVoice | null {
    return this.preferredVoice
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.4, Math.min(1.5, rate))
  }

  public getRate(): number {
    return this.rate
  }

  public setPitch(pitch: number) {
    this.pitch = Math.max(0.5, Math.min(2.0, pitch))
  }

  public setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel()
    }
    this.currentUtterance = null
  }

  public speak(
    text: string, 
    onStart?: () => void, 
    onEnd?: () => void, 
    onError?: (err: unknown) => void
  ) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.')
      return
    }

    // Cancel any currently playing speech to ensure no overlap
    this.synth.cancel()

    // Clean text for speech
    const cleanText = text.trim()
    if (!cleanText) return

    const utterance = new SpeechSynthesisUtterance(cleanText)
    this.currentUtterance = utterance

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice
    } else {
      const enVoice = this.getEnglishVoices()[0]
      if (enVoice) utterance.voice = enVoice
    }

    utterance.rate = this.rate // Slow and clear (0.8x default)
    utterance.pitch = this.pitch
    utterance.volume = this.volume

    utterance.onstart = () => {
      onStart?.()
    }

    utterance.onend = () => {
      this.currentUtterance = null
      onEnd?.()
    }

    utterance.onerror = (e) => {
      this.currentUtterance = null
      // Ignore 'canceled' errors as they are triggered by stop()
      if (e.error !== 'canceled' && e.error !== 'interrupted') {
        onError?.(e)
      }
      onEnd?.()
    }

    // Workaround for Chrome bug where speech can stall on long phrases
    this.synth.speak(utterance)
  }

  public speakWord(
    word: string,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: (err: unknown) => void
  ) {
    // Strip leading/trailing punctuation while preserving internal apostrophes and letters
    const cleanWord = word.replace(/^[^\w']+|[^\w']+$/g, '').trim()
    if (!cleanWord) return
    this.speak(cleanWord, onStart, onEnd, onError)
  }
}

export const speechEngine = new SpeechEngine()
