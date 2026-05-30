import { calcPhase, GuestPhase } from '@/lib/phase'
import { FacilitySettings } from '@/lib/store'

interface Props {
  checkIn: string
  checkOut: string
  settings: Pick<FacilitySettings, 'checkInTime' | 'checkOutTime'>
  arrivedAt?: string
  size?: 'sm' | 'md'
}

const PHASE_CONFIG: Record<GuestPhase, { label: string; emoji: string; cls: string }> = {
  booked:  { label: '予約済', emoji: '📅', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  staying: { label: '滞在中', emoji: '🏠', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' },
  post:    { label: '滞在後', emoji: '✨', cls: 'text-gold-400 bg-gold-500/10 border-gold-500/30' },
}

export default function PhaseBadge({ checkIn, checkOut, settings, arrivedAt, size = 'sm' }: Props) {
  if (!checkIn || !checkOut) return null
  const phase = calcPhase(checkIn, checkOut, settings.checkInTime, settings.checkOutTime, arrivedAt)
  const c = PHASE_CONFIG[phase]
  const textSize = size === 'md' ? 'text-xs' : 'text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1 border rounded-full px-2 py-0.5 font-medium whitespace-nowrap ${textSize} ${c.cls}`}>
      {c.emoji} {c.label}
    </span>
  )
}
