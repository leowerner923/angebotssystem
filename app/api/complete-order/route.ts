import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PATCH(req: NextRequest) {
  try {
    const { id, abgeschlossen } = await req.json()

    if (!id || typeof abgeschlossen !== 'boolean') {
      return NextResponse.json({ error: 'id oder abgeschlossen fehlt' }, { status: 400 })
    }

    const { data: offer, error: offerError } = await supabaseServer
      .from('offers')
      .select('status')
      .eq('id', id)
      .single()

    if (offerError || !offer) {
      return NextResponse.json({ error: 'Angebot nicht gefunden.' }, { status: 404 })
    }

    if (offer.status !== 'accepted') {
      return NextResponse.json(
        { error: 'Nur angenommene Angebote können als abgeschlossen markiert werden.' },
        { status: 409 }
      )
    }

    const { data, error } = await supabaseServer
      .from('offers')
      .update({ auftrag_abgeschlossen_am: abgeschlossen ? new Date().toISOString() : null })
      .eq('id', id)
      .select('auftrag_abgeschlossen_am')
      .single()

    if (error) {
      console.error('COMPLETE-ORDER ERROR:', error)
      return NextResponse.json({ error: 'Konnte nicht gespeichert werden.' }, { status: 500 })
    }

    return NextResponse.json({ success: true, auftrag_abgeschlossen_am: data.auftrag_abgeschlossen_am })
  } catch (err) {
    console.error('COMPLETE-ORDER ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
