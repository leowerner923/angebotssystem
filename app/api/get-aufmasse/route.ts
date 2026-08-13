import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  const { data, error } = await supabaseServer
    .from('aufmasse')
    .select('id, company_id, transkript, strukturiert, audio_pfad, status, erstellt_am')
    .eq('company_id', company_id)
    .order('erstellt_am', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Fehler beim Laden der Aufmaße:', error)
    return NextResponse.json({ error: 'Aufmaße konnten nicht geladen werden.' }, { status: 500 })
  }

  return NextResponse.json({ aufmasse: data ?? [] })
}
