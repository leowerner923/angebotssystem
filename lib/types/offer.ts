import type { Customer, RequestDetails } from './database'

export type OfferStatus = 'draft' | 'review' | 'sent' | 'accepted' | 'rejected'

export interface Offer {
  id: string
  company_id: string
  request_id: string
  customer_id: string
  title: string
  description: string
  price: number
  status: OfferStatus
  pdf_url: string | null
  created_at: string
  annahme_token: string
  entschieden_am: string | null
  gueltig_bis: string | null
  versendet_am: string | null
  follow_up_anzahl: number
  follow_up_zuletzt_am: string | null
}

/** API response type for /api/get-offers (includes joined customer) */
export interface OfferWithCustomer extends Offer {
  customers: Pick<Customer, 'id' | 'name' | 'email' | 'phone' | 'company'> | null
}

/** Data needed to generate the PDF */
export interface OfferPdfData {
  offerNumber: string
  companyName: string
  companyLocation: string
  customer: {
    name: string
    email: string
    phone?: string
    company?: string
  }
  serviceTitle: string
  details: RequestDetails
  price: number
  createdAt: Date
}