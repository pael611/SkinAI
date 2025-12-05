import { NextResponse } from 'next/server'
import { cookies as nextCookies } from 'next/headers'
import { createClient } from '@supabase/ssr'

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

  // Adapter cookie untuk Supabase SSR dengan tipe yang eksplisit
  const cookieAdapter = {
    getAll() {
      return cookieStore.getAll().map((c) => ({ name: c.name, value: c.value }))
    },
    setAll(cookies: CookieInput[]) {
      cookies.forEach(({ name, value, options }) => {
        // next/headers cookies().set(name, value, options?)
        // options pada Supabase sudah kompatibel dengan cookies().set
        cookieStore.set({ name, value, ...options })
      })
    },
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: cookieAdapter,
    }
  )

  // Contoh query sederhana, sesuaikan nama tabel/kolom Anda
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ articles: data ?? [] }, { status: 200 })
}
