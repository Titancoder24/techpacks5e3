import { Outlet, NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Flame, Archive, Plus, BookOpen, Settings, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNavigate } from 'react-router-dom'
import { createBlankTechPack, TechPackService } from '@/lib/techpack'
import { toast } from 'sonner'
import { Toaster } from 'sonner'

export default function UserLayout() {
  const [dark, setDark] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const handleNewStyle = () => {
    const tp = createBlankTechPack()
    TechPackService.save(tp)
    toast.success('New style created')
    navigate(`/editor/${tp.id}`)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Toaster theme={dark ? 'dark' : 'light'} richColors position="top-right" />
      <aside className="w-16 h-screen flex flex-col items-center py-4 bg-card border-r border-border/50 gap-1">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-6">
          <Flame className="w-5 h-5 text-primary-foreground" />
        </div>

        <NavLink
          to="/"
          end
          className={({ isActive }) => cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          )}
          title="Style Vault"
        >
          <Archive className="w-4.5 h-4.5" />
        </NavLink>

        <button
          onClick={handleNewStyle}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-all"
          title="New Style"
        >
          <Plus className="w-4.5 h-4.5" />
        </button>

        <NavLink
          to="/garments"
          className={({ isActive }) => cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          )}
          title="Garments"
        >
          <BookOpen className="w-4.5 h-4.5" />
        </NavLink>

        <NavLink
          to="/approvals"
          className={({ isActive }) => cn(
            'w-10 h-10 rounded-xl flex items-center justify-center transition-all',
            isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          )}
          title="Approvals"
        >
          <Settings className="w-4.5 h-4.5" />
        </NavLink>

        <div className="flex-1" />

        <button
          onClick={() => setDark(!dark)}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-all"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold mt-2">
          D
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
