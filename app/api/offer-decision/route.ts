import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const resend = new Resend(process.env.RESEND_API_KEY)

type Entscheidung = 'angenommen' | 'abgelehnt'

const STATUS_BY_ENTSCHEIDUNG: Record<Entscheidung, 'accepted' | 'rejected'> = {
  angenommen: 'accepted',
  abgelehnt: 'rejected',
}

async function sendeBenachrichtigungen(offer: {
  id: string
  title: string
  price: number
  status: 'accepted' | 'rejected'
  customers: { name: string; email: string } | null
}) {
  const price = offer.price.toFixed(2).replace('.', ',')
  const customerName = offer.customers?.name ?? 'Kunde'
  const angenommen = offer.status === 'accepted'

  try {
    if (offer.customers?.email) {
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: offer.customers.email,
        subject: angenommen ? 'Ihre Angebotsannahme' : 'Ihre Rückmeldung',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>Guten Tag ${customerName},</p>
            <p>${
              angenommen
                ? 'vielen Dank für Ihre Zusage! Wir melden uns zeitnah zur Terminabstimmung.'
                : 'vielen Dank für Ihre Rückmeldung. Falls sich noch etwas ändert, erreichen Sie uns jederzeit.'
            }</p>
            <p>Mit freundlichen Grüßen<br><strong>${COMPANY_CONFIG.name}</strong></p>
          </div>
        `,
      })
    }
  } catch (err) {
    console.error('OFFER-DECISION: Kunden-Mail fehlgeschlagen:', err)
  }

  try {
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: COMPANY_CONFIG.email,
      subject: angenommen
        ? `${customerName} hat Ihr Angebot angenommen`
        : `${customerName} hat Ihr Angebot abgelehnt`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p><strong>${customerName}</strong> hat online ${angenommen ? 'angenommen' : 'abgelehnt'}:</p>
          <p>Leistung: ${offer.title}<br>Betrag: ${price} €</p>
        </div>
      `,
    })
  } catch (err) {
    console.error('OFFER-DECISION: Betriebs-Mail fehlgeschlagen:', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const token: unknown = body.token
    const entscheidung: unknown = body.entscheidung

    if (typeof token !== 'string' || !token) {
      return NextResponse.json({ error: 'token fehlt' }, { status: 400 })
    }
    if (entscheidung !== 'angenommen' && entscheidung !== 'abgelehnt') {
      return NextResponse.json({ error: 'entscheidung muss "angenommen" oder "abgelehnt" sein' }, { status: 400 })
    }

    const { data: offer, error } = await supabaseServer
      .from('offers')
      .select('id, title, price, status, gueltig_bis, customers(name, email)')
      .eq('annahme_token', token)
      .single()

    if (error || !offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden.' }, { status: 404 })
    }

    if (offer.status !== 'sent') {
      return NextResponse.json(
        { error: 'Zu diesem Angebot liegt bereits eine Entscheidung vor.' },
        { status: 409 }
      )
    }

    if (offer.gueltig_bis && offer.gueltig_bis < new Date().toISOString().slice(0, 10)) {
      return NextResponse.json(
        { error: 'Dieses Angebot ist abgelaufen.' },
        { status: 410 }
      )
    }

    const neuerStatus = STATUS_BY_ENTSCHEIDUNG[entscheidung]

    const { error: updateError } = await supabaseServer
      .from('offers')
      .update({ status: neuerStatus, entschieden_am: new Date().toISOString() })
      .eq('annahme_token', token)

    if (updateError) {
      console.error('OFFER-DECISION UPDATE ERROR:', updateError)
      return NextResponse.json({ error: 'Entscheidung konnte nicht gespeichert werden.' }, { status: 500 })
    }

    const customers = Array.isArray(offer.customers) ? offer.customers[0] : offer.customers
    await sendeBenachrichtigungen({
      id: offer.id,
      title: offer.title,
      price: offer.price,
      status: neuerStatus,
      customers: customers ?? null,
    })

    return NextResponse.json({ success: true, status: neuerStatus })
  } catch (err) {
    console.error('OFFER-DECISION ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
