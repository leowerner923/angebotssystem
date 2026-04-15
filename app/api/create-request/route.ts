import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("CREATE REQUEST BODY:", body)

    const { name, email, service_type, square_meters } = body

    if (!name || !email) {
      return NextResponse.json(
        { error: "Name oder Email fehlt" },
        { status: 400 }
      )
    }

    // 1. Customer erstellen
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .insert({
        name,
        email,
      })
      .select()
      .single()

    if (customerError) {
      console.error("CUSTOMER ERROR:", customerError)
      return NextResponse.json(
        { error: "Customer konnte nicht erstellt werden" },
        { status: 500 }
      )
    }

    // 2. Request erstellen
    const { data: request, error: requestError } = await supabaseServer
      .from('requests')
      .insert({
        customer_id: customer.id,
        service_type,
        square_meters,
        status: 'new',
      })
      .select()
      .single()

    if (requestError) {
      console.error("REQUEST ERROR:", requestError)
      return NextResponse.json(
        { error: "Request konnte nicht erstellt werden" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      request_id: request.id,
    })
  } catch (err) {
    console.error("CREATE REQUEST CRASH:", err)

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    )
  }
}