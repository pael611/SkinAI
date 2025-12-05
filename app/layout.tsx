import './globals.css'
import type { Metadata } from 'next'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export const metadata: Metadata = {
  title: { default: 'SkinAI', template: '%s | SkinAI' },
  description: 'Next.js + Tailwind starter',
  icons: {
    icon: [{ url: '/brandLogo.png', type: 'image/png' }],
    shortcut: ['/brandLogo.png'],
    apple: [{ url: '/brandLogo.png', type: 'image/png' }],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preload" as="fetch" href="/model/best_skin_model.onnx" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50 to-white text-neutral-900">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
