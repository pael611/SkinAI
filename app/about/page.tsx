export default function AboutPage() {
  return (
    <main className="py-10">
      <section className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold text-neutral-900">Tentang SkinAI</h1>
        <p className="mt-4 text-neutral-700">SkinAI adalah aplikasi web yang memanfaatkan model ONNX untuk menganalisis kondisi kulit wajah dan memberikan rekomendasi produk perawatan. Inferensi berjalan di browser Anda untuk menjaga privasi, sementara data produk diambil dari dataset lokal Anda.</p>
        <h2 className="mt-8 text-2xl font-semibold text-neutral-900">Teknologi</h2>
        <ul className="mt-3 list-disc pl-6 text-neutral-700">
          <li>Next.js App Router dengan TypeScript</li>
          <li>Tailwind CSS untuk gaya responsif</li>
          <li>ONNX Runtime Web untuk inferensi di browser</li>
          <li>Pengambilan data produk dari `public/skincare_product/treatment.json`</li>
        </ul>
        <h2 className="mt-8 text-2xl font-semibold text-neutral-900">Privasi</h2>
        <p className="mt-3 text-neutral-700">Gambar yang Anda unggah tidak dikirim ke server; seluruh proses analisis berjalan di perangkat Anda.</p>
      </section>
    </main>
  )
}
