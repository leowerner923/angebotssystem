import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-8 text-center">
      <p className="text-8xl font-bold text-gray-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Seite nicht gefunden</h1>
      <p className="mt-2 max-w-sm text-gray-500">
        Diese Seite existiert nicht oder wurde verschoben.
      </p>
      <Link
        href="/dashboard"
        className="mt-8 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor: 'var(--brand-primary)' }}
      >
        Zurück zum Dashboard
      </Link>
    </main>
  )
}
