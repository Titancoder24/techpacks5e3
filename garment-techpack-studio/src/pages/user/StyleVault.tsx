import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, MessageSquare, Search, ArrowUpDown, Package } from 'lucide-react'
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

type SortMode = 'recent' | 'name' | 'cost'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
  exit: { opacity: 0, scale: 0.92, transition: { duration: 0.2 } },
}

export default function StyleVault() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('recent')
  const navigate = useNavigate()

  useEffect(() => {
    seedDataIfEmpty()
    setTechPacks(TechPackService.getAll())
  }, [])

  const filtered = useMemo(() => {
    let result = filter === 'all'
      ? techPacks
      : techPacks.filter(tp => tp.status === filter)

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(tp =>
        tp.styleName.toLowerCase().includes(q) ||
        tp.styleNumber.toLowerCase().includes(q) ||
        tp.pantoneCode.toLowerCase().includes(q)
      )
    }

    const sorted = [...result]
    switch (sort) {
      case 'name':
        sorted.sort((a, b) => a.styleName.localeCompare(b.styleName))
        break
      case 'cost':
        sorted.sort((a, b) => calculateGarmentCost(b) - calculateGarmentCost(a))
        break
      case 'recent':
      default:
        sorted.sort((a, b) => b.updatedAt - a.updatedAt)
        break
    }

    return sorted
  }, [techPacks, filter, search, sort])

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

  const sortOptions: { id: SortMode; label: string }[] = [
    { id: 'recent', label: 'Recent' },
    { id: 'name', label: 'Name' },
    { id: 'cost', label: 'Cost' },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
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

      {/* Search + Sort row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search styles, numbers, pantone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-border/30 bg-card pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/40 mr-1" />
          {sortOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setSort(opt.id)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all',
                sort === opt.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border border-border/30 text-muted-foreground hover:text-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('all')}
          className={cn(
            'px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap',
            filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/30 text-muted-foreground hover:text-foreground'
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
                filter === stage.id ? 'text-white' : 'text-muted-foreground hover:text-foreground'
              )}
              style={
                filter === stage.id
                  ? { backgroundColor: stage.hex }
                  : { backgroundColor: `${stage.hex}15`, color: stage.hex }
              }
            >
              {stage.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Empty state when no packs at all */}
      {techPacks.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="w-28 h-28 rounded-[28px] bg-card border border-border/30 flex items-center justify-center mb-6">
            <Package className="w-12 h-12 text-muted-foreground/20" />
          </div>
          <h2 className="text-lg font-black italic uppercase tracking-tighter mb-2">No styles yet</h2>
          <p className="text-sm text-muted-foreground mb-6">Create your first tech pack to get started.</p>
          <button
            onClick={handleNew}
            className="rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-8 py-3 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Style
          </button>
        </motion.div>
      ) : (
        <>
          {/* Empty search/filter state */}
          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <div className="w-20 h-20 rounded-[20px] bg-card border border-border/30 flex items-center justify-center mb-5">
                <Search className="w-8 h-8 text-muted-foreground/20" />
              </div>
              <h2 className="text-base font-black italic uppercase tracking-tighter mb-1">No matches found</h2>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
            </motion.div>
          )}

          {/* Cards grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {/* Create new card */}
            <motion.div
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNew}
              className="rounded-[24px] border-2 border-dashed border-border/50 flex flex-col items-center justify-center py-12 cursor-pointer hover:border-primary/30 transition-colors min-h-[300px]"
            >
              <div className="w-14 h-14 rounded-2xl bg-card border border-border/30 flex items-center justify-center mb-4">
                <Plus className="w-6 h-6 text-muted-foreground/40" />
              </div>
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Create New Style</p>
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
                    variants={cardVariants}
                    exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/editor/${tp.id}`)}
                    className="rounded-[24px] border border-border/30 bg-card overflow-hidden cursor-pointer group transition-shadow hover:shadow-xl"
                  >
                    {/* Pantone color gradient bar */}
                    <div className="h-3 w-full" style={{ background: `linear-gradient(90deg, ${tp.fabricColor}, ${tp.fabricColor}88, ${tp.fabricColor}44)` }} />

                    {/* Garment icon area */}
                    <div className={cn('h-24 bg-gradient-to-br flex items-center justify-center relative', TYPE_GRADIENTS[garmentType])}>
                      {garment && <garment.icon className="w-14 h-14 opacity-20" />}
                      <button
                        onClick={(e) => handleDelete(e, tp.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </button>
                    </div>

                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-1">
                          {garment?.category || 'Style'}
                        </p>
                        <h3 className="font-black italic uppercase tracking-tighter text-sm truncate">{tp.styleName}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{tp.styleNumber}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="bg-muted/30 rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                          {tp.season}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-4 h-4 rounded-full border border-border/40"
                            style={{ backgroundColor: tp.fabricColor }}
                          />
                          <span className="text-[9px] text-muted-foreground/60 font-mono">{tp.pantoneCode}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{
                            backgroundColor: `${stage?.hex}18`,
                            color: stage?.hex,
                            boxShadow: `0 0 12px ${stage?.hex}20`,
                          }}
                        >
                          {stage?.label}
                        </span>
                        <span className="text-xs font-bold">
                          <span className="text-[9px] text-muted-foreground/50 font-normal mr-0.5">Est.</span>
                          Rs.{cost}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/20">
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
          </motion.div>
        </>
      )}
    </div>
  )
}
