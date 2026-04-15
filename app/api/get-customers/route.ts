import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  const { data, error } = await supabaseServer
    .from('customers')
    .select('id, company_id, name, email, phone, company, created_at')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Kunden:', error)
    return NextResponse.json({ error: 'Kunden konnten nicht geladen werden.' }, { status: 500 })
  }

  const customers = data ?? []

  // Anzahl Anfragen pro Kunde ermitteln
  const { data: requestRows } = await supabaseServer
    .from('requests')
    .select('customer_id')
    .eq('company_id', company_id)

  const countMap: Record<string, number> = {}
  for (const row of requestRows ?? []) {
    countMap[row.customer_id] = (countMap[row.customer_id] ?? 0) + 1
  }

  return NextResponse.json({
    customers: customers.map((c) => ({ ...c, request_count: countMap[c.id] ?? 0 })),
  })
}
