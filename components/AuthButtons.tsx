"use client"
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'
import Link from 'next/link'

export default function AuthButtons() {
  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUserEmail(session?.user?.email ?? null)
      setLoading(false)
      // app_users sync now happens on first prediction save; avoid early calls here
    }
    init()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null)
      // avoid calling sync endpoint here to prevent 401 before cookies settle
    })
    return () => { sub.subscription.unsubscribe() }
  }, [])

  if (loading) {
    return <div className="text-sm text-neutral-600">Memuat auth…</div>
  }

  if (userEmail) {
    const initials = userEmail.split('@')[0].split(/[._-]/).map(s => s[0]).join('').slice(0,2).toUpperCase()
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-200 text-xs font-bold text-emerald-800">{initials}</span>
          <span className="hidden text-sm font-medium text-emerald-800 sm:inline">{userEmail}</span>
        </div>
        <Link href="/profile" className="rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">Profil</Link>
        <button
          className="rounded-lg bg-red-600 px-3 py-1.5 text-sm text-white shadow-sm hover:bg-red-700"
          onClick={async () => {
            // Perform client-side sign out and force UI/session refresh
            const { error } = await supabase.auth.signOut({ scope: 'global' })
            if (error) {
              console.error('Logout error:', error.message)
              return
            }
            setUserEmail(null)
            // Refresh to ensure server components/middleware see cleared cookies
            router.refresh()
            // Navigate to home for clear UX post-logout
            router.push('/')
          }}
        >
          Keluar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">Masuk / Daftar</Link>
    </div>
  )
}
