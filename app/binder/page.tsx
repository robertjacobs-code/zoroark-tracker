import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabase, type Card } from '@/lib/supabase'
import Header from '@/components/Header'
import Image from 'next/image'

export const revalidate = 60

export default async function BinderPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session
    ? (session as any).discordId === process.env.ALLOWED_DISCORD_USER_ID
    : false

  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('is_excluded', false)
    .not('binder_page', 'is', null)
    .order('binder_page', { ascending: true })
    .order('binder_row', { ascending: true })

  // Group by page
  const pages: Record<number, Card[]> = {}
  for (const card of cards ?? []) {
    const p = card.binder_page!
    if (!pages[p]) pages[p] = []
    pages[p].push(card)
  }

  const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b)

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Binder View</h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14 }}>
          Cards shown in binder order · each row of 3 = one binder row
        </p>

        {pageNumbers.map((pageNum) => (
          <div key={pageNum} style={{ marginBottom: 48 }}>
            <div style={{ fontSize: 13, color: '#7f77dd', fontWeight: 600, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Page {pageNum}
            </div>
            {/* Group rows */}
            {groupByRow(pages[pageNum]).map((rowCards, ri) => (
              <div key={ri} style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'flex-start' }}>
                {rowCards.map((card) => (
                  <BinderCard key={card.id} card={card} />
                ))}
                {/* Fill empty slots to always show 3 per row */}
                {Array.from({ length: Math.max(0, 3 - rowCards.length) }).map((_, i) => (
                  <div key={i} style={{ width: 120, height: 167, borderRadius: 6, background: '#1a1a2e', border: '1px dashed #333' }} />
                ))}
              </div>
            ))}
          </div>
        ))}
      </main>
    </>
  )
}

function groupByRow(cards: Card[]): Card[][] {
  const rows: Record<number, Card[]> = {}
  for (const c of cards) {
    const r = c.binder_row ?? 0
    if (!rows[r]) rows[r] = []
    rows[r].push(c)
  }
  return Object.keys(rows).map(Number).sort((a, b) => a - b).map((r) => rows[r])
}

function BinderCard({ card }: { card: Card }) {
  const owned = card.copies_owned > 0
  return (
    <div style={{ opacity: owned ? 1 : 0.3, transition: 'opacity 0.2s' }}>
      <div style={{ width: 120, height: 167, borderRadius: 6, overflow: 'hidden', background: '#1a1a2e', border: '1px solid #333' }}>
        {card.image_url ? (
          <Image src={card.image_url} alt={card.card_name} width={120} height={167} style={{ objectFit: 'cover', display: 'block' }} unoptimized />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#555', fontSize: 11 }}>
            No img
          </div>
        )}
      </div>
      <div style={{ fontSize: 10, color: '#888', marginTop: 4, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {card.card_number}
      </div>
      <div style={{ fontSize: 10, color: card.copies_owned === 3 ? '#4ade80' : '#7f77dd' }}>
        {card.copies_owned}/3
      </div>
    </div>
  )
}
