import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const search = searchParams.get('search')?.trim()
  const region = searchParams.get('region')
  const view = searchParams.get('view') ?? 'grid'

  let query = supabase
    .from('cards')
    .select('*')
    .eq('is_excluded', false)
    .order('sort_index', { ascending: true })

  if (region && region !== 'ALL') {
    query = query.eq('region', region)
  }

  if (search) {
    query = query.or(
      `card_number.ilike.%${search}%,card_name.ilike.%${search}%,set_name.ilike.%${search}%`
    )
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
