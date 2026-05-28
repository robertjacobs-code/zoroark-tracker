const BASE = 'https://api.tcgdex.net/v2'

export type TcgDexCard = {
  id: string
  localId: string
  name: string
  image?: string
  rarity?: string
  set: {
    id: string
    name: string
    releaseDate?: string
    serie?: { id: string; name: string }
  }
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function searchZoroarkByLang(lang: string): Promise<TcgDexCard[]> {
  const langCode = lang.toLowerCase()
  const url = `${BASE}/${langCode}/cards?name=Zoroark`
  const data = await fetchJson<TcgDexCard[]>(url)
  return data ?? []
}

export async function getCardImageUrl(cardId: string, lang = 'ja'): Promise<string | null> {
  const url = `${BASE}/${lang}/cards/${cardId}`
  const card = await fetchJson<TcgDexCard>(url)
  if (!card?.image) return null
  return `${card.image}/high.webp`
}
