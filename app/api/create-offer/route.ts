import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const { request_id } = await req.json()

    if (!request_id) {
      return NextResponse.json({ error: 'request_id fehlt' }, { status: 400 })
    }

    const { data: request } = await supabaseServer
      .from('requests')
      .select('*')
      .eq('id', request_id)
      .single()

    if (!request) {
      return NextResponse.json({ error: 'Request nicht gefunden' }, { status: 404 })
    }

    const { data: offer, error } = await supabaseServer
      .from('offers')
      .insert({
        request_id,
        customer_id: request.customer_id,
        title: request.service_type,
        description: `Service: ${request.service_type}`,
        price: request.price,
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}