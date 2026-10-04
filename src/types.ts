export interface PhraseItem {
  id: string
  text: string
  arabicTranslation?: string
  audioPlayed?: boolean
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export interface ScriptPreset {
  id: string
  title: string
  category: string
  level: CEFRLevel
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  description: string
  content: string
  emoji: string
}

export interface TypingStats {
  totalCharsTyped: number
  correctChars: number
  mistakes: number
  startTime: number | null
  endTime: number | null
  phraseMistakes: Record<number, number>
}

export interface VoiceSettings {
  voiceURI: string
  rate: number // default 0.8 (slow & clear)
  pitch: number
  volume: number
  autoPlay: boolean
  clickToSpeakWord: boolean // Touch/click any word in a phrase to read it out loud
  showArabicTranslation: boolean // Show Arabic translation for phrases and words
}

export interface SoundSettings {
  enabled: boolean
  volume: number
}
