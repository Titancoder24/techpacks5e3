import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TEAM_MEMBERS } from '@/lib/collaboration'
import { formatRelativeTime } from '@/lib/techpack'

const ROLE_COLORS: Record<string, string> = {
  designer: 'bg-blue-500/10 text-blue-400',
  buyer: 'bg-green-500/10 text-green-400',
  manufacturer: 'bg-orange-500/10 text-orange-400',
  admin: 'bg-purple-500/10 text-purple-400',
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Team</h1>
        <button className="rounded-2xl font-black uppercase tracking-widest text-[11px] bg-primary text-primary-foreground px-5 py-2.5 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      <div className="rounded-[24px] border border-border/30 bg-card backdrop-blur-3xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/30">
              <th className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 text-left px-5 py-3">User</th>
              <th className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 text-left px-5 py-3">Email</th>
              <th className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 text-left px-5 py-3">Role</th>
              <th className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 text-left px-5 py-3">Status</th>
              <th className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30 text-left px-5 py-3">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map(member => (
              <tr key={member.id} className="border-b border-border/10 hover:bg-muted/20 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                      {member.avatar}
                    </div>
                    <span className="text-sm font-medium">{member.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{member.email}</td>
                <td className="px-5 py-3">
                  <span className={cn('text-[9px] font-bold uppercase px-2.5 py-1 rounded-full', ROLE_COLORS[member.role])}>
                    {member.role}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-2 h-2 rounded-full', member.isOnline ? 'bg-green-400' : 'bg-muted-foreground/30')} />
                    <span className="text-xs">{member.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">
                  {formatRelativeTime(member.lastSeen)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
