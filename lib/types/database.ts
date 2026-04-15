export interface Company {
  id: string
  name: string
  slug: string
  primary_color: string
  created_at: string
}

export interface Customer {
  id: string
  company_id: string
  name: string
  email: string
  phone: string
  company?: string
  created_at: string
}

export interface ServiceType {
  id: string
  company_id: string
  name: string
  pricing_type: 'fixed' | 'per_m2' | 'per_unit'
  price_per_unit: number
  unit: string
  description?: string
}

export interface RequestDetails {
  area_m2?: number
  window_count?: number
  floor_count?: number
  cleaning_interval?: 'weekly' | 'biweekly' | 'monthly' | 'once'
  dirt_level?: 'normal' | 'heavy'
  extras?: string[]
  city?: string
  radius_km?: number
}

export type RequestStatus = 'new' | 'contacted' | 'closed'

export interface ServiceRequest {
  id: string
  company_id: string
  customer_id: string
  service_type: string
  square_meters: number | null
  price: number
  status: RequestStatus
  notes: string | null
  created_at: string
}

/** API response type for /api/get-requests (includes joined customer) */
export interface RequestWithCustomer extends ServiceRequest {
  customers: Pick<Customer, 'id' | 'name' | 'email' | 'phone' | 'company'> | null
}

/** API response type for /api/get-customers (includes request count) */
export interface CustomerWithCount extends Customer {
  request_count: number
}

// Offer types live in lib/types/offer.ts
export type { Offer, OfferStatus, OfferWithCustomer, OfferPdfData } from './offer'
