'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { COMPANY_CONFIG } from '@/lib/company-config'
import { supabase } from '@/lib/supabaseClient'

const NAV_LINKS = [
  {
    href: '/dashboard',
    label: 'Übersicht',
    icon: (
      <svg className="h-4