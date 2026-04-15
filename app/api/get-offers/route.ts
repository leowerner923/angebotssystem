import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  // pdf_url absichtlich nicht laden – zu groß für Listen-Abfrage
  const { data, error } = await supabaseServer
    .from('offers')
    .select(
      'id, company_id, request_id, customer_id, title, description, price, status, created_at, customers(id, name, email, phone, company)',
    )
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Fehler beim Laden der Angebote:', error)
    return NextResponse.json({ error: 'Angebote konnten nicht geladen werden.' }, { status: 500 })
  }

  return NextResponse.json({ offers: data ?? [] })
}
