import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'
import CardGrid from '@/components/CardGrid'
import Header from '@/components/Header'

export const revalidate = 60

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session ? (session as any).discordId === '387368293268324362' : false

  return (
    <>
      <Header />

      {/* Hero */}
      <div style={{
        position: 'relative',
        height: 340,
        overflow: 'hidden',
        background: '#e8e4de',
      }}>
        <img
          src="https://ksgoweicwwtutlgtfnnj.supabase.co/storage/v1/object/public/card-images/wp11891945.png"
          alt=""
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center 30%',
            opacity: 0.45,
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(245,243,240,0) 40%, rgba(245,243,240,1) 100%)',
        }} />
        <div style={{ position: 'relative', zIndex: 1, padding: '60px 48px 0', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', color: '#888', textTransform: 'uppercase', marginBottom: 12 }}>
            Personal Collection
          </div>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(42px, 6vw, 80px)',
            margin: 0, lineHeight: 0.95, letterSpacing: '-0.03em', color: '#1a1a1a',
          }}>
            Zoroark<br />Cards
          </h1>
          <p style={{ color: '#666', margin: '16px 0 0', fontSize: 14, maxWidth: 400 }}>
            Collecting 3× every variant ever printed · sorted by region → release date
          </p>
        </div>
      </div>

      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '40px 32px 80px' }}>
        <CardGrid isAdmin={isAdmin} />
      </main>
    </>
  )
}
