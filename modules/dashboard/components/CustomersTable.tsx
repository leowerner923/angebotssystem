'use client'

import { useEffect, useState, useCallback } from 'react'
import { Table } from '@/components/ui'
import type { CustomerWithCount } from '@/lib/types/database'
import { COMPANY_CONFIG } from '@/lib/company-config'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function CustomersTable() {
  const [customers, setCustomers] = useState<CustomerWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/get-customers?company_id=${COMPANY_CONFIG.id}`)
      const json = await res.json()
      if (!res.ok) {
        console.error('[CustomersTable] API Fehler:', res.status, json)
        setError(`API-Fehler ${res.status}: ${json.error ?? 'Unbekannter Fehler'}`)
        return
      }
      console.log('[CustomersTable] Geladen:', (json.customers ?? []).length, 'Kunden')
      setCustomers(json.customers ?? [])
    } catch (e) {
      console.error('[CustomersTable] Netzwerkfehler:', e)
      setError('Netzwerkfehler beim Laden der Kunden.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (c: CustomerWithCount) => (
        <div>
          <p className="font-medium text-gray-900">{c.name}</p>
          {c.company && <p className="text-xs text-gray-400">{c.company}</p>}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'E-Mail',
      render: (c: CustomerWithCount) => (
        <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">
          {c.email}
        </a>
      ),
    },
    {
      key: 'phone',
      header: 'Telefon',
      render: (c: CustomerWithCount) => c.phone || '—',
    },
    {
      key: 'request_count',
      header: 'Anfragen',
      render: (c: CustomerWithCount) => (
        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">
          {c.request_count}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Seit',
      render: (c: CustomerWithCount) => formatDate(c.created_at),
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
    <Table<CustomerWithCount>
      columns={columns}
      data={customers}
      loading={loading}
      emptyMessage="Noch keine Kunden vorhanden."
    />
  )
}
