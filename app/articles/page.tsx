import { cookies } from 'next/headers'
import { createClient } from '../../utils/supabase/server'
import Image from 'next/image'
import Link from 'next/link'

export default async function ArticlesPage() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)
  const { data, error } = await supabase
    .from('articles')
    .select('id,title,summary,cover_url,created_at,source,content_url')
    .order('created_at', { ascending: false })
  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">Gagal memuat artikel: {error.message}</div>
      </main>
    )
  }

  const extractDirectUrl = (val?: string) => {
    const raw = String(val || '').trim()
    if (!raw) return ''
    try {
      const u = new URL(raw)
      if (u.hostname === 'www.google.com' && u.pathname === '/url' && u.searchParams.get('q')) {
        return u.searchParams.get('q') as string
      }
      return raw
    } catch {
      return raw
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900 sm:text-4xl">Artikel Kesehatan Kulit</h1>
        <p className="mt-1 text-neutral-600">Kumpulan artikel seputar perawatan dan kesehatan kulit.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(data ?? []).map((a) => {
          const cover = extractDirectUrl(a.cover_url)
          const href = extractDirectUrl(a.content_url)
          const CardInner = (
            <article className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm transition hover:shadow-md">
              {cover ? (
                <Image src={cover} alt={a.title} width={640} height={360} className="mb-3 h-40 w-full rounded-xl object-cover" />
              ) : null}
              <div className="flex items-center justify-between">
                <h3 className="line-clamp-2 text-lg font-semibold text-neutral-900">{a.title}</h3>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-700">{a.source ?? 'bacaan'}</span>
              </div>
              <p className="mt-2 line-clamp-3 text-sm text-neutral-700">{a.summary}</p>
              {href ? (
                <div className="mt-3 text-sm font-medium text-emerald-700">
                  <span className="underline decoration-emerald-300 underline-offset-4 group-hover:decoration-emerald-500">Baca Selengkapnya →</span>
                </div>
              ) : null}
            </article>
          )

          return href ? (
            <a
              key={a.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {CardInner}
            </a>
          ) : (
            <div key={a.id}>{CardInner}</div>
          )
        })}
      </div>
    </main>
  )
}
