'use client'

import { useEffect, useRef, useState } from 'react'
import type { Aufmass } from '@/lib/types/aufmass'

const MAX_SEKUNDEN = 120
const MIME_KANDIDATEN = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']

function waehleMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined') return undefined
  return MIME_KANDIDATEN.find((t) => MediaRecorder.isTypeSupported(t))
}

function formatZeit(sekunden: number): string {
  const m = Math.floor(sekunden / 60)
  const s = sekunden % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

type Zustand = 'bereit' | 'kein_mikrofon' | 'nimmt_auf' | 'aufgenommen' | 'wertet_aus'

export default function AufmassRecorder({
  onAusgewertet,
}: {
  onAusgewertet: (aufmass: Aufmass) => void
}) {
  const [zustand, setZustand] = useState<Zustand>('bereit')
  const [sekunden, setSekunden] = useState(0)
  const [fehler, setFehler] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      stoppeTracks()
      if (timerRef.current) clearInterval(timerRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stoppeTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function aufnahmeStarten() {
    setFehler(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch {
      setZustand('kein_mikrofon')
      setFehler('Kein Zugriff auf das Mikrofon. Bitte in den Browser-Einstellungen erlauben und erneut versuchen.')
      return
    }

    streamRef.current = stream
    chunksRef.current = []

    const mimeType = waehleMimeType()
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream)
    recorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
      setAudioUrl(URL.createObjectURL(blob))
      setZustand('aufgenommen')
      stoppeTracks()
    }

    recorder.start()
    setZustand('nimmt_auf')
    setSekunden(0)

    timerRef.current = setInterval(() => {
      setSekunden((prev) => {
        const naechster = prev + 1
        if (naechster >= MAX_SEKUNDEN) {
          aufnahmeStoppen()
        }
        return naechster
      })
    }, 1000)
  }

  function aufnahmeStoppen() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop()
    }
  }

  function verwerfen() {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    chunksRef.current = []
    setZustand('bereit')
    setSekunden(0)
    setFehler(null)
  }

  async function auswerten() {
    if (chunksRef.current.length === 0) return
    setZustand('wertet_aus')
    setFehler(null)
    try {
      const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'audio/webm' })
      const ext = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
      const form = new FormData()
      form.append('audio', blob, `aufnahme.${ext}`)

      const res = await fetch('/api/aufmass', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) {
        setFehler(json.error ?? 'Auswertung fehlgeschlagen. Bitte erneut versuchen.')
        setZustand('aufgenommen')
        return
      }
      onAusgewertet(json.aufmass as Aufmass)
      verwerfen()
    } catch {
      setFehler('Netzwerkfehler. Bitte erneut versuchen.')
      setZustand('aufgenommen')
    }
  }

  if (zustand === 'kein_mikrofon') {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
        <p className="text-sm text-red-600">{fehler}</p>
        <button
          onClick={() => {
            setZustand('bereit')
            setFehler(null)
          }}
          className="mt-3 text-sm text-blue-600 hover:underline"
        >
          Erneut versuchen
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center">
      {zustand === 'bereit' && (
        <button
          onClick={aufnahmeStarten}
          className="flex w-full flex-col items-center gap-3 rounded-xl bg-blue-600 py-8 text-white transition-opacity hover:opacity-90 active:opacity-80"
        >
          <svg className="h-10 w-10" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3Z" />
            <path d="M19 11a1 1 0 1 0-2 0 5 5 0 0 1-10 0 1 1 0 1 0-2 0 7 7 0 0 0 6 6.93V20H9a1 1 0 1 0 0 2h6a1 1 0 1 0 0-2h-2v-2.07A7 7 0 0 0 19 11Z" />
          </svg>
          <span className="text-lg font-semibold">Aufnahme starten</span>
        </button>
      )}

      {zustand === 'nimmt_auf' && (
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
            <span className="text-2xl font-mono font-semibold text-gray-900">{formatZeit(sekunden)}</span>
          </div>
          <p className="text-xs text-gray-400">Max. {formatZeit(MAX_SEKUNDEN)}</p>
          <button
            onClick={aufnahmeStoppen}
            className="w-full rounded-xl bg-red-600 py-4 text-lg font-semibold text-white hover:opacity-90 active:opacity-80"
          >
            Stopp
          </button>
        </div>
      )}

      {(zustand === 'aufgenommen' || zustand === 'wertet_aus') && audioUrl && (
        <div className="flex flex-col items-center gap-4 py-2">
          <audio controls src={audioUrl} className="w-full" />
          {fehler && <p className="text-sm text-red-600">{fehler}</p>}
          <div className="flex w-full gap-2">
            <button
              onClick={verwerfen}
              disabled={zustand === 'wertet_aus'}
              className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              Verwerfen
            </button>
            <button
              onClick={auswerten}
              disabled={zustand === 'wertet_aus'}
              className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {zustand === 'wertet_aus' ? 'Wertet aus…' : 'Auswerten'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
