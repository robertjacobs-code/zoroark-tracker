// node scripts/seed-images.mjs
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing env vars'); process.exit(1) }

const db = createClient(SUPABASE_URL, SUPABASE_KEY)

const EN_SET_MAP = {
  'Black & White': 'bw1',
  'Emerging Powers': 'bw2',
  'Next Destinies': 'bw4',
  'Dark Explorers': 'bw5',
  'Legendary Treasures': 'bw11',
  'XY': 'xy1',
  'BREAKthrough': 'xy8',
  'The Best of XY': 'xy12pt5',
  'Shining Legends': 'sm35',
  'Team Up': 'sm9',
  'Unbroken Bonds': 'sm10',
  'Evolving Skies': 'swsh7',
  'Fusion Strike': 'swsh8',
  'Lost Origin': 'swsh11',
  'VSTAR Universe': 'swsh12pt5',
  'Crown Zenith': 'swsh125',
  'Night Wanderer': 'sv6pt5',
  'Shrouded Fable': 'sv6pt5',
  'Journey Together': 'sv09',
  'Ascended Heroes': 'sv10',
  'BW Black Star Promos': 'bwp',
  'SM Black Star Promos': 'smp',
  'SWSH Black Star Promos': 'swshp',
}

const JP_SET_MAP = {
  'White Collection': 'bw1',
  'Dark Rush': 'bw5',
  'Psycho Drive': 'bw3',
  'Blue Shock': 'xy8',
  'Collection X': 'xy1',
  'Shining Legends': 'sm35',
  'Dark Order': 'sm8a',
  'GX Ultra Shiny': 'sm8b',
  'Night Unison': 'sm9a',
  'Tag All Stars': 'sm12a',
  'Eevee Heroes': 's6a',
  'Dark Phantasma': 's10a',
  'VSTAR Universe': 'swsh12pt5',
  'Night Wanderer': 'sv6pt5',
  'Battle Partners': 'sv09',
  'MEGA Dream ex': 'sv10',
}

async function fetchSet(setId, lang) {
  try {
    const res = await fetch(`https://api.tcgdex.net/v2/${lang}/sets/${setId}`)
    if (!res.ok) { console.log(`    (HTTP ${res.status} for ${lang}/${setId})`); return null }
    return res.json()
  } catch (e) { console.log(`    (fetch error: ${e.message})`); return null }
}

async function main() {
  const { data: cards } = await db.from('cards')
    .select('id,card_name,set_name,card_number,region')
    .is('image_url', null)
    .eq('is_excluded', false)
    .order('sort_index')

  console.log(`${cards.length} cards missing images\n`)

  const cache = {}
  let updated = 0, skipped = 0, noMatch = 0

  for (const card of cards) {
    const lang = card.region === 'JP' ? 'ja' : 'en'
    const setMap = card.region === 'JP' ? JP_SET_MAP : EN_SET_MAP
    const setId = setMap[card.set_name]

    if (!setId) { console.log(`  skip (no map): ${card.set_name} [${card.region}]`); skipped++; continue }

    const key = `${lang}-${setId}`
    if (!cache[key]) {
      cache[key] = await fetchSet(setId, lang)
      await new Promise(r => setTimeout(r, 350))
    }
    const setData = cache[key]
    if (!setData?.cards) { console.log(`  skip (set not found): ${setId}`); skipped++; continue }

    // Strip leading zeros and match — also try raw localId for promos like SM84, SWSH297
    const rawNum = card.card_number.split('/')[0]
    const strippedNum = rawNum.replace(/^0+/, '')
    
    const match = setData.cards.find(c => {
      const lid = String(c.localId)
      return lid === rawNum || lid.replace(/^0+/, '') === strippedNum
    })

    if (match?.image) {
      const { error } = await db.from('cards').update({ image_url: `${match.image}/high.webp` }).eq('id', card.id)
      if (!error) { console.log(`  ✅ ${card.card_name} #${card.card_number} — ${card.set_name}`); updated++ }
    } else {
      console.log(`  ❌ no match: ${card.card_name} #${card.card_number} in ${setId} [${card.region}]`)
      noMatch++
    }
  }
  console.log(`\nDone — ✅ ${updated} updated · ⏭ ${skipped} skipped · ❌ ${noMatch} no match`)
}

main().catch(console.error)
