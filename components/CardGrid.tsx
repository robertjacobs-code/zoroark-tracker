'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Card } from '@/lib/supabase'
import CardTile from './CardTile'
import ProgressBar from './ProgressBar'

type Props = { isAdmin: boolean }

const REGIONS = ['ALL', 'EN', 'JP', 'CN', 'KR', 'DE', 'FR', 'OTHER']

export default function CardGrid({ isAdmin }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const fetchCards = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (region !== 'ALL') params.set('region', region)
    if (debouncedSearch) params.set('search', debouncedSearch)
    const res = await fetch(`/api/cards?${params}`)
    const data = await res.json()
    setCards(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [region, debouncedSearch])

  useEffect(() => { fetchCards() }, [fetchCards])

  function handleUpdate(id: string, copies: number) {
    setCards((prev) => prev.map((c) => c.id === id ? { ...c, copies_owned: copies } : c))
  }

  // Group by region for display
  const grouped = useMemo(() => {
    if (region !== 'ALL') return { [region]: cards }
    return cards.reduce<Record<string, Card[]>>((acc, c) => {
      if (!acc[c.region]) acc[c.region] = []
      acc[c.region].push(c)
      return acc
    }, {})
  }, [cards, region])

  const usedRegions = Object.keys(grouped).filter((r) => grouped[r].length > 0)

  return (
    <div>
      {/* Search + Filter bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by number, name, or set…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: '1 1 220px',
            padding: '10px 14px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            color: '#f0f0f0',
            fontSize: 14,
            outline: 'none',
          }}
        />
        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          style={{
            padding: '10px 14px',
            background: '#1a1a2e',
            border: '1px solid #333',
            borderRadius: 8,
            color: '#f0f0f0',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          {REGIONS.map((r) => <option key={r} value={r}>{r === 'ALL' ? 'All regions' : r}</option>)}
        </select>
      </div>

      {/* Overall progress */}
      {!debouncedSearch && region === 'ALL' && (
        <div style={{ marginBottom: 32, padding: '16px 20px', background: '#1a1a2e', borderRadius: 12, border: '1px solid #2a2a4e' }}>
          <ProgressBar cards={cards} label="Overall collection" />
          {usedRegions.map((r) => (
            <ProgressBar key={r} cards={grouped[r]} label={r} />
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>Loading cards…</div>
      )}

      {!loading && cards.length === 0 && (
        <div style={{ textAlign: 'center', color: '#666', padding: 40 }}>
          {debouncedSearch ? `No cards matching "${debouncedSearch}"` : 'No cards found'}
        </div>
      )}

      {!loading && usedRegions.map((r) => (
        <div key={r} style={{ marginBottom: 48 }}>
          {region === 'ALL' && (
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20, color: '#9f97ed', borderBottom: '1px solid #2a2a4e', paddingBottom: 10 }}>
              {r === 'EN' ? '🇺🇸 English' : r === 'JP' ? '🇯🇵 Japanese' : r} · {grouped[r].length} variants
            </h2>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 32,
          }}>
            {grouped[r].map((card) => (
              <CardTile key={card.id} card={card} isAdmin={isAdmin} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      ))}

      <style>{`
        @media (max-width: 640px) {
          .card-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
