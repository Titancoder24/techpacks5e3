import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Loader2, Save, Code2, Upload,
  ThumbsUp, ThumbsDown, Zap, Image, FileText,
} from 'lucide-react'
import { toast } from 'sonner'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { GARMENT_REGISTRY, FABRIC_REGISTRY } from '@/lib/garment-registry'
import {
  callGemini,
  buildGarmentPrompt,
  buildImageAnalysisPrompt,
  addFeedback,
} from '@/lib/gemini'
import { TechPackService, createBlankTechPack } from '@/lib/techpack'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mode = 'text' | 'image'

interface GeneratedResult {
  styleName?: string
  colorHex?: string
  pantoneCode?: string
  stitchType?: string
  stitchDensity?: string
  seamAllowance?: number
  constructionNotes?: string
  measurements?: Record<string, number>
  bom?: { item: string; description?: string; quantity: string }[]
  qualityNotes?: string
  [key: string]: unknown
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim()
}

function safeParseJSON(raw: string): GeneratedResult {
  const cleaned = stripMarkdownFences(raw)
  // Try direct parse first
  try {
    return JSON.parse(cleaned)
  } catch {
    // Attempt to extract first JSON object from the string
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      return JSON.parse(match[0])
    }
    throw new Error('Unable to parse AI response as JSON')
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function AIGenerator() {
  // -- State ---------------------------------------------------------------
  const [mode, setMode] = useState<Mode>('text')
  const [selectedGarment, setSelectedGarment] = useState('tshirt-crew')
  const [selectedFabric, setSelectedFabric] = useState('cotton-100')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<GeneratedResult | null>(null)
  const [rawResponse, setRawResponse] = useState('')
  const [showRaw, setShowRaw] = useState(false)

  // Image analysis state
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageFileName, setImageFileName] = useState<string | null>(null)

  // Feedback state
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)

  // -- Dropzone ------------------------------------------------------------
  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0]
    if (!file) return
    setImageFileName(file.name)
    const reader = new FileReader()
    reader.onload = () => {
      setImageBase64(reader.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: 1,
    multiple: false,
  })

  // -- Handlers ------------------------------------------------------------
  const resetOutput = () => {
    setResult(null)
    setRawResponse('')
    setShowRaw(false)
    setFeedbackOpen(false)
    setFeedbackNote('')
    setFeedbackSent(false)
  }

  const handleGenerate = async () => {
    setLoading(true)
    resetOutput()
    try {
      const prompt = buildGarmentPrompt(selectedGarment, selectedFabric, brief)
      const response = await callGemini(prompt)
      setRawResponse(response)
      const parsed = safeParseJSON(response)
      setResult(parsed)
      toast.success('Tech pack generated successfully')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Generation failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleImageAnalysis = async () => {
    if (!imageBase64) {
      toast.error('Please upload an image first')
      return
    }
    setLoading(true)
    resetOutput()
    try {
      const prompt = buildImageAnalysisPrompt(selectedGarment)
      const response = await callGemini(prompt, imageBase64)
      setRawResponse(response)
      const parsed = safeParseJSON(response)
      setResult(parsed)
      toast.success('Image analysis complete')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      toast.error(`Analysis failed: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToVault = () => {
    if (!result) return
    const tp = createBlankTechPack()
    tp.styleName = result.styleName || 'AI Generated Style'
    tp.garmentType = selectedGarment
    tp.fabricId = selectedFabric
    tp.constructionNotes = result.constructionNotes || ''
    tp.measurements = result.measurements || {}
    tp.bom = result.bom
      ? result.bom.map((b) => ({
          item: b.item,
          description: b.description || '',
          quantity: b.quantity,
        }))
      : tp.bom
    tp.stitchType = result.stitchType || tp.stitchType
    tp.stitchDensity = result.stitchDensity || tp.stitchDensity
    tp.pantoneCode = result.pantoneCode || tp.pantoneCode
    tp.fabricColor = result.colorHex || tp.fabricColor
    tp.mockupColor = result.colorHex || tp.mockupColor
    tp.seamAllowance = result.seamAllowance ?? tp.seamAllowance
    tp.aiDescription = mode === 'text' ? brief : `Image analysis: ${imageFileName || 'uploaded image'}`
    TechPackService.save(tp)
    toast.success('Saved to Style Vault')
  }

  const handleFeedback = (rating: 'good' | 'bad') => {
    const promptText = mode === 'text' ? brief : `Image analysis for ${selectedGarment}`
    addFeedback(promptText, rating, feedbackNote)
    setFeedbackSent(true)
    setFeedbackOpen(false)
    toast.success(rating === 'good' ? 'Thanks for the positive feedback' : 'Feedback recorded -- we will improve')
  }

  // -- Derived data --------------------------------------------------------
  const garment = GARMENT_REGISTRY.find((g) => g.id === selectedGarment)

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* ── HEADER ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            <Sparkles className="w-7 h-7 text-purple-400" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black italic uppercase tracking-tighter">
              AI Tech Pack Engine
            </h1>
            <p className="text-xs text-muted-foreground">
              Gemini 3 Flash Preview -- World-class tech pack generation
            </p>
          </div>
        </div>

        {/* Mode pills */}
        <div className="flex gap-1.5 rounded-2xl border border-border/30 bg-card p-1">
          <button
            onClick={() => setMode('text')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
              mode === 'text'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <FileText className="w-3.5 h-3.5" />
            Text Brief
          </button>
          <button
            onClick={() => setMode('image')}
            className={cn(
              'flex items-center gap-1.5 rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all',
              mode === 'image'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Image className="w-3.5 h-3.5" />
            Image Analysis
          </button>
        </div>
      </div>

      {/* ── TWO-COLUMN LAYOUT ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ============================================================= */}
        {/* LEFT -- Configuration                                         */}
        {/* ============================================================= */}
        <div className="space-y-5">
          <AnimatePresence mode="wait">
            {mode === 'text' ? (
              <motion.div
                key="text-mode"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Garment type grid */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                    Select Garment
                  </p>
                  <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                    {GARMENT_REGISTRY.map((g) => (
                      <motion.button
                        key={g.id}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSelectedGarment(g.id)}
                        className={cn(
                          'p-3 rounded-[16px] text-left transition-all border',
                          selectedGarment === g.id
                            ? 'border-primary bg-primary/10'
                            : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                        )}
                      >
                        <g.icon className="w-4 h-4 mb-1 opacity-50" />
                        <p className="text-[10px] font-bold leading-tight">{g.name}</p>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Fabric dropdown */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                    Fabric
                  </p>
                  <select
                    value={selectedFabric}
                    onChange={(e) => setSelectedFabric(e.target.value)}
                    className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {FABRIC_REGISTRY.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.gsm} GSM)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Design brief */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                    Design Brief
                  </p>
                  <textarea
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    rows={6}
                    className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Describe the style you want... (e.g., 'Oversized streetwear tee with dropped shoulders, boxy fit, raw-cut hem, vintage washed finish')"
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {loading ? 'Generating with Gemini 3...' : 'Generate Tech Pack'}
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="image-mode"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Dropzone */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                    Upload Garment Image
                  </p>
                  <div
                    {...getRootProps()}
                    className={cn(
                      'rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all',
                      isDragActive
                        ? 'border-primary bg-primary/5'
                        : 'border-border/40 hover:border-border/70'
                    )}
                  >
                    <input {...getInputProps()} />
                    {imageBase64 ? (
                      <div className="space-y-3">
                        <img
                          src={imageBase64}
                          alt="Uploaded garment"
                          className="max-h-48 mx-auto rounded-xl object-contain"
                        />
                        <p className="text-[10px] text-muted-foreground">
                          {imageFileName} -- click or drop to replace
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 mx-auto opacity-30" />
                        <p className="text-xs font-medium text-muted-foreground">
                          Drop a garment image or click to upload
                        </p>
                        <p className="text-[10px] text-muted-foreground/50">
                          PNG, JPG, or WebP
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Garment type helper dropdown */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                    Garment Type (helps AI classify)
                  </p>
                  <select
                    value={selectedGarment}
                    onChange={(e) => setSelectedGarment(e.target.value)}
                    className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {GARMENT_REGISTRY.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.category})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Analyze button */}
                <button
                  onClick={handleImageAnalysis}
                  disabled={loading || !imageBase64}
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {loading ? 'Generating with Gemini 3...' : 'Analyze Image'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ============================================================= */}
        {/* RIGHT -- Output                                               */}
        {/* ============================================================= */}
        <div className="space-y-4">
          {/* Loading state */}
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="rounded-[24px] border border-border/30 bg-card p-12 flex flex-col items-center justify-center"
              >
                <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
                <p className="text-sm font-black italic uppercase tracking-tight">
                  Generating with Gemini 3...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Analyzing {garment?.name || 'garment'} specifications
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Result output */}
          <AnimatePresence>
            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Main result card */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-5">
                  {/* Style heading + color swatch */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full border-2 border-border/30 flex-shrink-0"
                      style={{ backgroundColor: result.colorHex || '#ccc' }}
                      title={result.pantoneCode || 'Color swatch'}
                    />
                    <h2 className="text-xl font-black italic uppercase tracking-tighter leading-tight">
                      {result.styleName || 'Generated Style'}
                    </h2>
                  </div>

                  {/* Stat cards grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Stitch Type', value: result.stitchType },
                      { label: 'Pantone', value: result.pantoneCode },
                      { label: 'Density', value: result.stitchDensity },
                      {
                        label: 'Seam Allowance',
                        value: result.seamAllowance != null ? `${result.seamAllowance} cm` : undefined,
                      },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-xl bg-muted/20 p-3">
                        <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">
                          {stat.label}
                        </p>
                        <p className="text-xs font-bold mt-0.5">{stat.value || '--'}</p>
                      </div>
                    ))}
                  </div>

                  {/* Construction Notes */}
                  {result.constructionNotes && (
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">
                        Construction Notes
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                        {result.constructionNotes}
                      </p>
                    </div>
                  )}

                  {/* Measurements grid */}
                  {result.measurements && Object.keys(result.measurements).length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">
                        Measurements (cm)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(result.measurements).map(([key, val]) => (
                          <div key={key} className="bg-muted/20 rounded-xl px-3 py-2 text-center">
                            <p className="text-[8px] uppercase font-bold opacity-40">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </p>
                            <p className="text-xs font-bold">{val as number}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOM list */}
                  {result.bom && result.bom.length > 0 && (
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">
                        Bill of Materials
                      </p>
                      <div className="space-y-1.5">
                        {result.bom.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center bg-muted/20 rounded-xl px-3 py-2 text-xs"
                          >
                            <span className="font-medium">{item.item}</span>
                            <span className="text-muted-foreground">{item.quantity}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quality Notes */}
                  {result.qualityNotes && (
                    <div>
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">
                        Quality Notes
                      </p>
                      <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                        {result.qualityNotes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Feedback row */}
                <div className="rounded-[24px] border border-border/30 bg-card p-5">
                  {feedbackSent ? (
                    <p className="text-xs font-medium text-center text-muted-foreground">
                      Feedback recorded. Thank you.
                    </p>
                  ) : !feedbackOpen ? (
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                        Rate this result
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFeedbackOpen(true)}
                          className="rounded-xl border border-border/30 px-3 py-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 hover:border-green-500/50 hover:text-green-500"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          Good
                        </button>
                        <button
                          onClick={() => setFeedbackOpen(true)}
                          className="rounded-xl border border-border/30 px-3 py-1.5 text-xs font-bold hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 hover:border-red-500/50 hover:text-red-500"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                          Needs Work
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">
                        Add a note (optional)
                      </p>
                      <input
                        type="text"
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder="What was good or what should improve..."
                        className="w-full rounded-xl bg-muted/30 border-none px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('good')}
                          className="flex-1 rounded-xl bg-green-600 text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          Good
                        </button>
                        <button
                          onClick={() => handleFeedback('bad')}
                          className="flex-1 rounded-xl bg-red-600 text-white px-3 py-2 text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          Needs Work
                        </button>
                        <button
                          onClick={() => {
                            setFeedbackOpen(false)
                            setFeedbackNote('')
                          }}
                          className="rounded-xl border border-border/30 px-3 py-2 text-[10px] font-bold text-muted-foreground hover:scale-105 active:scale-95 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save to Vault */}
                <button
                  onClick={handleSaveToVault}
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-4 py-3.5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save to Style Vault
                </button>

                {/* Collapsible raw response */}
                <div className="rounded-[24px] border border-border/30 bg-card overflow-hidden">
                  <button
                    onClick={() => setShowRaw(!showRaw)}
                    className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold hover:bg-muted/20 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Code2 className="w-3.5 h-3.5" />
                      Raw AI Response
                    </span>
                    <span className="text-muted-foreground text-[10px] uppercase tracking-wider">
                      {showRaw ? 'Hide' : 'Show'}
                    </span>
                  </button>
                  <AnimatePresence>
                    {showRaw && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <pre className="px-5 pb-4 text-[10px] leading-relaxed text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto font-mono">
                          {rawResponse}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state placeholder */}
          {!result && !loading && (
            <div className="rounded-[24px] border border-dashed border-border/30 p-16 text-center">
              <Sparkles className="w-10 h-10 mx-auto mb-4 opacity-15" />
              <p className="text-sm font-black italic uppercase tracking-tight text-muted-foreground/40">
                Select a garment and generate
              </p>
              <p className="text-[10px] text-muted-foreground/30 mt-1">
                {mode === 'text'
                  ? 'Choose a garment type, fabric, and describe your design'
                  : 'Upload an image to analyze'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
