"use client"
import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const signUp = async () => {
    setLoading(true)
    setMsg('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else if (data?.user?.identities && data.user.identities.length === 0) setMsg('Akun sudah ada. Silakan masuk.')
    else {
      // Upsert app_users immediately for newly registered user (if session created)
      const user = data?.user
      if (user) {
        const { error: upErr } = await supabase
          .from('app_users')
          .upsert({ id: user.id, email: user.email }, { onConflict: 'id' })
        if (upErr) console.warn('Upsert app_users warning:', upErr.message)
      }
      setMsg('Registrasi berhasil. Anda dapat langsung masuk.')
    }
    setLoading(false)
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-center text-2xl font-extrabold tracking-tight text-emerald-900">Buat Akun</h2>
        <p className="mb-4 text-center text-sm text-neutral-600">Daftar untuk menyimpan riwayat prediksi kesehatan kulit Anda.</p>
        <div className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-emerald-400 focus:outline-none" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-neutral-300 px-3 py-3 focus:border-emerald-400 focus:outline-none" />
          <button disabled={loading || !email || !password} onClick={signUp} className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50">Daftar</button>
          {msg ? <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-2 text-sm">{msg}</div> : null}
        </div>
      </div>
    </main>
  )
}
