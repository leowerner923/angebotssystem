'use client'

import { useState } from 'react'

const MAX_DATEIEN = 5
const MAX_GROESSE = 5 * 1024 * 1024 // 5 MB

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Direkter fetch() statt supabase-js storage.upload(): Letzteres wird in
// manchen mobilen Browsern von einer RLS-Policy blockiert, ein roher Request
// mit identischen Headern/Auth geht zuverlässig durch.
async function uploadFoto(pfad: string, datei: File): Promise<{ error: string | null }> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/anfrage-fotos/${pfad}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
      'Content-Type': datei.type || 'application/octet-stream',
      'x-upsert': 'false',
    },
    body: datei,
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return { error: text || `HTTP ${res.status}` }
  }
  return { error: null }
}

// crypto.randomUUID() ist nur in secure contexts (https/localhost) verfügbar
function erzeugeOrdnerId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const UPLOAD_TIMEOUT_MS = 45000
const MAX_VERSUCHE = 3

function mitTimeout<T>(promise: PromiseLike<T>, ms: number): Promise<T> {
  return Promise.race([
    Promise.resolve(promise),
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), ms)
    ),
  ])
}

function warte(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Mobile Verbindungen sind manchmal kurz weg (z.B. Funkloch, Netzwechsel) -
// ein sofortiger Retry behebt das meistens, ohne den Nutzer zu stören.
async function uploadMitRetry(pfad: string, datei: File): Promise<{ error: string | null }> {
  let letzterFehler: string | null = null
  for (let versuch = 1; versuch <= MAX_VERSUCHE; versuch++) {
    try {
      const { error } = await mitTimeout(uploadFoto(pfad, datei), UPLOAD_TIMEOUT_MS)
      if (!error) return { error: null }
      letzterFehler = error
    } catch (err) {
      letzterFehler = err instanceof Error && err.message === 'TIMEOUT' ? 'TIMEOUT' : String(err)
    }
    if (versuch < MAX_VERSUCHE) await warte(1000)
  }
  return { error: letzterFehler }
}

export default function FotoUpload({
  onPfadeChange,
}: {
  onPfadeChange: (pfade: string[]) => void
}) {
  const [vorschau, setVorschau] = useState<string[]>([])
  const [laedt, setLaedt] = useState(false)
  const [fehler, setFehler] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFehler(null)
    const dateien = Array.from(e.target.files ?? [])
    if (dateien.length === 0) return
    if (dateien.length > MAX_DATEIEN) {
      setFehler(`Maximal ${MAX_DATEIEN} Fotos.`)
      return
    }
    for (const d of dateien) {
      if (!d.type.startsWith('image/')) { setFehler('Nur Bilder erlaubt.'); return }
      if (d.size > MAX_GROESSE) { setFehler('Jedes Foto max. 5 MB.'); return }
    }

    setLaedt(true)
    const pfade: string[] = []
    const vorschauUrls: string[] = []
    const ordner = erzeugeOrdnerId()

    try {
      for (const d of dateien) {
        const pfad = `${ordner}/${Date.now()}-${d.name}`
        const { error } = await uploadMitRetry(pfad, d)
        if (error) {
          setFehler(
            error === 'TIMEOUT'
              ? 'Upload dauert zu lange. Bitte Verbindung prüfen und erneut versuchen.'
              : `Upload fehlgeschlagen: ${error}`
          )
          return
        }
        pfade.push(pfad)
        vorschauUrls.push(URL.createObjectURL(d))
      }

      setVorschau(vorschauUrls)
      onPfadeChange(pfade)
    } finally {
      setLaedt(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Fotos hochladen <span className="text-gray-400">(optional, max. 5)</span>
      </label>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-100 file:px-3 file:py-1.5 file:text-sm file:text-gray-700 hover:file:bg-gray-200"
      />
      {laedt && <p className="text-xs text-gray-400">Lädt hoch…</p>}
      {fehler && <p className="text-xs text-red-500">{fehler}</p>}
      {vorschau.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {vorschau.map((url) => (
            <img
              key={url}
              src={url}
              alt=""
              className="h-20 w-20 rounded-lg border border-gray-200 object-cover"
            />
          ))}
        </div>
      )}
    </div>
  )
}