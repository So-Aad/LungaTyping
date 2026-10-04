import React, { useEffect } from 'react'
import confetti from 'canvas-confetti'
import { Trophy, RotateCcw, ArrowRight, Volume2, CheckCircle2, AlertCircle, Clock, Zap, Target } from 'lucide-react'
import { PhraseItem, TypingStats } from '../types'
import { speechEngine } from '../utils/speech'

interface StatsModalProps {
  isOpen: boolean
  stats: TypingStats
  phrases: PhraseItem[]
  scriptTitle: string
  onRetry: () => void
  onChangeScript: () => void
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  stats,
  phrases,
  scriptTitle,
  onRetry,
  onChangeScript,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire celebratory confetti!
      const duration = 2.5 * 1000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 }

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now()
        if (timeLeft <= 0) {
          return clearInterval(interval)
        }
        const particleCount = 50 * (timeLeft / duration)
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ['#38bdf8', '#4ade80', '#f43f5e', '#a855f7', '#facc15'],
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ['#38bdf8', '#4ade80', '#f43f5e', '#a855f7', '#facc15'],
        })
      }, 250)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Calculate elapsed time in seconds
  const totalSeconds =
    stats.startTime && stats.endTime
      ? Math.max(1, Math.round((stats.endTime - stats.startTime) / 1000))
      : 1

  const minutes = Math.floor(totalSeconds / 60)
  const remainingSeconds = totalSeconds % 60
  const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`

  // Calculate Accuracy
  const totalAttempts = stats.correctChars + stats.mistakes
  const accuracy = totalAttempts > 0 ? Math.round((stats.correctChars / totalAttempts) * 100) : 100

  // Calculate WPM (standard: 5 characters per word)
  const wordsTyped = stats.correctChars / 5
  const wpm = Math.round((wordsTyped / totalSeconds) * 60)
  const cpm = Math.round((stats.correctChars / totalSeconds) * 60)

  // Feedback grade & title
  const getFeedback = () => {
    if (accuracy >= 98) {
      return {
        title: 'Masterful Listener & Typist! 🌟',
        desc: 'Incredible auditory precision! You typed with near-flawless accuracy.',
        badge: 'Top Tier 🏆',
        color: 'text-amber-400',
      }
    } else if (accuracy >= 90) {
      return {
        title: 'Great Listening Ear! 🎯',
        desc: 'Strong typing speed and excellent English listening comprehension.',
        badge: 'Sharp Ear 🎧',
        color: 'text-emerald-400',
      }
    } else {
      return {
        title: 'Solid Practice Session! 💪',
        desc: 'Good persistence! Regular listening and typing will rapidly build your muscle memory.',
        badge: 'Growing Typist 🚀',
        color: 'text-sky-400',
      }
    }
  }

  const feedback = getFeedback()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col max-h-[90vh]">
        {/* Hero Header */}
        <div className="px-8 pt-8 pb-6 text-center bg-gradient-to-b from-purple-950/40 to-slate-900 border-b border-slate-800 relative">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 shadow-xl shadow-amber-500/20 mb-3 animate-bounce">
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {feedback.title}
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-md mx-auto">{feedback.desc}</p>
          <div className="mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/40">
              Completed: <span className="text-white font-bold">{scriptTitle}</span>
            </span>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="p-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/40 border-b border-slate-800">
          {/* Accuracy */}
          <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center text-emerald-400 mb-1">
              <Target className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{accuracy}%</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Accuracy</div>
          </div>

          {/* Speed (WPM) */}
          <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center text-sky-400 mb-1">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{wpm}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">WPM ({cpm} CPM)</div>
          </div>

          {/* Time Taken */}
          <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center text-amber-400 mb-1">
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{formattedTime}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Time Taken</div>
          </div>

          {/* Mistakes */}
          <div className="bg-slate-850/80 border border-slate-700/60 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center text-rose-400 mb-1">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono">{stats.mistakes}</div>
            <div className="text-xs text-slate-400 font-medium mt-0.5">Mistakes</div>
          </div>
        </div>

        {/* Sentence Review List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
            <span>PRACTICED SENTENCES ({phrases.length})</span>
            <span>CLICK TO RE-LISTEN</span>
          </div>

          <div className="space-y-2">
            {phrases.map((phrase, idx) => {
              const phraseErrors = stats.phraseMistakes[idx] || 0
              return (
                <div
                  key={phrase.id}
                  className="p-3.5 rounded-xl bg-slate-850/60 border border-slate-800 flex flex-col gap-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className="text-xs font-mono font-bold text-slate-500 mt-0.5">
                        #{idx + 1}
                      </span>
                      <p className="text-sm text-slate-200 leading-snug">{phrase.text}</p>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {phraseErrors === 0 ? (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Perfect
                        </span>
                      ) : (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium flex items-center gap-1">
                          {phraseErrors} {phraseErrors === 1 ? 'retry' : 'retries'}
                        </span>
                      )}

                      <button
                        onClick={() => speechEngine.speak(phrase.text)}
                        title="Listen again"
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-400 hover:text-white transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {phrase.arabicTranslation && (
                    <div dir="rtl" className="pr-6 text-xs text-amber-300/80 font-medium">
                      {phrase.arabicTranslation}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onRetry}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all border border-slate-700 flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Practice Again</span>
          </button>

          <button
            onClick={onChangeScript}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2"
          >
            <span>Next Script</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
