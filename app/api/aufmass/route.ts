import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG, SERVICES } from '@/lib/company-config'
import type { AufmassStrukturiert } from '@/lib/types/aufmass'

export const runtime = 'nodejs'

const MAX_AUDIO_BYTES = 10 * 1024 * 1024 // 10 MB
const MAX_AUSWERTUNGEN_PRO_TAG = 30
const TRANSCRIBE_MODEL = 'gpt-transcribe'
const STRUKTUR_MODEL = 'gpt-5.6-luna'

const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  'audio/webm': 'webm',
  'audio/mp4': 'm4a',
  'audio/x-m4a': 'm4a',
  'audio/mpeg': 'mp3',
  'audio/wav': 'wav',
  'audio/ogg': 'ogg',
}

function heuteStartIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

async function transkribiere(audio: File): Promise<{ text: string | null; error: string | null }> {
  const form = new FormData()
  form.append('file', audio, audio.name || 'aufnahme.webm')
  form.append('model', TRANSCRIBE_MODEL)
  form.append('languages[]', 'de')

  try {
    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('AUFMASS TRANSCRIBE ERROR:', res.status, errText)
      return { text: null, error: 'Transkription fehlgeschlagen.' }
    }
    const json = await res.json()
    const text: string | undefined = json.text
    if (!text) return { text: null, error: 'Keine Sprache erkannt.' }
    return { text, error: null }
  } catch (err) {
    console.error('AUFMASS TRANSCRIBE EXCEPTION:', err)
    return { text: null, error: 'Transkription fehlgeschlagen.' }
  }
}

function fallbackStruktur(): AufmassStrukturiert {
  return {
    raum: null,
    leistung: null,
    flaeche_m2: null,
    wandhoehe_m: null,
    untergrund: null,
    anstriche: null,
    decke_inklusive: null,
    hinweise: [],
    unklar: ['Automatische Auswertung fehlgeschlagen, bitte Felder manuell ausfüllen.'],
  }
}

function bereinigeStruktur(raw: unknown): AufmassStrukturiert {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const leistungsNamen = SERVICES.map((s) => s.name)
  const leistung = typeof r.leistung === 'string' && leistungsNamen.includes(r.leistung) ? r.leistung : null

  return {
    raum: typeof r.raum === 'string' ? r.raum : null,
    leistung,
    flaeche_m2: typeof r.flaeche_m2 === 'number' ? r.flaeche_m2 : null,
    wandhoehe_m: typeof r.wandhoehe_m === 'number' ? r.wandhoehe_m : null,
    untergrund: typeof r.untergrund === 'string' ? r.untergrund : null,
    anstriche: typeof r.anstriche === 'number' ? r.anstriche : null,
    decke_inklusive: typeof r.decke_inklusive === 'boolean' ? r.decke_inklusive : null,
    hinweise: Array.isArray(r.hinweise) ? r.hinweise.filter((h): h is string => typeof h === 'string') : [],
    unklar: Array.isArray(r.unklar) ? r.unklar.filter((h): h is string => typeof h === 'string') : [],
  }
}

async function strukturiere(transkript: string): Promise<AufmassStrukturiert> {
  if (!process.env.OPENAI_API_KEY) return fallbackStruktur()

  const leistungsListe = SERVICES.map((s) => s.name).join(', ')
  const prompt = `Du hilfst einem Malerbetrieb. Der folgende Text ist ein diktiertes Aufmaß von einer Baustelle. Extrahiere die Angaben und antworte nur mit JSON:
{"raum": string|null, "leistung": string|null, "flaeche_m2": number|null, "wandhoehe_m": number|null, "untergrund": string|null, "anstriche": number|null, "decke_inklusive": boolean|null, "hinweise": string[], "unklar": string[]}
Verfügbare Leistungen: ${leistungsListe}. Wähle leistung ausschließlich daraus, sonst null.
Regeln: Maßangaben wie "vier mal fünf" zu einer Fläche verrechnen und in hinweise vermerken, wie du gerechnet hast. Was nicht gesagt wurde, bleibt null — nichts erfinden. Alles, was du nicht sicher zuordnen konntest, kommt als kurze Stichpunkte nach unklar.

Text: "${transkript}"`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: STRUKTUR_MODEL,
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_completion_tokens: 600,
      }),
    })
    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error('AUFMASS STRUKTUR ERROR:', res.status, errText)
      return fallbackStruktur()
    }
    const json = await res.json()
    const rawContent: string | undefined = json.choices?.[0]?.message?.content
    if (!rawContent) return fallbackStruktur()

    const bereinigt = rawContent.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
    return bereinigeStruktur(JSON.parse(bereinigt))
  } catch (err) {
    console.error('AUFMASS STRUKTUR EXCEPTION:', err)
    return fallbackStruktur()
  }
}

export async function POST(req: NextRequest) {
  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return NextResponse.json({ error: 'Keine Audioaufnahme erhalten.' }, { status: 400 })
  }

  try {
    const audio = form.get('audio')

    if (!(audio instanceof File) || audio.size === 0) {
      return NextResponse.json({ error: 'Keine Audioaufnahme erhalten.' }, { status: 400 })
    }
    if (audio.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Aufnahme zu groß (max. 10 MB).' }, { status: 400 })
    }
    if (audio.type && !audio.type.startsWith('audio/')) {
      return NextResponse.json({ error: 'Ungültiges Dateiformat.' }, { status: 400 })
    }

    const { count, error: countError } = await supabaseServer
      .from('aufmasse')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', COMPANY_CONFIG.id)
      .gte('erstellt_am', heuteStartIso())

    if (countError) {
      console.error('AUFMASS COUNT ERROR:', countError)
      return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
    if ((count ?? 0) >= MAX_AUSWERTUNGEN_PRO_TAG) {
      return NextResponse.json(
        { error: `Tageslimit erreicht (max. ${MAX_AUSWERTUNGEN_PRO_TAG} Auswertungen pro Tag).` },
        { status: 429 }
      )
    }

    const { text: transkript, error: transkriptFehler } = await transkribiere(audio)
    if (transkriptFehler || !transkript) {
      return NextResponse.json({ error: transkriptFehler ?? 'Transkription fehlgeschlagen.' }, { status: 502 })
    }

    const strukturiert = await strukturiere(transkript)

    let audioPfad: string | null = null
    try {
      const ext = EXT_BY_CONTENT_TYPE[audio.type] ?? 'webm'
      const pfad = `${COMPANY_CONFIG.id}/${randomUUID()}.${ext}`
      const bytes = new Uint8Array(await audio.arrayBuffer())
      const { error: uploadError } = await supabaseServer.storage
        .from('aufmass-audio')
        .upload(pfad, bytes, { contentType: audio.type || 'audio/webm', upsert: false })
      if (!uploadError) audioPfad = pfad
    } catch (err) {
      console.error('AUFMASS AUDIO UPLOAD FEHLGESCHLAGEN (nicht kritisch):', err)
    }

    const { data: aufmass, error: insertError } = await supabaseServer
      .from('aufmasse')
      .insert({
        company_id: COMPANY_CONFIG.id,
        transkript,
        strukturiert,
        audio_pfad: audioPfad,
        status: 'entwurf',
      })
      .select()
      .single()

    if (insertError || !aufmass) {
      console.error('AUFMASS INSERT ERROR:', insertError)
      return NextResponse.json(
        { error: `Ergebnis konnte nicht gespeichert werden: ${insertError?.message ?? 'unbekannter Fehler'}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, aufmass })
  } catch (err) {
    console.error('AUFMASS ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
