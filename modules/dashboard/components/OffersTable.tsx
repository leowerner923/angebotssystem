'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table } from '@/components/ui'
import type { OfferWithCustomer, OfferStatus } from '@/lib/types/offer'
import { COMPANY_CONFIG } from '@/lib/company-config'

const STATUS_LABELS: Record<OfferStatus, string> = {
  draft: 'Entwurf',
  review: 'In Prüfung',
  sent: 'Versendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
}

const STATUS_COLORS: Record<OfferStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  review: 'bg-yellow-100 text-yellow-700',
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
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/get-offers?company_id=${COMPANY_CONFIG.id}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error ?? 'Fehler beim Laden')
        return
      }
      setOffers(json.offers ?? [])
    } catch (e) {
      setError('Netzwerkfehler')
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
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      )
    } finally {
      setUpdating(null)
    }
  }

  async function handleSendOffer(id: string) {
    setUpdating(id)
    try {
      const res = await fetch('/api/send-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: id }),
      })
      if (res.ok) {
        setOffers((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: 'sent' } : o))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Angebot wirklich löschen?')) return
    setDeleting(id)
    try {
      await fetch('/api/delete-offer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setOffers((prev) => prev.filter((o) => o.id !== id))
    } finally {
      setDeleting(null)
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
          {o.customers?.email && (
            <a href={`mailto:${o.customers.email}`} className="text-xs text-blue-500 hover:underline">
              {o.customers.email}
            </a>
          )}
          {o.customers?.phone && (
            <p className="text-xs text-gray-400">{o.customers.phone}</p>
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
        <span className="font-semibold">{formatPrice(o.price)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o: OfferWithCustomer) => (
        <div className="flex items-center gap-2">
          <select
            value={o.status}
            disabled={updating === o.id}
            onChange={(e) => handleStatusChange(o.id, e.target.value as OfferStatus)}
            className={`rounded px-2 py-1 text-xs ${STATUS_COLORS[o.status]}`}
          >
            {(Object.keys(STATUS_LABELS) as OfferStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
          {updating === o.id && (
            <span className="text-xs text-gray-400">...</span>
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
        <div className="flex flex-col gap-1.5">
          {o.pdf_url && (
            <button
              onClick={() => handleView(o.id)}
              className="text-xs text-gray-600 hover:underline"
            >
              PDF
            </button>
          )}
          <button
            onClick={() => handleStatusChange(o.id, 'review')}
            className="text-xs text-blue-600 hover:underline"
          >
            Zur Prüfung
          </button>
          {o.status === 'review' && (
            <button
              onClick={() => handleSendOffer(o.id)}
              disabled={updating === o.id}
              className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
            >
              {updating === o.id ? '...' : 'Senden'}
            </button>
          )}
          <button
            onClick={() => handleDelete(o.id)}
            disabled={deleting === o.id}
            className="text-xs text-red-400 hover:text-red-600 hover:underline disabled:opacity-50"
          >
            {deleting === o.id ? '...' : 'Löschen'}
          </button>
        </div>
      ),
    },
  ]

  if (error) {
    return (
      <div className="rounded bg-red-50 p-3 text-sm text-red-700">
        {error}
      </div>
    )
  }

  return (
    <Table<OfferWithCustomer>
      columns={columns}
      data={offers}
      loading={loading}
      emptyMessage="Keine Angebote vorhanden"
    />
  )
}