import { cookies } from 'next/headers'
import { createClient } from '../../../utils/supabase/server'
import Link from 'next/link'

export default async function ProfilePage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="mx-auto max-w-md px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-center text-2xl font-bold text-emerald-800">Profil</h2>
          <p className="text-center text-neutral-700">Anda belum masuk.</p>
          <div className="mt-4 flex justify-center">
            <Link href="/login" className="inline-block rounded-lg bg-emerald-600 px-5 py-2 text-white hover:bg-emerald-700">Masuk</Link>
          </div>
        </div>
      </main>
    )
  }

  // Stats: total predictions for this user
  const { count } = await supabase
    .from('predictions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const initials = (user.email || '?')
    .split('@')[0]
    .split(/[._-]/)
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 sm:text-4xl">Profil Kesehatan</h1>
        <p className="mt-1 text-neutral-600">Kelola akun Anda dan ringkasan riwayat prediksi kulit.</p>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-800">
              {initials}
            </div>
            <div>
              <div className="text-sm text-neutral-500">Email</div>
              <div className="truncate text-lg font-medium text-neutral-900">{user.email}</div>
              <div className="mt-1 text-xs text-neutral-500">ID: <span className="font-mono break-all text-neutral-700">{user.id}</span></div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/predict" className="rounded-lg bg-emerald-600 px-4 py-2 text-white shadow-sm hover:bg-emerald-700">Mulai Prediksi</Link>
            <Link href="/history" className="rounded-lg border border-emerald-200 px-4 py-2 text-emerald-800 hover:bg-emerald-50">Lihat Riwayat</Link>
            <Link href="/" className="rounded-lg border border-neutral-200 px-4 py-2 text-neutral-700 hover:bg-neutral-50">Beranda</Link>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="text-sm text-neutral-500">Ringkasan</div>
          <div className="mt-2">
            <div className="flex items-baseline justify-between">
              <div className="text-3xl font-bold text-emerald-800">{count ?? 0}</div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">Total Prediksi</span>
            </div>
            <p className="mt-2 text-sm text-neutral-600">Jumlah prediksi kulit yang tersimpan pada akun ini.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
