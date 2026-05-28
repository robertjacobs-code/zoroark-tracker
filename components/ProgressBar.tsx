'use client'

import type { Card } from '@/lib/supabase'

type Props = {
  cards: Card[]
  label: string
}

export default function ProgressBar({ cards, label }: Props) {
  const active = cards.filter((c) => !c.is_excluded)
  const total = active.length * 3
  const owned = active.reduce((sum, c) => sum + c.copies_owned, 0)
  const complete = active.filter((c) => c.copies_owned === 3).length
  const pct = total === 0 ? 0 : Math.round((owned / total) * 100)

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
        <span style={{ fontWeight: 500 }}>{label}</span>
        <span style={{ color: '#aaa' }}>
          {owned}/{total} copies · {complete}/{active.length} complete · {pct}%
        </span>
      </div>
      <div style={{ height: 8, background: '#2a2a2a', borderRadius: 4, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: pct === 100 ? '#4ade80' : '#7f77dd',
            borderRadius: 4,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  )
}
