const BASE = 'https://api.pokemontcg.io/v2'
const headers: Record<string, string> = {}
if (process.env.POKEMON_TCG_API_KEY) {
  headers['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY
}

export type TcgCard = {
  id: string
  name: string
  number: string
  set: { id: string; name: string; releaseDate: string; series: string }
  images: { small: string; large: string }
  rarity?: string
}

export async function searchZoroarkEN(): Promise<TcgCard[]> {
  const results: TcgCard[] = []
  let page = 1
  const pageSize = 250

  while (true) {
    const params = new URLSearchParams({
      q: 'name:"zoroark"',
      page: String(page),
      pageSize: String(pageSize),
      orderBy: 'set.releaseDate',
    })
    const res = await fetch(`${BASE}/cards?${params}`, { headers })
    if (!res.ok) throw new Error(`TCG API error: ${res.status}`)
    const data = await res.json()
    results.push(...data.data)
    if (data.data.length < pageSize) break
    page++
  }

  return results
}

export async function getCardById(id: string): Promise<TcgCard | null> {
  const res = await fetch(`${BASE}/cards/${id}`, { headers })
  if (!res.ok) return null
  const data = await res.json()
  return data.data
}
