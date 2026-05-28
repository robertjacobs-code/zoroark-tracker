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

type Props = { missingImages: CardRow[]; allCards: CardRow[] }

export default function AdminClient({ missingImages, allCards }: Props) {
  const [tab, setTab] = useState<'missing' | 'all'>('missing')
  const [uploading, setUploading] = useState<string | null>(null)
  const [done, setDone] = useState<Set<string>>(new Set())
  const [urlInputs, setUrlInputs] = useState<Record<string, string>>({})
  const [fileSelections, setFileSelections] = useState<Record<string, File>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function saveUrl(cardId: string) {
    const url = urlInputs[cardId]?.trim()
    if (!url) return
    setUploading(cardId)
    setErrors(e => ({ ...e, [cardId]: '' }))
    try {
      const fd = new FormData()
      fd.append('card_id', cardId)
      fd.append('image_url', url)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      if (res.ok) {
        setDone(d => new Set([...d, cardId]))
      } else {
        const text = await res.text()
        setErrors(e => ({ ...e, [cardId]: `Error ${res.status}: ${text}` }))
      }
    } catch (err) {
      setErrors(e => ({ ...e, [cardId]: String(err) }))
    } finally {
      setUploading(null)
    }
  }

  async function saveFile(cardId: string) {
    const file = fileSelections[cardId]
    if (!file) return
    setUploading(cardId)
    setErrors(e => ({ ...e, [cardId]: '' }))
    try {
      const fd = new FormData()
      fd.append('card_id', cardId)
      fd.append('image', file)
      const res = await fetch('/api/admin/upload-image', { method: 'POST', body: fd })
      if (res.ok) {
        setDone(d => new Set([...d, cardId]))
      } else {
        const text = await res.text()
        setErrors(e => ({ ...e, [cardId]: `Error ${res.status}: ${text}` }))
      }
    } catch (err) {
      setErrors(e => ({ ...e, [cardId]: String(err) }))
    } finally {
      setUploading(null)
    }
  }

  const displayCards = tab === 'missing'
    ? missingImages.filter(c => !done.has(c.id))
    : allCards

  const tab1 = (t: typeof tab) => ({
    padding: '8px 20px',
    background: tab === t ? '#7f77dd' : '#f0eefc',
    border: `1px solid ${tab === t ? '#7f77dd' : '#ddd'}`,
    borderRadius: 8, color: tab === t ? '#fff' : '#666',
    cursor: 'pointer', fontSize: 13, fontWeight: 500,
  })

  return (
    <div id="missing-images">
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button style={tab1('missing')} onClick={() => setTab('missing')}>
          Missing images ({missingImages.filter(c => !done.has(c.id)).length})
        </button>
        <button style={tab1('all')} onClick={() => setTab('all')}>
          All cards ({allCards.length})
        </button>
      </div>

      {displayCards.length === 0 && (
        <div style={{ color: '#16a34a', padding: 40, textAlign: 'center', fontSize: 15 }}>
          ✅ All cards have images!
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {displayCards.map(card => (
          <div key={card.id} style={{
            background: '#fff',
            border: `1px solid ${done.has(card.id) ? '#86efac' : errors[card.id] ? '#fca5a5' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: 12, padding: '14px 18px',
            display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap',
          }}>
            <div style={{ flex: '1 1 180px' }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: '#1a1a1a' }}>{card.card_name}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{card.set_name} · #{card.card_number} · {card.region}</div>
              {card.image_url && !done.has(card.id) && (
                <div style={{ color: '#aaa', fontSize: 10, marginTop: 2, wordBreak: 'break-all' }}>
                  Current: {card.image_url.slice(0, 50)}…
                </div>
              )}
            </div>

            {done.has(card.id) ? (
              <div style={{ color: '#16a34a', fontSize: 13, padding: '8px 0' }}>✅ Saved</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: '1 1 320px' }}>
                {/* URL row */}
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    type="url"
                    placeholder="Paste image URL…"
                    value={urlInputs[card.id] ?? ''}
                    onChange={e => setUrlInputs(u => ({ ...u, [card.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') saveUrl(card.id) }}
                    style={{
                      flex: 1, padding: '8px 10px',
                      background: '#f9f9f9', border: '1px solid #ddd',
                      borderRadius: 6, color: '#1a1a1a', fontSize: 13, fontFamily: 'inherit',
                    }}
                  />
                  <button
                    onClick={() => saveUrl(card.id)}
                    disabled={uploading === card.id || !urlInputs[card.id]?.trim()}
                    style={{
                      padding: '8px 14px', background: '#7f77dd', border: 'none',
                      borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13,
                      opacity: (!urlInputs[card.id]?.trim() || uploading === card.id) ? 0.5 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {uploading === card.id ? 'Saving…' : 'Save URL'}
                  </button>
                </div>

                {/* File row */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) setFileSelections(s => ({ ...s, [card.id]: f }))
                    }}
                    style={{ flex: 1, fontSize: 12, color: '#666' }}
                  />
                  {fileSelections[card.id] && (
                    <button
                      onClick={() => saveFile(card.id)}
                      disabled={uploading === card.id}
                      style={{
                        padding: '8px 14px', background: '#1a1a1a', border: 'none',
                        borderRadius: 6, color: '#fff', cursor: 'pointer', fontSize: 13,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {uploading === card.id ? 'Uploading…' : 'Upload file'}
                    </button>
                  )}
                </div>

                {errors[card.id] && (
                  <div style={{ color: '#dc2626', fontSize: 11, background: '#fef2f2', padding: '6px 10px', borderRadius: 6 }}>
                    {errors[card.id]}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
