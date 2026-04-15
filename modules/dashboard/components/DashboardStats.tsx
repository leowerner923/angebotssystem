'use client'

import { useEffect, useState } from 'react'
import StatsCard from './StatsCard'
import { COMPANY_CONFIG } from '@/lib/company-config'
import type { RequestWithCustomer } from '@/lib/types/database'
import type { OfferWithCustomer } from '@/lib/types/offer'

export default function DashboardStats() {
  const [requests, setRequests] = useState<RequestWithCustomer[]>([])
  const [offers, setOffers] = useState<OfferWithCustomer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch(`/api/get-requests?company_id=${COMPANY_CONFIG.id}`).then((r) => r.json()),
      fetch(`/api/get-offers?company_id=${COMPANY_CONFIG.id}`).then((r) => r.json()),
    ])
      .then(([reqJson, offJson]) => {
        setRequests(reqJson.requests ?? [])
        setOffers(offJson.offers ?? [])
      })
      .catch((e) => console.error('Stats laden fehlgeschlagen:', e))
      .finally(() => setLoading(false))
  }, [])

  const open = requests.filter((r) => r.status === 'new').length
  const createdOffers = offers.length
  const acceptedOffers = offers.filter((o) => o.status === 'accepted').length
  const revenue = offers
    .filter((o) => o.status === 'accepted')
    .reduce((sum, o) => sum + (o.price ?? 0), 0)
  const potenzial = requests.reduce((sum, r) => sum + (r.price ?? 0), 0)

  function fmt(n: number) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  }

  if (loading) {
    return (
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatsCard title="Offene Anfragen" value={open} subtitle="Status: Neu" />
        <StatsCard title="Erstellte Angebote" value={createdOffers} />
        <StatsCard title="Angenommen" value={acceptedOffers} subtitle="Angebote" />
        <StatsCard title="Umsatz" value={fmt(revenue)} subtitle="Angenommene Angebote" />
      </div>
      <p className="mt-3 text-xs text-gray-400">
        Geschätztes Anfragen-Potenzial:{' '}
        <span className="font-medium text-gray-500">{fmt(potenzial)}</span>
        <span className="ml-1">(unverbindliche Schätzwerte aus Anfragen)</span>
      </p>
    </div>
  )
}
