import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-options'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  const discordId = session ? (session as Record<string, any>).discordId : null
  return discordId === '387368293268324362'
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const copies = Number(body.copies_owned)

  if (isNaN(copies) || copies < 0 || copies > 3) {
    return NextResponse.json({ error: 'copies_owned must be 0–3' }, { status: 400 })
  }

  const db = getServiceClient()
  const { data, error } = await db
    .from('cards')
    .update({ copies_owned: copies })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
