import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { getServiceClient } from '@/lib/supabase'
import Header from '@/components/Header'
import AdminClient from './AdminClient'

export default async function AdminPage() {
  const session = await getServerSession(authOptions)
  const discordId = session ? (session as Record<string, any>).discordId : null
  if (discordId !== '387368293268324362') redirect('/')

  const db = getServiceClient()
  const { data: missingImages } = await db
    .from('cards')
    .select('id, card_name, set_name, card_number, region, sort_index')
    .eq('is_excluded', false)
    .is('image_url', null)
    .order('sort_index')

  const { data: allCards } = await db
    .from('cards')
    .select('id, card_name, set_name, card_number, region, image_url, copies_owned, sort_index')
    .eq('is_excluded', false)
    .order('sort_index')

  return (
    <>
      <Header />
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px 80px', background: '#f5f3f0', minHeight: '100vh' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 28, margin: '0 0 8px', color: '#1a1a1a' }}>
          Admin
        </h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14 }}>
          {missingImages?.length ?? 0} cards missing images
        </p>
        <AdminClient missingImages={missingImages ?? []} allCards={allCards ?? []} />
      </main>
    </>
  )
}
