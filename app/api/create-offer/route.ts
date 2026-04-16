import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG, SERVICES } from '@/lib/company-config'

const resend = new Resend(process.env.RESEND_API_KEY)

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
      .select('*, customers(name, email, phone)')
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
      })
      .select()
      .single()

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Offer error' }, { status: 500 })
    }

    return NextResponse.json({ offer })

  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}