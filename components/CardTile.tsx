'use client'
import Image from 'next/image'
import { useState } from 'react'
import type { Card } from '@/lib/supabase'

const CARD_W = 160
const CARD_H = 223

type Props = { card: Card; isAdmin: boolean; onUpdate?: (id: string, copies: number) => void }

const REGION_FLAG: Record<string, string> = {
  EN: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷', DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', PT: '🇵🇹',
}

export default function CardTile({ card, isAdmin, onUpdate }: Props) {
  const [copies, setCopies] = useState(card.copies_owned)
  const [saving, setSaving] = useState(false)
  const noneOwned = copies === 0

  async function toggleCopy(idx: number) {
    if (!isAdmin || saving) return
    const newCopies = copies > idx ? idx : idx + 1
    setSaving(true)
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copies_owned: newCopies }),
      })
      if (res.ok) { setCopies(newCopies); onUpdate?.(card.id, newCopies) }
    } finally { setSaving(false) }
  }

  function CardImg({ idx }: { idx: number }) {
    const owned = idx < copies
    return (
      <div
        onClick={() => toggleCopy(idx)}
        style={{
          width: CARD_W, height: CARD_H, borderRadius: 8, overflow: 'hidden',
          background: '#e8e4de', border: '1px solid rgba(0,0,0,0.08)',
          opacity: owned ? 1 : 0.2, transition: 'opacity 0.2s, transform 0.15s',
          cursor: isAdmin ? 'pointer' : 'default', flexShrink: 0,
          transform: isAdmin && owned ? undefined : undefined,
        }}
        onMouseEnter={e => { if (isAdmin) (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)' }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'none' }}
      >
        {card.image_url ? (
          <Image src={card.image_url} alt={`${card.card_name} ${card.card_number}`}
            width={CARD_W} height={CARD_H}
            style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }} unoptimized />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: 11 }}>
            No image
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '16px',
      border: '1px solid rgba(0,0,0,0.07)',
      opacity: noneOwned ? 0.5 : 1, transition: 'opacity 0.2s',
      display: 'flex', gap: 16, alignItems: 'flex-start',
    }}>
      {/* 3 card images side by side */}
      <div className="cards-row" style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
        <CardImg idx={0} />
        <CardImg idx={1} />
        <CardImg idx={2} />
      </div>

      {/* Info panel */}
      <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
        <div style={{ fontSize: 11, color: '#999', fontWeight: 500, marginBottom: 4 }}>
          {REGION_FLAG[card.region] ?? ''} {card.region} · {card.release_date?.slice(0, 4)}
        </div>
        <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15, color: '#1a1a1a', lineHeight: 1.2, marginBottom: 6 }}>
          {card.card_name}
        </div>
        <div style={{ fontSize: 12, color: '#666', marginBottom: 2 }}>{card.set_name}</div>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 2 }}>#{card.card_number}</div>
        {card.finish && <div style={{ fontSize: 11, color: '#aaa', marginBottom: 2 }}>{card.finish}</div>}
        {card.rarity && <div style={{ fontSize: 11, color: '#bbb', marginBottom: 2 }}>{card.rarity}</div>}
        {card.form_mechanic && <div style={{ fontSize: 11, color: '#ccc' }}>{card.form_mechanic}</div>}

        {card.binder_page && (
          <div style={{ marginTop: 8, fontSize: 11, color: '#7f77dd', fontWeight: 500 }}>
            Binder p.{card.binder_page} · row {card.binder_row}
          </div>
        )}

        {/* Copy dots */}
        <div style={{ display: 'flex', gap: 6, marginTop: 12, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <button key={i} onClick={() => toggleCopy(i)} disabled={!isAdmin || saving}
              title={isAdmin ? (i < copies ? 'Remove copy' : 'Mark owned') : undefined}
              style={{
                width: 20, height: 20, borderRadius: '50%', padding: 0,
                background: i < copies ? '#7f77dd' : 'transparent',
                border: i < copies ? '2px solid #7f77dd' : '2px solid #ddd',
                cursor: isAdmin ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {i < copies && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
            </button>
          ))}
          <span style={{ fontSize: 11, color: '#bbb', marginLeft: 4 }}>{copies}/3</span>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cards-row { gap: 3px !important; }
          .cards-row > div { width: 90px !important; height: 126px !important; }
        }
      `}</style>
    </div>
  )
}
