import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { offer_id } = await req.json()

    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id fehlt' }, { status: 400 })
    }

    const { data: offer, error } = await supabaseServer
      .from('offers')
      .select('*, customers(name, email)')
      .eq('id', offer_id)
      .single()

    if (error || !offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 })
    }

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: offer.customers.email,
      subject: `Ihr Angebot - ${offer.title}`,
      html: `
        <h2>Guten Tag ${offer.customers.name},</h2>
        <p>vielen Dank für Ihre Anfrage. Hier ist Ihr Angebot:</p>
        <p><strong>Leistung:</strong> ${offer.title}</p>
        <p><strong>Preis:</strong> ${offer.price} €</p>
        <p>Wir freuen uns auf Ihre Rückmeldung.</p>
        <p>Mit freundlichen Grüßen</p>
      `,
    })

    await supabaseServer
      .from('offers')
      .update({ status: 'sent' })
      .eq('id', offer_id)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('SEND OFFER ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}