import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { COMPANY_CONFIG } from '@/lib/company-config'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${COMPANY_CONFIG.name} – Angebotssystem`,
  description: `Kostenlose Anfrage bei ${COMPANY_CONFIG.name} in ${COMPANY_CONFIG.location}`,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ '--brand-primary': COMPANY_CONFIG.primaryColor } as React.CSSProperties}
    >
      <body className="min-h-full">{children}</body>
    </html>
  )
}
