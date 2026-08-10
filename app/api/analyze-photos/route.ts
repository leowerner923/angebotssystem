import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { SERVICES } from '@/lib/company-config'
import type { FotoAnalyse } from '@/lib/types/database'

// Vision-fähiges Modell, Stand August 2026 (bitte bei Bedarf gegen aktuelle OpenAI-Doku prüfen)
const OPENAI_MODEL = 'gpt-5.6-luna'
const MAX_FOTOS = 5

const MIME_BY_EXT: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
}

type ChatContentPart =
  | { type: 'text'; text: string }
  | { type: 'image_url'; image_url: { url: string; detail: 'low' } }

function extractExt(pfad: string): string {
  return (pfad.split('.').pop() ?? '').toLowerCase()
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const requestId = body.requestId

    if (!requestId || typeof requestId !== 'string') {
      return NextResponse.json({ error: 'requestId fehlt' }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OPENAI_API_KEY ist nicht konfiguriert.' }, { status: 500 })
    }

    const { data: requestRow, error: requestError } = await supabaseServer
      .from('requests')
      .select('id, foto_pfade, service_type, square_meters')
      .eq('id', requestId)
      .single()

    if (requestError || !requestRow) {
      return NextResponse.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })
    }

    const fotoPfade: string[] = requestRow.foto_pfade ?? []
    if (fotoPfade.length === 0) {
      return NextResponse.json({ error: 'Keine Fotos für diese Anfrage vorhanden.' }, { status: 400 })
    }

    const bilder: { mediaType: string; base64: string }[] = []
    for (const pfad of fotoPfade.slice(0, MAX_FOTOS)) {
      const mediaType = MIME_BY_EXT[extractExt(pfad)]
      if (!mediaType) continue // HEIC & unbekannte Formate werden übersprungen

      const { data: blob, error: downloadError } = await supabaseServer.storage
        .from('anfrage-fotos')
        .download(pfad)

      if (downloadError || !blob) {
        return NextResponse.json({ error: `Foto konnte nicht geladen werden: ${pfad}` }, { status: 500 })
      }

      const buffer = Buffer.from(await blob.arrayBuffer())
      bilder.push({ mediaType, base64: buffer.toString('base64') })
    }

    if (bilder.length === 0) {
      return NextResponse.json(
        { error: 'Keine unterstützten Bildformate gefunden (HEIC wird derzeit nicht unterstützt).' },
        { status: 400 }
      )
    }

    const leistung =
      SERVICES.find((s) => s.id === requestRow.service_type)?.name ?? requestRow.service_type ?? 'unbekannt'
    const flaeche = requestRow.square_meters

    const promptText = `Du bist Assistent für einen Malerbetrieb. Analysiere die Fotos einer Kundenanfrage für die Leistung "${leistung}". Der Kunde hat ${flaeche ?? 'keine'} m² angegeben.
Antworte nur mit JSON in genau dieser Struktur:
{"flaeche_geschaetzt_m2": number|null, "untergrund": string|null, "vorarbeiten": string[], "auffaelligkeiten": string[], "sicherheit": "hoch"|"mittel"|"niedrig", "hinweis": string}
Regeln: Schätze konservativ. Wenn etwas auf den Fotos nicht erkennbar ist, gib null bzw. eine leere Liste zurück statt zu raten. "sicherheit" beschreibt, wie verlässlich deine Einschätzung ist. "hinweis" ist ein kurzer Satz für den Handwerker in einfachem Deutsch. Nenne niemals Preise.`

    const content: ChatContentPart[] = [{ type: 'text', text: promptText }]
    for (const bild of bilder) {
      content.push({
        type: 'image_url',
        image_url: { url: `data:${bild.mediaType};base64,${bild.base64}`, detail: 'low' },
      })
    }

    let openaiRes: Response
    try {
      openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          messages: [{ role: 'user', content }],
          response_format: { type: 'json_object' },
          max_completion_tokens: 1024,
        }),
      })
    } catch {
      return NextResponse.json({ error: 'OpenAI-API war nicht erreichbar.' }, { status: 502 })
    }

    if (!openaiRes.ok) {
      const errText = await openaiRes.text().catch(() => '')
      console.error('OPENAI ERROR:', openaiRes.status, errText)
      if (openaiRes.status === 401) {
        return NextResponse.json({ error: 'OpenAI-API-Key ist ungültig.' }, { status: 500 })
      }
      if (openaiRes.status === 429) {
        return NextResponse.json(
          { error: 'OpenAI-Rate-Limit erreicht oder Guthaben aufgebraucht. Bitte später erneut versuchen.' },
          { status: 429 }
        )
      }
      return NextResponse.json({ error: 'Foto-Analyse fehlgeschlagen.' }, { status: 502 })
    }

    const openaiJson = await openaiRes.json()
    const rawContent: string | undefined = openaiJson.choices?.[0]?.message?.content

    if (!rawContent) {
      return NextResponse.json({ error: 'Keine Antwort von der Foto-Analyse erhalten.' }, { status: 502 })
    }

    let parsed: Partial<Omit<FotoAnalyse, 'erstellt_am'>>
    try {
      const bereinigt = rawContent.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim()
      parsed = JSON.parse(bereinigt)
    } catch {
      console.error('OPENAI JSON PARSE ERROR:', rawContent)
      return NextResponse.json({ error: 'Antwort der Foto-Analyse war kein gültiges JSON.' }, { status: 502 })
    }

    const fotoAnalyse: FotoAnalyse = {
      flaeche_geschaetzt_m2: parsed.flaeche_geschaetzt_m2 ?? null,
      untergrund: parsed.untergrund ?? null,
      vorarbeiten: Array.isArray(parsed.vorarbeiten) ? parsed.vorarbeiten : [],
      auffaelligkeiten: Array.isArray(parsed.auffaelligkeiten) ? parsed.auffaelligkeiten : [],
      sicherheit: parsed.sicherheit ?? 'niedrig',
      hinweis: parsed.hinweis ?? '',
      erstellt_am: new Date().toISOString(),
    }

    const { error: updateError } = await supabaseServer
      .from('requests')
      .update({ foto_analyse: fotoAnalyse })
      .eq('id', requestId)

    if (updateError) {
      console.error('UPDATE ERROR:', updateError)
      return NextResponse.json({ error: 'Analyse-Ergebnis konnte nicht gespeichert werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, foto_analyse: fotoAnalyse })
  } catch (err) {
    console.error('ANALYZE PHOTOS ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
