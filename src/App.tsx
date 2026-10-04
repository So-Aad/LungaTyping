import React, { useState, useEffect } from 'react'
import { Navbar } from './components/Navbar'
import { TypingArena } from './components/TypingArena'
import { ScriptModal } from './components/ScriptModal'
import { SettingsModal } from './components/SettingsModal'
import { StatsModal } from './components/StatsModal'
import { AudioHelpModal } from './components/AudioHelpModal'
import { PRESET_SCRIPTS, ALL_CEFR_LEVELS, CEFR_LEVELS_CONFIG } from './data/presetScripts'
import { PhraseItem, ScriptPreset, TypingStats, VoiceSettings, CEFRLevel } from './types'
import { parseScriptToPhrases } from './utils/textParser'
import { soundEffects } from './utils/audio'
import { speechEngine } from './utils/speech'
import { Headphones, Sparkles, Volume2, Target, Award, BookOpen } from 'lucide-react'

export function App() {
  const [currentScriptTitle, setCurrentScriptTitle] = useState<string>(PRESET_SCRIPTS[0].title)
  const [currentScriptLevel, setCurrentScriptLevel] = useState<string>(PRESET_SCRIPTS[0].level)
  const [quickLevel, setQuickLevel] = useState<CEFRLevel | 'ALL'>('ALL')
  const [phrases, setPhrases] = useState<PhraseItem[]>(() =>
    parseScriptToPhrases(PRESET_SCRIPTS[0].content)
  )
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(0)

  // Audio & Voice state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
  const [soundVolume, setSoundVolume] = useState<number>(0.8)
  const [caseSensitive, setCaseSensitive] = useState<boolean>(true)
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    voiceURI: '',
    rate: 0.8, // Slow and clear by default as requested!
    pitch: 1.0,
    volume: 1.0,
    autoPlay: true,
    clickToSpeakWord: true,
    showArabicTranslation: true,
  })

  // Modals state
  const [isScriptModalOpen, setIsScriptModalOpen] = useState<boolean>(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false)
  const [isAudioHelpOpen, setIsAudioHelpOpen] = useState<boolean>(false)
  const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false)

  // Hide phrase (dictation) mode
  const [hidePhrase, setHidePhrase] = useState<boolean>(false)

  // Tracking stats
  const [stats, setStats] = useState<TypingStats>({
    totalCharsTyped: 0,
    correctChars: 0,
    mistakes: 0,
    startTime: null,
    endTime: null,
    phraseMistakes: {},
  })

  // Ensure speech settings are synced to speechEngine
  useEffect(() => {
    speechEngine.setRate(voiceSettings.rate)
    speechEngine.setPitch(voiceSettings.pitch)
    speechEngine.setVolume(voiceSettings.volume)
  }, [voiceSettings])

  // Sync sound effects enabled & volume
  const handleToggleSound = () => {
    const nextVal = !soundEnabled
    setSoundEnabled(nextVal)
    soundEffects.setEnabled(nextVal)
    if (nextVal) {
      soundEffects.playCorrectClick()
    }
  }

  const handleUpdateSoundVolume = (vol: number) => {
    setSoundVolume(vol)
    soundEffects.setVolume(vol)
  }

  // Handle correct character
  const handleRecordCorrectChar = () => {
    setStats((prev) => ({
      ...prev,
      correctChars: prev.correctChars + 1,
      totalCharsTyped: prev.totalCharsTyped + 1,
      startTime: prev.startTime ?? Date.now(),
    }))
  }

  // Handle mistake
  const handleRecordMistake = (phraseIdx: number) => {
    setStats((prev) => ({
      ...prev,
      mistakes: prev.mistakes + 1,
      totalCharsTyped: prev.totalCharsTyped + 1,
      startTime: prev.startTime ?? Date.now(),
      phraseMistakes: {
        ...prev.phraseMistakes,
        [phraseIdx]: (prev.phraseMistakes[phraseIdx] || 0) + 1,
      },
    }))
  }

  // Move to next phrase
  const handlePhraseCompleted = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex((prev) => prev + 1)
    }
  }

  // Finish session
  const handleAllCompleted = () => {
    setStats((prev) => ({
      ...prev,
      endTime: Date.now(),
    }))
    setIsStatsModalOpen(true)
  }

  // Reset entire session
  const handleResetSession = () => {
    speechEngine.stop()
    setCurrentPhraseIndex(0)
    setStats({
      totalCharsTyped: 0,
      correctChars: 0,
      mistakes: 0,
      startTime: null,
      endTime: null,
      phraseMistakes: {},
    })
  }

  // Choose preset
  const handleSelectPreset = (preset: ScriptPreset) => {
    speechEngine.stop()
    setCurrentScriptTitle(preset.title)
    setCurrentScriptLevel(preset.level)
    setPhrases(parseScriptToPhrases(preset.content))
    handleResetSession()
  }

  // Apply custom script
  const handleApplyCustomScript = (title: string, content: string) => {
    speechEngine.stop()
    setCurrentScriptTitle(title)
    setCurrentScriptLevel('Custom')
    setPhrases(parseScriptToPhrases(content))
    handleResetSession()
  }

  // Restart current phrase
  const handleRestartCurrentPhrase = () => {
    // Keep stats, reset just the phrase progression handled in TypingArena
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      {/* Top Navbar */}
      <Navbar
        scriptTitle={currentScriptTitle}
        scriptLevel={currentScriptLevel}
        currentPhraseIndex={currentPhraseIndex}
        totalPhrases={phrases.length}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenScriptModal={() => setIsScriptModalOpen(true)}
        onOpenAudioHelp={() => setIsAudioHelpOpen(true)}
        onReset={handleResetSession}
        speechRate={voiceSettings.rate}
      />

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-10 flex flex-col justify-between">
        {/* Hero Banner / Instructions */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span>Interactive Auditory Typing Method</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Listen carefully, then <span className="text-gradient-candy">type what you hear</span>
          </h2>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Type what you hear on your physical keyboard. If you make a mistake, typing halts
            instantly with error audio so you can listen and retry!
          </p>
        </div>

        {/* The Typing Arena */}
        <div className="my-auto py-2">
          {phrases.length > 0 ? (
            <TypingArena
              phrases={phrases}
              currentPhraseIndex={currentPhraseIndex}
              onPhraseCompleted={handlePhraseCompleted}
              onAllCompleted={handleAllCompleted}
              onRecordMistake={handleRecordMistake}
              onRecordCorrectChar={handleRecordCorrectChar}
              voiceSettings={voiceSettings}
              caseSensitive={caseSensitive}
              onRestartCurrentPhrase={handleRestartCurrentPhrase}
              hidePhrase={hidePhrase}
              onToggleHidePhrase={() => setHidePhrase((v) => !v)}
              onToggleClickToSpeakWord={() =>
                setVoiceSettings((prev) => ({
                  ...prev,
                  clickToSpeakWord: !prev.clickToSpeakWord,
                }))
              }
              onToggleArabicTranslation={() =>
                setVoiceSettings((prev) => ({
                  ...prev,
                  showArabicTranslation: !prev.showArabicTranslation,
                }))
              }
            />
          ) : (
            <div className="text-center p-12 bg-slate-900/60 rounded-3xl border border-slate-800">
              <p className="text-slate-400 mb-4">No phrases found in current script.</p>
              <button
                onClick={() => setIsScriptModalOpen(true)}
                className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-semibold"
              >
                Choose a Script
              </button>
            </div>
          )}
        </div>

        {/* Quick Lesson Switcher Bar */}
        <div className="mt-8 pt-6 border-t border-slate-900 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1.5 text-slate-300">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" /> CEFR LEVELS:
              </span>
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  onClick={() => setQuickLevel('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    quickLevel === 'ALL'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  All ({PRESET_SCRIPTS.length})
                </button>
                {ALL_CEFR_LEVELS.map((lvl) => {
                  const cfg = CEFR_LEVELS_CONFIG[lvl]
                  const isSelected = quickLevel === lvl
                  return (
                    <button
                      key={lvl}
                      onClick={() => setQuickLevel(lvl)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all border ${
                        isSelected
                          ? `${cfg.badgeClass} ring-1 ring-white/20 shadow-sm`
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  )
                })}
              </div>
            </div>

            <button
              onClick={() => setIsScriptModalOpen(true)}
              className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1 font-medium text-xs"
            >
              + All 18 lessons & custom script →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {(quickLevel === 'ALL'
              ? PRESET_SCRIPTS
              : PRESET_SCRIPTS.filter((p) => p.level === quickLevel)
            ).map((preset) => {
              const isActive = currentScriptTitle === preset.title
              const cfg = CEFR_LEVELS_CONFIG[preset.level]
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  title={`${preset.title} (${preset.level})`}
                  className={`px-3 py-2 rounded-xl text-xs font-medium text-left truncate flex items-center gap-2 border transition-all ${
                    isActive
                      ? 'bg-purple-950/60 border-purple-500/60 text-purple-200 shadow-md shadow-purple-500/10'
                      : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className="text-base flex-shrink-0">{preset.emoji}</span>
                  <div className="truncate flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className={`text-[9px] font-black px-1 rounded border ${cfg.badgeClass}`}>
                        {preset.level}
                      </span>
                      <span className="truncate text-slate-200">{preset.title}</span>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 px-4 text-center text-xs text-slate-500">
        <p>LinguaType • Real-time Speech Synthesis & Procedural Audio Feedback</p>
      </footer>

      {/* Modals */}
      <ScriptModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        currentScriptTitle={currentScriptTitle}
        onSelectPreset={handleSelectPreset}
        onApplyCustomScript={handleApplyCustomScript}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={voiceSettings}
        onUpdateSettings={(newVal) => setVoiceSettings((prev) => ({ ...prev, ...newVal }))}
        soundVolume={soundVolume}
        onUpdateSoundVolume={handleUpdateSoundVolume}
        caseSensitive={caseSensitive}
        onToggleCaseSensitive={setCaseSensitive}
      />

      <StatsModal
        isOpen={isStatsModalOpen}
        stats={stats}
        phrases={phrases}
        scriptTitle={currentScriptTitle}
        onRetry={() => {
          setIsStatsModalOpen(false)
          handleResetSession()
        }}
        onChangeScript={() => {
          setIsStatsModalOpen(false)
          setIsScriptModalOpen(true)
        }}
      />

      <AudioHelpModal
        isOpen={isAudioHelpOpen}
        onClose={() => setIsAudioHelpOpen(false)}
      />
    </div>
  )
}

export default App
