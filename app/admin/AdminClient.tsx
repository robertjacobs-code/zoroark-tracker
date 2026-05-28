'use client'

import { useState } from 'react'

type CardRow = {
  id: string
  card_name: string
  set_name: string
  card_number: string
  region: string
  image_url?: string | null
  sort_index: number
}

type Props = {
  missingImages: CardRow[]
  allCards: CardRow[]
}

export default function AdminClient({ missingImages, allCards }: Props) {
  const [tab, setTab] = useState<'missing' | 'all'>('missing')
  const [uploading, setUploading] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})

  async function handleFileUpload(cardId: string, file: File) {
    setUploading(cardId)
    const fd = new FormData()
    fd.append('card_id', cardId)
    fd.append('image', file)
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
    if (res.ok) setDone((d) => new Set([...d, cardId]))
    setUploading(null)
  }

  async function handleUrlSave(cardId: string) {
    const url = urlInputs[cardId]?.trim()
    if (!url) return
    setUploading(cardId)
    const fd = new FormData()
    fd.append('card_id', cardId)
    fd.append('image_url', url)
    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
    if (res.ok) setDone((d) => new Set([...d, cardId]))
    setUploading(null)
  }

  const displayCards = tab === 'missing'
    ? missingImages.filter((c) => !done.has(c.id))
    : allCards

  const tabStyle = (t: typeof tab) => ({
    padding: '8px 20px',
    background: tab === t ? '#7f77dd' : '#1a1a2e',
    border: `1px solid ${tab === t ? '#7f77dd' : '#333'}`,
    borderRadius: 6,
    color: tab === t ? '#fff' : '#aaa',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: tab === t ? 600 : 400,
  })

  return (
    <div id="missing-images">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={tabStyle('missing')} onClick={() => setTab('missing')}>
          Missing images ({missingImages.filter((c) => !done.has(c.id)).length})
        </button>
        <button style={tabStyle('all')} onClick={() => setTab('all')}>
          All cards ({allCards.length})
        </button>
      </div>

      {displayCards.length === 0 && (
        <div style={{ color: '#4ade80', padding: 40, textAlign: 'center' }}>
          ✅ All cards have images!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayCards.map((card) => (
          <div key={card.id} style={{
            background: '#1a1a2e',
            border: `1px solid ${done.has(card.id) ? '#4ade80' : '#2a2a4e'}`,
            borderRadius: 10,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flexWrap: 'wrap',
          }}>
            {/* Card info */}
            <div style={{ flex: '1 1 200px' }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{card.card_name}</div>
              <div style={{ color: '#aaa', fontSize: 13 }}>{card.set_name} · #{card.card_number}</div>
              <div style={{ color: '#888', fontSize: 12 }}>{card.region}</div>
              {card.image_url && (
                <div style={{ color: '#666', fontSize: 11, marginTop: 2, wordBreak: 'break-all' }}>
                  {card.image_url.slice(0, 60)}…
                </div>
              )}
            </div>

            {done.has(card.id) ? (
              <div style={{ color: '#4ade80', fontSize: 13 }}>✅ Saved</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 300px' }}>
                {/* URL input */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="url"
                    placeholder="Paste image URL…"
                    value={urlInputs[card.id] ?? ''}
                    onChange={(e) => setUrlInputs((u) => ({ ...u, [card.id]: e.target.value }))}
                    style={{
                      flex: 1, padding: '7px 10px', background: '#0f0f1a',
                      border: '1px solid #333', borderRadius: 6, color: '#f0f0f0', fontSize: 13,
                    }}
                  />
                  <button
                    onClick={() => handleUrlSave(card.id)}
                    disabled={uploading === card.id || !urlInputs[card.id]}
                    style={{ padding: '7px 14px', background: '#7f77dd', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13 }}
                  >
                    Save URL
                  </button>
                </div>
                {/* File upload */}
                <label style={{ cursor: 'pointer', fontSize: 12, color: '#888' }}>
                  Or upload file:{' '}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ fontSize: 12 }}
                    onChange={(e) => {
                      const f = e.target.files?.[0]
                      if (f) handleFileUpload(card.id, f)
                    }}
                  />
                </label>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
