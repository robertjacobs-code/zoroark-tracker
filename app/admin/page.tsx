import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth-options'
import { getServiceClient } from '@/lib/supabase'
import Header from '@/components/Header'
import AdminClient from './AdminClient'

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { action?: string; id?: string }
}) {
  const session = await getServerSession(authOptions)
  const isAdmin = session
    ? (session as any).discordId === process.env.ALLOWED_DISCORD_USER_ID
    : false

  if (!isAdmin) redirect('/')

  // Handle Discord webhook confirm links
  if (searchParams.action === 'add_pending' && searchParams.id) {
    // In a full implementation you'd look up a pending_cards table
    // For now just redirect to admin with a notice
  }

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
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Admin</h1>
        <p style={{ color: '#888', marginBottom: 32, fontSize: 14 }}>
          {missingImages?.length ?? 0} cards missing images
        </p>
        <AdminClient missingImages={missingImages ?? []} allCards={allCards ?? []} />
      </main>
    </>
  )
}
