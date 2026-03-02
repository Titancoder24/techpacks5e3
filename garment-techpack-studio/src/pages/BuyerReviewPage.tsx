import { useState, useEffect, lazy, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { toast, Toaster } from 'sonner'
import { CheckCircle2, RefreshCw, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TechPackService, calculateGarmentCost, formatRelativeTime,
  APPROVAL_STAGES, type TechPack, type TechPackMessage,
} from '@/lib/techpack'
import { GARMENT_REGISTRY, FABRIC_REGISTRY } from '@/lib/garment-registry'

const Scene = lazy(() => import('@/components/editor/Scene'))

export default function BuyerReviewPage() {
  const { id } = useParams()
  const [tp, setTp] = useState<TechPack | null>(null)
  const [comment, setComment] = useState('')

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

  return (
    <div className="min-h-screen bg-background">
      <Toaster theme="dark" richColors position="top-right" />

      <header className="h-16 border-b border-border/50 flex items-center justify-between px-6">
        <div>
          <h1 className="font-black text-lg">{tp.styleName}</h1>
          <p className="text-xs text-muted-foreground">{tp.styleNumber} -- Buyer Review</p>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ backgroundColor: `${stage?.hex}15`, color: stage?.hex }}
        >
          {stage?.label}
        </span>
      </header>

      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3D Preview */}
        <div className="space-y-4">
          <div className="h-[400px] rounded-[24px] overflow-hidden border border-border/30">
            <Suspense fallback={
              <div className="w-full h-full bg-muted/20 flex items-center justify-center">
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
        </div>

        {/* Right: Spec Sheet */}
        <div className="space-y-4">
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
              <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: tp.fabricColor }} />
              <span className="text-xs font-mono">{tp.pantoneCode}</span>
            </div>
          </div>

          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Measurements (cm)</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(tp.measurements || {}).map(([key, val]) => val ? (
                <div key={key} className="flex justify-between bg-muted/20 rounded-xl px-3 py-2">
                  <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span className="font-bold">{val}</span>
                </div>
              ) : null)}
            </div>
          </div>

          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Bill of Materials</h2>
            {(tp.bom || []).map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs bg-muted/20 rounded-xl px-3 py-2">
                <span className="font-medium">{item.item}</span>
                <span className="text-muted-foreground">{item.quantity}</span>
              </div>
            ))}
          </div>

          {tp.constructionNotes && (
            <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-2">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Construction Notes</h2>
              <p className="text-xs leading-relaxed text-muted-foreground">{tp.constructionNotes}</p>
            </div>
          )}

          {/* Comments */}
          <div className="rounded-[24px] border border-border/30 bg-card p-5 space-y-3">
            <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Comments</h2>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {(tp.messages || []).map(msg => (
                <div key={msg.id} className="bg-muted/20 rounded-xl px-3 py-2">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold">{msg.userName}</span>
                    <span className={cn(
                      'text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full',
                      msg.userRole === 'buyer' ? 'bg-green-500/10 text-green-400' :
                      msg.userRole === 'designer' ? 'bg-blue-500/10 text-blue-400' :
                      'bg-orange-500/10 text-orange-400'
                    )}>
                      {msg.userRole}
                    </span>
                    <span className="text-[9px] text-muted-foreground ml-auto">{formatRelativeTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-xs">{msg.text}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 rounded-2xl bg-muted/30 border-none px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
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
    </div>
  )
}
