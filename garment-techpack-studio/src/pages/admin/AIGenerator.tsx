import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Loader2, Save, Code2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { GARMENT_REGISTRY, FABRIC_REGISTRY } from '@/lib/garment-registry'
import { callGemini, buildGarmentPrompt } from '@/lib/gemini'
import { TechPackService, createBlankTechPack, type TechPack } from '@/lib/techpack'

export default function AIGenerator() {
  const [selectedGarment, setSelectedGarment] = useState('tshirt-crew')
  const [selectedFabric, setSelectedFabric] = useState('cotton-100')
  const [brief, setBrief] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [rawResponse, setRawResponse] = useState('')
  const [showRaw, setShowRaw] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)
    setResult(null)
    setRawResponse('')
    try {
      const prompt = buildGarmentPrompt(selectedGarment, selectedFabric, brief)
      const response = await callGemini(prompt)
      setRawResponse(response)

      const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned)
      setResult(parsed)
      toast.success('Tech pack generated')
    } catch (err: any) {
      toast.error(`Generation failed: ${err.message}`)
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
    tp.bom = result.bom || tp.bom
    tp.stitchType = result.stitchType || tp.stitchType
    tp.stitchDensity = result.stitchDensity || tp.stitchDensity
    tp.pantoneCode = result.pantoneCode || tp.pantoneCode
    tp.fabricColor = result.colorHex || tp.fabricColor
    tp.mockupColor = result.colorHex || tp.mockupColor
    tp.seamAllowance = result.seamAllowance || tp.seamAllowance
    tp.aiDescription = brief
    TechPackService.save(tp)
    toast.success('Saved to Style Vault')
  }

  const garment = GARMENT_REGISTRY.find(g => g.id === selectedGarment)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
          <Sparkles className="w-7 h-7 text-purple-400" />
        </motion.div>
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">AI Tech Pack Engine</h1>
          <p className="text-xs text-muted-foreground">Powered by Gemini Flash</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Config */}
        <div className="space-y-6">
          <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5 space-y-4">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Select Garment</p>
            <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
              {GARMENT_REGISTRY.map(g => (
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

          <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5 space-y-4">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Fabric</p>
            <select
              value={selectedFabric}
              onChange={(e) => setSelectedFabric(e.target.value)}
              className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {FABRIC_REGISTRY.map(f => (
                <option key={f.id} value={f.id}>{f.name} ({f.gsm} GSM)</option>
              ))}
            </select>
          </div>

          <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5 space-y-4">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Design Brief</p>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              className="w-full rounded-2xl bg-muted/30 border-none px-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-ring resize-none"
              placeholder="Describe the style you want... (e.g., 'Oversized streetwear tee with dropped shoulders')"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {loading ? 'Generating...' : 'Generate Tech Pack'}
          </button>
        </div>

        {/* RIGHT: Output */}
        <div className="space-y-4">
          {loading && (
            <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-12 flex flex-col items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-400 mb-3" />
              <p className="text-sm font-medium">Generating tech pack...</p>
              <p className="text-xs text-muted-foreground mt-1">AI is analyzing {garment?.name} specifications</p>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-black">{result.styleName}</h2>
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white/20"
                    style={{ backgroundColor: result.colorHex || '#ccc' }}
                    title={result.pantoneCode}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-muted/20 p-3">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">Stitch Type</p>
                    <p className="text-xs font-bold mt-0.5">{result.stitchType}</p>
                  </div>
                  <div className="rounded-xl bg-muted/20 p-3">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">Pantone</p>
                    <p className="text-xs font-bold mt-0.5">{result.pantoneCode}</p>
                  </div>
                  <div className="rounded-xl bg-muted/20 p-3">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">Density</p>
                    <p className="text-xs font-bold mt-0.5">{result.stitchDensity}</p>
                  </div>
                  <div className="rounded-xl bg-muted/20 p-3">
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30">Seam</p>
                    <p className="text-xs font-bold mt-0.5">{result.seamAllowance} cm</p>
                  </div>
                </div>

                <div>
                  <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 mb-2">Construction Notes</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{result.constructionNotes}</p>
                </div>

                {result.measurements && (
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 mb-2">Measurements (cm)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(result.measurements).map(([key, val]) => (
                        <div key={key} className="bg-muted/20 rounded-xl px-3 py-2 text-center">
                          <p className="text-[8px] uppercase font-bold opacity-40">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-xs font-bold">{val as number}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.bom && (
                  <div>
                    <p className="text-[9px] uppercase font-black tracking-[0.2em] opacity-30 mb-2">Bill of Materials</p>
                    <div className="space-y-1.5">
                      {result.bom.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between bg-muted/20 rounded-xl px-3 py-2 text-xs">
                          <span className="font-medium">{item.item}</span>
                          <span className="text-muted-foreground">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleSaveToVault}
                  className="w-full rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-4 py-3 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" /> Save to Style Vault
                </button>
              </div>

              <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl overflow-hidden">
                <button
                  onClick={() => setShowRaw(!showRaw)}
                  className="w-full flex items-center justify-between px-5 py-3 text-xs font-bold hover:bg-muted/20 transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Code2 className="w-3.5 h-3.5" /> Raw AI Response
                  </span>
                  <span className="text-muted-foreground">{showRaw ? 'Hide' : 'Show'}</span>
                </button>
                {showRaw && (
                  <pre className="px-5 pb-4 text-[10px] leading-relaxed text-muted-foreground overflow-x-auto max-h-64 overflow-y-auto font-mono">
                    {rawResponse}
                  </pre>
                )}
              </div>
            </>
          )}

          {!result && !loading && (
            <div className="rounded-[24px] border border-dashed border-border/30 p-12 text-center">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium text-muted-foreground/50">
                Select a garment and generate a tech pack
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
