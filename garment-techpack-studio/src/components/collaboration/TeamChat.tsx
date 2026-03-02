import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { GlobalChatMessage } from '@/lib/collaboration'
import { CollabService } from '@/lib/collaboration'
import { formatRelativeTime } from '@/lib/techpack'

interface TeamChatProps {
  className?: string
}

export default function TeamChat({ className }: TeamChatProps) {
  const [messages, setMessages] = useState<GlobalChatMessage[]>(CollabService.getGlobalChat())
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return
    const updated = CollabService.sendGlobalMessage({
      userId: 'u1',
      userName: 'You (Designer)',
      avatar: 'D',
      text: input.trim(),
    })
    setMessages(updated)
    setInput('')
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="px-4 py-3 border-b border-border/50">
        <h3 className="text-[10px] uppercase font-black tracking-[0.3em] opacity-30">Team Chat</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">No messages yet</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.userId === 'u1'
          return (
            <div key={msg.id} className={cn('flex gap-2', isMe ? 'flex-row-reverse' : 'flex-row')}>
              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold shrink-0">
                {msg.avatar}
              </div>
              <div className={cn('max-w-[75%]', isMe ? 'items-end' : 'items-start')}>
                <p className={cn('text-[10px] font-medium mb-0.5', isMe ? 'text-right' : 'text-left')}>
                  {msg.userName}
                </p>
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
            placeholder="Type a message..."
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
