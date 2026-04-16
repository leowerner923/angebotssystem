import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG, SERVICES } from '@/lib/company-config'
import { generateOfferPdf } from '@/lib/pdf/generate-offer-pdf'
import type { OfferPdfData } from '@/lib/types/offer'

function calculatePrice(serviceId: string, squareMeters: number | null, windowCount: number | null): number {
  const service = SERVICES.find((s) => s.id === serviceId)
  if (!service) return 0

  if (service.pricing_type === 'per_m2') {
    return service.price_per_unit * (squareMeters ?? 0)
  } else if (service.pricing_type === 'per_unit') {
    return service.price_per_unit * (windowCount ?? 0)
  }
  return service.price_per_unit
}

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()

    if (!request_id) {
      return NextResponse.json({ error: 'request_id fehlt' }, { status: 400 })
    }

    const { data: request, error: reqError } = await supabaseServer
      .from('requests')
      .select('*, customers(name, email, phone, company)')
      .eq('id', request_id)
      .single()

    if (reqError || !request) {
      return NextResponse.json({ error: 'Request nicht gefunden' }, { status: 404 })
    }

    const service = SERVICES.find((s) => s.id === request.service_type)
    const calculatedPrice = calculatePrice(
      request.service_type,
      request.square_meters,
      request.window_count
    )

    const offerNumber = request_id.slice(-8).toUpperCase()

    const pdfData: OfferPdfData = {
      offerNumber,
      companyName: COMPANY_CONFIG.name,
      companyLocation: COMPANY_CONFIG.location,
      customer: {
        name: request.customers?.name ?? '',
        email: request.customers?.email ?? '',
        phone: request.customers?.phone ?? undefined,
        company: request.customers?.company ?? undefined,
      },
      serviceTitle: service?.name ?? request.service_type,
      details: {
        area_m2: request.square_meters ?? undefined,
        window_count: request.window_count ?? undefined,
        floor_count: request.floor_count ?? undefined,
        cleaning_interval: request.cleaning_interval ?? undefined,
        city: request.city ?? undefined,
        extras: [],
      },
      price: calculatedPrice,
      createdAt: new Date(),
    }

    let pdfBase64: string | null = null
    try {
      const pdfBytes = await generateOfferPdf(pdfData)
      pdfBase64 = Buffer.from(pdfBytes).toString('base64')
    } catch (err) {
      console.error('PDF Fehler:', err)
    }

    const { data: offer, error } = await supabaseServer
      .from('offers')
      .insert({
        company_id: request.company_id ?? COMPANY_CONFIG.id,
        request_id,
        customer_id: request.customer_id,
        title: service?.name ?? request.service_type,
        description: `Leistung: ${service?.name ?? request.service_type}${request.square_meters ? ` · Fläche: ${request.square_meters} m²` : ''}${request.window_count ? ` · Fenster: ${request.window_count}` : ''}`,
        price: calculatedPrice,
        status: 'draft',
        pdf_url: pdfBase64,
      }