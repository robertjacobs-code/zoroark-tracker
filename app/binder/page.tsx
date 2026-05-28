import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import { supabase, type Card } from '@/lib/supabase'
import Header from '@/components/Header'
import { BinderPageDisplay } from './BinderComponents'

export const revalidate = 60

export default async function Page() {
  const { data: cards } = await supabase
    .from('cards')
    .select('*')
    .eq('is_excluded', false)
    .not('binder_page', 'is', null)
    .order('binder_page', { ascending: true })
    .order('binder_row', { ascending: true })

  const pages: Record<number, Card[]> = {}
  for (const card of cards ?? []) {
    const p = card.binder_page!
    if (!pages[p]) pages[p] = []
    pages[p].push(card)
  }
  const pageNumbers = Object.keys(pages).map(Number).sort((a, b) => a - b)

  const pagePairs: [number, number | null][] = []
  for (let i = 0; i < pageNumbers.length; i += 2) {
    pagePairs.push([pageNumbers[i], pageNumbers[i + 1] ?? null])
  }

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, margin: '0 0 4px', letterSpacing: '-0.02em', color: '#1a1a1a' }}>
          Binder View
        </h1>
        <p style={{ color: '#888', fontSize: 14, margin: '0 0 40px' }}>
          Each row of 3 = one binder pocket row · two pages side by side
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
          {pagePairs.map(([leftPage, rightPage]) => (
            <div key={leftPage} className="page-pair" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
              <BinderPageDisplay pageNum={leftPage} cards={pages[leftPage]} />
              {rightPage !== null
                ? <BinderPageDisplay pageNum={rightPage} cards={pages[rightPage]!} />
                : <div style={{ flex: 1 }} />
              }
            </div>
          ))}
        </div>
      </main>
      <style>{`
        @media (max-width: 900px) { .page-pair { flex-direction: column !important; } }
      `}</style>
    </>
  )
}
