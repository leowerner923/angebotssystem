import type { Metadata } from 'next'
import { COMPANY_CONFIG } from '@/lib/company-config'
import CustomersTable from '@/modules/dashboard/components/CustomersTable'

export const metadata: Metadata = {
  title: `Kunden – ${COMPANY_CONFIG.name}`,
}

export default function KundenPage() {
  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900">Kunden</h1>
      <p className="mt-1 text-sm text-gray-500">Alle Kunden im Überblick.</p>
      <CustomersTable />
    </>
  )
}