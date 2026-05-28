import { getServerSession } from 'next-auth'
import { authOptions } from './api/auth/[...nextauth]/route'
import CardGrid from '@/components/CardGrid'
import Header from '@/components/Header'

export const revalidate = 60

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  const isAdmin = session
    ? (session as any).discordId === process.env.ALLOWED_DISCORD_USER_ID
    : false

  return (
    <>
      <Header />
      <main style={{ maxWidth: 1400, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#f0f0f0' }}>
            Zoroark Card Collection
          </h1>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>
            Collecting 3× every Zoroark variant ever printed · sorted by region → release date
          </p>
        </div>
        <CardGrid isAdmin={isAdmin} />
      </main>
    </>
  )
}
