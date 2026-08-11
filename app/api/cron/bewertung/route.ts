import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const resend = new Resend(process.env.RESEND_API_KEY)

const MIN_TAGE_NACH_ABSCHLUSS = 3
const MAX_MAILS_PRO_LAUF = 50
const OPENAI_MODEL = 'gpt-5.6-luna'

interface OfferRow {
  id: string
  title: string
  auftrag_abgeschlossen_am: string | null
  bewertung_gesendet_am: string | null
  customers: { name: string; email: string } | { name: string; email: string }[] | null
}

function tageSeit(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}

function istFaellig(offer: OfferRow): boolean {
  if (!offer.auftrag_abgeschlossen_am) return false
  if (offer.bewertung_gesendet_am) return false
  return tageSeit(offer.auftrag_abgeschlossen_am) >= MIN_TAGE_NACH_ABSCHLUSS
}

async function generiereBewertungsText(params: { kundenname: string; leistung: string }): Promise<string> {
  const fallback = `Guten Tag ${params.kundenname},\n\nvielen Dank, dass Sie sich für "${params.leistung}" für uns entschieden haben. Wir würden uns sehr über eine kurze Google-Bewertung freuen, falls Sie zufrieden waren.\n\nMit freundlichen Grüßen\n${COMPANY_CONFIG.name}`

  if (!process.env.OPENAI_API_KEY) return fallback

  const prompt = `Schreibe eine kurze, herzliche Nachricht auf Deutsch. Absender ist der Malerbetrieb "${COMPANY_CONFIG.name}", Empfänger der Kunde "${params.kundenname}". Der Auftrag "${params.leistung}" wurde vor wenigen Tagen abgeschlossen.
Regeln: maximal 4 Sätze. Bedanke dich für den Auftrag und bitte höflich um eine kurze Google-Bewertung. Kein Druck, keine Sternchen-Vorgabe, keine Gegenleistung anbieten. Sie-Form, natürlicher Ton, kein Marketing-Sprech. Kein Betreff, nur der Fließtext. Erwähne keine Preise und schreibe keine Links.`

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_completion_tokens: 300,
      }),
    })
    if (!res.ok) return fallback
    const json = await res.json()
    const text: string | undefined = json.choices?.[0]?.message?.content?.trim()
    return text || fallback
  } catch {
    return fallback
  }
}

export async function GET(req: NextRequest) {
  return handleBewertungRun(req)
}

export async function POST(req: NextRequest) {
  return handleBewertungRun(req)
}

async function handleBewertungRun(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabaseServer
    .from('company_settings')
    .select('bewertung_aktiv, google_bewertung_url')
    .eq('company_id', COMPANY_CONFIG.id)
    .maybeSingle()

  // Opt-in: ohne bewusste Aktivierung UND ohne hinterlegten Link läuft nichts.
  if (settings?.bewertung_aktiv !== true || !settings.google_bewertung_url) {
    return NextResponse.json({
      geprueft: 0,
      versendet: 0,
      fehler: 0,
      hinweis: 'Bewertungsbitte für diesen Betrieb nicht aktiviert oder kein Link hinterlegt',
    })
  }

  const bewertungsLink = settings.google_bewertung_url

  const { data: offers, error } = await supabaseServer
    .from('offers')
    .select('id, title, auftrag_abgeschlossen_am, bewertung_gesendet_am, customers(name, email)')
    .eq('status', 'accepted')
    .eq('company_id', COMPANY_CONFIG.id)

  if (error) {
    console.error('CRON BEWERTUNG: Laden fehlgeschlagen:', error)
    return NextResponse.json({ error: 'Angebote konnten nicht geladen werden.' }, { status: 500 })
  }

  const faellige = ((offers ?? []) as OfferRow[]).filter(istFaellig).slice(0, MAX_MAILS_PRO_LAUF)

  let versendet = 0
  const fehlerListe: string[] = []

  for (const offer of faellige) {
    try {
      const customers = Array.isArray(offer.customers) ? offer.customers[0] : offer.customers
      if (!customers?.email) {
        fehlerListe.push(`${offer.id}: keine Kunden-E-Mail`)
        continue
      }

      const text = await generiereBewertungsText({
        kundenname: customers.name ?? 'Kunde',
        leistung: offer.title,
      })

      const textMitLink = `${text}\n\nHier geht's zur Bewertung: ${bewertungsLink}`
      const htmlMitLink = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; white-space: pre-line;">${text}</div><div style="text-align: center; margin: 24px 0;"><a href="${bewertungsLink}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600;">Jetzt bewerten</a></div>`

      const { error: sendError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: customers.email,
        cc: COMPANY_CONFIG.email,
        subject: `Vielen Dank – ${COMPANY_CONFIG.name}`,
        text: textMitLink,
        html: htmlMitLink,
      })

      if (sendError) {
        fehlerListe.push(`${offer.id}: ${sendError.message}`)
        continue
      }

      const { error: updateError } = await supabaseServer
        .from('offers')
        .update({ bewertung_gesendet_am: new Date().toISOString() })
        .eq('id', offer.id)

      if (updateError) {
        console.error('CRON BEWERTUNG: Update fehlgeschlagen:', updateError)
        fehlerListe.push(`${offer.id}: Mail versendet, aber nicht gespeichert`)
        continue
      }

      versendet++
    } catch (err) {
      console.error('CRON BEWERTUNG: Fehler bei Angebot', offer.id, err)
      fehlerListe.push(`${offer.id}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  return NextResponse.json({
    geprueft: faellige.length,
    versendet,
    fehler: fehlerListe.length,
    fehlerDetails: fehlerListe,
  })
}
