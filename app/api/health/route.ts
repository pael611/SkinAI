import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  const envOk = Boolean(supabaseUrl && supabasePublishableKey)
  if (!envOk) {
    return NextResponse.json({
      ok: false,
      envOk,
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY',
    }, { status: 500 })
  }

  const cookieStore = cookies()
  const supabase = createServerClient(supabaseUrl!, supabasePublishableKey!, {
    cookies: {
      get(name: string) { return cookieStore.get(name)?.value },
      set(name: string, value: string, options: any) { cookieStore.set({ name, value, ...options }) },
      remove(name: string, options: any) { cookieStore.delete({ name, ...options }) },
    },
  })

  const { data: { user }, error: userErr } = await supabase.auth.getUser()

  // Lightweight connectivity check: attempt a minimal query
  let canQuery = false
  let queryErrMsg: string | undefined
  try {
    const { error: qErr } = await supabase
      .from('app_users')
      .select('id')
      .limit(1)
    if (!qErr) canQuery = true
    else queryErrMsg = qErr.message
  } catch (e: any) {
    queryErrMsg = e?.message ?? String(e)
  }

  return NextResponse.json({
    ok: envOk && !userErr,
    envOk,
    session: user ? { id: user.id, email: user.email } : null,
    userError: userErr ? userErr.message : null,
    canQuery,
    queryError: queryErrMsg ?? null,
  })
}
