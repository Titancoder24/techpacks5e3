import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GARMENT_REGISTRY, GARMENT_CATEGORIES } from '@/lib/garment-registry'

export default function GarmentLibrary() {
  const [filter, setFilter] = useState('All')

  const filtered = filter === 'All'
    ? GARMENT_REGISTRY
    : GARMENT_REGISTRY.filter(g => g.category === filter)

  const TYPE_COLORS: Record<string, string> = {
    top: 'bg-blue-500/10 text-blue-400',
    bottom: 'bg-amber-500/10 text-amber-400',
    dress: 'bg-pink-500/10 text-pink-400',
    outer: 'bg-slate-500/10 text-slate-400',
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Garment Library</h1>

      <div className="flex gap-2 mb-6 flex-wrap">
        {GARMENT_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
              filter === cat ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map((g) => (
          <motion.div
            key={g.id}
            whileHover={{ scale: 1.03, y: -4 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-[20px] border border-border/30 bg-card p-4 cursor-pointer transition-shadow hover:shadow-lg"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <g.icon className="w-6 h-6 opacity-40" />
            </div>
            <h3 className="text-xs font-bold mb-2">{g.name}</h3>
            <div className="flex items-center gap-1.5">
              <span className={cn('text-[8px] font-bold uppercase px-2 py-0.5 rounded-full', TYPE_COLORS[g.type])}>
                {g.type}
              </span>
              <span className="text-[8px] font-bold uppercase px-2 py-0.5 rounded-full bg-muted/50 text-muted-foreground">
                {g.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
