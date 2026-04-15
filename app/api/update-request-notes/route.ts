import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { id, notes } = body as { id?: string; notes?: string }

  if (!id) {
    return NextResponse.json({ error: 'id fehlt.' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('requests')
    .update({ notes: notes ?? null })
    .eq('id', id)

  if (error) {
    console.error('Fehler beim Speichern der Notiz:', error)
    return NextResponse.json({ error: 'Notiz konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
