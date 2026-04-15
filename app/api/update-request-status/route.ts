import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import type { RequestStatus } from '@/lib/types/database'

const VALID_STATUSES: RequestStatus[] = ['new', 'contacted', 'closed']

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { id, status } = body as { id: string; status: RequestStatus }

  if (!id || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('requests')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Fehler beim Aktualisieren des Status:', error)
    return NextResponse.json({ error: 'Status konnte nicht gespeichert werden.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
