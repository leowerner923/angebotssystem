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

    await resend.emails.send({
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
          
          <p>Bei Fragen stehen wir Ihnen jederzeit zur Verfügung. 
          Melden Sie sich einfach — wir kümmern uns persönlich um Ihr Anliegen.</p>
          
          <p>Mit freundlichen Grüßen<br>
          <strong>${COMPANY_CONFIG.name}</strong><br>
          ${COMPANY_CONFIG.location}</p>
        </div>
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