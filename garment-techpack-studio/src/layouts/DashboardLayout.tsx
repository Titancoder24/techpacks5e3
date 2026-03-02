import { Outlet } from 'react-router-dom'
import { Search, Sun, Moon } from 'lucide-react'
import { useState, useEffect } from 'react'
import Sidebar from '@/components/dashboard/Sidebar'
import NotificationBell from '@/components/collaboration/NotificationBell'

export default function DashboardLayout() {
  const [dark, setDark] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border/50 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search styles, garments..."
              className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl hover:bg-muted/50 transition-colors"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
