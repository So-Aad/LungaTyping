import React, { useState, useEffect } from 'react'
import { X, Volume2, Mic, Play, RotateCcw, Check } from 'lucide-react'
import { speechEngine } from '../utils/speech'
import { soundEffects } from '../utils/audio'
import { VoiceSettings } from '../types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  settings: VoiceSettings
  onUpdateSettings: (newSettings: Partial<VoiceSettings>) => void
  soundVolume: number
  onUpdateSoundVolume: (volume: number) => void
  caseSensitive: boolean
  onToggleCaseSensitive: (val: boolean) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  soundVolume,
  onUpdateSoundVolume,
  caseSensitive,
  onToggleCaseSensitive,
}) => {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isTestingVoice, setIsTestingVoice] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const v = speechEngine.getEnglishVoices()
      setVoices(v)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleTestVoice = () => {
    setIsTestingVoice(true)
    speechEngine.speak(
      'Hello! Listening carefully is the first step to mastering English pronunciation.',
      () => setIsTestingVoice(true),
      () => setIsTestingVoice(false),
      () => setIsTestingVoice(false)
    )
  }

  const handleVoiceChange = (uri: string) => {
    speechEngine.setVoiceByURI(uri)
    onUpdateSettings({ voiceURI: uri })
  }

  const handleRateChange = (rate: number) => {
    speechEngine.setRate(rate)
    onUpdateSettings({ rate })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-indigo-500/10">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Voice & Audio Settings</h2>
              <p className="text-xs text-slate-400">Configure speech rate, English voice accent, and volume</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* English Voice Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">English Voice</label>
              <button
                onClick={handleTestVoice}
                disabled={isTestingVoice}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-all"
              >
                <Play className={`w-3 h-3 ${isTestingVoice ? 'animate-pulse text-indigo-400' : ''}`} />
                <span>{isTestingVoice ? 'Speaking...' : 'Test Voice'}</span>
              </button>
            </div>
            <select
              value={settings.voiceURI}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {voices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Select your preferred English accent (US, UK, Australia, etc.).
            </p>
          </div>

          {/* Speech Rate (Slow & Clear) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200">
                Speech Speed: <span className="text-indigo-400 font-mono">{settings.rate.toFixed(2)}x</span>
              </label>
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                {settings.rate <= 0.8 ? 'Slow & Clear 🎧' : settings.rate <= 1.0 ? 'Natural' : 'Fast'}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.2"
              step="0.05"
              value={settings.rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <div className="flex items-center gap-2">
              {[
                { label: '0.65x Extra Slow', val: 0.65 },
                { label: '0.80x Slow (Default)', val: 0.8 },
                { label: '1.00x Normal', val: 1.0 },
              ].map((btn) => (
                <button
                  key={btn.val}
                  onClick={() => handleRateChange(btn.val)}
                  className={`px-2.5 py-1 text-xs rounded-lg border transition-all ${
                    Math.abs(settings.rate - btn.val) < 0.01
                      ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300 font-semibold'
                      : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          {/* Keyboard Audio Effects Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-emerald-400" />
                Keyboard Click Volume
              </label>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {Math.round(soundVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={soundVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value)
                onUpdateSoundVolume(vol)
                soundEffects.setVolume(vol)
                soundEffects.playCorrectClick()
              }}
              className="w-full accent-emerald-500 cursor-pointer"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Auto Play Audio */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-200">Auto-speak new phrases</p>
                <p className="text-xs text-slate-500">Automatically pronounce the sentence when moving to it</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ autoPlay: !settings.autoPlay })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.autoPlay ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.autoPlay ? 'left-5.5 transform translate-x-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Click / Touch Word to Read Aloud */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-200">Tap / Click word to read aloud</p>
                <p className="text-xs text-slate-500">Touch or click any word in a phrase to hear it pronounced</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ clickToSpeakWord: !settings.clickToSpeakWord })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.clickToSpeakWord ? 'bg-indigo-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.clickToSpeakWord ? 'left-5.5 transform translate-x-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Arabic Translation Toggle */}
            <div className="flex items-center justify-between py-1">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-200">Arabic Translations (ترجمة)</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    العربية
                  </span>
                </div>
                <p className="text-xs text-slate-500">Display Arabic translation for every phrase and word</p>
              </div>
              <button
                onClick={() => onUpdateSettings({ showArabicTranslation: !settings.showArabicTranslation })}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  settings.showArabicTranslation ? 'bg-amber-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    settings.showArabicTranslation ? 'left-5.5 transform translate-x-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Case Sensitivity */}
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-slate-200">Strict Case Matching</p>
                <p className="text-xs text-slate-500">Require exact uppercase / lowercase typing</p>
              </div>
              <button
                onClick={() => onToggleCaseSensitive(!caseSensitive)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  caseSensitive ? 'bg-purple-600' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${
                    caseSensitive ? 'left-5.5 transform translate-x-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm transition-all shadow-md shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
