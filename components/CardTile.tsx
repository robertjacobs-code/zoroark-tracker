'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Card } from '@/lib/supabase'

const CARD_W = 180
const CARD_H = 251

type Props = {
  card: Card
  isAdmin: boolean
  onUpdate?: (id: string, copies: number) => void
}

const REGION_FLAG: Record<string, string> = {
  EN: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷',
  DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', PT: '🇵🇹',
}

function CardImage({ imageUrl, name, number, opacity, onClick, isAdmin, badge }: {
  imageUrl: string | null; name: string; number: string
  opacity: number; onClick?: () => void; isAdmin: boolean; badge?: string
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width: CARD_W,
        height: CARD_H,
        borderRadius: 10,
        overflow: 'hidden',
        opacity,
        transition: 'opacity 0.2s',
        cursor: isAdmin && onClick ? 'pointer' : 'default',
        flexShrink: 0,
        background: '#1e1e2e',
        border: '1px dashed #333',
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={`${name} ${number}`}
          width={CARD_W}
          height={CARD_H}
          style={{ objectFit: 'cover', display: 'block', width: '100%', height: '100%' }}
          unoptimized
        />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 12 }}>
          No image
        </div>
      )}
      {badge && (
        <div style={{
          position: 'absolute', bottom: 6, right: 6,
          background: badge === '3/3' ? '#4ade80' : '#7f77dd',
          color: '#fff', borderRadius: 20, padding: '2px 8px',
          fontSize: 12, fontWeight: 600,
        }}>
          {badge}
        </div>
      )}
    </div>
  )
}

export default function CardTile({ card, isAdmin, onUpdate }: Props) {
  const [copies, setCopies] = useState(card.copies_owned)
  const [saving, setSaving] = useState(false)
  const noneOwned = copies === 0

  async function handleCopyClick(newCopies: number) {
    if (!isAdmin || saving) return
    setSaving(true)
    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copies_owned: newCopies }),
      })
      if (res.ok) {
        setCopies(newCopies)
        onUpdate?.(card.id, newCopies)
      }
    } finally {
      setSaving(false)
    }
  }

  function toggleCopy(idx: number) {
    const newCopies = copies > idx ? idx : idx + 1
    handleCopyClick(newCopies)
  }

  return (
    <div style={{ opacity: noneOwned ? 0.35 : 1, transition: 'opacity 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

      {/* Desktop: 3 cards side by side in a row */}
      <div className="stack-desktop" style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {[0, 1, 2].map((idx) => (
          <CardImage
            key={idx}
            imageUrl={card.image_url}
            name={card.card_name}
            number={card.card_number}
            opacity={idx < copies ? 1 : 0.15}
            onClick={() => toggleCopy(idx)}
            isAdmin={isAdmin}
          />
        ))}
      </div>

      {/* Mobile: single card with counter badge */}
      <div className="stack-mobile" style={{ marginBottom: 10 }}>
        <CardImage
          imageUrl={card.image_url}
          name={card.card_name}
          number={card.card_number}
          opacity={1}
          onClick={() => handleCopyClick(copies < 3 ? copies + 1 : 0)}
          isAdmin={isAdmin}
          badge={`${copies}/3`}
        />
      </div>

      {/* Copy dots (desktop) */}
      <div className="copy-dots" style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => toggleCopy(i)}
            disabled={!isAdmin || saving}
            title={isAdmin ? (i < copies ? 'Remove copy' : 'Mark owned') : undefined}
            style={{
              width: 12, height: 12, borderRadius: '50%',
              background: i < copies ? '#7f77dd' : '#2a2a2a',
              border: i < copies ? '2px solid #9f97ed' : '2px solid #444',
              cursor: isAdmin ? 'pointer' : 'default',
              padding: 0,
            }}
          />
        ))}
      </div>

      {/* Card info */}
      <div style={{ fontSize: 12, lineHeight: 1.5 }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>
          {REGION_FLAG[card.region] ?? ''} {card.card_name}
        </div>
        <div style={{ color: '#aaa' }}>{card.set_name}</div>
        <div style={{ color: '#888' }}>#{card.card_number}</div>
        {card.finish && <div style={{ color: '#777' }}>{card.finish}</div>}
        {card.rarity && <div style={{ color: '#666' }}>{card.rarity}</div>}
        {card.binder_page && (
          <div style={{ marginTop: 4, color: '#7f77dd', fontSize: 11 }}>
            Binder p.{card.binder_page} · row {card.binder_row}
          </div>
        )}
      </div>

      <style>{`
        .stack-desktop { display: flex !important; }
        .stack-mobile { display: none !important; }
        .copy-dots { display: flex !important; }
        @media (max-width: 640px) {
          .stack-desktop { display: none !important; }
          .stack-mobile { display: block !important; }
          .copy-dots { display: none !important; }
        }
      `}</style>
    </div>
  )
}
