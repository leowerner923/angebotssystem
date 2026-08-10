import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const resend = new Resend(process.env.RESEND_API_KEY)

const MIN_TAGE_BIS_ERSTE_NACHFRAGE = 3
const MIN_TAGE_ZWISCHEN_NACHFRAGEN = 4
const MAX_FOLLOW_UPS = 2
const MAX_MAILS_PRO_LAUF = 50
const OPENAI_MODEL = 'gpt-5.6-luna'

interface OfferRow {
  id: string
  title: string
  price: number
  gueltig_bis: string | null
  versendet_am: string | null
  follow_up_anzahl: number
  follow_up_zuletzt_am: string | null
  annahme_token: string
  customers: { name: string; email: string } | { name: string; email: string }[] | null
}

function tageSeit(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24)
}

function heuteAlsIsoDatum(): string {
  return new Date().toISOString().slice(0, 10)
}

function istFaellig(offer: OfferRow): boolean {
  // Altbestand ohne Versanddatum: kann nicht bewertet werden, überspringen statt als uralt zu behandeln
  if (!offer.versendet_am) return false
  if (offer.follow_up_anzahl >= MAX_FOLLOW_UPS) return false
  if (offer.gueltig_bis && offer.gueltig_bis < heuteAlsIsoDatum()) return false

  if (offer.follow_up_anzahl === 0) {
    return tageSeit(offer.versendet_am) >= MIN_TAGE_BIS_ERSTE_NACHFRAGE
  }

  // follow_up_anzahl === 1
  if (!offer.follow_up_zuletzt_am) return false
  return tageSeit(offer.follow_up_zuletzt_am) >= MIN_TAGE_ZWISCHEN_NACHFRAGEN
}

async function generiereNachfassText(params: {
  kundenname: string
  leistung: string
  tage: number
  zweiteNachfrage: boolean
}): Promise<string> {
  const fallback = params.zweiteNachfrage
    ? `Guten Tag ${params.kundenname},\n\nwir wollten uns noch einmal kurz zu unserem Angebot über "${params.leistung}" melden. Dies ist unsere letzte Nachfrage — bei Interesse oder Fragen antworten Sie uns gerne einfach.\n\nMit freundlichen Grüßen\n${COMPANY_CONFIG.name}`
    : `Guten Tag ${params.kundenname},\n\nvor ein paar Tagen haben wir Ihnen ein Angebot über "${params.leistung}" geschickt und wollten kurz nachfragen, ob es noch Fragen dazu gibt. Antworten Sie uns gerne einfach.\n\nMit freundlichen Grüßen\n${COMPANY_CONFIG.name}`

  if (!process.env.OPENAI_API_KEY) return fallback

  const prompt = `Schreibe eine kurze, freundliche Nachfass-Mail auf Deutsch. Absender ist der Malerbetrieb "${COMPANY_CONFIG.name}", Empfänger der Kunde "${params.kundenname}". Vor ${Math.round(params.tage)} Tagen wurde ein Angebot über "${params.leistung}" geschickt, bisher keine Rückmeldung.
Regeln: maximal 5 Sätze. Höflich, sachlich, kein Verkaufsdruck, keine Rabatte, keine Superlative. Sie-Form. Biete an, bei Fragen einfach zu antworten. Kein Betreff, nur der Fließtext. Erwähne keine Preise.
${params.zweiteNachfrage ? 'Dies ist die zweite und letzte Nachfrage. Fasse dich noch kürzer und erwähne, dass dies die letzte Nachfrage ist.' : ''}`

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
        max_completion_tokens: 400,
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

// Vercel Cron ruft per GET auf (Authorization-Header wird automatisch aus
// CRON_SECRET gesetzt); POST bleibt für den manuellen Testauslöser.
export async function GET(req: NextRequest) {
  return handleFollowUpRun(req)
}

export async function POST(req: NextRequest) {
  return handleFollowUpRun(req)
}

async function handleFollowUpRun(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: settings } = await supabaseServer
    .from('company_settings')
    .select('follow_up_aktiv')
    .eq('company_id', COMPANY_CONFIG.id)
    .maybeSingle()

  // Opt-in: ohne expliziten Eintrag (noch nie aktiviert) läuft kein Follow-up.
  if (settings?.follow_up_aktiv !== true) {
    return NextResponse.json({ geprueft: 0, versendet: 0, fehler: 0, hinweis: 'Follow-up für diesen Betrieb nicht aktiviert' })
  }

  const { data: offers, error } = await supabaseServer
    .from('offers')
    .select(
      'id, title, price, gueltig_bis, versendet_am, follow_up_anzahl, follow_up_zuletzt_am, annahme_token, customers(name, email)'
    )
    .eq('status', 'sent')
    .eq('company_id', COMPANY_CONFIG.id)

  if (error) {
    console.error('CRON FOLLOW-UP: Laden fehlgeschlagen:', error)
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

      const zweiteNachfrage = offer.follow_up_anzahl === 1
      const tage = tageSeit(offer.versendet_am!)
      const text = await generiereNachfassText({
        kundenname: customers.name ?? 'Kunde',
        leistung: offer.title,
        tage,
        zweiteNachfrage,
      })

      const link = `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/angebot/${offer.annahme_token}`
      const textMitLink = `${text}\n\nHier geht's zu Ihrem Angebot: ${link}`
      const htmlMitLink = `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; white-space: pre-line;">${text}</div><div style="text-align: center; margin: 24px 0;"><a href="${link}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 600;">Angebot ansehen</a></div>`

      const { error: sendError } = await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: customers.email,
        cc: COMPANY_CONFIG.email,
        subject: `Kurze Nachfrage zu Ihrem Angebot – ${COMPANY_CONFIG.name}`,
        text: textMitLink,
        html: htmlMitLink,
      })

      if (sendError) {
        fehlerListe.push(`${offer.id}: ${sendError.message}`)
        continue
      }

      const { error: updateError } = await supabaseServer
        .from('offers')
        .update({
          follow_up_anzahl: offer.follow_up_anzahl + 1,
          follow_up_zuletzt_am: new Date().toISOString(),
        })
        .eq('id', offer.id)

      if (updateError) {
        console.error('CRON FOLLOW-UP: Zähler-Update fehlgeschlagen:', updateError)
        fehlerListe.push(`${offer.id}: Mail versendet, aber Zähler nicht gespeichert`)
        continue
      }

      versendet++
    } catch (err) {
      console.error('CRON FOLLOW-UP: Fehler bei Angebot', offer.id, err)
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
