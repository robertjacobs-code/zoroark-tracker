import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { isAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  if (!(await isAdmin())) {
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

  // If a URL was provided directly, just update the record
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

  // If a file was uploaded, store in Supabase Storage
  if (file) {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `cards/${cardId}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await db.storage
      .from('card-images')
      .upload(path, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = db.storage.from('card-images').getPublicUrl(path)
    const publicUrl = urlData.publicUrl

    const { data, error } = await db
      .from('cards')
      .update({ image_url: publicUrl })
      .eq('id', cardId)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({ error: 'image or image_url required' }, { status: 400 })
}
