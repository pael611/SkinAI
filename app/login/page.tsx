"use client"
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const signInPassword = async () => {
    setLoading(true)
    setMsg('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else {
      // Upsert app_users for logged-in user
      const user = data.user
      if (user) {
        const { error: upErr } = await supabase
          .from('app_users')
          .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
        if (upErr) console.warn('Upsert app_users warning:', upErr.message)
      }
      const params = new URLSearchParams(window.location.search)
      const redirect = params.get('redirect') || '/'
      window.location.assign(redirect)
    }
    setLoading(false)
  }

  // Magic link removed per request

  // OAuth login (Google) removed per request; keep email/password and magic link only

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-emerald-900">Selamat Datang</h2>
        <p className="mb-4 text-center text-sm text-neutral-600">Masuk untuk mengelola profil dan riwayat prediksi kesehatan kulit Anda.</p>
        <div className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-emerald-400 focus:outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-emerald-400 focus:outline-none" />
          <button disabled={loading || !email || !password} onClick={signInPassword} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">Masuk</button>
          <div className="text-center text-sm"><a href="/register" className="font-medium text-emerald-700 hover:underline">Belum punya akun? Daftar</a></div>
          {msg ? <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">{msg}</div> : null}
        </div>
      </div>
    </main>
  )
}
