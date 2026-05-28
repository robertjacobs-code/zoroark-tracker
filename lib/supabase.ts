import { createClient } from '@supabase/supabase-js'

export type Card = {
  id: string
  sort_index: number
  release_date: string
  binder_page: number | null
  binder_row: number | null
  region: string
  card_name: string
  form_mechanic: string | null
  set_name: string
  card_number: string
  rarity: string | null
  variant: string | null
  finish: string | null
  notes: string | null
  copies_owned: number
  image_url: string | null
  tcg_api_id: string | null
  is_excluded: boolean
  created_at: string
  updated_at: string
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, anonKey)

export function getServiceClient() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}
