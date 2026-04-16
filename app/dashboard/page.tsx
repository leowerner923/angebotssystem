import type { Metadata } from 'next'
import { COMPANY_CONFIG } from '@/lib/company-config'
import DashboardStats from '@/modules/dashboard/components/DashboardStats'

export const metadata: Metadata = {
  title: `Dashboard – ${COMPANY_CONFIG.name}`,
}

export default function DashboardPage() {
  return (
    <>
      <h1 className="text-xl font-semibold text-gray-900">Übersicht</h1>
      <p className="mt-1 text-sm text-gray-500">Willkommen zurück, {COMPANY_CONFIG.name}.</p>
      <DashboardStats />
    </>
  )
}