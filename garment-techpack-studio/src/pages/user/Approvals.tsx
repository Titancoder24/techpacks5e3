import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TechPackService, APPROVAL_STAGES, formatRelativeTime, type TechPack } from '@/lib/techpack'
import { GARMENT_REGISTRY } from '@/lib/garment-registry'

export default function Approvals() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setTechPacks(TechPackService.getAll())
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-6">Approval Board</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {APPROVAL_STAGES.map(stage => {
          const items = techPacks.filter(tp => tp.status === stage.id)
          return (
            <div key={stage.id} className="min-w-[280px] w-[280px] shrink-0">
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.hex }} />
                <h3 className="text-xs font-bold uppercase tracking-wider">{stage.label}</h3>
                <span className="text-[10px] font-bold bg-muted/50 rounded-full px-2 py-0.5 ml-auto">
                  {items.length}
                </span>
              </div>

              <div className="space-y-2">
                {items.map(tp => {
                  const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
                  return (
                    <motion.div
                      key={tp.id}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/editor/${tp.id}`)}
                      className="rounded-[16px] border border-border/30 bg-card p-3 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-2.5">
                        {garment && (
                          <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                            <garment.icon className="w-4 h-4 opacity-50" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{tp.styleName}</p>
                          <p className="text-[10px] text-muted-foreground">{tp.styleNumber}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[10px] bg-muted/50 rounded-full px-2 py-0.5 font-semibold">{tp.season}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-0.5">
                            <MessageSquare className="w-3 h-3" />
                            {tp.messages?.length || 0}
                          </span>
                          <span>{formatRelativeTime(tp.updatedAt)}</span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}

                {items.length === 0 && (
                  <div className="rounded-[16px] border border-dashed border-border/30 p-6 text-center">
                    <p className="text-[10px] text-muted-foreground/50">No items</p>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
