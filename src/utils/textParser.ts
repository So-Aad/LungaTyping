import { PhraseItem } from '../types'
import { getPhraseTranslation } from './arabicTranslation'

/**
 * Normalizes user text: replaces curly quotes and special hyphens with standard ASCII characters
 * so keyboard typing doesn't get blocked by typographic ligature symbols.
 */
export function normalizeScriptText(text: string): string {
  return text
    .replace(/[\u2018\u2019]/g, "'") // Single curly quotes
    .replace(/[\u201C\u201D]/g, '"') // Double curly quotes
    .replace(/[\u2013\u2014]/g, '-') // En-dash and em-dash
    .replace(/\r\n/g, '\n')
    .replace(/\t/g, ' ')
}

/**
 * Splits raw script text into an array of phrases/sentences for practice.
 */
export function parseScriptToPhrases(rawText: string): PhraseItem[] {
  const normalized = normalizeScriptText(rawText)
  
  // Split by line breaks first, or punctuation followed by whitespace
  const rawSegments = normalized
    .split(/\n+/)
    .flatMap(line => {
      // Split each line into sentences based on punctuation (. ! ?)
      // Match sentences ending in punctuation or end of line
      const sentences = line.match(/[^.!?]+(?:[.!?]+|$)/g)
      return sentences || [line]
    })
    .map(s => s.trim())
    .filter(s => s.length > 0)

  return rawSegments.map((phrase, index) => ({
    id: `phrase-${index}-${Date.now()}`,
    text: phrase,
    arabicTranslation: getPhraseTranslation(phrase) || undefined,
  }))
}

// Array of vibrant color classes and hex codes for typed characters
export const CHAR_COLORS = [
  { text: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)', name: 'Sky Blue' },
  { text: '#4ade80', glow: 'rgba(74, 222, 128, 0.4)', name: 'Emerald' },
  { text: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)', name: 'Rose Pink' },
  { text: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)', name: 'Neon Purple' },
  { text: '#facc15', glow: 'rgba(250, 204, 21, 0.4)', name: 'Amber Gold' },
  { text: '#fb923c', glow: 'rgba(251, 146, 60, 0.4)', name: 'Bright Orange' },
  { text: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.4)', name: 'Vibrant Teal' },
  { text: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)', name: 'Hot Pink' },
  { text: '#60a5fa', glow: 'rgba(96, 165, 250, 0.4)', name: 'Electric Blue' },
  { text: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)', name: 'Lilac Violet' },
]

export function getCharacterColor(index: number) {
  return CHAR_COLORS[index % CHAR_COLORS.length]
}
