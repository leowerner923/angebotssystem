'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table } from '@/components/ui'
import type { OfferWithCustomer, OfferStatus } from '@/lib/types/offer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Entwurf',
  sent: 'Versendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
}

const STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  sent: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
}

function formatPrice(n: number) {
  return `${n.toFixed(2).replace('.', ',')} €`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function OffersTable() {
  const [offers, setOffers] = useState<OfferWithCustomer[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/get-offers?company_id=${COMPANY_CONFIG.id}`)
      const json = await res.json()
      if (!res.ok) {
        console.error('[OffersTable] API Fehler:', res.status, json)
        setError(`API-Fehler ${res.status}: ${json.error ?? 'Unbekannter Fehler'}`)
        return
      }
      console.log('[OffersTable] Geladen:', (json.offers ?? []).length, 'Angebote')
      setOffers(json.offers ?? [])
    } catch (e) {
      console.error('[OffersTable] Netzwerkfehler:', e)
      setError('Netzwerkfehler beim Laden der Angebote.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleStatusChange(id: string, status: OfferStatus) {
    setUpdating(id)
    try {
      await fetch('/api/update-offer-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))
    } finally {
      setUpdating(null)
    }
  }

  function handleView(id: string) {
    window.open(`/api/get-offer-pdf?id=${id}`, '_blank')
  }

  const columns = [
    {
      key: 'customer',
      header: 'Kunde',
      render: (o: OfferWithCustomer) => (
        <div className="min-w-[140px]">
          <p className="font-medium text-gray-900">{o.customers?.name ?? '—'}</p>
          {o.customers?.company && (
            <p className="text-xs text-gray-400">{o.customers.company}</p>
          )}
          {o.customers?.email && (
            <a
              href={`mailto:${o.customers.email}`}
              className="text-xs text-blue-600 hover:underline"
            >
              {o.customers.email}
            </a>
          )}
          {o.customers?.phone && (
            <a
              href={`tel:${o.customers.phone}`}
              className="block text-xs text-gray-400 hover:text-gray-700"
            >
              {o.customers.phone}
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Leistung',
      render: (o: OfferWithCustomer) => (
        <span className="font-medium text-gray-800">{o.title}</span>
      ),
    },
    {
      key: 'price',
      header: 'Preis',
      render: (o: OfferWithCustomer) => (
        <span className="font-semibold text-gray-900">{formatPrice(o.price)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: OfferWithCustomer) => (
        <div className="relative">
          <select
            value={o.status}
            disabled={updating === o.id}
            onChange={(e) => handleStatusChange(o.id, e.target.value as OfferStatus)}
            className={`cursor-pointer rounded-full border-0 py-0.5 pl-2.5 pr-6 text-xs font-medium outline-none ring-1 ring-transparent transition-all focus:ring-2 focus:ring-blue-300 disabled:opacity-50 ${STATUS_COLORS[o.status]}`}
          >
            {(Object.keys(STATUS_LABELS) as OfferStatus[]).map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          {updating === o.id && (
            <span className="ml-2 text-xs text-gray-400">…</span>
          )}
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Datum',
      render: (o: OfferWithCustomer) => formatDate(o.created_at),
    },
    {
      key: 'actions',
      header: '',
      render: (o: OfferWithCustomer) => (
        <button
          onClick={() => handleView(o.id)}
          className="cursor-pointer whitespace-nowrap rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          PDF ansehen
        </button>
      ),
    },
  ]

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
        <strong>Fehler beim Laden:</strong> {error}
      </div>
    )
  }

  return (
    <Table<OfferWithCustomer>
      columns={columns}
      data={offers}
      loading={loading}
      emptyMessage="Noch keine Angebote vorhanden."
    />
  )
}
