import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell } from 'recharts'
import { TechPackService, APPROVAL_STAGES, calculateGarmentCost, formatRelativeTime, type TechPack } from '@/lib/techpack'
import { GARMENT_REGISTRY } from '@/lib/garment-registry'
import { TEAM_MEMBERS, CollabService } from '@/lib/collaboration'

const CATEGORY_COLORS: Record<string, string> = {
  top: '#3b82f6',
  bottom: '#22c55e',
  dress: '#ec4899',
  outer: '#f97316',
}

const CATEGORY_LABELS: Record<string, string> = {
  top: 'Tops',
  bottom: 'Bottoms',
  dress: 'Dresses',
  outer: 'Outerwear',
}

const ROLE_COLORS: Record<string, string> = {
  designer: '#3b82f6',
  buyer: '#22c55e',
  manufacturer: '#f97316',
  admin: '#a855f7',
}

export default function Overview() {
  const [techPacks, setTechPacks] = useState<TechPack[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    setTechPacks(TechPackService.getAll())
  }, [])

  const totalStyles = techPacks.length
  const approved = techPacks.filter(tp => tp.status === 'approved').length
  const pending = techPacks.filter(tp => tp.status === 'sent_to_buyer' || tp.status === 'buyer_reviewing').length
  const allCosts = techPacks.map(tp => calculateGarmentCost(tp))
  const totalCost = allCosts.reduce((sum, c) => sum + c, 0)
  const avgCost = allCosts.length > 0 ? Math.round(totalCost / allCosts.length) : 0
  const minCost = allCosts.length > 0 ? Math.min(...allCosts) : 0
  const maxCost = allCosts.length > 0 ? Math.max(...allCosts) : 0

  const pipelineData = APPROVAL_STAGES.map(stage => ({
    name: stage.label,
    count: techPacks.filter(tp => tp.status === stage.id).length,
    color: stage.hex,
  }))

  // Styles by Category data
  const categoryCountMap: Record<string, number> = {}
  techPacks.forEach(tp => {
    const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
    if (garment) {
      categoryCountMap[garment.type] = (categoryCountMap[garment.type] || 0) + 1
    }
  })
  const categoryData = Object.entries(categoryCountMap)
    .map(([type, count]) => ({
      name: CATEGORY_LABELS[type] || type,
      value: count,
      color: CATEGORY_COLORS[type] || '#6b7280',
    }))
    .filter(d => d.value > 0)

  const recentActivity = [...techPacks]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 8)

  const stats = [
    { label: 'Total Styles', value: totalStyles, color: '#3b82f6' },
    { label: 'Approved', value: approved, color: '#22c55e' },
    { label: 'Pending Review', value: pending, color: '#eab308' },
    { label: 'Est. Total Cost', value: `Rs.${totalCost.toLocaleString()}`, color: '#a855f7' },
  ]

  const onlineMembers = CollabService.getOnlineMembers()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-black italic uppercase tracking-tighter">Overview</h1>

      {/* Stat Cards with colored left border */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rounded-[24px] border border-border/30 bg-card p-5 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px]" style={{ backgroundColor: stat.color }} />
            <div className="pl-2">
              <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">{stat.label}</p>
              <p className="text-2xl font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Pipeline + Styles by Category Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-[24px] border border-border/30 bg-card p-5">
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

        {/* Styles by Category Donut Chart */}
        <div className="rounded-[24px] border border-border/30 bg-card p-5">
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Styles by Category</h2>
          {categoryData.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No styles yet</p>
          ) : (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                      strokeWidth={0}
                    >
                      {categoryData.map((entry, idx) => (
                        <PieCell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '12px',
                        fontSize: '11px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                {categoryData.map(cat => (
                  <div key={cat.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-[10px] font-semibold text-muted-foreground">{cat.name} ({cat.value})</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Cost Distribution + Team Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cost Distribution */}
        <div className="lg:col-span-2 rounded-[24px] border border-border/30 bg-card p-5">
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Cost Distribution</h2>
          {allCosts.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">No styles to calculate</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-[24px] border border-border/30 bg-card p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px] bg-green-500" />
                <div className="pl-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Minimum</p>
                  <p className="text-xl font-black text-green-500 mt-1">Rs.{minCost.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-border/30 bg-card p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px] bg-blue-500" />
                <div className="pl-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Average</p>
                  <p className="text-xl font-black text-blue-500 mt-1">Rs.{avgCost.toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-[24px] border border-border/30 bg-card p-4 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-[24px] bg-red-500" />
                <div className="pl-2">
                  <p className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Maximum</p>
                  <p className="text-xl font-black text-red-500 mt-1">Rs.{maxCost.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Team Activity */}
        <div className="rounded-[24px] border border-border/30 bg-card p-5">
          <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Team Activity</h2>
          <div className="space-y-2.5">
            {TEAM_MEMBERS.map(member => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ backgroundColor: ROLE_COLORS[member.role] || '#6b7280' }}
                  >
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                      member.isOnline ? 'bg-green-500' : 'bg-muted-foreground/30'
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{member.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{member.role}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    member.isOnline
                      ? 'bg-green-500/10 text-green-500'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}
                >
                  {member.isOnline ? 'Online' : formatRelativeTime(member.lastSeen)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity - Enhanced Cards */}
      <div className="rounded-[24px] border border-border/30 bg-card p-5">
        <h2 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 mb-4">Recent Activity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {recentActivity.map(tp => {
            const garment = GARMENT_REGISTRY.find(g => g.id === tp.garmentType)
            const stage = APPROVAL_STAGES.find(s => s.id === tp.status)
            return (
              <button
                key={tp.id}
                onClick={() => navigate(`/editor/${tp.id}`)}
                className="rounded-[24px] border border-border/30 bg-card p-4 text-left hover:scale-105 active:scale-95 transition-all"
              >
                <div className="flex items-start gap-3 mb-3">
                  {garment && (
                    <div className="w-9 h-9 rounded-xl bg-muted/20 flex items-center justify-center shrink-0">
                      <garment.icon className="w-4 h-4 opacity-50" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{tp.styleName}</p>
                    <p className="text-[10px] text-muted-foreground">{tp.styleNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-5 h-5 rounded-md border border-border/30 shrink-0"
                    style={{ backgroundColor: tp.fabricColor }}
                  />
                  <span className="text-[10px] text-muted-foreground font-mono truncate">{tp.pantoneCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span
                    className="rounded-full px-2.5 py-0.5 text-[9px] font-semibold"
                    style={{ backgroundColor: `${stage?.hex}1a`, color: stage?.hex }}
                  >
                    {stage?.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{formatRelativeTime(tp.updatedAt)}</span>
                </div>
              </button>
            )
          })}
          {recentActivity.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-8 col-span-full">No activity yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
