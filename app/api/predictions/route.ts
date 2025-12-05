import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies as nextCookies } from 'next/headers'

type CookieInput = {
  name: string
  value: string
  options?: {
    path?: string
    domain?: string
    httpOnly?: boolean
    secure?: boolean
    maxAge?: number
    expires?: Date
    sameSite?: 'lax' | 'strict' | 'none'
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!

export async function POST(req: NextRequest) {
  if (!supabaseUrl || !supabasePublishableKey) {
    return NextResponse.json(
      { error: 'Supabase env missing' },
      { status: 500 }
    )
  }

  const cookieStore = nextCookies()
  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
      },
      setAll(cookiesToSet: CookieInput[]) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set({ name, value, ...options })
        )
      },
      // kompat API lama (opsional)
      get(name: string) {
        const c = cookieStore.get(name)
        return c ? c.value : undefined
      },
      set(name: string, value: string, options?: CookieInput['options']) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options?: CookieInput['options']) {
        cookieStore.set({ name, value: '', ...(options ?? {}), maxAge: 0 })
      },
    },
  })

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Coba dapatkan user dari cookies
  let { data: { user } } = await supabase.auth.getUser()

  // Fallback: jika client mengirim Authorization: Bearer <jwt>
  if (!user) {
    const auth = req.headers.get('authorization')
    const jwt = auth?.toLowerCase().startsWith('bearer ')
      ? auth.slice(7).trim()
      : undefined
    if (jwt) {
      const res = await supabase.auth.getUser(jwt)
      user = res.data.user ?? null
    }
  }

  if (!user?.id) {
    return NextResponse.json(
      { error: 'Not authenticated', hint: 'Pastikan request mengirim cookies Supabase atau header Authorization Bearer <JWT>' },
      { status: 401 }
    )
  }

  const payload = {
    label: String((body as any).label ?? ''),
    confidence: Number((body as any).confidence ?? NaN),
    source: String((body as any).source ?? ''),
    occurred_at: String((body as any).occurred_at ?? new Date().toISOString()),
    user_id: user.id,
  }

  if (!payload.label || Number.isNaN(payload.confidence) || !payload.source) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  // Opsional: pastikan user terdaftar di app_users
  await supabase
    .from('app_users')
    .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
    .then(({ error }) => {
      if (error) console.warn('Upsert app_users warning:', error.message)
    })

  const { data, error } = await supabase
    .from('predictions')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prediction: data }, { status: 201 })
}
