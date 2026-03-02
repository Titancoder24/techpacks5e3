import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, MessageSquare } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  TechPackService, createBlankTechPack, calculateGarmentCost,
  formatRelativeTime, APPROVAL_STAGES,
  type TechPack,
} from '@/lib/techpack'
import { GARMENT_REGISTRY } from '@/lib/garment-registry'
import { seedDataIfEmpty } from '@/App'

const TYPE_GRADIENTS: Record<string, string> = {
  top: 'from-blue-500/20 to-blue-600/5',
  bottom: 'from-amber-500/20 to-amber-600/5',
  dress: 'from-pink-500/20 to-pink-600/5',
  outer: 'from-slate-500/20 to-slate-600/5',
}

export default function StyleVault() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const [filter, setFilter] = useState<string>('all')
  const navigate = useNavigate()

  useEffect(() => {
    seedDataIfEmpty()
    setTechPacks(TechPackService.getAll())
  }, [])

  const filtered = filter === 'all'
    ? techPacks
    : techPacks.filter(tp => tp.status === filter)

  const handleNew = () => {
    const tp = createBlankTechPack()
    TechPackService.save(tp)
    toast.success('New style created')
    navigate(`/editor/${tp.id}`)
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    TechPackService.delete(id)
    setTechPacks(TechPackService.getAll())
    toast.success('Style deleted')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Style Vault</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {techPacks.length} of 100 slots used
          </p>
        </div>
        <button
          onClick={handleNew}
          className="rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-6 py-3 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> New Style
        </button>
      </div>

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          All ({techPacks.length})
        </button>
        {APPROVAL_STAGES.map(stage => {
          const count = techPacks.filter(tp => tp.status === stage.id).length
          return (
            <button
              key={stage.id}
              onClick={() => setFilter(stage.id)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
                filter === stage.id ? 'text-white' : 'text-muted-foreground hover:bg-muted'
              )}
              style={filter === stage.id ? { backgroundColor: stage.hex } : { backgroundColor: `${stage.hex}15` }}
            >
              {stage.label} ({count})
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleNew}
          className="rounded-[24px] border-2 border-dashed border-border/50 flex flex-col items-center justify-center py-12 cursor-pointer hover:border-primary/30 transition-colors min-h-[280px]"
        >
          <Plus className="w-8 h-8 text-muted-foreground/50 mb-3" />
          <p className="text-sm font-medium text-muted-foreground/50">Create New Style</p>
        </motion.div>

        <AnimatePresence>
          {filtered.map((tp) => {
            const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
            const garmentType = garment?.type || 'top'
            const stage = APPROVAL_STAGES.find(s => s.id === tp.status)
            const cost = calculateGarmentCost(tp)

            return (
              <motion.div
                key={tp.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/editor/${tp.id}`)}
                className="rounded-[24px] border border-white/10 dark:border-white/10 bg-card backdrop-blur-3xl overflow-hidden cursor-pointer group transition-shadow hover:shadow-xl"
              >
                <div className={cn('h-24 bg-gradient-to-br flex items-center justify-center relative', TYPE_GRADIENTS[garmentType])}>
                  {garment && <garment.icon className="w-10 h-10 opacity-30" />}
                  <button
                    onClick={(e) => handleDelete(e, tp.id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                  </button>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-1">
                      {garment?.category || 'Style'}
                    </p>
                    <h3 className="font-bold text-sm truncate">{tp.styleName}</h3>
                    <p className="text-xs text-muted-foreground">{tp.styleNumber}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="bg-muted/50 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                      {tp.season}
                    </span>
                    <div
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: tp.fabricColor }}
                      title={tp.pantoneCode}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        backgroundColor: `${stage?.hex}15`,
                        color: stage?.hex,
                      }}
                    >
                      {stage?.label}
                    </span>
                    <span className="text-xs font-bold">Rs.{cost}</span>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {tp.messages?.length || 0}
                    </span>
                    <span>{formatRelativeTime(tp.updatedAt)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
