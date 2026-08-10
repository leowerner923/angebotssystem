import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { offer_id } = await req.json()

    if (!offer_id) {
      return NextResponse.json({ error: 'offer_id fehlt' }, { status: 400 })
    }

    const { data: offer, error } = await supabaseServer
      .from('offers')
      .select('*, customers(name, email, phone)')
      .eq('id', offer_id)
      .single()

    if (error || !offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden' }, { status: 404 })
    }

    const customerName = offer.customers?.name ?? 'Kunde'
    const price = offer.price.toFixed(2).replace('.', ',')

    const gueltigBis = new Date()
    gueltigBis.setDate(gueltigBis.getDate() + 30)
    const gueltigBisIso = gueltigBis.toISOString().slice(0, 10)

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const annahmeLink = `${baseUrl}/angebot/${offer.annahme_token}`

    const emailPayload: any = {
      from: 'onboarding@resend.dev',
      to: offer.customers.email,
      subject: `Ihr Angebot von ${COMPANY_CONFIG.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #1d4ed8;">Ihr persönliches Angebot</h2>

          <p>Guten Tag ${customerName},</p>

          <p>vielen Dank für Ihr Interesse an unseren Dienstleistungen.
          Wir haben Ihr Angebot vorbereitet und freuen uns, Ihnen folgendes mitteilen zu können:</p>

          <div style="background: #f8fafc; border-left: 4px solid #1d4ed8; padding: 16px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Leistung:</strong> ${offer.title}</p>
            <p style="margin: 8px 0 0;"><strong>Beschreibung:</strong> ${offer.description}</p>
            <p style="margin: 8px 0 0; font-size: 20px;"><strong>Preis: ${price} €</strong></p>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${annahmeLink}" style="display: inline-block; background: #1d4ed8; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600;">
              Angebot ansehen und annehmen
            </a>
          </div>

          <p>Das PDF mit allen Details finden Sie im Anhang. Der Link oben führt zu einer schlichten Seite,
          auf der Sie das Angebot direkt annehmen oder ablehnen können — ganz ohne Login.</p>

          <p>Bei Fragen stehen wir Ihnen jederzeit zur Verfügung.
          Melden Sie sich einfach — wir kümmern uns persönlich um Ihr Anliegen.</p>

          <p>Mit freundlichen Grüßen<br>
          <strong>${COMPANY_CONFIG.name}</strong><br>
          ${COMPANY_CONFIG.location}</p>
        </div>
      `,
    }

    if (offer.pdf_url) {
      const pdfBuffer = Buffer.from(offer.pdf_url, 'base64')
      emailPayload.attachments = [
        {
          filename: `Angebot-${offer.id.slice(-8).toUpperCase()}.pdf`,
          content: pdfBuffer,
        },
      ]
    }

    await resend.emails.send(emailPayload)

    await supabaseServer
      .from('offers')
      .update({ status: 'sent', gueltig_bis: gueltigBisIso, versendet_am: new Date().toISOString() })
      .eq('id', offer_id)

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('SEND OFFER ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}