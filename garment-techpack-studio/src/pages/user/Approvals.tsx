import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, MousePointerClick } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TechPackService, APPROVAL_STAGES, calculateGarmentCost, formatRelativeTime, type TechPack } from '@/lib/techpack'
import { GARMENT_REGISTRY } from '@/lib/garment-registry'

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] } },
}

const columnVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export default function Approvals() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setTechPacks(TechPackService.getAll())
  }, [])

  const stageCounts = APPROVAL_STAGES.map(stage => ({
    ...stage,
    count: techPacks.filter(tp => tp.status === stage.id).length,
  }))

  return (
    <div className="p-6">
      {/* Header */}
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-5">Approval Board</h1>

      {/* Count summary bar */}
      <div className="rounded-[24px] border border-border/30 bg-card p-4 mb-6">
        <div className="flex items-center gap-3 overflow-x-auto">
          <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 shrink-0 mr-1">Pipeline</p>
          {stageCounts.map(stage => (
            <div
              key={stage.id}
              className="flex items-center gap-2 shrink-0 rounded-xl px-3 py-1.5"
              style={{ backgroundColor: `${stage.hex}10` }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: stage.hex }}
              />
              <span className="text-[10px] font-bold whitespace-nowrap" style={{ color: stage.hex }}>
                {stage.label}
              </span>
              <span
                className="text-[11px] font-black ml-0.5"
                style={{ color: stage.hex }}
              >
                {stage.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kanban board - horizontally scrollable on mobile with snap */}
      <div
        className="flex gap-4 overflow-x-auto pb-4"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {APPROVAL_STAGES.map(stage => {
          const items = techPacks.filter(tp => tp.status === stage.id)
          return (
            <div
              key={stage.id}
              className="min-w-[300px] w-[300px] shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              {/* Column header with colored top border */}
              <div
                className="rounded-t-[20px] border border-border/30 border-b-0 bg-card px-4 pt-1 pb-3"
                style={{ borderTop: `4px solid ${stage.hex}` }}
              >
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stage.hex, boxShadow: `0 0 8px ${stage.hex}40` }}
                    />
                    <h3 className="text-xs font-black uppercase tracking-wider">{stage.label}</h3>
                  </div>
                  <span
                    className="text-[11px] font-black rounded-full px-2.5 py-0.5"
                    style={{ backgroundColor: `${stage.hex}15`, color: stage.hex }}
                  >
                    {items.length}
                  </span>
                </div>
              </div>

              {/* Column body */}
              <div className="rounded-b-[20px] border border-border/30 border-t-0 bg-card/50 p-2.5 min-h-[120px]">
                <motion.div
                  variants={columnVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-2.5"
                >
                  {items.map(tp => {
                    const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
                    const cost = calculateGarmentCost(tp)
                    return (
                      <motion.div
                        key={tp.id}
                        variants={cardVariants}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/editor/${tp.id}`)}
                        className="rounded-[16px] border border-border/30 bg-card p-3.5 cursor-pointer group transition-shadow hover:shadow-lg relative overflow-hidden"
                        style={{ borderLeft: `3px solid ${stage.hex}` }}
                      >
                        <div className="flex items-start gap-3">
                          {garment && (
                            <div className="w-9 h-9 rounded-xl bg-muted/20 flex items-center justify-center shrink-0 border border-border/20">
                              <garment.icon className="w-4.5 h-4.5 opacity-40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black italic uppercase tracking-tight truncate">{tp.styleName}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{tp.styleNumber}</p>
                          </div>
                          {/* Fabric color dot */}
                          <div
                            className="w-4 h-4 rounded-full shrink-0 border border-border/30"
                            style={{ backgroundColor: tp.fabricColor }}
                            title={tp.pantoneCode}
                          />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-muted/20 border border-border/20 rounded-full px-2 py-0.5 font-semibold">
                              {tp.season}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground">
                              <span className="text-[9px] font-normal opacity-60 mr-0.5">Est.</span>
                              Rs.{cost}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-3 h-3" />
                              {tp.messages?.length || 0}
                            </span>
                            <span>{formatRelativeTime(tp.updatedAt)}</span>
                          </div>
                        </div>

                        {/* Click to edit hover state */}
                        <div className="absolute inset-0 flex items-center justify-center bg-card/90 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-[16px]">
                          <div className="flex items-center gap-1.5 text-primary">
                            <MousePointerClick className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Click to edit</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  {/* Empty column state */}
                  {items.length === 0 && (
                    <div className="rounded-[16px] border-2 border-dashed border-border/20 p-8 text-center">
                      <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-20">
                        No items in this stage
                      </p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
