import React, { useState, useMemo } from 'react'
import { X, Sparkles, BookOpen, Edit3, ArrowRight, Check, Search, Layers } from 'lucide-react'
import { PRESET_SCRIPTS, CEFR_LEVELS_CONFIG, ALL_CEFR_LEVELS } from '../data/presetScripts'
import { ScriptPreset, CEFRLevel } from '../types'
import { parseScriptToPhrases } from '../utils/textParser'

interface ScriptModalProps {
  isOpen: boolean
  onClose: () => void
  currentScriptTitle: string
  onSelectPreset: (preset: ScriptPreset) => void
  onApplyCustomScript: (title: string, content: string) => void
}

export const ScriptModal: React.FC<ScriptModalProps> = ({
  isOpen,
  onClose,
  currentScriptTitle,
  onSelectPreset,
  onApplyCustomScript,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets')
  const [selectedLevel, setSelectedLevel] = useState<CEFRLevel | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [customContent, setCustomContent] = useState('')

  // Filter scripts based on level and search
  const filteredScripts = useMemo(() => {
    return PRESET_SCRIPTS.filter((script) => {
      const matchesLevel = selectedLevel === 'ALL' || script.level === selectedLevel
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        script.title.toLowerCase().includes(q) ||
        script.description.toLowerCase().includes(q) ||
        script.category.toLowerCase().includes(q) ||
        script.level.toLowerCase().includes(q)
      return matchesLevel && matchesSearch
    })
  }, [selectedLevel, searchQuery])

  // Group scripts by CEFR level
  const scriptsByLevel = useMemo(() => {
    const map = new Map<CEFRLevel, ScriptPreset[]>()
    ALL_CEFR_LEVELS.forEach((lvl) => map.set(lvl, []))
    filteredScripts.forEach((script) => {
      const arr = map.get(script.level)
      if (arr) arr.push(script)
    })
    return map
  }, [filteredScripts])

  if (!isOpen) return null

  const phraseCount = customContent.trim() ? parseScriptToPhrases(customContent).length : 0

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!customContent.trim()) return

    const title = customTitle.trim() || 'My Custom Script'
    onApplyCustomScript(title, customContent)
    onClose()
  }

  const handlePresetClick = (preset: ScriptPreset) => {
    onSelectPreset(preset)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl shadow-indigo-500/10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-850">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">English Practice Scripts</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  CEFR A1 → C2
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Choose a structured lesson by proficiency level or create your own custom dialogue
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs & Search / Filter Controls */}
        <div className="border-b border-slate-800 bg-slate-950/50 px-6 pt-3 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Main Tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('presets')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'presets'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Curated Levels ({PRESET_SCRIPTS.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('custom')}
                className={`pb-3 px-3 text-sm font-semibold border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === 'custom'
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Custom User Script</span>
              </button>
            </div>

            {/* Quick search input (visible in presets tab) */}
            {activeTab === 'presets' && (
              <div className="relative pb-2 w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search topic or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/70 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            )}
          </div>

          {/* CEFR Level Filter Pills */}
          {activeTab === 'presets' && (
            <div className="flex items-center gap-1.5 pb-3 overflow-x-auto scrollbar-none">
              <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1 flex-shrink-0">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Levels:
              </span>
              <button
                onClick={() => setSelectedLevel('ALL')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all flex-shrink-0 border ${
                  selectedLevel === 'ALL'
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/25'
                    : 'bg-slate-850 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                All Levels ({PRESET_SCRIPTS.length})
              </button>
              {ALL_CEFR_LEVELS.map((lvl) => {
                const count = PRESET_SCRIPTS.filter((s) => s.level === lvl).length
                const config = CEFR_LEVELS_CONFIG[lvl]
                const isSelected = selectedLevel === lvl
                return (
                  <button
                    key={lvl}
                    onClick={() => setSelectedLevel(lvl)}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex-shrink-0 border flex items-center gap-1.5 ${
                      isSelected
                        ? `${config.badgeClass} ring-2 ${config.activeRing} shadow-md`
                        : 'bg-slate-850 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{lvl}</span>
                    <span className="text-[10px] font-normal opacity-75 hidden sm:inline">
                      {config.sublabel}
                    </span>
                    <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-800/80 text-slate-300">
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'presets' ? (
            filteredScripts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-base font-semibold">No scripts found</p>
                <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or level filter.</p>
                <button
                  onClick={() => {
                    setSelectedLevel('ALL')
                    setSearchQuery('')
                  }}
                  className="mt-3 px-4 py-1.5 rounded-xl bg-slate-800 text-indigo-400 text-xs font-semibold hover:bg-slate-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              // When specific level or search is active, show flat list. If ALL and no search, show grouped by level!
              ALL_CEFR_LEVELS.map((lvl) => {
                const scripts = scriptsByLevel.get(lvl) || []
                if (scripts.length === 0) return null
                const config = CEFR_LEVELS_CONFIG[lvl]

                return (
                  <div key={lvl} className="space-y-3">
                    {/* Level Group Header */}
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${config.badgeClass}`}>
                          {lvl}
                        </span>
                        <h3 className="text-sm font-bold text-white">{config.title}</h3>
                        <span className="text-xs text-slate-500 hidden sm:inline">• {config.description}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono font-medium">
                        {scripts.length} {scripts.length === 1 ? 'lesson' : 'lessons'}
                      </span>
                    </div>

                    {/* Scripts Grid for this Level */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                      {scripts.map((preset) => {
                        const isSelected = currentScriptTitle === preset.title
                        const phraseCountEst = parseScriptToPhrases(preset.content).length

                        return (
                          <div
                            key={preset.id}
                            onClick={() => handlePresetClick(preset)}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group ${
                              isSelected
                                ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500'
                                : 'bg-slate-850/60 border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-2xl p-1 bg-slate-800/80 rounded-xl border border-slate-700/60">
                                  {preset.emoji}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                                    {preset.level}
                                  </span>
                                  {isSelected && (
                                    <span className="p-0.5 rounded-full bg-indigo-500 text-white">
                                      <Check className="w-3 h-3" />
                                    </span>
                                  )}
                                </div>
                              </div>
                              <h4 className="font-bold text-white text-sm group-hover:text-indigo-300 transition-colors line-clamp-1">
                                {preset.title}
                              </h4>
                              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {preset.description}
                              </p>
                            </div>

                            <div className="mt-4 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                              <span className="text-slate-500 font-medium">
                                {phraseCountEst} phrases • {preset.category}
                              </span>
                              <span className="text-indigo-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                Start <ArrowRight className="w-3 h-3" />
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-1.5">
                  Lesson / Script Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. My Favorite English Movie Dialogue"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-200">
                    Paste Script or Sentences
                  </label>
                  <span className="text-xs font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    {phraseCount} {phraseCount === 1 ? 'phrase' : 'phrases'} detected
                  </span>
                </div>
                <textarea
                  rows={8}
                  placeholder={`Paste your English sentences here. For example:\n\nHello, how are you doing today?\nI am learning English with interactive typing.\nListening carefully improves pronunciation.`}
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 font-mono placeholder-slate-500 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  💡 Tips: You can paste paragraphs, dialogues, or lists. Sentences are automatically split by punctuation (. ! ?) and line breaks.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCustomContent('')
                    setCustomTitle('')
                  }}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm hover:bg-slate-800 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="submit"
                  disabled={phraseCount === 0}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Start Learning This Script</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
