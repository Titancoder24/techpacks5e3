import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TechPackMessage } from '@/lib/techpack'
import { TechPackService, formatRelativeTime } from '@/lib/techpack'

interface StyleChatProps {
  techPackId: string
  messages: TechPackMessage[]
  onMessageSent?: () => void
  className?: string
}

const ROLE_COLORS: Record<string, string> = {
  designer: 'bg-blue-500/10 text-blue-400',
  buyer: 'bg-green-500/10 text-green-400',
  manufacturer: 'bg-orange-500/10 text-orange-400',
  admin: 'bg-purple-500/10 text-purple-400',
}

export default function StyleChat({ techPackId, messages, onMessageSent, className }: StyleChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const msg: TechPackMessage = {
      id: Math.random().toString(36).substr(2, 9),
      userId: 'u1',
      userName: 'You (Designer)',
      userRole: 'designer',
      text: input.trim(),
      timestamp: Date.now(),
    }
    TechPackService.addMessage(techPackId, msg)
    setInput('')
    onMessageSent?.()
  }

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Style Comments</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[300px]">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">No comments yet</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === 'u1'
          return (
            <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                {msg.userName.charAt(0)}
              </div>
              <div className={cn('max-w-[80%]', isMe ? 'items-end' : 'items-start')}>
                <div className={cn('flex items-center gap-1.5 mb-0.5', isMe ? 'flex-row-reverse' : 'flex-row')}>
                  <p className="text-[10px] font-medium">{msg.userName}</p>
                  <span className={cn('text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-full', ROLE_COLORS[msg.userRole] || 'bg-muted')}>
                    {msg.userRole}
                  </span>
                </div>
                <div className={cn(
                  'px-3 py-2 rounded-2xl text-xs',
                  isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm'
                )}>
                  {msg.text}
                </div>
                <p className={cn('text-[9px] text-muted-foreground mt-0.5', isMe ? 'text-right' : 'text-left')}>
                  {formatRelativeTime(msg.timestamp)}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border/50">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Add a comment..."
            className="flex-1 rounded-2xl bg-muted/30 border-none px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <button
            onClick={handleSend}
            className="rounded-2xl bg-primary text-primary-foreground p-2.5 hover:scale-105 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
