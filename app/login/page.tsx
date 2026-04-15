'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { COMPANY_CONFIG } from '@/lib/company-config'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      console.log('[Login] Versuche Anmeldung für:', email.trim())
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      console.log('[Login] Antwort:', { data, error: authError })
      if (authError) {
        console.error('[Login] Fehler:', authError.message, authError.status)
        if (authError.message.includes('Invalid login credentials') || authError.status === 400) {
          setError('E-Mail oder Passwort falsch. Bitte erneut versuchen.')
        } else if (authError.message.includes('Email not confirmed')) {
          setError('E-Mail-Adresse noch nicht bestätigt. Bitte prüfe dein Postfach.')
        } else {
          setError(`Fehler: ${authError.message}`)
        }
        setLoading(false)
      } else {
        console.log('[Login] Erfolgreich! Weiterleitung zu /dashboard')
        // Harte Navigation: stellt sicher dass Session aus localStorage gelesen wird
        window.location.href = '/dashboard'
        // loading bleibt true während der Redirect läuft
      }
    } catch (err) {
      console.error('[Login] Unerwarteter Fehler:', err)
      setError('Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.')
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <p className="text-xl font-bold text-gray-900">{COMPANY_CONFIG.name}</p>
          <p className="mt-1 text-sm text-gray-500">Dashboard Login</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <h1 className="mb-6 text-lg font-semibold text-gray-900">Anmelden</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@beispiel.de"
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 cursor-pointer rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundColor: 'var(--brand-primary)' }}
            >
              {loading ? 'Anmelden…' : 'Anmelden'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
