import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'
import { generateOfferPdf } from '@/lib/pdf/generate-offer-pdf'
import type { OfferPdfData } from '@/lib/types/offer'
import type { ServiceRequest, Customer } from '@/lib/types/database'

export async function GET() {
  return Response.json({ ok: true })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { request_id } = body as { request_id: string }

  if (!request_id) {
    return NextResponse.json({ error: 'request_id fehlt.' }, { status: 400 })
  }

  const { data: request, error: reqError } = await supabaseServer
    .from('requests')
    .select('*')
    .eq('id', request_id)
    .single<ServiceRequest>()

  if (reqError || !request) {
    return NextResponse.json({ error: 'Anfrage nicht gefunden.' }, { status: 404 })
  }

  const { data: customer, error: custError } = await supabaseServer
    .from('customers')
    .select('*')
    .eq('id', request.customer_id)
    .single<Customer>()

  if (custError || !customer) {
    return NextResponse.json({ error: 'Kunde nicht gefunden.' }, { status: 404 })
  }

  const title = request.service_type
  const offerNumber = request_id.slice(-8).toUpperCase()

  const pdfData: OfferPdfData = {
    offerNumber,
    companyName: COMPANY_CONFIG.name,
    companyLocation: COMPANY_CONFIG.location,
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone || undefined,
      company: customer.company || undefined,
    },
    serviceTitle: title,
    details: { area_m2: request.square_meters ?? undefined },
    price: request.price,
    createdAt: new Date(),
  }

  let pdfBase64: string | null = null
  try {
    const pdfBytes = await generateOfferPdf(pdfData)
    pdfBase64 = Buffer.from(pdfBytes).toString('base64')
  } catch (err) {
    console.error('PDF-Generierung fehlgeschlagen:', err)
  }

  const description = buildDescription(request.service_type, request.square_meters)

  const { data: offer, error: offerError } = await supabaseServer
    .from('offers')
    .insert({
      company_id: COMPANY_CONFIG.id,
      request_id,
      customer_id: customer.id,
      title,
      description,
      price: request.price,
      status: 'draft',
      pdf_url: pdfBase64,
    })
    .select('id')
    .single()

  if (offerError || !offer) {
    console.error('Fehler beim Speichern des Angebots:', offerError)
    return NextResponse.json({ error: 'Angebot konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ offer_id: offer.id, pdf_available: pdfBase64 !== null })
}

function buildDescription(serviceType: string, squareMeters: number | null): string {
  const parts: string[] = [`Leistung: ${serviceType}`]
  if (squareMeters) parts.push(`Fläche: ${squareMeters} m²`)
  return parts.join(' · ')
}