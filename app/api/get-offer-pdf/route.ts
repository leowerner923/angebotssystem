import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabaseServer'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const id = req.nextUrl.searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id fehlt.' }, { status: 400 })
  }

  const { data, error } = await supabaseServer
    .from('offers')
    .select('id, pdf_url, title')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Angebot nicht gefunden.' }, { status: 404 })
  }

  if (!data.pdf_url) {
    return NextResponse.json({ error: 'Kein PDF für dieses Angebot vorhanden.' }, { status: 404 })
  }

  const pdfBytes = Buffer.from(data.pdf_url as string, 'base64')
  const safeTitle = (data.title as string).replace(/[^a-z0-9]/gi, '-').toLowerCase()

  return new NextResponse(pdfBytes, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="angebot-${safeTitle}-${id.slice(-6)}.pdf"`,
      'Content-Length': String(pdfBytes.length),
    },
  })
}
