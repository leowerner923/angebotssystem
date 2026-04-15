import { NextRequest, NextResponse } from 'next/server'
import type { WizardState } from '@/lib/types/wizard'
import { calculateEstimate } from '@/lib/pricing'
import { calculateLeadScore } from '@/lib/lead-scoring'
import { SERVICES } from '@/lib/company-config'
import { supabaseServer } from '@/lib/supabaseServer'
import { validateCity } from '@/lib/geo'

interface CreateRequestBody {
  company_id: string
  wizardState: WizardState
}

/**
 * TEST ROUTE (wichtig zum Debuggen)
 * Öffne im Browser:
 * http://localhost:3000/api/create-request
 */
export async function GET() {
  return Response.json({ ok: true })
}

/**
 * MAIN POST ROUTE (Wizard sendet hierhin)
 */
export async function POST(req: NextRequest) {
  const body: CreateRequestBody = await req.json()

  if (!body.wizardState || !body.company_id) {
    return NextResponse.json(
      { error: 'Ungültige Anfrage.' },
      { status: 400 }
    )
  }

  const { wizardState, company_id } = body

  // Standort-Check
  const cityCheck = validateCity(wizardState.city ?? '')
  if (!cityCheck.valid) {
    return NextResponse.json(
      {
        error:
          cityCheck.reason === 'not_found'
            ? 'Ort nicht gefunden.'
            : `Ort außerhalb des Einzugsgebiets (${cityCheck.distanceKm} km, max. 50 km).`,
      },
      { status: 422 }
    )
  }

  // Preis + Score
  const estimate = calculateEstimate(wizardState)
  const score = calculateLeadScore(wizardState, estimate.total)

  // Kunde suchen
  const { data: existingCustomer } = await supabaseServer
    .from('customers')
    .select('id')
    .eq('email', wizardState.contactEmail.toLowerCase().trim())
    .eq('company_id', company_id)
    .maybeSingle()

  let customerId: string

  if (existingCustomer) {
    customerId = existingCustomer.id

    await supabaseServer
      .from('customers')
      .update({
        name: wizardState.contactName.trim(),
        phone: wizardState.contactPhone.trim(),
        company: wizardState.contactCompany?.trim() || null,
      })
      .eq('id', customerId)
  } else {
    const { data: newCustomer, error: customerError } = await supabaseServer
      .from('customers')
      .insert({
        company_id,
        name: wizardState.contactName.trim(),
        email: wizardState.contactEmail.toLowerCase().trim(),
        phone: wizardState.contactPhone.trim(),
        company: wizardState.contactCompany?.trim() || null,
      })
      .select('id')
      .single()

    if (customerError || !newCustomer) {
      console.error('CUSTOMER ERROR:', customerError)
      return NextResponse.json(
        { error: 'Kunde konnte nicht gespeichert werden.' },
        { status: 500 }
      )
    }

    customerId = newCustomer.id
  }

  // Service
  const service = SERVICES.find(
    (s) => s.id === wizardState.selectedServiceId
  )

  // Request speichern
  const { data: newRequest, error: requestError } = await supabaseServer
    .from('requests')
    .insert({
      company_id,
      customer_id: customerId,
      service_type: service?.name ?? wizardState.selectedServiceId,
      square_meters: wizardState.areaM2,
      price: estimate.total,
      status: 'new',
    })
    .select('id')
    .single()

  console.log('INSERT ERROR:', requestError)
  console.log('INSERT DATA:', newRequest)

  if (requestError || !newRequest) {
    return NextResponse.json(
      { error: 'Anfrage konnte nicht gespeichert werden.' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    request_id: newRequest.id,
    estimated_price: estimate.total,
    lead_score: score,
  })
}