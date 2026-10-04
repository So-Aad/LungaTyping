import React from 'react'
import { Volume2, VolumeX, Sliders, FileText, RotateCcw, Headphones, HelpCircle } from 'lucide-react'

interface NavbarProps {
  scriptTitle: string
  scriptLevel?: string
  currentPhraseIndex: number
  totalPhrases: number
  soundEnabled: boolean
  onToggleSound: () => void
  onOpenSettings: () => void
  onOpenScriptModal: () => void
  onOpenAudioHelp: () => void
  onReset: () => void
  speechRate: number
}

export const Navbar: React.FC<NavbarProps> = ({
  scriptTitle,
  scriptLevel,
  currentPhraseIndex,
  totalPhrases,
  soundEnabled,
  onToggleSound,
  onOpenSettings,
  onOpenScriptModal,
  onOpenAudioHelp,
  onReset,
  speechRate,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-pink-500 to-amber-400 p-[2px] shadow-lg shadow-purple-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Headphones className="w-5 h-5 text-pink-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                Lingua<span className="text-gradient-candy">Type</span>
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                English Lab
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">Listen & Type Interactive English Tutor</p>
          </div>
        </div>

        {/* Current Script Badge */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-full px-3.5 py-1.5 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {scriptLevel && (
            <span className="font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              {scriptLevel}
            </span>
          )}
          <span className="text-slate-400">Script:</span>
          <span className="font-semibold text-white truncate max-w-[180px]">{scriptTitle}</span>
          <span className="text-slate-500">|</span>
          <span className="text-purple-400 font-mono font-medium">
            {totalPhrases > 0 ? `${currentPhraseIndex + 1}/${totalPhrases}` : '0/0'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Legend & Sounds Guide */}
          <button
            onClick={onOpenAudioHelp}
            title="Keyboard Sound Legend"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-amber-400 transition-all border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="hidden lg:inline">Audio Guide</span>
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute keyboard sound effects' : 'Unmute keyboard sound effects'}
            className={`p-2 rounded-lg transition-all border ${
              soundEnabled
                ? 'bg-purple-900/30 border-purple-500/40 text-purple-300 hover:bg-purple-900/50'
                : 'bg-slate-800/70 border-slate-700/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-rose-400" />}
          </button>

          {/* Voice Settings */}
          <button
            onClick={onOpenSettings}
            title="Voice & Speech Settings"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/60 flex items-center gap-1.5 text-xs font-medium"
          >
            <Sliders className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline font-mono text-[11px] text-sky-300">{speechRate}x</span>
          </button>

          {/* Change Script Button */}
          <button
            onClick={onOpenScriptModal}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 border border-indigo-400/30"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Scripts</span>
          </button>

          {/* Reset / Restart */}
          <button
            onClick={onReset}
            title="Restart current script from beginning"
            className="p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition-all border border-slate-700/60"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
