'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import type { Card } from '@/lib/supabase'
import CardTile from './CardTile'
import ProgressBar from './ProgressBar'

type Props = { isAdmin: boolean }
const REGIONS = ['ALL', 'EN', 'JP', 'CN', 'KR', 'DE', 'FR', 'OTHER']
const REGION_LABEL: Record<string, string> = { EN: '🇺🇸 English', JP: '🇯🇵 Japanese', CN: '🇨🇳 Chinese', KR: '🇰🇷 Korean' }

export default function CardGrid({ isAdmin }: Props) {
  const [cards, setCards] = useState<Card[]>([])
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 250); return () => clearTimeout(t) }, [search])

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
    setCards(prev => prev.map(c => c.id === id ? { ...c, copies_owned: copies } : c))
  }

  const grouped = useMemo(() => {
    if (region !== 'ALL') return { [region]: cards }
    return cards.reduce<Record<string, Card[]>>((acc, c) => {
      if (!acc[c.region]) acc[c.region] = []
      acc[c.region].push(c)
      return acc
    }, {})
  }, [cards, region])

  const usedRegions = Object.keys(grouped).filter(r => grouped[r].length > 0)

  return (
    <div>
      {/* Stats + search row */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* Progress panel */}
        {!debouncedSearch && region === 'ALL' && (
          <div style={{ flex: '1 1 340px', background: '#fff', borderRadius: 16, padding: '20px 24px', border: '1px solid rgba(0,0,0,0.07)' }}>
            <ProgressBar cards={cards} label="Overall" large />
            {usedRegions.map(r => <ProgressBar key={r} cards={grouped[r]} label={REGION_LABEL[r] ?? r} />)}
          </div>
        )}
        {/* Search + filter */}
        <div style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            placeholder="Search by number, name, or set…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 16px', boxSizing: 'border-box',
              background: '#fff', border: '1px solid rgba(0,0,0,0.12)', borderRadius: 10,
              color: '#1a1a1a', fontSize: 14, outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <select
            value={region}
            onChange={e => setRegion(e.target.value)}
            style={{
              padding: '10px 14px', background: '#fff', border: '1px solid rgba(0,0,0,0.12)',
              borderRadius: 10, color: '#1a1a1a', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {REGIONS.map(r => <option key={r} value={r}>{r === 'ALL' ? 'All regions' : (REGION_LABEL[r] ?? r)}</option>)}
          </select>
        </div>
      </div>

      {loading && <div style={{ textAlign: 'center', color: '#999', padding: 60, fontSize: 14 }}>Loading…</div>}
      {!loading && cards.length === 0 && (
        <div style={{ textAlign: 'center', color: '#999', padding: 60 }}>
          {debouncedSearch ? `No cards matching "${debouncedSearch}"` : 'No cards found'}
        </div>
      )}

      {!loading && usedRegions.map(r => (
        <div key={r} style={{ marginBottom: 56 }}>
          {region === 'ALL' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#1a1a1a' }}>
                {REGION_LABEL[r] ?? r}
              </h2>
              <span style={{ fontSize: 12, color: '#999', background: 'rgba(0,0,0,0.06)', borderRadius: 20, padding: '3px 10px' }}>
                {grouped[r].length} variants
              </span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(560px, 1fr))', gap: '32px 24px' }}>
            {grouped[r].map(card => (
              <CardTile key={card.id} card={card} isAdmin={isAdmin} onUpdate={handleUpdate} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
