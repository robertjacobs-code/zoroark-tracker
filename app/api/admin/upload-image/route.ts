import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  const discordId = session ? (session as Record<string, any>).discordId : null
  return discordId === '387368293268324362'
}

export async function POST(req: NextRequest) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const cardId = formData.get('card_id') as string
  const file = formData.get('image') as File | null
  const imageUrl = formData.get('image_url') as string | null

  if (!cardId) {
    return NextResponse.json({ error: 'card_id required' }, { status: 400 })
  }

  const db = getServiceClient()

  if (imageUrl) {
    const { data, error } = await db
      .from('cards')
      .update({ image_url: imageUrl })
      .eq('id', cardId)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  if (file) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `cards/${cardId}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await db.storage
      .from('card-images')
      .upload(path, buffer, { contentType: file.type, upsert: true })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = db.storage.from('card-images').getPublicUrl(path)
    const { data, error } = await db
      .from('cards')
      .update({ image_url: urlData.publicUrl })
      .eq('id', cardId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'image or image_url required' }, { status: 400 })
}