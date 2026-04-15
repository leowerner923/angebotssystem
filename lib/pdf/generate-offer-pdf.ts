import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { OfferPdfData } from '@/lib/types/offer'

const BRAND_BLUE = rgb(0.114, 0.306, 0.847) // #1d4ed8
const GRAY_DARK = rgb(0.11, 0.11, 0.11)
const GRAY_MID = rgb(0.45, 0.45, 0.45)
const GRAY_LIGHT = rgb(0.88, 0.88, 0.88)
const WHITE = rgb(1, 1, 1)

const INTERVAL_LABELS: Record<string, string> = {
  weekly: 'Wöchentlich',
  biweekly: 'Alle 2 Wochen',
  monthly: 'Monatlich',
  once: 'Einmalig',
}

function formatPrice(n: number) {
  return n.toFixed(2).replace('.', ',') + ' €'
}

function formatDate(d: Date) {
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export async function generateOfferPdf(data: OfferPdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const page = doc.addPage([595, 842]) // A4
  const { width, height } = page.getSize()

  const regular = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)

  function hLine(topY: number, color = GRAY_LIGHT) {
    page.drawLine({
      start: { x: 60, y: height - topY },
      end: { x: width - 60, y: height - topY },
      thickness: 0.75,
      color,
    })
  }

  // ── HEADER ─────────────────────────────────────────────────────────────
  // Blue accent bar at top
  page.drawRectangle({ x: 0, y: height - 10, width, height: 10, color: BRAND_BLUE })

  // Company name
  page.drawText(data.companyName, {
    x: 60,
    y: height - 55,
    size: 20,
    font: bold,
    color: BRAND_BLUE,
  })
  page.drawText(data.companyLocation, {
    x: 60,
    y: height - 72,
    size: 9,
    font: regular,
    color: GRAY_MID,
  })

  // Date – right aligned
  const dateStr = `Datum: ${formatDate(data.createdAt)}`
  const dateWidth = regular.widthOfTextAtSize(dateStr, 9)
  page.drawText(dateStr, {
    x: width - 60 - dateWidth,
    y: height - 55,
    size: 9,
    font: regular,
    color: GRAY_MID,
  })

  // Offer number
  const numStr = `Angebots-Nr.: ${data.offerNumber}`
  const numWidth = regular.widthOfTextAtSize(numStr, 9)
  page.drawText(numStr, {
    x: width - 60 - numWidth,
    y: height - 67,
    size: 9,
    font: regular,
    color: GRAY_MID,
  })

  // ── DIVIDER ─────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 60, y: height - 85, width: width - 120, height: 1.5, color: BRAND_BLUE })

  // ── ANGEBOT HEADING ──────────────────────────────────────────────────────
  page.drawText('Angebot', {
    x: 60,
    y: height - 115,
    size: 18,
    font: bold,
    color: GRAY_DARK,
  })
  page.drawText(data.serviceTitle, {
    x: 60,
    y: height - 134,
    size: 11,
    font: regular,
    color: GRAY_MID,
  })

  // ── CUSTOMER BLOCK ────────────────────────────────────────────────────────
  page.drawText('Kunde', {
    x: 60,
    y: height - 170,
    size: 8,
    font: bold,
    color: GRAY_MID,
  })

  let customerY = 185
  page.drawText(data.customer.name, {
    x: 60,
    y: height - customerY,
    size: 11,
    font: bold,
    color: GRAY_DARK,
  })
  customerY += 16
  if (data.customer.company) {
    page.drawText(data.customer.company, {
      x: 60,
      y: height - customerY,
      size: 10,
      font: regular,
      color: GRAY_DARK,
    })
    customerY += 14
  }
  page.drawText(data.customer.email, {
    x: 60,
    y: height - customerY,
    size: 10,
    font: regular,
    color: GRAY_MID,
  })
  customerY += 14
  if (data.customer.phone) {
    page.drawText(data.customer.phone, {
      x: 60,
      y: height - customerY,
      size: 10,
      font: regular,
      color: GRAY_MID,
    })
  }

  // ── DIVIDER ──────────────────────────────────────────────────────────────
  hLine(240)

  // ── SERVICE DETAILS ───────────────────────────────────────────────────────
  page.drawText('Leistungsübersicht', {
    x: 60,
    y: height - 258,
    size: 8,
    font: bold,
    color: GRAY_MID,
  })

  const detailRows: Array<[string, string]> = [['Leistung', data.serviceTitle]]

  if (data.details.area_m2) {
    detailRows.push(['Fläche', `${data.details.area_m2} m²`])
  }
  if (data.details.window_count) {
    detailRows.push(['Anzahl Fenster', `${data.details.window_count} Stück`])
  }
  if (data.details.floor_count) {
    detailRows.push(['Etagen', `${data.details.floor_count}`])
  }
  if (data.details.cleaning_interval) {
    detailRows.push(['Intervall', INTERVAL_LABELS[data.details.cleaning_interval] ?? data.details.cleaning_interval])
  }
  if (data.details.city) {
    detailRows.push(['Standort', `${data.details.city}${data.details.radius_km ? ` (${data.details.radius_km} km)` : ''}`])
  }
  if (data.details.extras && data.details.extras.length > 0) {
    detailRows.push(['Extras', data.details.extras.join(', ')])
  }

  let detailY = 275
  for (const [label, value] of detailRows) {
    page.drawText(label, { x: 60, y: height - detailY, size: 10, font: regular, color: GRAY_MID })
    page.drawText(value, { x: 220, y: height - detailY, size: 10, font: regular, color: GRAY_DARK })
    detailY += 18
  }

  // ── DIVIDER ──────────────────────────────────────────────────────────────
  hLine(detailY + 10)

  // ── PRICE BLOCK ───────────────────────────────────────────────────────────
  const priceTop = detailY + 30

  // Price box background
  page.drawRectangle({
    x: 60,
    y: height - (priceTop + 60),
    width: width - 120,
    height: 60,
    color: rgb(0.96, 0.97, 1.0),
    borderColor: BRAND_BLUE,
    borderWidth: 1,
  })

  page.drawText('Gesamtbetrag (netto)', {
    x: 80,
    y: height - (priceTop + 22),
    size: 10,
    font: regular,
    color: GRAY_MID,
  })

  const priceStr = formatPrice(data.price)
  const priceW = bold.widthOfTextAtSize(priceStr, 26)
  page.drawText(priceStr, {
    x: width - 60 - priceW - 20,
    y: height - (priceTop + 42),
    size: 26,
    font: bold,
    color: BRAND_BLUE,
  })

  page.drawText('Unverbindliches Angebot. Finale Preise nach Vor-Ort-Besichtigung.', {
    x: 60,
    y: height - (priceTop + 80),
    size: 8,
    font: regular,
    color: GRAY_MID,
  })

  // ── FOOTER ────────────────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 48, color: BRAND_BLUE })
  page.drawText('Vielen Dank für Ihr Vertrauen.', {
    x: 60,
    y: 30,
    size: 11,
    font: bold,
    color: WHITE,
  })
  page.drawText(data.companyName, {
    x: 60,
    y: 14,
    size: 9,
    font: regular,
    color: rgb(0.7, 0.8, 1.0),
  })

  return doc.save()
}
