export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-neutral-600">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>&copy; {new Date().getFullYear()} SkinAI. Health-focused AI for skincare.</p>
          <div className="flex gap-4">
            <a href="/about" className="hover:text-emerald-600">About</a>
            <a href="/predict" className="hover:text-emerald-600">Predict</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
