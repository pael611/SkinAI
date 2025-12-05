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

export async function GET() {
  const cookieStore = nextCookies()

  // Adapter cookies untuk Supabase SSR
  const cookieAdapter = {
    // API baru ssr menerima getAll/setAll
    getAll() {
      return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
    },
    setAll(cookies: CookieInput[]) {
      cookies.forEach(({ name, value, options }) => {
        cookieStore.set({ name, value, ...options })
      })
    },
    // Tambahkan fallback API lama (get/set/remove) jika diperlukan oleh versi paket
    get(name: string) {
      const c = cookieStore.get(name)
      return c ? c.value : undefined
    },
    set(name: string, value: string, options?: CookieInput['options']) {
      cookieStore.set({ name, value, ...options })
    },
    remove(name: string, options?: CookieInput['options']) {
      // remove dengan set empty + maxAge 0
      cookieStore.set({ name, value: '', ...(options ?? {}), maxAge: 0 })
    },
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: cookieAdapter,
    }
  )

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data ?? [] }, { status: 200 })
}
