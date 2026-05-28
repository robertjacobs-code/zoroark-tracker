// One-time image seeder. Run from project root:
// $env:NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"; $env:SUPABASE_SERVICE_ROLE_KEY="xxx"; node scripts/seed-images.mjs

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing env vars: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

const EN_SET_MAP = {
  'Black & White': 'bw1', 'Emerging Powers': 'bw2', 'Next Destinies': 'bw4',
  'Dark Explorers': 'bw5', 'Legendary Treasures': 'bw11', 'XY': 'xy1',
  'BREAKthrough': 'xy8', 'Guardians Rising': 'sm2', 'Burning Shadows': 'sm3',
  'Shining Legends': 'sm35', 'Crimson Invasion': 'sm4', 'Cosmic Eclipse': 'sm12',
  'Lost Origin': 'swsh11', 'Journey Together': 'sv9', 'Ascended Heroes': 'sv10',
}

const JP_SET_MAP = {
  'White Collection': 'bw1', 'Dark Rush': 'bw5', 'Blue Shock': 'xy8',
  'Collection X': 'xy1', 'Battle Partners': 'sv9',
}

async function fetchSet(setId, lang) {
  try {
    const res = await fetch(`https://api.tcgdex.net/v2/${lang}/sets/${setId}`)
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function main() {
  const { data: cards } = await db.from('cards').select('id,card_name,set_name,card_number,region').is('image_url', null).eq('is_excluded', false).order('sort_index')
  console.log(`${cards.length} cards missing images\n`)

  const cache = {}
  let updated = 0

  for (const card of cards) {
    const lang = card.region === 'JP' ? 'ja' : 'en'
    const setMap = card.region === 'JP' ? JP_SET_MAP : EN_SET_MAP
    const setId = setMap[card.set_name]
    if (!setId) { console.log(`  skip (no map): ${card.set_name}`); continue }

    const key = `${lang}-${setId}`
    if (!cache[key]) { cache[key] = await fetchSet(setId, lang); await new Promise(r => setTimeout(r, 400)) }
    const setData = cache[key]
    if (!setData?.cards) continue

    const num = card.card_number.split('/')[0].replace(/^0+/, '')
    const match = setData.cards.find(c => String(c.localId).replace(/^0+/, '') === num)

    if (match?.image) {
      const { error } = await db.from('cards').update({ image_url: `${match.image}/high.webp` }).eq('id', card.id)
      if (!error) { console.log(`  ✅ ${card.card_name} #${card.card_number} — ${card.set_name}`); updated++ }
    } else {
      console.log(`  ❌ no match: ${card.card_name} #${card.card_number} in ${setId}`)
    }
  }
  console.log(`\nDone — ${updated} updated`)
}

main().catch(console.error)
