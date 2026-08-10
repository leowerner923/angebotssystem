import type { Metadata } from 'next'
import { COMPANY_CONFIG } from '@/lib/company-config'
import OffersTable from '@/modules/dashboard/components/OffersTable'
import FollowUpToggle from '@/modules/dashboard/components/FollowUpToggle'

export const metadata: Metadata = {
  title: `Angebote – ${COMPANY_CONFIG.name}`,
}

export default function AngebotePage() {
  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900">Angebote</h1>
      <p className="mt-1 text-sm text-gray-500">Alle erstellten Angebote. PDF-Download direkt in der Tabelle.</p>
      <div className="mt-4">
        <FollowUpToggle />
      </div>
      <OffersTable />
    </>
  )
}