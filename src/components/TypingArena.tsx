import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Volume2,
  Volume1,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Snail,
  Keyboard,
  Headphones,
  Sparkles,
  EyeOff,
  Eye,
  Languages,
} from 'lucide-react'
import { PhraseItem, VoiceSettings } from '../types'
import { soundEffects } from '../utils/audio'
import { speechEngine } from '../utils/speech'
import { getPhraseTranslation, getWordTranslation } from '../utils/arabicTranslation'

interface TypingArenaProps {
  phrases: PhraseItem[]
  currentPhraseIndex: number
  onPhraseCompleted: () => void
  onAllCompleted: () => void
  onRecordMistake: (phraseIdx: number) => void
  onRecordCorrectChar: () => void
  voiceSettings: VoiceSettings
  caseSensitive: boolean
  onRestartCurrentPhrase: () => void
  hidePhrase: boolean
  onToggleHidePhrase: () => void
  onToggleClickToSpeakWord?: () => void
  onToggleArabicTranslation?: () => void
}

interface TextToken {
  text: string
  startIndex: number
  endIndex: number
  isSpace: boolean
  wordIndex?: number
  cleanWord?: string
  arabicTranslation?: string | null
}

const parseTextTokens = (text: string): TextToken[] => {
  const tokens: TextToken[] = []
  if (!text) return tokens

  const regex = /(\S+|\s+)/g
  let match: RegExpExecArray | null
  let wordCount = 0

  while ((match = regex.exec(text)) !== null) {
    const raw = match[0]
    const startIndex = match.index
    const endIndex = startIndex + raw.length
    const isSpace = /^\s+$/.test(raw)
    const cleanWord = isSpace ? undefined : raw.replace(/^[^\w']+|[^\w']+$/g, '')
    const arabicTranslation = cleanWord ? getWordTranslation(cleanWord) : null

    tokens.push({
      text: raw,
      startIndex,
      endIndex,
      isSpace,
      wordIndex: isSpace ? undefined : wordCount++,
      cleanWord,
      arabicTranslation,
    })
  }

  return tokens
}

export const TypingArena: React.FC<TypingArenaProps> = ({
  phrases,
  currentPhraseIndex,
  onPhraseCompleted,
  onAllCompleted,
  onRecordMistake,
  onRecordCorrectChar,
  voiceSettings,
  caseSensitive,
  onRestartCurrentPhrase,
  hidePhrase,
  onToggleHidePhrase,
  onToggleClickToSpeakWord,
  onToggleArabicTranslation,
}) => {
  const currentPhrase = phrases[currentPhraseIndex] || { text: '' }
  const targetText = currentPhrase.text
  const targetWords = targetText.trim().split(/\s+/)
  const tokens = useMemo(() => parseTextTokens(targetText), [targetText])
  const currentPhraseArabic = currentPhrase.arabicTranslation || getPhraseTranslation(targetText)

  // ── Normal mode state ──────────────────────────────────────────────────────
  const [typedIndex, setTypedIndex] = useState(0)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [lastWrongChar, setLastWrongChar] = useState<string | null>(null)
  const [phraseJustFinished, setPhraseJustFinished] = useState(false)
  const errorTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Hide (dictation) mode state ───────────────────────────────────────────
  const [hiddenInput, setHiddenInput] = useState('')
  // Index of the first wrong word (-1 = none)
  const [errorWordIndex, setErrorWordIndex] = useState(-1)
  const [revealed, setRevealed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // Separate hidden input ref for capturing mobile keyboard in normal (non-hide) mode
  const mobileInputRef = useRef<HTMLInputElement>(null)
  // Whether mobile keyboard is currently active (focus on mobileInputRef)
  const [mobileKeyboardActive, setMobileKeyboardActive] = useState(false)

  // ── Helpers ───────────────────────────────────────────────────────────────
  // Strip leading/trailing punctuation and lowercase for comparison
  const normalize = (s: string) => s.replace(/^[^\w\s]+|[^\w\s]+$/g, '').toLowerCase()
  // Returns true if a character is punctuation (not a letter, digit, or space)
  const isPunct = (ch: string) => /[^\w\s]/.test(ch)
  const wordsMatch = (a: string, b: string) => normalize(a) === normalize(b)

  // ── Speech ────────────────────────────────────────────────────────────────
  const handleSpeak = useCallback(
    (customRate?: number) => {
      if (!targetText) return
      soundEffects.unlock()
      const prevRate = speechEngine.getRate()
      if (customRate) speechEngine.setRate(customRate)
      setIsSpeaking(true)
      speechEngine.speak(
        targetText,
        () => setIsSpeaking(true),
        () => {
          setIsSpeaking(false)
          if (customRate) speechEngine.setRate(prevRate)
        },
        () => {
          setIsSpeaking(false)
          if (customRate) speechEngine.setRate(prevRate)
        }
      )
    },
    [targetText]
  )

  const [speakingWordIndex, setSpeakingWordIndex] = useState<number | null>(null)
  const speakingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [activeWordTranslation, setActiveWordTranslation] = useState<{
    english: string
    arabic: string
  } | null>(null)

  const handleSpeakWord = useCallback((word: string, wordIdx: number) => {
    if (!word) return
    soundEffects.unlock()
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current)
    setSpeakingWordIndex(wordIdx)

    const arabic = getWordTranslation(word)
    if (arabic) {
      setActiveWordTranslation({ english: word, arabic })
    }

    speechEngine.speakWord(
      word,
      () => setSpeakingWordIndex(wordIdx),
      () => {
        setSpeakingWordIndex((prev) => (prev === wordIdx ? null : prev))
      },
      () => {
        setSpeakingWordIndex((prev) => (prev === wordIdx ? null : prev))
      }
    )

    // Safety fallback timeout in case onend drops on short word
    speakingTimeoutRef.current = setTimeout(() => {
      setSpeakingWordIndex((prev) => (prev === wordIdx ? null : prev))
    }, 2500)
  }, [])

  useEffect(() => {
    return () => {
      if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current)
    }
  }, [])

  // ── Reset on phrase change ────────────────────────────────────────────────
  useEffect(() => {
    setTypedIndex(0)
    setHasError(false)
    setLastWrongChar(null)
    setPhraseJustFinished(false)
    setHiddenInput('')
    setErrorWordIndex(-1)
    setRevealed(false)
    setActiveWordTranslation(null)
    if (speakingTimeoutRef.current) clearTimeout(speakingTimeoutRef.current)
    setSpeakingWordIndex(null)

    if (voiceSettings.autoPlay && targetText) {
      const timer = setTimeout(() => handleSpeak(), 350)
      return () => clearTimeout(timer)
    }
  }, [currentPhraseIndex, targetText, voiceSettings.autoPlay, handleSpeak])

  // Focus input when hide mode activates
  useEffect(() => {
    if (hidePhrase && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
    // Reset hidden state when toggling mode
    setHiddenInput('')
    setErrorWordIndex(-1)
    setRevealed(false)
    setTypedIndex(0)
    setHasError(false)
    setPhraseJustFinished(false)
  }, [hidePhrase])

  // ── finishPhrase (shared) ─────────────────────────────────────────────────
  const finishPhrase = useCallback(() => {
    if (phraseJustFinished) return
    setPhraseJustFinished(true)
    const isLastPhrase = currentPhraseIndex >= phrases.length - 1
    if (isLastPhrase) {
      soundEffects.playGameComplete()
      setTimeout(() => onAllCompleted(), 600)
    } else {
      soundEffects.playPhraseComplete()
      setTimeout(() => onPhraseCompleted(), 600)
    }
  }, [phraseJustFinished, currentPhraseIndex, phrases.length, onAllCompleted, onPhraseCompleted])

  // ── Hide mode: input change ───────────────────────────────────────────────
  const handleHiddenInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (phraseJustFinished) return
      soundEffects.unlock()

      // If there's a word-level error, block all input (only backspace via keydown)
      if (errorWordIndex !== -1) return

      const raw = e.target.value
      setHiddenInput(raw)

      // Split into parts; "committed" words are those followed by a space
      const parts = raw.split(' ')
      const committed = parts.slice(0, parts.length - 1) // exclude in-progress last word

      // Check committed words for errors
      let firstError = -1
      for (let i = 0; i < committed.length; i++) {
        if (!wordsMatch(committed[i], targetWords[i] ?? '')) {
          firstError = i
          break
        }
      }

      if (firstError !== -1) {
        soundEffects.playWrongSound()
        onRecordMistake(currentPhraseIndex)
        setErrorWordIndex(firstError)
        // Rewind input to just after the last correct word
        const correctPrefix = committed.slice(0, firstError).join(' ')
        setHiddenInput(correctPrefix === '' ? '' : correctPrefix + ' ')
        return
      }

      // Record correct chars for committed correct words
      committed.forEach((w, i) => {
        if (wordsMatch(w, targetWords[i] ?? '')) onRecordCorrectChar()
      })

      // Check full completion (all words committed and last part is empty)
      const lastPart = parts[parts.length - 1]
      const allPrevCorrect = committed.every((w, i) => wordsMatch(w, targetWords[i] ?? ''))
      if (allPrevCorrect && committed.length === targetWords.length && lastPart === '') {
        finishPhrase()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [phraseJustFinished, errorWordIndex, targetWords, currentPhraseIndex, finishPhrase]
  )

  // ── Hide mode: keydown ────────────────────────────────────────────────────
  const handleHiddenKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      soundEffects.unlock()

      if (e.key === 'Tab' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        handleSpeak()
        return
      }

      // Error state: only allow backspace
      if (errorWordIndex !== -1) {
        if (e.key === 'Backspace') {
          soundEffects.playBackspaceClick()
          // Remove one character from the end (which is the trailing space of error prefix)
          setHiddenInput((prev) => (prev.endsWith(' ') ? prev.slice(0, -1) : prev))
          setErrorWordIndex(-1)
        } else {
          e.preventDefault()
        }
        return
      }

      if (e.key === 'Backspace') {
        soundEffects.playBackspaceClick()
        return
      }

      // Submit on Enter
      if (e.key === 'Enter') {
        e.preventDefault()
        const typedWords = hiddenInput.trim().split(/\s+/).filter(Boolean)
        let firstError = -1
        for (let i = 0; i < typedWords.length; i++) {
          if (!wordsMatch(typedWords[i], targetWords[i] ?? '')) {
            firstError = i
            break
          }
        }
        if (firstError !== -1) {
          soundEffects.playWrongSound()
          onRecordMistake(currentPhraseIndex)
          setErrorWordIndex(firstError)
          const correctPrefix = typedWords.slice(0, firstError).join(' ')
          setHiddenInput(correctPrefix === '' ? '' : correctPrefix + ' ')
        } else if (typedWords.length === targetWords.length) {
          finishPhrase()
        } else {
          // Incomplete answer
          soundEffects.playWrongSound()
          setErrorWordIndex(typedWords.length)
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [errorWordIndex, hiddenInput, targetWords, currentPhraseIndex, handleSpeak, finishPhrase]
  )

  // ── Normal mode: key handler ──────────────────────────────────────────────
  const processKey = useCallback(
    (key: string) => {
      if (phraseJustFinished || !targetText) return
      soundEffects.unlock()

      if (key === 'Backspace') {
        soundEffects.playBackspaceClick()
        if (typedIndex > 0) {
          // Step back, skipping over any punctuation that was auto-advanced
          let prev = typedIndex - 1
          while (prev > 0 && isPunct(targetText[prev])) prev--
          setTypedIndex(prev)
        }
        setHasError(false)
        setLastWrongChar(null)
        return
      }

      // Skip past any punctuation chars at current position automatically
      let idx = typedIndex
      while (idx < targetText.length && isPunct(targetText[idx])) idx++

      const expectedChar = targetText[idx]
      if (!expectedChar) return

      // Always case-insensitive
      const isMatch = key.toLowerCase() === expectedChar.toLowerCase()

      if (isMatch) {
        setHasError(false)
        setLastWrongChar(null)
        onRecordCorrectChar()
        if (expectedChar === ' ') soundEffects.playSpaceClick()
        else soundEffects.playCorrectClick()

        // Advance past this char, then skip any punctuation that follow
        let nextIndex = idx + 1
        while (nextIndex < targetText.length && isPunct(targetText[nextIndex])) nextIndex++
        setTypedIndex(nextIndex)

        if (nextIndex >= targetText.length) {
          setPhraseJustFinished(true)
          const isLastPhrase = currentPhraseIndex >= phrases.length - 1
          if (isLastPhrase) {
            soundEffects.playGameComplete()
            setTimeout(() => onAllCompleted(), 600)
          } else {
            soundEffects.playPhraseComplete()
            setTimeout(() => onPhraseCompleted(), 600)
          }
        }
      } else {
        soundEffects.playWrongSound()
        setHasError(true)
        setLastWrongChar(key === ' ' ? '␣ Space' : key)
        onRecordMistake(currentPhraseIndex)
        if (errorTimeoutRef.current) clearTimeout(errorTimeoutRef.current)
        errorTimeoutRef.current = setTimeout(() => setHasError(false), 900)
      }
    },
    [
      typedIndex, targetText, phraseJustFinished,
      currentPhraseIndex, phrases.length,
      onRecordCorrectChar, onRecordMistake, onPhraseCompleted, onAllCompleted,
    ]
  )

  // Global keydown for normal mode only
  useEffect(() => {
    if (hidePhrase) return
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) return

      if (e.key === 'Tab' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        handleSpeak()
        return
      }
      if (e.key === 'Backspace' || e.key.length === 1) {
        e.preventDefault()
        processKey(e.key)
      }
    }
    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [hidePhrase, handleSpeak, processKey])

  // ── Mobile keyboard input handler (normal mode) ───────────────────────────
  // The hidden input accumulates characters from the mobile keyboard.
  // We pull out each new character, feed it to processKey(), then clear.
  const mobileInputValueRef = useRef('')
  const handleMobileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (hidePhrase || phraseJustFinished) return
      soundEffects.unlock()
      const newValue = e.target.value
      const prev = mobileInputValueRef.current

      if (newValue.length > prev.length) {
        // Characters were added — process each new character
        const added = newValue.slice(prev.length)
        for (const ch of added) {
          processKey(ch)
        }
      } else if (newValue.length < prev.length) {
        // Backspace
        processKey('Backspace')
      }

      // Always clear so the input is ready for the next character.
      // We set value to '' via the ref trick below (the controlled value stays '').
      mobileInputValueRef.current = ''
      e.target.value = ''
    },
    [hidePhrase, phraseJustFinished, processKey]
  )

  const handleMobileKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      soundEffects.unlock()
      if (e.key === 'Tab' || (e.ctrlKey && e.code === 'Space')) {
        e.preventDefault()
        handleSpeak()
        return
      }
      // Let onChange handle the actual character; only intercept Backspace here
      if (e.key === 'Backspace') {
        e.preventDefault()
        processKey('Backspace')
      }
    },
    [handleSpeak, processKey]
  )

  // ── Derived ───────────────────────────────────────────────────────────────
  // In normal mode, the effective cursor skips punctuation — find the real next char
  const effectiveIdx = (() => {
    let idx = typedIndex
    while (idx < targetText.length && isPunct(targetText[idx])) idx++
    return idx
  })()
  const activeChar = targetText[effectiveIdx]
  const isTargetSpace = activeChar === ' '
  const inputParts = hiddenInput.split(' ')
  const committedWordCount = inputParts.length - 1 // words followed by a space

  const hiddenWordCount = hiddenInput.trim() === ''
    ? 0
    : hiddenInput.trim().split(/\s+/).filter(Boolean).length

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6 select-none">
      {/* Hidden mobile keyboard capture input (normal mode) */}
      {!hidePhrase && (
        <input
          ref={mobileInputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          className="mobile-keyboard-capture"
          aria-hidden="true"
          tabIndex={-1}
          onChange={handleMobileInputChange}
          onKeyDown={handleMobileKeyDown}
          onFocus={() => setMobileKeyboardActive(true)}
          onBlur={() => setMobileKeyboardActive(false)}
        />
      )}

      {/* Audio Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-5 shadow-xl shadow-purple-950/10">
        {/* Row 1: Primary actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Listen */}
          <button
            onClick={() => handleSpeak()}
            disabled={isSpeaking}
            className={`flex-1 sm:flex-none px-3 sm:px-5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 sm:gap-2.5 transition-all shadow-lg min-w-0 ${
              isSpeaking
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-purple-500/25 ring-2 ring-purple-400/50'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/25 hover:scale-[1.02]'
            }`}
          >
            <Volume2 className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span className="truncate">{isSpeaking ? 'Speaking...' : 'Listen 🎧'}</span>
            {isSpeaking && (
              <span className="flex items-center gap-0.5 ml-1 flex-shrink-0">
                <span className="w-1 h-3 bg-white rounded-full animate-pulse"></span>
                <span className="w-1 h-5 bg-white rounded-full animate-pulse delay-75"></span>
                <span className="w-1 h-2 bg-white rounded-full animate-pulse delay-150"></span>
              </span>
            )}
          </button>

          {/* Slow */}
          <button
            onClick={() => handleSpeak(0.6)}
            disabled={isSpeaking}
            title="Listen extra slow (0.60x)"
            className="px-3 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-amber-300 text-xs font-semibold border border-slate-700/70 transition-all flex items-center gap-1.5 flex-shrink-0"
          >
            <Snail className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Slow (0.6x)</span>
            <span className="sm:hidden">0.6x</span>
          </button>

          {/* Hide / Show Phrase Toggle */}
          <button
            onClick={onToggleHidePhrase}
            title={hidePhrase ? 'Show phrase (exit dictation mode)' : 'Hide phrase (dictation mode)'}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
              hidePhrase
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30'
                : 'bg-slate-800/90 border-slate-700/70 text-slate-300 hover:text-amber-300 hover:bg-slate-700/90'
            }`}
          >
            {hidePhrase ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">{hidePhrase ? 'Show Phrase' : 'Hide Phrase'}</span>
            <span className="sm:hidden">{hidePhrase ? 'Show' : 'Hide'}</span>
          </button>

          {/* Touch / Click Word to Read Toggle */}
          {onToggleClickToSpeakWord && (
            <button
              onClick={onToggleClickToSpeakWord}
              title={
                voiceSettings.clickToSpeakWord
                  ? 'Tap / Click word to read aloud is ON (click to disable)'
                  : 'Tap / Click word to read aloud is OFF (click to enable)'
              }
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                voiceSettings.clickToSpeakWord
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30 ring-1 ring-purple-500/30'
                  : 'bg-slate-800/90 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-700/90'
              }`}
            >
              <Volume1 className={`w-4 h-4 ${voiceSettings.clickToSpeakWord ? 'text-purple-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                Tap Word:{' '}
                <span className={voiceSettings.clickToSpeakWord ? 'text-purple-300 font-bold' : 'text-slate-400'}>
                  {voiceSettings.clickToSpeakWord ? 'ON' : 'OFF'}
                </span>
              </span>
              <span className="sm:hidden">Word: {voiceSettings.clickToSpeakWord ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Arabic Translation Toggle */}
          {onToggleArabicTranslation && (
            <button
              onClick={onToggleArabicTranslation}
              title={
                voiceSettings.showArabicTranslation
                  ? 'Arabic translation is ON (click to hide)'
                  : 'Arabic translation is OFF (click to show)'
              }
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 flex-shrink-0 ${
                voiceSettings.showArabicTranslation
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 ring-1 ring-amber-500/30'
                  : 'bg-slate-800/90 border-slate-700/70 text-slate-400 hover:text-slate-200 hover:bg-slate-700/90'
              }`}
            >
              <Languages className={`w-4 h-4 ${voiceSettings.showArabicTranslation ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="hidden sm:inline">
                ترجمة (AR):{' '}
                <span className={voiceSettings.showArabicTranslation ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                  {voiceSettings.showArabicTranslation ? 'ON' : 'OFF'}
                </span>
              </span>
              <span className="sm:hidden">AR: {voiceSettings.showArabicTranslation ? 'ON' : 'OFF'}</span>
            </button>
          )}

          {/* Right side controls — pushed to end on desktop, new row on mobile */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-400 ml-auto">
            <span className="inline-flex items-center gap-1.5 bg-slate-800/70 border border-slate-700/60 px-3 py-1.5 rounded-xl text-slate-300 font-medium shadow-sm">
              <Keyboard className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">PC Keyboard • </span>
              <span className="text-purple-300 font-semibold">Audio ON</span>
            </span>

            <span className="hidden md:inline-flex items-center gap-1 bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/50">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-200 font-mono text-[10px]">Tab</kbd> to replay
            </span>

            <button
              onClick={() => {
                onRestartCurrentPhrase()
                setTypedIndex(0)
                setHasError(false)
                setHiddenInput('')
                setErrorWordIndex(-1)
                setRevealed(false)
                setPhraseJustFinished(false)
              }}
              title="Restart this sentence"
              className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Row 2 (mobile only): restart + status */}
        <div className="flex sm:hidden items-center justify-between mt-2.5 pt-2.5 border-t border-slate-800/60 gap-2">
          {/* Tap to type button — mobile only, shown via CSS */}
          {!hidePhrase && (
            <button
              onPointerDown={(e) => {
                e.preventDefault()
                mobileInputRef.current?.focus()
              }}
              className={`tap-to-type-btn flex-1 items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                mobileKeyboardActive
                  ? 'bg-indigo-600/30 border-indigo-500/60 text-indigo-300 ring-1 ring-indigo-400/40'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700/80'
              }`}
            >
              <Keyboard className="w-4 h-4 text-purple-400" />
              <span>{mobileKeyboardActive ? '⌨️ Keyboard Active' : '⌨️ Tap to Type'}</span>
            </button>
          )}

          <button
            onClick={() => {
              onRestartCurrentPhrase()
              setTypedIndex(0)
              setHasError(false)
              setHiddenInput('')
              setErrorWordIndex(-1)
              setRevealed(false)
              setPhraseJustFinished(false)
            }}
            title="Restart this sentence"
            className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700/50 flex-shrink-0"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Stage */}
      <div
        className={`relative bg-gradient-to-b from-slate-900/95 to-slate-950 border rounded-3xl p-4 sm:p-12 shadow-2xl transition-all duration-200 ${
          hasError || errorWordIndex !== -1
            ? 'border-rose-500/70 shadow-rose-500/10 animate-wiggle'
            : phraseJustFinished
            ? 'border-emerald-500/70 shadow-emerald-500/15'
            : 'border-slate-800 shadow-purple-950/20'
        }`}
      >
        {/* Glow */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 pb-3 sm:pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <span className="text-xs uppercase font-extrabold tracking-wider text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full">
              Phrase {currentPhraseIndex + 1} of {phrases.length}
            </span>
            {hidePhrase && !phraseJustFinished && (
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5" /> Dictation
              </span>
            )}
            {phraseJustFinished && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center gap-1.5 animate-pop">
                <CheckCircle className="w-4 h-4" /> Completed!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Progress:</span>
            <span className="text-white font-bold text-sm">
              {hidePhrase
                ? `${Math.round((hiddenWordCount / Math.max(1, targetWords.length)) * 100)}%`
                : `${Math.round((typedIndex / Math.max(1, targetText.length)) * 100)}%`}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 sm:h-2 bg-slate-800/80 rounded-full mb-4 sm:mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-sky-400 transition-all duration-150 rounded-full shadow-lg shadow-purple-500/30"
            style={{
              width: hidePhrase
                ? `${(hiddenWordCount / Math.max(1, targetWords.length)) * 100}%`
                : `${(typedIndex / Math.max(1, targetText.length)) * 100}%`,
            }}
          />
        </div>

        {/* ── HIDE MODE ── */}
        {hidePhrase ? (
          <div className="min-h-[160px] flex flex-col items-center justify-center gap-6">
            {/* Word-level display */}
            <div className="font-mono text-2xl sm:text-3xl leading-relaxed tracking-wide text-center flex flex-wrap items-center justify-center gap-x-3 gap-y-3">
              {targetWords.map((word, wi) => {
                const userTyped = inputParts[wi] ?? ''
                const isCommitted = wi < committedWordCount
                const isCurrent = wi === committedWordCount
                const isErrorWord = wi === errorWordIndex
                const isWordSpeaking = speakingWordIndex === wi
                const canSpeak = voiceSettings.clickToSpeakWord
                const arabicWord = getWordTranslation(word)
                const showArabic = voiceSettings.showArabicTranslation && Boolean(arabicWord)

                // Revealed / completed: show real word with coloring
                if (revealed || phraseJustFinished) {
                  const correct = isCommitted ? wordsMatch(inputParts[wi] ?? '', word) : false
                  return (
                    <span
                      key={wi}
                      onClick={(e) => {
                        if (canSpeak) {
                          e.preventDefault()
                          inputRef.current?.focus()
                          handleSpeakWord(word, wi)
                        }
                      }}
                      role={canSpeak ? 'button' : undefined}
                      tabIndex={canSpeak ? -1 : undefined}
                      title={canSpeak ? `Tap or click to hear "${word}"${arabicWord ? ` (${arabicWord})` : ''}` : undefined}
                      className={`group inline-flex items-center px-1.5 py-0.5 rounded transition-all select-none touch-manipulation ${
                        canSpeak ? 'cursor-pointer hover:bg-purple-500/20 active:scale-95' : ''
                      } ${
                        isWordSpeaking ? 'ring-2 ring-pink-400 bg-pink-500/25 scale-105' : ''
                      } ${
                        phraseJustFinished
                          ? 'text-emerald-400 font-bold'
                          : isCommitted
                          ? correct
                            ? 'text-emerald-400 font-bold'
                            : 'text-rose-400 font-bold bg-rose-500/15 ring-1 ring-rose-500/40'
                          : 'text-slate-400'
                      }`}
                    >
                      <span className="inline-flex items-center">
                        {word}
                        {isWordSpeaking && (
                          <span className="ml-1 inline-flex items-center text-pink-300 animate-pulse text-xs">
                            <Volume2 className="w-3.5 h-3.5 inline" />
                          </span>
                        )}
                      </span>
                    </span>
                  )
                }

                // Committed word: show what was typed, colored by correctness
                if (isCommitted) {
                  const correct = wordsMatch(userTyped, word)
                  return (
                    <span
                      key={wi}
                      onClick={(e) => {
                        if (canSpeak) {
                          e.preventDefault()
                          inputRef.current?.focus()
                          handleSpeakWord(word, wi)
                        }
                      }}
                      role={canSpeak ? 'button' : undefined}
                      tabIndex={canSpeak ? -1 : undefined}
                      title={canSpeak ? `Tap or click to hear "${word}"${arabicWord ? ` (${arabicWord})` : ''}` : undefined}
                      className={`group inline-flex items-center px-1.5 py-0.5 rounded font-bold transition-all select-none touch-manipulation ${
                        canSpeak ? 'cursor-pointer hover:bg-purple-500/20 active:scale-95' : ''
                      } ${
                        isWordSpeaking ? 'ring-2 ring-pink-400 bg-pink-500/25 scale-105' : ''
                      } ${
                        correct
                          ? 'text-emerald-400'
                          : 'text-rose-400 bg-rose-500/15 ring-1 ring-rose-500/40'
                      }`}
                    >
                      <span className="inline-flex items-center">
                        {userTyped}
                        {isWordSpeaking && (
                          <span className="ml-1 inline-flex items-center text-pink-300 animate-pulse text-xs">
                            <Volume2 className="w-3.5 h-3.5 inline" />
                          </span>
                        )}
                      </span>
                    </span>
                  )
                }

                // Current word being typed (with cursor underline)
                if (isCurrent) {
                  return (
                    <span
                      key={wi}
                      onClick={(e) => {
                        if (canSpeak) {
                          e.preventDefault()
                          inputRef.current?.focus()
                          handleSpeakWord(word, wi)
                        }
                      }}
                      role={canSpeak ? 'button' : undefined}
                      tabIndex={canSpeak ? -1 : undefined}
                      title={canSpeak ? `Tap or click to hear "${word}"` : undefined}
                      className={`relative px-2 py-0.5 rounded-lg font-medium transition-all select-none touch-manipulation ${
                        canSpeak ? 'cursor-pointer hover:ring-purple-400/50' : ''
                      } ${
                        isWordSpeaking ? 'ring-2 ring-pink-400 bg-pink-500/25 scale-105' : ''
                      } ${
                        isErrorWord
                          ? 'bg-rose-500/20 ring-2 ring-rose-500 text-rose-300 animate-wiggle'
                          : 'bg-indigo-500/20 ring-2 ring-indigo-400 text-white'
                      }`}
                    >
                      {/* Blinking caret */}
                      <span className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-caret" />
                      {userTyped || (
                        <span className="opacity-30 text-slate-400">
                          {'_'.repeat(Math.min(word.length, 6))}
                        </span>
                      )}
                      {isWordSpeaking && (
                        <span className="ml-1 inline-flex items-center text-pink-300 animate-pulse text-xs">
                          <Volume2 className="w-3 h-3 inline" />
                        </span>
                      )}
                    </span>
                  )
                }

                // Future hidden word: dots
                return (
                  <span
                    key={wi}
                    onClick={(e) => {
                      if (canSpeak) {
                        e.preventDefault()
                        inputRef.current?.focus()
                        handleSpeakWord(word, wi)
                      }
                    }}
                    role={canSpeak ? 'button' : undefined}
                    tabIndex={canSpeak ? -1 : undefined}
                    title={canSpeak ? `Tap or click to hear this word` : undefined}
                    className={`text-slate-700 font-medium tracking-widest select-none px-1.5 py-0.5 rounded transition-all touch-manipulation ${
                      canSpeak ? 'cursor-pointer hover:text-slate-400 hover:bg-slate-800/40' : ''
                    } ${
                      isWordSpeaking ? 'text-pink-300 ring-2 ring-pink-400 bg-pink-500/25 scale-105' : ''
                    }`}
                  >
                    {'•'.repeat(Math.min(word.length, 8))}
                    {isWordSpeaking && (
                      <span className="ml-1 inline-flex items-center text-pink-300 animate-pulse text-xs">
                        <Volume2 className="w-3 h-3 inline" />
                      </span>
                    )}
                  </span>
                )
              })}
            </div>

            {/* Free-type input */}
            <div className="w-full max-w-2xl">
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                value={hiddenInput}
                onChange={handleHiddenInputChange}
                onKeyDown={handleHiddenKeyDown}
                disabled={phraseJustFinished}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={
                  phraseJustFinished
                    ? '✓ Completed!'
                    : errorWordIndex !== -1
                    ? '← Backspace to fix wrong word…'
                    : 'Type what you hear… Space after each word'
                }
                className={`w-full px-4 sm:px-5 py-3 sm:py-4 rounded-2xl font-mono text-base sm:text-lg bg-slate-800/80 border-2 text-white placeholder-slate-600 outline-none transition-all ${
                  errorWordIndex !== -1
                    ? 'border-rose-500 shadow-rose-500/20 shadow-lg'
                    : phraseJustFinished
                    ? 'border-emerald-500 shadow-emerald-500/20 shadow-lg'
                    : 'border-slate-700 focus:border-indigo-500 focus:shadow-indigo-500/15 focus:shadow-lg'
                }`}
                style={{ fontSize: '16px' }}
              />
            </div>

            {/* Peek button */}
            {!phraseJustFinished && (
              <button
                onMouseDown={() => setRevealed(true)}
                onMouseUp={() => setRevealed(false)}
                onMouseLeave={() => setRevealed(false)}
                onTouchStart={() => setRevealed(true)}
                onTouchEnd={() => setRevealed(false)}
                className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-600 transition-all"
              >
                <Eye className="w-3.5 h-3.5" />
                Hold to peek at phrase
              </button>
            )}
          </div>
        ) : (
          /* ── NORMAL MODE ── */
          <div
            className="min-h-[120px] sm:min-h-[140px] flex flex-col items-center justify-center p-2 sm:p-4 gap-3"
            onPointerDown={() => {
              // On touch devices, tapping the phrase area focuses the hidden input
              if (mobileInputRef.current && !phraseJustFinished) {
                mobileInputRef.current.focus()
              }
            }}
          >
            {/* Mobile keyboard hint — shown only when keyboard is not active */}
            {!mobileKeyboardActive && !phraseJustFinished && (
              <div className="tap-to-type-btn items-center gap-1.5 text-xs text-slate-500 bg-slate-900/60 border border-slate-700/50 px-3 py-1.5 rounded-full pointer-events-none">
                <Keyboard className="w-3.5 h-3.5 text-purple-400" />
                <span>Tap here to open keyboard</span>
              </div>
            )}
            <div className="font-mono text-xl sm:text-3xl md:text-4xl leading-relaxed tracking-wide text-center flex flex-wrap items-center justify-center gap-y-3">
              {tokens.map((token, tokenIdx) => {
                if (token.isSpace) {
                  return (
                    <span key={`token-${tokenIdx}`} className="inline-block whitespace-pre">
                      {token.text.split('').map((char, i) => {
                        const index = token.startIndex + i
                        const isTyped = index < typedIndex
                        const isAutoPunct = isPunct(char) && index >= typedIndex && index < effectiveIdx
                        const isCurrent = index === effectiveIdx

                        if (isTyped || isAutoPunct) {
                          return (
                            <span
                              key={index}
                              className={`font-bold inline-block transform scale-100 ${
                                isAutoPunct
                                  ? 'text-slate-400'
                                  : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                              }`}
                            >
                              {char === ' ' ? '\u00A0' : char}
                            </span>
                          )
                        }

                        if (isCurrent) {
                          return (
                            <span
                              key={index}
                              className={`relative font-medium inline-block mx-[1px] px-[3px] rounded-lg transition-all ${
                                hasError
                                  ? 'bg-rose-500/30 text-rose-300 ring-2 ring-rose-500 animate-wiggle'
                                  : 'bg-indigo-500/25 text-white ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/30'
                              }`}
                            >
                              <span className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-caret" />
                              <span className="text-slate-300 px-1 text-lg font-sans font-semibold">␣</span>
                            </span>
                          )
                        }

                        return (
                          <span
                            key={index}
                            className="text-slate-600/60 font-medium inline-block transition-opacity"
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        )
                      })}
                    </span>
                  )
                }

                const isWordSpeaking = speakingWordIndex === token.wordIndex
                const canSpeak = voiceSettings.clickToSpeakWord && Boolean(token.cleanWord)
                const showArabic = voiceSettings.showArabicTranslation && Boolean(token.arabicTranslation)

                return (
                  <span
                    key={`token-${tokenIdx}`}
                    onClick={(e) => {
                      if (canSpeak && token.cleanWord) {
                        e.preventDefault()
                        e.stopPropagation()
                        handleSpeakWord(token.cleanWord, token.wordIndex!)
                      }
                    }}
                    role={canSpeak ? 'button' : undefined}
                    tabIndex={canSpeak ? -1 : undefined}
                    title={
                      token.cleanWord
                        ? `${token.cleanWord}${token.arabicTranslation ? ` (${token.arabicTranslation})` : ''} - Tap to hear`
                        : undefined
                    }
                    className={`group relative inline-flex items-center flex-nowrap rounded-xl px-1.5 py-0.5 mx-0.5 transition-all select-none touch-manipulation ${
                      canSpeak
                        ? 'cursor-pointer hover:bg-purple-500/20 hover:ring-1 hover:ring-purple-400/40 active:scale-95'
                        : ''
                    } ${
                      isWordSpeaking
                        ? 'ring-2 ring-pink-400 bg-pink-500/25 shadow-lg shadow-pink-500/25 scale-105 z-10'
                        : ''
                    }`}
                  >
                    <span className="inline-flex items-center flex-nowrap">
                      {token.text.split('').map((char, i) => {
                        const index = token.startIndex + i
                        const isTyped = index < typedIndex
                        const isAutoPunct = isPunct(char) && index >= typedIndex && index < effectiveIdx
                        const isCurrent = index === effectiveIdx
                        const isSpace = char === ' '

                        if (isTyped || isAutoPunct) {
                          return (
                            <span
                              key={index}
                              className={`font-bold inline-block transform scale-100 ${
                                isAutoPunct
                                  ? 'text-slate-400'
                                  : 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]'
                              }`}
                            >
                              {isSpace ? '\u00A0' : char}
                            </span>
                          )
                        }

                        if (isCurrent) {
                          return (
                            <span
                              key={index}
                              className={`relative font-medium inline-block mx-[1px] px-[3px] rounded-lg transition-all ${
                                hasError
                                  ? 'bg-rose-500/30 text-rose-300 ring-2 ring-rose-500 animate-wiggle'
                                  : 'bg-indigo-500/25 text-white ring-2 ring-indigo-400 shadow-xl shadow-indigo-500/30'
                              }`}
                            >
                              <span className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full animate-caret" />
                              {isSpace ? (
                                <span className="text-slate-300 px-1 text-lg font-sans font-semibold">␣</span>
                              ) : (
                                char
                              )}
                            </span>
                          )
                        }

                        return (
                          <span
                            key={index}
                            className="text-slate-600/60 font-medium inline-block transition-opacity"
                          >
                            {isSpace ? '\u00A0' : char}
                          </span>
                        )
                      })}
                      {isWordSpeaking && (
                        <span className="ml-1 inline-flex items-center text-pink-300 animate-pulse text-xs">
                          <Volume2 className="w-3.5 h-3.5 inline" />
                        </span>
                      )}
                    </span>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {/* Arabic Phrase Translation — below the English phrase */}
        {currentPhraseArabic && (
          <div className="mt-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-400/80 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                <Languages className="w-3 h-3" />
                Arabic Translation
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-amber-500/20 to-transparent" />
            </div>
            <div
              dir="rtl"
              className="w-full px-4 sm:px-5 py-3 sm:py-4 rounded-2xl bg-gradient-to-br from-amber-950/30 via-slate-900/80 to-slate-900/90 border border-amber-500/25 shadow-inner shadow-amber-900/10"
            >
              <p className="text-amber-100 font-semibold text-lg sm:text-xl leading-relaxed select-text tracking-wide font-arabic">
                {currentPhraseArabic}
              </p>
            </div>
          </div>
        )}

        {/* Footer Feedback */}
        <div className="mt-5 sm:mt-10 pt-4 sm:pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3 text-xs">
          {hidePhrase ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Words typed:</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-purple-300 font-mono font-bold text-sm">
                {hiddenWordCount} / {targetWords.length}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 hidden sm:inline">Next Key:</span>
              {activeChar ? (
                <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-purple-300 font-mono font-bold flex items-center gap-1.5 shadow-sm text-sm">
                  {isTargetSpace ? (
                    <span>SPACEBAR ␣</span>
                  ) : activeChar === activeChar.toUpperCase() && activeChar.match(/[A-Z]/) ? (
                    <span><span className="hidden sm:inline">Shift + </span>{activeChar.toLowerCase()}</span>
                  ) : (
                    <span>{activeChar}</span>
                  )}
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> Phrase Complete!
                </span>
              )}
            </div>
          )}

          {/* Error banner */}
          {(hasError || errorWordIndex !== -1) && (
            <div className="flex items-center gap-1.5 text-rose-400 bg-rose-500/10 px-3.5 py-1.5 rounded-full border border-rose-500/25 animate-pop text-center">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>
                {hidePhrase
                  ? `Wrong word! Press ← Backspace to fix.`
                  : `Wrong key ${lastWrongChar ? `[${lastWrongChar}]` : ''}! Retry.`}
              </span>
            </div>
          )}

          {!hasError && errorWordIndex === -1 && !phraseJustFinished && (
            <div className="text-slate-400 flex items-center gap-1.5">
              <Headphones className="w-4 h-4 text-sky-400 flex-shrink-0" />
              <span>
                {voiceSettings.clickToSpeakWord ? (
                  <>
                    {hidePhrase ? 'Type what you hear' : (
                      <>
                        <span className="hidden sm:inline">Type on your PC keyboard</span>
                        <span className="sm:hidden">Tap phrase area to type</span>
                      </>
                    )}{' '}•{' '}
                    <span className="text-purple-300 font-medium">Tap any word to hear it</span>
                  </>
                ) : hidePhrase ? (
                  'Type what you hear • Space after each word'
                ) : (
                  <>
                    <span className="hidden sm:inline">Type on your keyboard • Every key has audio</span>
                    <span className="sm:hidden">Tap the phrase area to open keyboard</span>
                  </>
                )}
              </span>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
