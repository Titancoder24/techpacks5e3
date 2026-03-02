import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Brain, Save, Plus, Trash2, Star, ThumbsUp, ThumbsDown,
  Sparkles, Zap, Target, Palette
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  getTrainingProfile, saveTrainingProfile, createDefaultTrainingProfile,
  addFeedback, type TrainingProfile
} from '@/lib/gemini'
import { FABRIC_REGISTRY, PANTONE_COLORS, STITCH_TYPES } from '@/lib/garment-registry'

const BRAND_TONES = [
  'contemporary', 'streetwear', 'luxury', 'minimalist',
  'ethnic-fusion', 'avant-garde', 'classic', 'sportswear',
] as const

const PRICE_POINTS: TrainingProfile['pricePoint'][] = ['budget', 'mid-range', 'premium', 'luxury']

export default function AITrainingStudio() {
  const [profile, setProfile] = useState<TrainingProfile>(createDefaultTrainingProfile())

  useEffect(() => {
    const saved = getTrainingProfile()
    if (saved) setProfile(saved)
  }, [])

  const update = <K extends keyof TrainingProfile>(key: K, value: TrainingProfile[K]) => {
    setProfile(prev => ({ ...prev, [key]: value }))
  }

  const toggleFabric = (id: string) => {
    setProfile(prev => ({
      ...prev,
      preferredFabrics: prev.preferredFabrics.includes(id)
        ? prev.preferredFabrics.filter(f => f !== id)
        : [...prev.preferredFabrics, id],
    }))
  }

  const toggleColor = (code: string) => {
    setProfile(prev => ({
      ...prev,
      preferredColors: prev.preferredColors.includes(code)
        ? prev.preferredColors.filter(c => c !== code)
        : [...prev.preferredColors, code],
    }))
  }

  const toggleStitch = (stitch: string) => {
    setProfile(prev => ({
      ...prev,
      preferredStitchTypes: prev.preferredStitchTypes.includes(stitch)
        ? prev.preferredStitchTypes.filter(s => s !== stitch)
        : [...prev.preferredStitchTypes, stitch],
    }))
  }

  const addReferenceStyle = () => {
    setProfile(prev => ({
      ...prev,
      exampleStyles: [...prev.exampleStyles, { name: '', notes: '' }],
    }))
  }

  const updateStyle = (index: number, field: 'name' | 'notes', value: string) => {
    setProfile(prev => {
      const styles = [...prev.exampleStyles]
      styles[index] = { ...styles[index], [field]: value }
      return { ...prev, exampleStyles: styles }
    })
  }

  const removeStyle = (index: number) => {
    setProfile(prev => ({
      ...prev,
      exampleStyles: prev.exampleStyles.filter((_, i) => i !== index),
    }))
  }

  const clearFeedbackHistory = () => {
    setProfile(prev => ({ ...prev, feedbackHistory: [] }))
  }

  const handleSave = () => {
    saveTrainingProfile(profile)
    toast.success('Training profile saved successfully')
  }

  const feedbackSlice = profile.feedbackHistory.slice(-10).reverse()

  return (
    <div className="space-y-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        >
          <Brain className="w-8 h-8 text-purple-400" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">
            AI Training Studio
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Train your AI to create world-class tech packs tailored to your brand
          </p>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Sparkles, label: 'Fabric preferences', value: profile.preferredFabrics.length, color: 'text-blue-400' },
          { icon: Palette, label: 'Color preferences', value: profile.preferredColors.length, color: 'text-pink-400' },
          { icon: Star, label: 'Reference styles', value: profile.exampleStyles.length, color: 'text-amber-400' },
          { icon: Zap, label: 'Feedback entries', value: profile.feedbackHistory.length, color: 'text-green-400' },
        ].map(stat => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] border border-border/30 bg-card p-5 flex items-center gap-3"
          >
            <stat.icon className={cn('w-5 h-5', stat.color)} />
            <div>
              <p className="text-xl font-black italic tabular-nums">{stat.value}</p>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Two-column grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Brand Configuration */}
        <div className="space-y-6">
          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-5">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
              Brand Configuration
            </p>

            {/* Brand Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                Brand Name
              </label>
              <input
                type="text"
                value={profile.brandName}
                onChange={e => update('brandName', e.target.value)}
                placeholder="Enter your brand name"
                className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Brand Tone */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                Brand Tone
              </label>
              <select
                value={profile.brandTone}
                onChange={e => update('brandTone', e.target.value)}
                className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring appearance-none cursor-pointer"
              >
                {BRAND_TONES.map(tone => (
                  <option key={tone} value={tone}>
                    {tone.charAt(0).toUpperCase() + tone.slice(1).replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Market */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                Target Market
              </label>
              <input
                type="text"
                value={profile.targetMarket}
                onChange={e => update('targetMarket', e.target.value)}
                placeholder="e.g. Men & Women 18-35"
                className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>

            {/* Price Point */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                Price Point
              </label>
              <div className="flex flex-wrap gap-2">
                {PRICE_POINTS.map(pp => (
                  <button
                    key={pp}
                    onClick={() => update('pricePoint', pp)}
                    className={cn(
                      'rounded-2xl font-black uppercase tracking-widest text-[11px] px-4 py-2 transition-all active:scale-95 hover:scale-105',
                      profile.pricePoint === pp
                        ? 'bg-purple-600 text-white'
                        : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                    )}
                  >
                    {pp}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                Special Instructions
              </label>
              <textarea
                value={profile.specialInstructions}
                onChange={e => update('specialInstructions', e.target.value)}
                placeholder="e.g. Always use French seams, prefer natural fabrics, minimise trim count..."
                rows={5}
                className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              />
            </div>
          </div>
        </div>

        {/* RIGHT: Preferences */}
        <div className="space-y-6">
          {/* Preferred Fabrics */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
              Preferred Fabrics
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {FABRIC_REGISTRY.map(fabric => {
                const selected = profile.preferredFabrics.includes(fabric.id)
                return (
                  <button
                    key={fabric.id}
                    onClick={() => toggleFabric(fabric.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-3 py-2 text-left transition-all active:scale-95 hover:scale-[1.02]',
                      selected
                        ? 'bg-blue-600/20 border border-blue-500/40'
                        : 'bg-muted/20 border border-transparent hover:bg-muted/40'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        selected ? 'bg-blue-500 border-blue-500' : 'border-muted-foreground/30'
                      )}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{fabric.name}</p>
                      <p className="text-[10px] text-muted-foreground">{fabric.gsm} GSM</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preferred Colors */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
              Preferred Colors
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {PANTONE_COLORS.map(color => {
                const selected = profile.preferredColors.includes(color.code)
                return (
                  <button
                    key={color.code}
                    onClick={() => toggleColor(color.code)}
                    title={`${color.name} (${color.code})`}
                    className={cn(
                      'group relative rounded-2xl p-1.5 transition-all active:scale-90 hover:scale-110',
                      selected
                        ? 'ring-2 ring-purple-400 ring-offset-2 ring-offset-card'
                        : 'hover:ring-1 hover:ring-muted-foreground/30 hover:ring-offset-1 hover:ring-offset-card'
                    )}
                  >
                    <div
                      className="w-full aspect-square rounded-xl"
                      style={{ backgroundColor: color.hex }}
                    />
                    <p className="text-[8px] text-center mt-1 truncate text-muted-foreground leading-none">
                      {color.name}
                    </p>
                    {selected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Preferred Stitch Types */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
              Preferred Stitch Types
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STITCH_TYPES.map(stitch => {
                const selected = profile.preferredStitchTypes.includes(stitch)
                return (
                  <button
                    key={stitch}
                    onClick={() => toggleStitch(stitch)}
                    className={cn(
                      'flex items-center gap-2 rounded-2xl px-3 py-2 text-left transition-all active:scale-95 hover:scale-[1.02]',
                      selected
                        ? 'bg-green-600/20 border border-green-500/40'
                        : 'bg-muted/20 border border-transparent hover:bg-muted/40'
                    )}
                  >
                    <div
                      className={cn(
                        'w-4 h-4 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                        selected ? 'bg-green-500 border-green-500' : 'border-muted-foreground/30'
                      )}
                    >
                      {selected && (
                        <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs font-semibold">{stitch}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Example Styles ──────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-black italic uppercase tracking-tighter">
              Reference Styles
            </h2>
          </div>
          <button
            onClick={addReferenceStyle}
            className="rounded-2xl font-black uppercase tracking-widest text-[11px] bg-muted/30 hover:bg-muted/50 px-4 py-2 flex items-center gap-2 transition-all active:scale-95 hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Reference Style
          </button>
        </div>

        {profile.exampleStyles.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No reference styles yet. Add styles your brand admires to help the AI understand your aesthetic.
          </p>
        )}

        <div className="space-y-2">
          {profile.exampleStyles.map((style, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-start gap-3 rounded-2xl bg-muted/15 p-3"
            >
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={style.name}
                  onChange={e => updateStyle(i, 'name', e.target.value)}
                  placeholder="Style name"
                  className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <input
                  type="text"
                  value={style.notes}
                  onChange={e => updateStyle(i, 'notes', e.target.value)}
                  placeholder="Notes (e.g. oversized fit, raw hem, drop shoulder)"
                  className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <button
                onClick={() => removeStyle(i)}
                className="rounded-2xl p-2 text-red-400 hover:bg-red-500/15 transition-all active:scale-95 hover:scale-105 flex-shrink-0 mt-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Feedback History ─────────────────────────────────────────── */}
      <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <h2 className="text-lg font-black italic uppercase tracking-tighter">
              Feedback History
            </h2>
          </div>
          {profile.feedbackHistory.length > 0 && (
            <button
              onClick={clearFeedbackHistory}
              className="rounded-2xl font-black uppercase tracking-widest text-[11px] text-red-400 hover:bg-red-500/15 px-4 py-2 flex items-center gap-2 transition-all active:scale-95 hover:scale-105"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear Feedback History
            </button>
          )}
        </div>

        {feedbackSlice.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No feedback recorded yet. Rate AI-generated outputs to help the model learn your preferences.
          </p>
        )}

        <div className="space-y-2">
          {feedbackSlice.map((entry, i) => (
            <motion.div
              key={`${entry.timestamp}-${i}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-start gap-3 rounded-2xl bg-muted/15 p-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                {entry.rating === 'good' ? (
                  <ThumbsUp className="w-4 h-4 text-green-400" />
                ) : (
                  <ThumbsDown className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground leading-relaxed">{entry.note}</p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Save Button ──────────────────────────────────────────────── */}
      <motion.button
        onClick={handleSave}
        whileTap={{ scale: 0.97 }}
        className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 flex items-center justify-center gap-3 transition-all active:scale-95 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
      >
        <Save className="w-5 h-5" />
        Save Training Profile
      </motion.button>
    </div>
  )
}
