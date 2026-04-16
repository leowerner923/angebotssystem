import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing id or status' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('offers')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('UPDATE ERROR:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, offer: data })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}