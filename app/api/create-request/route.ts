import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json()
    const { company_id, wizardState } = body

    console.log("CREATE REQUEST BODY:", body)

    if (!wizardState || !company_id) {
      return NextResponse.json(
        { error: 'wizardState oder company_id fehlt' },
        { status: 400 }
      )
    }

    // 👉 1. CUSTOMER erstellen
    const { data: customer, error: customerError } = await supabaseServer
      .from('customers')
      .insert({
        name: wizardState.contactName,
        email: wizardState.contactEmail,
        phone: wizardState.contactPhone,
        company: wizardState.contactCompany || null,
        city: wizardState.city,
        radius_km: wizardState.radius_km,
        company_id: company_id, // 🔥 FIX
      })
      .select()
      .single()

    if (customerError || !customer) {
      console.error("CUSTOMER ERROR:", customerError)
      return NextResponse.json(
        { error: customerError?.message || "Customer insert failed" },
        { status: 500 }
      )
    }

    // 👉 2. REQUEST erstellen
    const { data: requestData, error: requestError } = await supabaseServer
      .from('requests')
      .insert({
        company_id: company_id,
        customer_id: customer.id,
        service_type: wizardState.selectedServiceId,
        square_meters: wizardState.areaM2,
        window_count: wizardState.windowCount,
        floor_count: wizardState.floorCount,
        cleaning_interval: wizardState.cleaningInterval,
        dirt_level: wizardState.dirtLevel,
        price: 0,
        status: 'new',
      })
      .select()
      .single()

    if (requestError || !requestData) {
      console.error("REQUEST ERROR:", requestError)
      return NextResponse.json(
        { error: requestError?.message || "Request insert failed" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      customer_id: customer.id,
      request_id: requestData.id,
    })

  } catch (err) {
    console.error("UNEXPECTED ERROR:", err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}