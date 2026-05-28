'use client'
import type { Card } from '@/lib/supabase'

type Props = { cards: Card[]; label: string; large?: boolean }

export default function ProgressBar({ cards, label, large }: Props) {
  const active = cards.filter(c => !c.is_excluded)
  const total = active.length * 3
  const owned = active.reduce((s, c) => s + c.copies_owned, 0)
  const complete = active.filter(c => c.copies_owned === 3).length
  const pct = total === 0 ? 0 : Math.round((owned / total) * 100)

  return (
    <div style={{ marginBottom: large ? 20 : 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'baseline' }}>
        <span style={{ fontWeight: 600, fontSize: large ? 15 : 13, color: '#1a1a1a' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#999' }}>
          {owned}/{total} copies · {complete}/{active.length} sets · <strong style={{ color: pct === 100 ? '#16a34a' : '#7f77dd' }}>{pct}%</strong>
        </span>
      </div>
      <div style={{ height: large ? 6 : 4, background: 'rgba(0,0,0,0.08)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: pct === 100 ? '#16a34a' : '#7f77dd',
          borderRadius: 999, transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  )
}
