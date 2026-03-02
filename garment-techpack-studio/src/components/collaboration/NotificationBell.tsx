import { useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CollabService, type Notification } from '@/lib/collaboration'
import { formatRelativeTime } from '@/lib/techpack'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>(CollabService.getNotifications())
  const unread = notifications.filter(n => !n.read).length

  const handleToggle = () => {
    if (!open && unread > 0) {
      CollabService.markAllRead()
      setNotifications(CollabService.getNotifications())
    }
    setOpen(!open)
  }

  const TYPE_ICONS: Record<string, string> = {
    approval: 'A',
    comment: 'C',
    status_change: 'S',
    mention: '@',
  }

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-xl hover:bg-muted/50 transition-colors"
      >
        <Bell className="w-4.5 h-4.5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full text-[9px] font-bold flex items-center justify-center">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 bg-card border border-border/50 rounded-[20px] shadow-2xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border/50">
              <h3 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Notifications</h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                notifications.slice(0, 10).map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      'px-4 py-3 border-b border-border/30 hover:bg-muted/30 transition-colors',
                      !n.read && 'bg-primary/5'
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                        {TYPE_ICONS[n.type] || 'N'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {n.fromUser} -- {n.techPackName}
                        </p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {formatRelativeTime(n.timestamp)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
