import { ANIMATION_REGISTRY } from '@/lib/garment-registry'
import { cn } from '@/lib/utils'

interface TimelineProps {
  selectedAnimation: string
  onSelect: (id: string) => void
}

export default function Timeline({ selectedAnimation, onSelect }: TimelineProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {ANIMATION_REGISTRY.map((anim) => (
        <button
          key={anim.id}
          onClick={() => onSelect(anim.id)}
          className={cn(
            'px-2 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all',
            'hover:scale-105 active:scale-95',
            selectedAnimation === anim.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
          )}
        >
          {anim.name}
        </button>
      ))}
    </div>
  )
}
