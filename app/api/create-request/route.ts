import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("CREATE REQUEST BODY:", body)

    const wizard = body.wizardState

    if (!wizard) {
      return NextResponse.json({ error: "wizardState fehlt" }, { status: 400 })
    }

    const {
      contactName,
      contactEmail,
      contactPhone,
      contactCompany,
      selectedServiceId,
      areaM2,
      city
    } = wizard

    if (!contactName || !contactEmail) {
      return NextResponse.json({ error: "Kontakt fehlt" }, { status: 400 })
    }

    // 1. Customer erstellen
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .insert({
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        company: contactCompany || null,
        city: city || null
      })
      .select()
      .single()

    if (customerError) {
      console.error("CUSTOMER ERROR:", customerError)
      return NextResponse.json({ error: "Customer insert failed" }, { status: 500 })
    }

    // 2. Request erstellen
    const { data: request, error: requestError } = await supabaseServer
      .from('requests')
      .insert({
        customer_id: customer.id,
        service_type: selectedServiceId,
        square_meters: areaM2,
        status: 'new'
      })
      .select()
      .single()

    if (requestError) {
      console.error("REQUEST ERROR:", requestError)
      return NextResponse.json({ error: "Request insert failed" }, { status: 500 })
    }

    return NextResponse.json({
      request_id: request.id
    })

  } catch (err) {
    console.error("CREATE REQUEST CRASH:", err)

    return NextResponse.json(
      { error: "Serverfehler" },
      { status: 500 }
    )
  }
}