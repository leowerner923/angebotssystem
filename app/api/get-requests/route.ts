import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  const { data, error } = await supabaseServer
    .from('requests')
    .select(`
      id,
      company_id,
      customer_id,
      service_type,
      square_meters,
      price,
      status,
      notes,
      created_at,
      customers (
        id,
        name,
        email,
        phone,
        company
      )
    `)
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Anfragen:', error)
    return NextResponse.json({ error: 'Anfragen konnten nicht geladen werden.' }, { status: 500 })
  }

  return NextResponse.json({ requests: data ?? [] })
}
