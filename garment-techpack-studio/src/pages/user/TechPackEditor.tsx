import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast, Toaster } from 'sonner'
import {
  ArrowLeft, Save, Share2, Sun, Moon, Upload, Plus, Trash2,
  FileText, Copy, CheckCircle2, Sparkles, Loader2, ChevronDown, Send
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TechPackService, createBlankTechPack, calculateGarmentCost,
  APPROVAL_STAGES,
  type TechPack,
} from '@/lib/techpack'
import {
  GARMENT_REGISTRY, FABRIC_REGISTRY, PANTONE_COLORS,
  STITCH_TYPES, GARMENT_CATEGORIES, ANIMATION_REGISTRY,
} from '@/lib/garment-registry'
import { exportTechPackPDF } from '@/lib/pdf-export'
import { chatWithAI } from '@/lib/gemini'
import { calculateSizeGrading } from '@/lib/pricing'
import StyleChat from '@/components/collaboration/StyleChat'
import Timeline from '@/components/editor/Timeline'

const Scene = lazy(() => import('@/components/editor/Scene'))

export default function TechPackEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [dark, setDark] = useState(true)
  const [tp, setTp] = useState<TechPack>(() => {
    if (id) {
      const existing = TechPackService.getById(id)
      if (existing) return existing
    }
    const blank = createBlankTechPack()
    TechPackService.save(blank)
    return blank
  })
  const [activeTab, setActiveTab] = useState('garments')
  const [garmentFilter, setGarmentFilter] = useState('All')
  const [refreshChat, setRefreshChat] = useState(0)
  const [aiMessages, setAiMessages] = useState<{role: 'user' | 'ai', text: string}[]>([])
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiOpen, setAiOpen] = useState(true)
  const aiScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const update = useCallback((partial: Partial<TechPack>) => {
    setTp(prev => {
      const next = { ...prev, ...partial }
      return next
    })
  }, [])

  const handleSave = () => {
    TechPackService.save(tp)
    toast.success('Style saved')
  }

  const handleExportPDF = async () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement | undefined
    await exportTechPackPDF(tp, canvas || undefined)
    toast.success('PDF exported')
  }

  const handleCopyShareLink = () => {
    const url = `${window.location.origin}/review/${tp.id}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied')
  }

  const handleStatusChange = (statusId: string) => {
    TechPackService.updateStatus(tp.id, statusId as TechPack['status'], 'Designer')
    update({ status: statusId as TechPack['status'] })
    toast.success(`Status updated to ${APPROVAL_STAGES.find(s => s.id === statusId)?.label}`)
  }

  const addBOMRow = () => {
    update({ bom: [...tp.bom, { item: '', description: '', quantity: '' }] })
  }

  const removeBOMRow = (idx: number) => {
    update({ bom: tp.bom.filter((_, i) => i !== idx) })
  }

  const updateBOM = (idx: number, field: string, value: string) => {
    const updated = [...tp.bom]
    updated[idx] = { ...updated[idx], [field]: value }
    update({ bom: updated })
  }

  const sendAiMessage = async () => {
    const message = aiInput.trim()
    if (!message || aiLoading) return
    setAiInput('')
    setAiMessages(prev => [...prev, { role: 'user', text: message }])
    setAiLoading(true)

    try {
      const context = [
        `Style Name: ${tp.styleName}`,
        `Style Number: ${tp.styleNumber}`,
        `Garment Type: ${tp.garmentType}`,
        `Fabric ID: ${tp.fabricId}`,
        `Pantone Code: ${tp.pantoneCode || 'not set'}`,
        `Fabric Color: ${tp.fabricColor || 'not set'}`,
        `Stitch Type: ${tp.stitchType}`,
        `Seam Allowance: ${tp.seamAllowance} cm`,
        `Measurements: ${JSON.stringify(tp.measurements)}`,
        `BOM (${tp.bom.length} items): ${JSON.stringify(tp.bom)}`,
        `Construction Notes: ${tp.constructionNotes || 'none'}`,
        `Status: ${tp.status}`,
      ].join('\n')

      const response = await chatWithAI(message, context)

      const jsonMatch = response.match(/<json>([\s\S]*?)<\/json>/)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[1])
          update(parsed)
          toast.success('AI applied changes')
        } catch {
          // JSON parse failed -- just show the text
        }
        const cleanText = response.replace(/<json>[\s\S]*?<\/json>/g, '').trim()
        setAiMessages(prev => [...prev, { role: 'ai', text: cleanText || 'Changes applied to your tech pack.' }])
      } else {
        setAiMessages(prev => [...prev, { role: 'ai', text: response }])
      }
    } catch (err) {
      setAiMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
      toast.error('AI request failed')
    } finally {
      setAiLoading(false)
      setTimeout(() => {
        aiScrollRef.current?.scrollTo({ top: aiScrollRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    }
  }

  const cost = calculateGarmentCost(tp)
  const sizeGrading = calculateSizeGrading(cost)
  const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
  const fabric = FABRIC_REGISTRY.find(f => f.id === tp.fabricId)
  const stage = APPROVAL_STAGES.find(s => s.id === tp.status)

  const filteredGarments = garmentFilter === 'All'
    ? GARMENT_REGISTRY
    : GARMENT_REGISTRY.filter(g => g.category === garmentFilter)

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <Toaster theme={dark ? 'dark' : 'light'} richColors position="top-right" />

      {/* Top Bar */}
      <header className="h-14 border-b border-border/50 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <input
            value={tp.styleName}
            onChange={(e) => update({ styleName: e.target.value })}
            className="bg-transparent font-bold text-sm focus:outline-none w-48"
          />
          <span
            className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: `${stage?.hex}15`, color: stage?.hex }}
          >
            {stage?.label}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} className="rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-4 py-2 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={handleCopyShareLink} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            <Share2 className="w-4 h-4" />
          </button>
          <button onClick={() => setDark(!dark)} className="p-2 rounded-xl hover:bg-muted/50 transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 3-column layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR */}
        <aside className="w-[380px] border-r border-border/50 flex flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b border-border/50">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-1">Style Number</p>
            <p className="text-sm font-mono font-bold">{tp.styleNumber}</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border/50">
            {['garments', 'fabric', 'motion', 'spec'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-2.5 text-[10px] uppercase font-black tracking-[0.2em] transition-all',
                  activeTab === tab ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTab === 'garments' && (
              <div className="space-y-4">
                <div className="flex gap-1.5 flex-wrap">
                  {GARMENT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setGarmentFilter(cat)}
                      className={cn(
                        'px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all',
                        garmentFilter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {filteredGarments.map(g => (
                    <motion.button
                      key={g.id}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => update({ garmentType: g.id })}
                      className={cn(
                        'p-3 rounded-[16px] text-left transition-all border',
                        tp.garmentType === g.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                      )}
                    >
                      <g.icon className="w-5 h-5 mb-1.5 opacity-50" />
                      <p className="text-[10px] font-bold leading-tight">{g.name}</p>
                      <p className="text-[8px] text-muted-foreground uppercase">{g.category}</p>
                    </motion.button>
                  ))}
                </div>
                <div className="border-2 border-dashed border-border/30 rounded-[16px] p-4 text-center">
                  <Upload className="w-5 h-5 mx-auto mb-2 opacity-30" />
                  <p className="text-[10px] text-muted-foreground">Drop reference image</p>
                </div>
              </div>
            )}

            {activeTab === 'fabric' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Pantone Colors</p>
                  <div className="grid grid-cols-6 gap-2">
                    {PANTONE_COLORS.map(c => (
                      <button
                        key={c.code}
                        onClick={() => update({ fabricColor: c.hex, pantoneCode: c.code, mockupColor: c.hex })}
                        className={cn(
                          'w-full aspect-square rounded-xl transition-all hover:scale-110',
                          tp.pantoneCode === c.code ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
                        )}
                        style={{ backgroundColor: c.hex }}
                        title={`${c.name} (${c.code})`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Fabric Type</p>
                  <div className="space-y-2">
                    {FABRIC_REGISTRY.map(f => (
                      <button
                        key={f.id}
                        onClick={() => update({ fabricId: f.id })}
                        className={cn(
                          'w-full p-3 rounded-[16px] text-left transition-all border flex items-center justify-between',
                          tp.fabricId === f.id ? 'border-primary bg-primary/10' : 'border-border/30 bg-muted/20 hover:bg-muted/40'
                        )}
                      >
                        <div>
                          <p className="text-xs font-bold">{f.name}</p>
                          <p className="text-[10px] text-muted-foreground">{f.gsm} GSM</p>
                        </div>
                        {f.stretch && (
                          <span className="text-[8px] font-bold uppercase bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">Stretch</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'motion' && (
              <div className="space-y-4">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Animation Preset</p>
                <Timeline
                  selectedAnimation={tp.animationType}
                  onSelect={(id) => update({ animationType: id })}
                />
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Auto-play</span>
                    <button
                      onClick={() => update({ isMoving: !tp.isMoving })}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        tp.isMoving ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                        tp.isMoving ? 'left-5.5' : 'left-0.5'
                      )} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Clay Mode</span>
                    <button
                      onClick={() => update({ isClay: !tp.isClay })}
                      className={cn(
                        'w-10 h-5 rounded-full transition-colors relative',
                        tp.isClay ? 'bg-primary' : 'bg-muted'
                      )}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all',
                        tp.isClay ? 'left-5.5' : 'left-0.5'
                      )} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'spec' && (
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Measurements (cm)</p>
                  <div className="grid grid-cols-2 gap-3">
                    {(['chest', 'waist', 'hip', 'shoulder', 'sleeveLength', 'length', 'inseam'] as const).map(key => (
                      <div key={key}>
                        <label className="text-[10px] uppercase font-bold tracking-wider opacity-50 block mb-1">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </label>
                        <input
                          type="number"
                          value={tp.measurements[key] || ''}
                          onChange={(e) => update({ measurements: { ...tp.measurements, [key]: parseFloat(e.target.value) || undefined } })}
                          className="w-full rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          placeholder="0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Bill of Materials</p>
                  <div className="space-y-2">
                    {tp.bom.map((item, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          value={item.item}
                          onChange={(e) => updateBOM(idx, 'item', e.target.value)}
                          className="flex-1 rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          placeholder="Item"
                        />
                        <input
                          value={item.description}
                          onChange={(e) => updateBOM(idx, 'description', e.target.value)}
                          className="flex-1 rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          placeholder="Description"
                        />
                        <input
                          value={item.quantity}
                          onChange={(e) => updateBOM(idx, 'quantity', e.target.value)}
                          className="w-24 rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                          placeholder="Qty"
                        />
                        <button onClick={() => removeBOMRow(idx)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    ))}
                    <button onClick={addBOMRow} className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
                      <Plus className="w-3 h-3" /> Add Row
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Stitch Type</p>
                  <select
                    value={tp.stitchType}
                    onChange={(e) => update({ stitchType: e.target.value })}
                    className="w-full rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    {STITCH_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Seam Allowance (cm)</p>
                  <input
                    type="range"
                    min="0.5"
                    max="3"
                    step="0.1"
                    value={tp.seamAllowance}
                    onChange={(e) => update({ seamAllowance: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground text-right">{tp.seamAllowance} cm</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Construction Notes</p>
                  <textarea
                    value={tp.constructionNotes}
                    onChange={(e) => update({ constructionNotes: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl bg-muted/30 border-none px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                    placeholder="Add construction notes..."
                  />
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* CENTER - 3D Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-4">
            <Suspense fallback={
              <div className="w-full h-full rounded-[24px] bg-muted/20 flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading 3D scene...</p>
              </div>
            }>
              <Scene
                garmentType={tp.garmentType}
                color={tp.mockupColor}
                backgroundColor={dark ? '#0a0f1e' : '#ffffff'}
                isMoving={tp.isMoving}
                animationType={tp.animationType}
                isClay={tp.isClay}
                zoom={tp.zoom}
                environmentPreset={tp.environmentPreset}
              />
            </Suspense>
          </div>

          <div className="px-4 pb-4 grid grid-cols-4 gap-3">
            {[
              { label: 'Est. Cost', value: `Rs.${cost}` },
              { label: 'Fabric', value: fabric?.name || tp.fabricId },
              { label: 'Stitch', value: tp.stitchType.split(' ')[0] },
              { label: 'BOM Items', value: `${tp.bom.length}` },
            ].map(stat => (
              <div key={stat.label} className="rounded-[16px] border border-border/30 bg-card/50 backdrop-blur-3xl p-3">
                <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30">{stat.label}</p>
                <p className="text-sm font-bold mt-0.5">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className="w-[320px] border-l border-border/50 flex flex-col overflow-hidden shrink-0">
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-3 border-b border-border/50">
              <button
                onClick={handleExportPDF}
                className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-green-600 text-white px-4 py-3 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" /> Export PDF
              </button>
              <button
                onClick={handleCopyShareLink}
                className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-muted/50 text-foreground px-4 py-2.5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Copy className="w-3.5 h-3.5" /> Copy Share Link
              </button>
            </div>

            <div className="p-4 border-b border-border/50">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Approval Workflow</p>
              <div className="space-y-1.5">
                {APPROVAL_STAGES.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => handleStatusChange(s.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all text-left text-xs',
                      tp.status === s.id ? 'bg-primary/10 font-bold' : 'hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn('w-2.5 h-2.5 rounded-full', tp.status === s.id && 'ring-2 ring-offset-1 ring-offset-background')}
                        style={{ backgroundColor: s.hex, boxShadow: tp.status === s.id ? `0 0 8px ${s.hex}50` : undefined }}
                      />
                      {idx > 0 && <div className="absolute left-[22px] -top-1.5 w-px h-1.5 bg-border/30" />}
                    </div>
                    <span>{s.label}</span>
                    {tp.status === s.id && <CheckCircle2 className="w-3.5 h-3.5 ml-auto" style={{ color: s.hex }} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 border-b border-border/50">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Size Grading</p>
              <div className="grid grid-cols-4 gap-1.5">
                {sizeGrading.map(s => (
                  <div key={s.size} className="rounded-xl bg-muted/30 p-2 text-center">
                    <p className="text-[9px] font-bold opacity-50">{s.size}</p>
                    <p className="text-[10px] font-bold">Rs.{s.cost}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant */}
            <div className="border-b border-border/50">
              <button
                onClick={() => setAiOpen(!aiOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">AI Assistant</p>
                </div>
                <ChevronDown className={cn('w-3.5 h-3.5 opacity-30 transition-transform', aiOpen && 'rotate-180')} />
              </button>
              {aiOpen && (
                <div className="px-4 pb-4 flex flex-col">
                  <div
                    ref={aiScrollRef}
                    className="h-[200px] overflow-y-auto rounded-2xl bg-card border border-border/30 p-3 space-y-2 mb-3"
                  >
                    {aiMessages.length === 0 && (
                      <p className="text-[10px] text-muted-foreground text-center mt-16">
                        Ask the AI to help edit your tech pack.
                      </p>
                    )}
                    {aiMessages.map((msg, i) => (
                      <div
                        key={i}
                        className={cn(
                          'max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed',
                          msg.role === 'user'
                            ? 'ml-auto bg-primary text-primary-foreground'
                            : 'mr-auto bg-muted text-foreground'
                        )}
                      >
                        {msg.text}
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="mr-auto bg-muted rounded-2xl px-3 py-2 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin opacity-50" />
                        <span className="text-[10px] text-muted-foreground">Thinking...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                      placeholder="Ask AI to edit tech pack..."
                      className="flex-1 rounded-2xl bg-muted/30 border-none px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <button
                      onClick={sendAiMessage}
                      disabled={aiLoading || !aiInput.trim()}
                      className={cn(
                        'p-2.5 rounded-2xl transition-all',
                        aiInput.trim() && !aiLoading
                          ? 'bg-primary text-primary-foreground hover:scale-105 active:scale-95'
                          : 'bg-muted/30 text-muted-foreground opacity-50 cursor-not-allowed'
                      )}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="min-h-[300px]">
              <StyleChat
                techPackId={tp.id}
                messages={TechPackService.getById(tp.id)?.messages || tp.messages || []}
                onMessageSent={() => setRefreshChat(prev => prev + 1)}
                className="h-full"
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
