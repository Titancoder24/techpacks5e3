import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { TechPackService, APPROVAL_STAGES, calculateGarmentCost, formatRelativeTime, type TechPack } from '@/lib/techpack'
import { GARMENT_REGISTRY } from '@/lib/garment-registry'

export default function Overview() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setTechPacks(TechPackService.getAll())
  }, [])

  const totalStyles = techPacks.length
  const approved = techPacks.filter(tp => tp.status === 'approved').length
  const pending = techPacks.filter(tp => tp.status === 'sent_to_buyer' || tp.status === 'buyer_reviewing').length
  const totalCost = techPacks.reduce((sum, tp) => sum + calculateGarmentCost(tp), 0)

  const pipelineData = APPROVAL_STAGES.map(stage => ({
    name: stage.label,
    count: techPacks.filter(tp => tp.status === stage.id).length,
    color: stage.hex,
  }))

  const recentActivity = [...techPacks]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)

  const stats = [
    { label: 'Total Styles', value: totalStyles, color: '#3b82f6' },
    { label: 'Approved', value: approved, color: '#22c55e' },
    { label: 'Pending Review', value: pending, color: '#eab308' },
    { label: 'Est. Total Cost', value: `Rs.${totalCost.toLocaleString()}`, color: '#a855f7' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5">
            <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">{stat.label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5">
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Pipeline</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pipelineData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={24}>
                  {pipelineData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl p-5">
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Recent Activity</h2>
          <div className="space-y-2">
            {recentActivity.map(tp => {
              const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
              const stage = APPROVAL_STAGES.find(s => s.id === tp.status)
              return (
                <button
                  key={tp.id}
                  onClick={() => navigate(`/editor/${tp.id}`)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors text-left"
                >
                  {garment && (
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <garment.icon className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{tp.styleName}</p>
                    <p className="text-[10px] text-muted-foreground">{formatRelativeTime(tp.updatedAt)}</p>
                  </div>
                  <span
                    className="rounded-full px-2 py-0.5 text-[9px] font-semibold shrink-0"
                    style={{ backgroundColor: `${stage?.hex}15`, color: stage?.hex }}
                  >
                    {stage?.label}
                  </span>
                </button>
              )
            })}
            {recentActivity.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-8">No activity yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
