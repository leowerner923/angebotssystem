import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

const GUELTIGE_STATUS = ['entwurf', 'uebernommen', 'verworfen']

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    if (!id || !GUELTIGE_STATUS.includes(status)) {
      return NextResponse.json({ error: 'id oder gültiger status fehlt' }, { status: 400 })
    }

    const { error } = await supabaseServer.from('aufmasse').update({ status }).eq('id', id)

    if (error) {
      console.error('UPDATE-AUFMASS-STATUS ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('UPDATE-AUFMASS-STATUS ERROR:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
