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
      companyName: COMPAN