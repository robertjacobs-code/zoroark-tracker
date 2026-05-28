import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { searchZoroarkEN } from '@/lib/tcg-api'
import { searchZoroarkByLang } from '@/lib/tcgdex'
import { notifyNewCard, notifyMissingImages } from '@/lib/discord'

function verifyCron(req: NextRequest): boolean {
  const auth = req.headers.get('authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}`
}

export async function POST(req: NextRequest) {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'new_cards'

  if (type === 'missing_images') {
    return handleMissingImages()
  }
  return handleNewCards()
}

// Vercel cron hits GET
export async function GET(req: NextRequest) {
  const cronSecret = req.headers.get('authorization')
  if (cronSecret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const type = req.nextUrl.searchParams.get('type') ?? 'new_cards'
  if (type === 'missing_images') return handleMissingImages()
  return handleNewCards()
}

async function handleMissingImages() {
  const db = getServiceClient()
  const { data, error } = await db
    .from('cards')
    .select('id, card_name, set_name, card_number, region')
    .eq('is_excluded', false)
    .is('image_url', null)
    .order('sort_index')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await notifyMissingImages({ cards: data ?? [] })

  await db.from('scan_log').insert({
    scan_type: 'missing_images',
    cards_found: data?.length ?? 0,
    cards_added: 0,
  })

  return NextResponse.json({ type: 'missing_images', count: data?.length ?? 0 })
}

async function handleNewCards() {
  const db = getServiceClient()

  const { data: existing } = await db
    .from('cards')
    .select('card_number, set_name, region')
    .eq('is_excluded', false)

  const existingKeys = new Set(
    (existing ?? []).map((c) => `${c.region}|${c.set_name}|${c.card_number}`)
  )

  let newFound = 0
  const allNew: Array<{
    cardName: string; setName: string; cardNumber: string; region: string
    releaseDate: string; rarity?: string; imageUrl?: string
  }> = []

  // Scan EN via pokemontcg.io
  try {
    const enCards = await searchZoroarkEN()
    for (const c of enCards) {
      const key = `EN|${c.set.name}|${c.number}`
      if (!existingKeys.has(key)) {
        allNew.push({
          cardName: c.name,
          setName: c.set.name,
          cardNumber: c.number,
          region: 'EN',
          releaseDate: c.set.releaseDate,
          rarity: c.rarity,
          imageUrl: c.images?.small,
        })
      }
    }
  } catch (e) {
    console.error('EN scan failed:', e)
  }

  // Scan JP via TCGdex
  try {
    const jpCards = await searchZoroarkByLang('ja')
    for (const c of jpCards) {
      const key = `JP|${c.set.name}|${c.localId}`
      if (!existingKeys.has(key)) {
        allNew.push({
          cardName: c.name,
          setName: c.set.name,
          cardNumber: c.localId,
          region: 'JP',
          releaseDate: c.set.releaseDate ?? 'Unknown',
          rarity: c.rarity,
          imageUrl: c.image ? `${c.image}/high.webp` : undefined,
        })
      }
    }
  } catch (e) {
    console.error('JP scan failed:', e)
  }

  // Post Discord notifications for each new card
  for (const card of allNew) {
    try {
      await notifyNewCard({ ...card })
      newFound++
      // Small delay to avoid Discord rate limits
      await new Promise((r) => setTimeout(r, 500))
    } catch (e) {
      console.error('Discord notify failed:', e)
    }
  }

  await db.from('scan_log').insert({
    scan_type: 'new_cards',
    cards_found: allNew.length,
    cards_added: 0,
    details: { new_cards: allNew.map((c) => `${c.region}|${c.setName}|${c.cardNumber}`) },
  })

  return NextResponse.json({ type: 'new_cards', found: allNew.length })
}
