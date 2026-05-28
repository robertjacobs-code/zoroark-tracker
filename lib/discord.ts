const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL!
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? ''

export type NewCardPayload = {
  cardName: string
  setName: string
  cardNumber: string
  region: string
  releaseDate: string
  rarity?: string | null
  imageUrl?: string | null
  pendingId?: string
}

export type MissingImagePayload = {
  cards: Array<{ id: string; cardName: string; setName: string; cardNumber: string; region: string }>
}

async function postWebhook(body: object) {
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Discord webhook failed: ${res.status} ${text}`)
  }
}

export async function notifyNewCard(card: NewCardPayload) {
  const addUrl = `${BASE_URL}/admin?action=add_pending&id=${card.pendingId ?? ''}`
  const skipUrl = `${BASE_URL}/admin?action=skip_pending&id=${card.pendingId ?? ''}`

  const embed = {
    title: `🃏 New Zoroark found: ${card.cardName}`,
    color: 0x7f77dd,
    fields: [
      { name: 'Set', value: card.setName, inline: true },
      { name: 'Card No.', value: card.cardNumber, inline: true },
      { name: 'Region', value: card.region, inline: true },
      { name: 'Release', value: card.releaseDate, inline: true },
      ...(card.rarity ? [{ name: 'Rarity', value: card.rarity, inline: true }] : []),
    ],
    ...(card.imageUrl ? { thumbnail: { url: card.imageUrl } } : {}),
    footer: { text: 'Zoroark Tracker • New Card Scanner' },
    timestamp: new Date().toISOString(),
  }

  await postWebhook({
    content: `**New Zoroark card detected!** Review and confirm below:`,
    embeds: [embed],
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: '✅ Add to tracker',
            url: addUrl,
          },
          {
            type: 2,
            style: 5,
            label: '❌ Skip',
            url: skipUrl,
          },
        ],
      },
    ],
  })
}

export async function notifyMissingImages(payload: MissingImagePayload) {
  if (payload.cards.length === 0) {
    await postWebhook({ content: '✅ **Weekly image scan complete** — no missing images found!' })
    return
  }

  const uploadUrl = `${BASE_URL}/admin#missing-images`

  const lines = payload.cards
    .slice(0, 20)
    .map((c) => `• **${c.cardName}** — ${c.setName} (${c.cardNumber}) [${c.region}]`)
    .join('\n')

  const overflow = payload.cards.length > 20 ? `\n_...and ${payload.cards.length - 20} more_` : ''

  await postWebhook({
    embeds: [
      {
        title: `🖼️ Missing images: ${payload.cards.length} card${payload.cards.length === 1 ? '' : 's'}`,
        description: lines + overflow,
        color: 0xef9f27,
        url: uploadUrl,
        footer: { text: 'Click title to open admin uploader' },
        timestamp: new Date().toISOString(),
      },
    ],
  })
}
