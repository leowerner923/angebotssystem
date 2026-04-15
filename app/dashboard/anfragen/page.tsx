import type { Metadata } from 'next'
import { COMPANY_CONFIG } from '@/lib/company-config'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import RequestsTable from '@/modules/dashboard/components/RequestsTable'

export const metadata: Metadata = {
  title: `Anfragen – ${COMPANY_CONFIG.name}`,
}

export default function AnfragenPage() {
  return (
    <DashboardLayout>
      <h1 className="text-xl font-semibold text-gray-900">Anfragen</h1>
      <p className="mt-1 text-sm text-gray-500">Alle eingegangenen Anfragen, neueste zuerst.</p>
      <div className="mt-6">
        <RequestsTable />
      </div>
    </DashboardLayout>
  )
}
