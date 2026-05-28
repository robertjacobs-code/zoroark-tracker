'use client'

import Image from 'next/image'
import type { Card } from '@/lib/supabase'

type PageProps = { pageNum: number; cards: Card[] }

export function BinderPageDisplay({ pageNum, cards }: PageProps) {
  const rows = groupByRow(cards)
  return (
    <div style={{ flex: 1, background: '#fff', borderRadius: 16, border: '1px solid rgba(0,0,0,0.07)', padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7f77dd', marginBottom: 16 }}>
        Page {pageNum}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {rows.map((rowCards, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            {Array.from({ length: 3 }).map((_, i) => {
              const card = rowCards[i]
              return card ? <BinderCard key={card.id} card={card} /> : <EmptySlot key={i} />
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function BinderCard({ card }: { card: Card }) {
  return (
    <div style={{ opacity: card.copies_owned > 0 ? 1 : 0.35, transition: 'opacity 0.2s', flex: '1 1 0' }}>
      <div style={{ aspectRatio: '2.5/3.5', borderRadius: 6, overflow: 'hidden', background: '#f0ede8', border: '1px solid rgba(0,0,0,0.08)', position: 'relative' }}>
        {card.image_url ? (
          <Image src={card.image_url} alt={card.card_name} fill style={{ objectFit: 'cover' }} unoptimized />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 10, fontStyle: 'italic' }}>
            no image
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#aaa', marginTop: 3, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {card.card_number}
      </div>
      <div style={{ fontSize: 10, textAlign: 'center', color: card.copies_owned === 3 ? '#16a34a' : '#7f77dd', fontWeight: 600 }}>
        {card.copies_owned}/3
      </div>
    </div>
  )
}

function EmptySlot() {
  return (
    <div style={{ flex: '1 1 0' }}>
      <div style={{ aspectRatio: '2.5/3.5', borderRadius: 6, background: '#f5f3f0', border: '1px dashed rgba(0,0,0,0.1)' }} />
    </div>
  )
}

function groupByRow(cards: Card[]): Card[][] {
  const rows: Record<number, Card[]> = {}
  for (const c of cards) {
    const r = c.binder_row ?? 0
    if (!rows[r]) rows[r] = []
    rows[r].push(c)
  }
  return Object.keys(rows).map(Number).sort((a, b) => a - b).map(r => rows[r])
}