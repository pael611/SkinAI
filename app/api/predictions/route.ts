import { NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

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

export async function POST(req: Request) {
  const cookieStore = nextCookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
        },
        setAll(cookies: CookieInput[]) {
          cookies.forEach(({ name, value, options }) => {
            cookieStore.set({ name, value, ...options })
          })
        },
        // opsional: kompatibilitas API lama
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
    }
  )

  const body = await req.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('predictions')
    .insert(body)
    .select('*')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prediction: data }, { status: 201 })
}
