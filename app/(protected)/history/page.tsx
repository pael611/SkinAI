import { cookies } from 'next/headers'
import { createClient } from '../../../utils/supabase/server'
import Link from 'next/link'
import type { Prediction } from '../../../types'

export default async function HistoryPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-2xl font-bold text-emerald-800">Riwayat Prediksi</h2>
          <p className="text-neutral-700">Anda belum masuk. Silakan masuk untuk melihat riwayat prediksi Anda.</p>
          <div className="mt-4">
            <Link href="/login" className="inline-block rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Masuk</Link>
          </div>
        </div>
      </main>
    )
  }

  const { data, error } = await supabase
    .from('predictions')
    .select('id,label,confidence,source,occurred_at')
    .eq('user_id', user.id)
    .order('occurred_at', { ascending: false })

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">Gagal memuat riwayat: {error.message}</div>
      </main>
    )
  }

  const rows = (data ?? []) as Prediction[]

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 sm:text-4xl">Riwayat Prediksi</h1>
        <p className="mt-1 text-neutral-600">Jejak analisis kulit Anda, lengkap dengan tingkat keyakinan dan sumber gambar.</p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-center text-neutral-700 shadow-sm">Belum ada riwayat. Lakukan prediksi pertama Anda.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => {
            const confidencePct = Math.round(row.confidence * 100)
            return (
              <div key={row.id} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm text-neutral-500">Label</div>
                    <div className="text-lg font-semibold text-neutral-900">{row.label}</div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium capitalize text-emerald-700">{row.source}</span>
                </div>
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-neutral-600">Tingkat Keyakinan</span>
                    <span className="font-medium text-emerald-700">{confidencePct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-emerald-100">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, Math.max(0, confidencePct))}%` }} />
                  </div>
                </div>
                <div className="mt-4 text-xs text-neutral-500">{new Date(row.occurred_at).toLocaleString()}</div>
                <div className="mt-4">
                  <Link href="/predict" className="inline-block rounded-lg border border-emerald-200 px-3 py-1.5 text-sm text-emerald-800 hover:bg-emerald-50">Ulangi Prediksi</Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </main>
  )
}
