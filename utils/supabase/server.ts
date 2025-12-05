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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string

export const createClient = (cookieStore: ReturnType<typeof cookies>) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: CookieInput[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options })
          )
        } catch {
          // ignore in server components w/o mutable cookies
        }
      },
      // opsional kompatibilitas API lama:
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
}
