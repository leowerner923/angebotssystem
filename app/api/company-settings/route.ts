import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

export async function GET(req: NextRequest) {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  const { data, error } = await supabaseServer
    .from('company_settings')
    .select('follow_up_aktiv')
    .eq('company_id', company_id)
    .maybeSingle()

  if (error) {
    console.error('COMPANY-SETTINGS GET ERROR:', error)
    return NextResponse.json({ error: 'Einstellungen konnten nicht geladen werden.' }, { status: 500 })
  }

  // Kein Eintrag vorhanden = noch nie bewusst aktiviert -> sicherer Default: aus.
  // Lieber muss der Maler es einschalten, als dass unerwartet Mails in seinem Namen rausgehen.
  return NextResponse.json({ follow_up_aktiv: data?.follow_up_aktiv ?? false })
}

export async function PATCH(req: NextRequest) {
  try {
    const { company_id, follow_up_aktiv } = await req.json()

    if (!company_id || typeof follow_up_aktiv !== 'boolean') {
      return NextResponse.json({ error: 'company_id oder follow_up_aktiv fehlt' }, { status: 400 })
    }

    const { error } = await supabaseServer
      .from('company_settings')
      .upsert({ company_id, follow_up_aktiv }, { onConflict: 'company_id' })

    if (error) {
      console.error('COMPANY-SETTINGS PATCH ERROR:', error)
      return NextResponse.json({ error: 'Einstellung konnte nicht gespeichert werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, follow_up_aktiv })
  } catch (err) {
    console.error('COMPANY-SETTINGS ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
