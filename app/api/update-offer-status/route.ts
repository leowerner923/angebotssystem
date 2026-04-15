import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'
import type { OfferStatus } from '@/lib/types/offer'

const VALID_STATUSES: OfferStatus[] = ['draft', 'sent', 'accepted', 'rejected']

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { id, status } = body as { id?: string; status?: string }

  if (!id || !status || !VALID_STATUSES.includes(status as OfferStatus)) {
    return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 })
  }

  const { error } = await supabaseServer
    .from('offers')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Fehler beim Aktualisieren des Angebotsstatus:', error)
    return NextResponse.json({ error: 'Status konnte nicht aktualisiert werden.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
