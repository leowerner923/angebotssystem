'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const MAX_DATEIEN = 5
const MAX_GROESSE = 5 * 1024 * 1024 // 5 MB

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
    const ordner = crypto.randomUUID()

    for (const d of dateien) {
      const pfad = `${ordner}/${Date.now()}-${d.name}`
      const { error } = await supabase.storage
        .from('anfrage-fotos')
        .upload(pfad, d, { cacheControl: '3600', upsert: false })
      if (error) {
        setFehler('Upload fehlgeschlagen, bitte erneut versuchen.')
        setLaedt(false)
        return
      }
      pfade.push(pfad)
      vorschauUrls.push(URL.createObjectURL(d))
    }

    setVorschau(vorschauUrls)
    onPfadeChange(pfade)
    setLaedt(false)
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