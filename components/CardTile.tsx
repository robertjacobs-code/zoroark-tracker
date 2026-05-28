'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Card } from '@/lib/supabase'

const CARD_W = 200
const CARD_H = 279
const STACK_OFFSET = 6

type Props = {
  card: Card
  isAdmin: boolean
  onUpdate?: (id: string, copies: number) => void
}

const REGION_FLAG: Record<string, string> = {
  EN: '🇺🇸', JP: '🇯🇵', CN: '🇨🇳', KR: '🇰🇷',
  DE: '🇩🇪', FR: '🇫🇷', IT: '🇮🇹', ES: '🇪🇸', PT: '🇵🇹',
}

export default function CardTile({ card, isAdmin, onUpdate }: Props) {
  const [copies, setCopies] = useState(card.copies_owned)
  const [saving, setSaving] = useState(false)

  const owned = copies
  const allOwned = owned === 3
  const noneOwned = owned === 0

  async function handleCopyClick(idx: number) {
    if (!isAdmin) return
    // clicking an owned copy removes it; clicking unowned adds up to that index
    const newCopies = copies > idx ? idx : idx + 1
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

  const placeholder = (
    <div
      style={{
        width: CARD_W,
        height: CARD_H,
        borderRadius: 10,
        background: '#1e1e2e',
        border: '1px dashed #444',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#555',
        fontSize: 13,
      }}
    >
      No image
    </div>
  )

  const cardImg = (opacity: number, zIndex: number, offsetX: number, offsetY: number, idx: number) => (
    <div
      key={idx}
      onClick={() => handleCopyClick(idx)}
      title={isAdmin ? (idx < copies ? 'Click to remove copy' : 'Click to mark owned') : undefined}
      style={{
        position: 'absolute',
        left: offsetX,
        top: offsetY,
        zIndex,
        opacity,
        transition: 'opacity 0.2s, transform 0.15s',
        cursor: isAdmin ? 'pointer' : 'default',
        borderRadius: 10,
        overflow: 'hidden',
        width: CARD_W,
        height: CARD_H,
        boxShadow: opacity === 1 ? '0 4px 16px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      {card.image_url ? (
        <Image
          src={card.image_url}
          alt={`${card.card_name} ${card.card_number}`}
          width={CARD_W}
          height={CARD_H}
          style={{ objectFit: 'cover', borderRadius: 10, display: 'block' }}
          unoptimized
        />
      ) : placeholder}
    </div>
  )

  // Desktop: show all 3 slots stacked. Mobile handled via CSS class.
  const stackHeight = CARD_H + STACK_OFFSET * 2

  return (
    <div className="card-tile" style={{ opacity: noneOwned ? 0.35 : 1, transition: 'opacity 0.2s' }}>
      {/* Desktop: stacked 3-slot view */}
      <div className="stack-desktop" style={{ position: 'relative', width: CARD_W + STACK_OFFSET * 2, height: stackHeight, marginBottom: 12 }}>
        {[2, 1, 0].map((idx) => {
          const isOwned = idx < owned
          const ox = (2 - idx) * STACK_OFFSET
          const oy = (2 - idx) * STACK_OFFSET
          return cardImg(isOwned ? 1 : 0.2, idx + 1, ox, oy, idx)
        })}
      </div>

      {/* Mobile: single card with counter badge */}
      <div className="stack-mobile" style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
        <div
          onClick={() => handleCopyClick(Math.min(copies, 2))}
          style={{ cursor: isAdmin ? 'pointer' : 'default', borderRadius: 10, overflow: 'hidden', width: CARD_W, height: CARD_H }}
        >
          {card.image_url ? (
            <Image
              src={card.image_url}
              alt={`${card.card_name} ${card.card_number}`}
              width={CARD_W}
              height={CARD_H}
              style={{ objectFit: 'cover', display: 'block' }}
              unoptimized
            />
          ) : placeholder}
        </div>
        <div style={{
          position: 'absolute', bottom: 8, right: 8,
          background: allOwned ? '#4ade80' : '#7f77dd',
          color: '#fff', borderRadius: 20, padding: '3px 10px',
          fontSize: 13, fontWeight: 600,
        }}>
          {copies}/3
        </div>
      </div>

      {/* Copy dots row (desktop only) */}
      <div className="copy-dots" style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        {[0, 1, 2].map((i) => (
          <button
            key={i}
            onClick={() => handleCopyClick(i)}
            disabled={!isAdmin || saving}
            title={isAdmin ? (i < copies ? 'Remove copy' : 'Mark owned') : undefined}
            style={{
              width: 14, height: 14, borderRadius: '50%',
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
        .stack-desktop { display: block; }
        .stack-mobile { display: none; }
        .copy-dots { display: flex; }
        @media (max-width: 640px) {
          .stack-desktop { display: none; }
          .stack-mobile { display: block; }
          .copy-dots { display: none; }
        }
      `}</style>
    </div>
  )
}
