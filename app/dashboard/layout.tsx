'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Übersicht' },
  { href: '/dashboard/anfragen', label: 'Anfragen' },
  { href: '/dashboard/kunden', label: 'Kunden' },
  { href: '/dashboard/angebote', label: 'Angebote' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.push('/login')
      } else {
        setAuthChecked(true)
      }
    })
  }, [router])

  if (!authChecked) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      
      {/* Sidebar */}
      <aside className="w-60 bg-black text-white flex flex-col">

        {/* LOGO ONLY (kein Text mehr!) */}
        <div className="flex h-16 items-center border-b border-white/10 px-5">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        </div>

        {/* NAV */}
        <nav className="p-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2 text-sm rounded hover:bg-white/10"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}