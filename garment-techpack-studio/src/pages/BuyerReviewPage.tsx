import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import {
  CheckCircle2, RefreshCw, Send, Eye, Factory, Ruler,
  Clock, MessageSquare, Palette, Scissors, FileText, Package
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TechPackService, calculateGarmentCost, formatRelativeTime,
  APPROVAL_STAGES, type TechPack, type TechPackMessage,
} from '@/lib/techpack'
import { GARMENT_REGISTRY, FABRIC_REGISTRY } from '@/lib/garment-registry'

const Scene = lazy(() => import('@/components/editor/Scene'))

const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const
const SIZE_GRADES: Record<string, number[]> = {
  chest:       [-4, -2, 0, 2, 4, 6, 8],
  waist:       [-4, -2, 0, 2, 4, 6, 8],
  hip:         [-4, -2, 0, 2, 4, 6, 8],
  shoulder:    [-2, -1, 0, 1, 2, 3, 4],
  sleeveLength:[-1.5, -0.75, 0, 0.75, 1.5, 2.25, 3],
  length:      [-3, -1.5, 0, 1.5, 3, 4.5, 6],
  inseam:      [-2, -1, 0, 1, 2, 3, 4],
}

function getGradedValue(base: number, key: string, sizeIdx: number): number {
  const grades = SIZE_GRADES[key] || [-4, -2, 0, 2, 4, 6, 8]
  return Math.round((base + grades[sizeIdx]) * 10) / 10
}

const STITCH_VISUAL: Record<string, { label: string; pattern: string }> = {
  '301 Lockstitch': { label: 'Lockstitch', pattern: '--- --- --- ---' },
  '401 Chain Stitch': { label: 'Chain', pattern: '=== === === ===' },
  '504 Overlock': { label: 'Overlock', pattern: '~~~ ~~~ ~~~ ~~~' },
  '516 Safety Stitch': { label: 'Safety', pattern: '=-= =-= =-= =-=' },
  '602 Coverstitch': { label: 'Cover', pattern: '::: ::: ::: :::' },
  '605 Flatlock': { label: 'Flatlock', pattern: '||| ||| ||| |||' },
}

export default function BuyerReviewPage() {
  const { id } = useParams()
  const [tp, setTp] = useState<TechPack | null>(null)
  const [comment, setComment] = useState('')
  const [viewMode, setViewMode] = useState<'buyer' | 'factory'>('buyer')

  useEffect(() => {
    document.documentElement.classList.add('dark')
    if (id) {
      const found = TechPackService.getById(id)
      setTp(found || null)
    }
  }, [id])

  if (!tp) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Toaster theme="dark" richColors position="top-right" />
        <p className="text-muted-foreground">Tech pack not found</p>
      </div>
    )
  }

  const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
  const fabric = FABRIC_REGISTRY.find(f => f.id === tp.fabricId)
  const cost = calculateGarmentCost(tp)
  const stage = APPROVAL_STAGES.find(s => s.id === tp.status)

  const handleApprove = () => {
    TechPackService.updateStatus(tp.id, 'approved', 'Buyer')
    setTp({ ...tp, status: 'approved' })
    toast.success('Tech pack approved')
  }

  const handleRequestChanges = () => {
    TechPackService.updateStatus(tp.id, 'revision_needed', 'Buyer', 'Changes requested by buyer')
    setTp({ ...tp, status: 'revision_needed' })
    toast.success('Revision requested')
  }

  const handleComment = () => {
    if (!comment.trim()) return
    const msg: TechPackMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'u2',
      userName: 'Sarah K. (Buyer)',
      userRole: 'buyer',
      text: comment.trim(),
      timestamp: Date.now(),
    }
    TechPackService.addMessage(tp.id, msg)
    setTp({ ...tp, messages: [...(tp.messages || []), msg] })
    setComment('')
    toast.success('Comment added')
  }

  const stitchInfo = STITCH_VISUAL[tp.stitchType] || { label: tp.stitchType, pattern: '--- ---' }

  return (
    <div className="min-h-screen bg-background">
      <Toaster theme="dark" richColors position="top-right" />

      {/* Header */}
      <header className="h-16 border-b border-border/50 flex items-center justify-between px-4 sm:px-6">
        <div className="min-w-0">
          <h1 className="font-black italic uppercase tracking-tighter text-lg truncate">{tp.styleName}</h1>
          <p className="text-xs text-muted-foreground">{tp.styleNumber} -- {viewMode === 'buyer' ? 'Buyer Review' : 'Factory Sheet'}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {/* View Mode Toggle */}
          <div className="rounded-2xl border border-border/30 bg-card p-1 flex">
            <button
              onClick={() => setViewMode('buyer')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5',
                viewMode === 'buyer'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Eye className="w-3 h-3" /> Buyer
            </button>
            <button
              onClick={() => setViewMode('factory')}
              className={cn(
                'rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5',
                viewMode === 'factory'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Factory className="w-3 h-3" /> Factory
            </button>
          </div>
          <span
            className="rounded-full px-2.5 py-0.5 text-xs font-semibold hidden sm:inline-block"
            style={{ backgroundColor: `${stage?.hex}15`, color: stage?.hex }}
          >
            {stage?.label}
          </span>
        </div>
      </header>

      {/* FACTORY VIEW */}
      {viewMode === 'factory' && (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">
          {/* Style header card */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Style</p>
                <h2 className="font-black italic uppercase tracking-tighter text-2xl mt-1">{tp.styleName}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{tp.styleNumber} -- {garment?.name} -- {tp.season}</p>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className="w-14 h-14 rounded-2xl border-2 border-border/30 shrink-0"
                  style={{ backgroundColor: tp.fabricColor }}
                />
                <div>
                  <p className="text-xs font-bold">{tp.pantoneCode}</p>
                  <p className="text-xs text-muted-foreground">{fabric?.name} ({fabric?.gsm} GSM)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Measurement Table - All Sizes */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-4 h-4 opacity-50" />
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Measurements (cm) -- All Sizes</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Measurement</th>
                    {SIZES.map((size, idx) => (
                      <th
                        key={size}
                        className={cn(
                          'text-center py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em]',
                          idx === 2 ? 'bg-primary/10 text-primary rounded-t-xl' : 'opacity-30'
                        )}
                      >
                        {size}
                        {idx === 2 && <span className="block text-[8px] mt-0.5 font-semibold normal-case tracking-normal">(Base)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(tp.measurements || {}).map(([key, val]) => {
                    if (!val) return null
                    return (
                      <tr key={key} className="border-b border-border/10">
                        <td className="py-2.5 px-3 text-muted-foreground capitalize text-xs">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </td>
                        {SIZES.map((size, idx) => {
                          const graded = getGradedValue(val, key, idx)
                          return (
                            <td
                              key={size}
                              className={cn(
                                'text-center py-2.5 px-3 tabular-nums',
                                idx === 2
                                  ? 'bg-primary/10 font-black text-base text-primary'
                                  : 'font-bold text-sm'
                              )}
                            >
                              {graded}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-muted-foreground mt-3 opacity-50">
              Tolerance: +/- 0.5 cm. Base size (M) highlighted. All measurements in centimeters.
            </p>
          </div>

          {/* BOM Table */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 opacity-50" />
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Bill of Materials</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/30">
                    <th className="text-left py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Item</th>
                    <th className="text-left py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Description</th>
                    <th className="text-right py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Quantity</th>
                    <th className="text-left py-2 px-3 text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Supplier</th>
                  </tr>
                </thead>
                <tbody>
                  {(tp.bom || []).map((item, idx) => (
                    <tr key={idx} className="border-b border-border/10">
                      <td className="py-2.5 px-3 font-bold">{item.item}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.description || '--'}</td>
                      <td className="py-2.5 px-3 text-right font-bold tabular-nums">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-muted-foreground">{item.supplier || '--'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Construction + Stitch + Color row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Construction Notes */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 opacity-50" />
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Construction Notes</h2>
              </div>
              <p className="text-sm leading-relaxed">
                {tp.constructionNotes || 'No construction notes provided.'}
              </p>
              <div className="mt-4 pt-4 border-t border-border/20">
                <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-2">Seam Allowance</p>
                <p className="text-lg font-black tabular-nums">{tp.seamAllowance} cm</p>
              </div>
            </div>

            {/* Stitch + Pantone */}
            <div className="space-y-5">
              {/* Stitch Type */}
              <div className="rounded-[24px] border border-border/30 bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Scissors className="w-4 h-4 opacity-50" />
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Stitch Type</h2>
                </div>
                <p className="text-lg font-black">{tp.stitchType}</p>
                <p className="text-xs text-muted-foreground mt-1">Density: {tp.stitchDensity}</p>
                <div className="mt-3 rounded-xl bg-muted/20 px-4 py-3">
                  <p className="font-mono text-xs tracking-[0.25em] text-muted-foreground">{stitchInfo.pattern}</p>
                </div>
              </div>

              {/* Pantone Color Swatch */}
              <div className="rounded-[24px] border border-border/30 bg-card p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 opacity-50" />
                  <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Pantone Color</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl border-2 border-border/30"
                    style={{ backgroundColor: tp.fabricColor }}
                  />
                  <div>
                    <p className="text-lg font-black">{tp.pantoneCode}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">{tp.fabricColor}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Print placement note */}
          {tp.printUrl && (
            <div className="rounded-[24px] border border-border/30 bg-card p-5">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-3">Print Placement</h2>
              <p className="text-sm">Print artwork applied. Refer to attached print file for placement and dimensions.</p>
            </div>
          )}
        </div>
      )}

      {/* BUYER VIEW */}
      {viewMode === 'buyer' && (
        <div className="max-w-6xl mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: 3D Preview + Actions */}
          <div className="space-y-4">
            <div className="h-[350px] sm:h-[400px] rounded-[24px] overflow-hidden border border-border/30">
              <Suspense fallback={
                <div className="w-full h-full bg-card flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              }>
                <Scene
                  garmentType={tp.garmentType}
                  color={tp.mockupColor}
                  backgroundColor="#0a0f1e"
                  isMoving={true}
                  animationType="float"
                  isClay={false}
                  zoom={tp.zoom}
                  environmentPreset="city"
                />
              </Suspense>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-green-600 text-white px-4 py-3.5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve
              </button>
              <button
                onClick={handleRequestChanges}
                className="flex-1 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-orange-500 text-white px-4 py-3.5 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Request Changes
              </button>
            </div>

            {/* Approval History Timeline */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 opacity-50" />
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Approval History</h2>
              </div>
              {(tp.approvalLog || []).length === 0 && (
                <p className="text-xs text-muted-foreground py-2">No status changes yet.</p>
              )}
              <div className="relative">
                {(tp.approvalLog || []).map((entry, idx) => {
                  const entryStage = APPROVAL_STAGES.find(s => s.id === entry.status)
                  return (
                    <div key={idx} className="flex gap-3 pb-4 last:pb-0">
                      {/* Timeline line + dot */}
                      <div className="flex flex-col items-center">
                        <div
                          className="w-3 h-3 rounded-full border-2 shrink-0"
                          style={{ borderColor: entryStage?.hex, backgroundColor: idx === (tp.approvalLog || []).length - 1 ? entryStage?.hex : 'transparent' }}
                        />
                        {idx < (tp.approvalLog || []).length - 1 && (
                          <div className="w-px flex-1 bg-border/30 mt-1" />
                        )}
                      </div>
                      <div className="min-w-0 pb-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={{ backgroundColor: `${entryStage?.hex}1a`, color: entryStage?.hex }}
                          >
                            {entryStage?.label}
                          </span>
                          <span className="text-[10px] text-muted-foreground">by {entry.changedBy}</span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground opacity-60 mt-0.5">
                          {formatRelativeTime(entry.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Right: Spec Sheet */}
          <div className="space-y-4">
            {/* Specifications */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-4">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Specifications</h2>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div><span className="text-muted-foreground">Garment:</span> <span className="font-bold">{garment?.name}</span></div>
                <div><span className="text-muted-foreground">Season:</span> <span className="font-bold">{tp.season}</span></div>
                <div><span className="text-muted-foreground">Fabric:</span> <span className="font-bold">{fabric?.name}</span></div>
                <div><span className="text-muted-foreground">GSM:</span> <span className="font-bold">{fabric?.gsm}</span></div>
                <div><span className="text-muted-foreground">Pantone:</span> <span className="font-bold">{tp.pantoneCode}</span></div>
                <div><span className="text-muted-foreground">Stitch:</span> <span className="font-bold">{tp.stitchType}</span></div>
                <div><span className="text-muted-foreground">Seam:</span> <span className="font-bold">{tp.seamAllowance} cm</span></div>
                <div><span className="text-muted-foreground">Est. Cost:</span> <span className="font-bold">Rs.{cost}</span></div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Color:</span>
                <div className="w-5 h-5 rounded-full border border-border/30" style={{ backgroundColor: tp.fabricColor }} />
                <span className="text-xs font-mono">{tp.pantoneCode}</span>
              </div>
            </div>

            {/* Measurement Comparison - All Sizes */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Graded Measurements (cm)</h2>
              <div className="overflow-x-auto -mx-2 px-2">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/20">
                      <th className="text-left py-1.5 px-2 text-[9px] uppercase font-black tracking-wider opacity-30">Pt.</th>
                      {SIZES.map((size, idx) => (
                        <th
                          key={size}
                          className={cn(
                            'text-center py-1.5 px-1.5 text-[9px] uppercase font-black tracking-wider',
                            idx === 2 ? 'text-primary' : 'opacity-30'
                          )}
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(tp.measurements || {}).map(([key, val]) => {
                      if (!val) return null
                      return (
                        <tr key={key} className="border-b border-border/10">
                          <td className="py-1.5 px-2 text-muted-foreground capitalize text-[10px]">
                            {key.replace(/([A-Z])/g, ' $1')}
                          </td>
                          {SIZES.map((size, idx) => (
                            <td
                              key={size}
                              className={cn(
                                'text-center py-1.5 px-1.5 tabular-nums',
                                idx === 2 ? 'font-black text-primary' : 'font-semibold'
                              )}
                            >
                              {getGradedValue(val, key, idx)}
                            </td>
                          ))}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* BOM */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Bill of Materials</h2>
              {(tp.bom || []).map((item, idx) => (
                <div key={idx} className="flex justify-between text-xs rounded-xl bg-muted/20 px-3 py-2">
                  <span className="font-medium">{item.item}</span>
                  <span className="text-muted-foreground">{item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Construction Notes */}
            {tp.constructionNotes && (
              <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-2">
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Construction Notes</h2>
                <p className="text-xs leading-relaxed text-muted-foreground">{tp.constructionNotes}</p>
              </div>
            )}

            {/* Comments Thread */}
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 opacity-50" />
                <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Comments</h2>
                {(tp.messages || []).length > 0 && (
                  <span className="rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[9px] font-bold ml-auto">
                    {(tp.messages || []).length}
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {(tp.messages || []).map(msg => (
                  <div key={msg.id} className="rounded-xl bg-muted/20 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black shrink-0',
                        msg.userRole === 'buyer' ? 'bg-green-500/20 text-green-400' :
                        msg.userRole === 'designer' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-orange-500/20 text-orange-400'
                      )}>
                        {msg.userName.charAt(0)}
                      </div>
                      <span className="text-[10px] font-bold">{msg.userName}</span>
                      <span className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        msg.userRole === 'buyer' ? 'bg-green-500/10 text-green-400' :
                        msg.userRole === 'designer' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-orange-500/10 text-orange-400'
                      )}>
                        {msg.userRole}
                      </span>
                      <span className="text-[9px] text-muted-foreground ml-auto">{formatRelativeTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-xs pl-6">{msg.text}</p>
                  </div>
                ))}
                {(tp.messages || []).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">No comments yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                  placeholder="Add a comment..."
                  className="flex-1 rounded-2xl bg-muted/20 border-none px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                />
                <button
                  onClick={handleComment}
                  className="rounded-2xl bg-primary text-primary-foreground p-2.5 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
