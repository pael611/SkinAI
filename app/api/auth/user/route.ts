import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '../../../../utils/supabase/server'

export async function GET() {
  const cookieStore = cookies()Z
  const supabase = createClient(cookieStore)
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ user })
}
