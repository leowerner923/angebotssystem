import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import { COMPANY_CONFIG } from '@/lib/company-config'

function istGueltigeHttpsUrl(value: unknown): value is string {
  if (typeof value !== 'string' || !value) return false
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export async function GET(req: NextRequest) {
  const company_id = req.nextUrl.searchParams.get('company_id') ?? COMPANY_CONFIG.id

  const { data, error } = await supabaseServer
    .from('company_settings')
    .select('follow_up_aktiv, google_bewertung_url, bewertung_aktiv')
    .eq('company_id', company_id)
    .maybeSingle()

  if (error) {
    console.error('COMPANY-SETTINGS GET ERROR:', error)
    return NextResponse.json({ error: 'Einstellungen konnten nicht geladen werden.' }, { status: 500 })
  }

  // Kein Eintrag vorhanden = noch nie bewusst aktiviert -> sicherer Default: aus.
  // Lieber muss der Maler es einschalten, als dass unerwartet Mails in seinem Namen rausgehen.
  return NextResponse.json({
    follow_up_aktiv: data?.follow_up_aktiv ?? false,
    google_bewertung_url: data?.google_bewertung_url ?? null,
    bewertung_aktiv: data?.bewertung_aktiv ?? false,
  })
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const company_id: unknown = body.company_id

    if (!company_id || typeof company_id !== 'string') {
      return NextResponse.json({ error: 'company_id fehlt' }, { status: 400 })
    }

    const { data: bestehend } = await supabaseServer
      .from('company_settings')
      .select('follow_up_aktiv, google_bewertung_url, bewertung_aktiv')
      .eq('company_id', company_id)
      .maybeSingle()

    const naechster = {
      follow_up_aktiv: bestehend?.follow_up_aktiv ?? false,
      google_bewertung_url: bestehend?.google_bewertung_url ?? null,
      bewertung_aktiv: bestehend?.bewertung_aktiv ?? false,
    }

    if (typeof body.follow_up_aktiv === 'boolean') {
      naechster.follow_up_aktiv = body.follow_up_aktiv
    }

    if ('google_bewertung_url' in body) {
      const url = body.google_bewertung_url
      if (url === null || url === '') {
        naechster.google_bewertung_url = null
        naechster.bewertung_aktiv = false // ohne Link kein aktiver Schalter, sonst inkonsistenter Zustand
      } else if (istGueltigeHttpsUrl(url)) {
        naechster.google_bewertung_url = url
      } else {
        return NextResponse.json({ error: 'Bitte eine gültige https://-URL angeben.' }, { status: 400 })
      }
    }

    if (typeof body.bewertung_aktiv === 'boolean') {
      if (body.bewertung_aktiv && !istGueltigeHttpsUrl(naechster.google_bewertung_url)) {
        return NextResponse.json(
          { error: 'Ohne gültigen Google-Bewertungslink kann die automatische Bewertungsbitte nicht aktiviert werden.' },
          { status: 400 }
        )
      }
      naechster.bewertung_aktiv = body.bewertung_aktiv
    }

    const { error } = await supabaseServer
      .from('company_settings')
      .upsert({ company_id, ...naechster }, { onConflict: 'company_id' })

    if (error) {
      console.error('COMPANY-SETTINGS PATCH ERROR:', error)
      return NextResponse.json({ error: 'Einstellung konnte nicht gespeichert werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, ...naechster })
  } catch (err) {
    console.error('COMPANY-SETTINGS ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
