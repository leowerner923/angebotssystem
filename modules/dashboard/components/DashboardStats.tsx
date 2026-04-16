'use client'

import { useEffect, useState } from 'react'
import { COMPANY_CONFIG } from '@/lib/company-config'
import type { RequestWithCustomer } from '@/lib/types/database'
import type { OfferWithCustomer } from '@/lib/types/offer'

function Badge({ color, label }: { color: 'amber' | 'green' | 'blue' | 'gray'; label: string }) {
  const styles = {
    amber: { background: '#FAEEDA', color: '#854F0B', dot: '#BA7517' },
    green: { background: '#EAF3DE', color: '#3B6D11', dot: '#639922' },
    blue: { background: '#E6F1FB', color: '#185FA5', dot: '#378ADD' },
    gray: { background: '#F1EFE8', color: '#5F5E5A', dot: '#888780' },
  }
  const s = styles[color]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 20, background: s.background, color: s.color, marginTop: 4 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
      {label}
    </span>
  )
}

function StatCard({ label, value, badge }: { label: string; value: string | number; badge: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 32, fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1 }}>{value}</span>
      {badge}
    </div>
  )
}

const STATUS_LABEL: Record<string, string> = {
  draft: 'Entwurf',
  review: 'In Prüfung',
  sent: 'Versendet',
  accepted: 'Angenommen',
  rejected: 'Abgelehnt',
}

const STATUS_COLOR: Record<string, 'amber' | 'green' | 'blue' | 'gray'> = {
  draft: 'gray',
  review: 'amber',
  sent: 'blue',
  accepted: 'green',
  rejected: 'gray',
}

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

  const offeneAnfragen = requests.filter((r) => r.status === 'new').length
  const angeboteSent = offers.filter((o) => o.status === 'sent').length
  const angeboteAccepted = offers.filter((o) => o.status === 'accepted').length
  const umsatz = offers.filter((o) => o.status === 'accepted').reduce((sum, o) => sum + (o.price ?? 0), 0)
  const potenzial = requests.reduce((sum, r) => sum + (r.price ?? 0), 0)
  const konversionsrate = offers.length > 0 ? Math.round((angeboteAccepted / offers.length) * 100) : 0

  function fmt(n: number) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
  }

  if (loading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginTop: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    )
  }

  const recentOffers = [...offers].slice(0, 5)

  return (
    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* KPI Karten */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
        <StatCard label="Offene Anfragen" value={offeneAnfragen} badge={<Badge color="amber" label="Warten auf Angebot" />} />
        <StatCard label="Angebote versendet" value={angeboteSent} badge={<Badge color="blue" label="Beim Kunden" />} />
        <StatCard label="Angenommen" value={angeboteAccepted} badge={<Badge color="green" label={`${konversionsrate}% Konversionsrate`} />} />
        <StatCard label="Umsatz" value={fmt(umsatz)} badge={<Badge color="green" label="Angenommene Angebote" />} />
      </div>

      {/* Potenzial */}
      <div style={{ background: 'var(--color-background-secondary)', border: '0.5px dashed var(--color-border-secondary)', borderRadius: 16, padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>Geschätztes Potenzial</p>
          <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '4px 0 0' }}>Summe offener Anfragen · unverbindlich</p>
        </div>
        <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--color-text-primary)' }}>{fmt(potenzial)}</span>
      </div>

      {/* Letzte Aktivität */}
      {recentOffers.length > 0 && (
        <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 16, padding: '20px 24px' }}>
          <p style={{ fontSize: 12, fontWeight: 500, color: 'var(--color-text-tertiary)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Letzte Aktivität</p>
          {recentOffers.map((offer, i) => (
            <div key={offer.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < recentOffers.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none' }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{offer.customers?.name ?? '—'}</p>
                <p style={{ fontSize: 12, color: 'var(--color-text-tertiary)', margin: '2px 0 0' }}>{offer.title} · {offer.description}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)', margin: 0 }}>{fmt(offer.price)}</p>
                <Badge color={STATUS_COLOR[offer.status] ?? 'gray'} label={STATUS_LABEL[offer.status] ?? offer.status} />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}