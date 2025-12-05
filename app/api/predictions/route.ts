import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export async function POST(req: NextRequest) {
  try {
    if (!supabaseUrl || !supabasePublishableKey) {
      return NextResponse.json({
        error: 'Supabase env missing',
        detail: 'Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY are set.',
      }, { status: 500 })
    }

    const cookieStore = cookies()
    const supabaseServer = createServerClient(supabaseUrl, supabasePublishableKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
        },
        setAll(cookiesToSet: CookieInput[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          )
        },
      },
    })

    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }
    const { label, confidence, source, occurred_at } = body as {
      label: string
      confidence: number
      source: 'upload' | 'camera'
      occurred_at?: string
    }

    // Ambil user dari cookies
    let { data: { user }, error: userErr } = await supabaseServer.auth.getUser()
    if (userErr) console.warn('getUser via cookies error:', userErr.message)

    // Fallback: coba Authorization: Bearer <jwt>
    if (!user) {
      const auth = req.headers.get('authorization')
      const jwt = auth?.toLowerCase().startsWith('bearer ') ? auth.slice(7).trim() : undefined
      if (jwt) {
        const res = await supabaseServer.auth.getUser(jwt)
        user = res.data.user ?? null
      }
    }

    if (!user?.id) {
      return NextResponse.json({
        error: 'Not authenticated',
        hint: 'Pastikan request mengirim cookies Supabase (credentials: include) atau header Authorization: Bearer <JWT>',
      }, { status: 401 })
    }

    const payload = {
      label,
      confidence,
      source,
      occurred_at: occurred_at ?? new Date().toISOString(),
      user_id: user.id,
    }

    const { data, error } = await supabaseServer
      .from('predictions')
      .insert(payload)
      .select('*')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prediction: data }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 })
  }
}
