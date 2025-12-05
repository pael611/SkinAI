"use client"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import AuthButtons from "./AuthButtons"
import { prefetchModel } from "../lib/modelPrefetch"

export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/brandlogo.png"
              alt="SkinAI logo"
              width={28}
              height={28}
              priority
              className="h-7 w-7 rounded"
            />
            <span className="text-lg font-bold tracking-tight text-emerald-800">SkinAI</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/" className="rounded-lg px-2 py-1 text-neutral-700 hover:bg-neutral-100 hover:text-emerald-700">Home</Link>
            <Link href="/predict" className="rounded-lg px-2 py-1 text-neutral-700 hover:bg-neutral-100 hover:text-emerald-700" onMouseEnter={() => prefetchModel()}>Predict</Link>
            <Link href="/about" className="rounded-lg px-2 py-1 text-neutral-700 hover:bg-neutral-100 hover:text-emerald-700">About</Link>
            <div className="flex flex-1 items-center justify-end">
              <AuthButtons />
            </div>
          </nav>
          <div className="flex items-center gap-1">
            <button aria-label="Toggle Menu" className="md:hidden rounded p-2 hover:bg-neutral-100" onClick={() => setOpen((v) => !v)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-neutral-700">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            </button>
          </div>
        </div>
        {open && (
          <div className="mt-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/" className="rounded px-2 py-2 hover:bg-neutral-100" onClick={() => setOpen(false)}>Home</Link>
              <Link href="/predict" className="rounded px-2 py-2 hover:bg-neutral-100" onClick={() => { prefetchModel(); setOpen(false) }}>Predict</Link>
              <Link href="/about" className="rounded px-2 py-2 hover:bg-neutral-100" onClick={() => setOpen(false)}>About</Link>
              <div className="rounded px-2 py-2">
                <AuthButtons />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
