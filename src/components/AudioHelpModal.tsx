import React from 'react'
import { X, Play, Music, Sparkles, Award } from 'lucide-react'
import { soundEffects } from '../utils/audio'
import { speechEngine } from '../utils/speech'

interface AudioHelpModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AudioHelpModal: React.FC<AudioHelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null

  const soundRows = [
    {
      event: 'Correct character',
      icon: '🔉',
      soundTitle: 'Soft key click',
      desc: 'Gentle, tactile mechanical key tap that confirms correct keypress.',
      action: () => soundEffects.playCorrectClick(),
      badgeColor: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
    },
    {
      event: 'Wrong character',
      icon: '❌',
      soundTitle: 'Short error sound',
      desc: 'Low dual-tone buzz that immediately halts typing until correct key is pressed.',
      action: () => soundEffects.playWrongSound(),
      badgeColor: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
    },
    {
      event: 'Space',
      icon: '🔉',
      soundTitle: 'Slightly deeper click',
      desc: 'Resonant, deeper mechanical spacebar "thock".',
      action: () => soundEffects.playSpaceClick(),
      badgeColor: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
    },
    {
      event: 'Backspace / retry',
      icon: '↩️',
      soundTitle: 'Different click',
      desc: 'Crisp downward pitch tick when deleting or resetting characters.',
      action: () => soundEffects.playBackspaceClick(),
      badgeColor: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
    },
    {
      event: 'Phrase completed',
      icon: '✨',
      soundTitle: 'Success sound',
      desc: 'Sparkling ascending major chime as you finish each sentence.',
      action: () => soundEffects.playPhraseComplete(),
      badgeColor: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
    },
    {
      event: 'All phrases completed',
      icon: '🏆',
      soundTitle: 'Completion sound',
      desc: 'Triumphant celebratory victory fanfare at the end of the script.',
      action: () => soundEffects.playGameComplete(),
      badgeColor: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300',
    },
    {
      event: 'Tap / Click on any word',
      icon: '🗣️',
      soundTitle: 'Word pronunciation',
      desc: 'Touch or click any word in the phrase to hear clear English speech for that specific word.',
      action: () => speechEngine.speakWord('Pronunciation'),
      badgeColor: 'border-pink-500/30 bg-pink-500/10 text-pink-300',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-purple-500/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Audio Feedback System</h2>
              <p className="text-xs text-slate-400">Interactive sound cues designed for auditory muscle memory</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound List with Interactive Previews */}
        <div className="p-6 divide-y divide-slate-800/80 max-h-[65vh] overflow-y-auto">
          {soundRows.map((item, idx) => (
            <div key={idx} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">{item.event}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${item.badgeColor}`}>
                    {item.icon} {item.soundTitle}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
              <button
                onClick={item.action}
                className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 hover:border-purple-500 transition-all shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Test</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Synthesized in real-time via Web Audio API
          </p>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  )
}
