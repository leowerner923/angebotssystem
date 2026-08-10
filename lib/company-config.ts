import type { ServiceType } from '@/lib/types/database'

// Maler-Demo – fiktiver Betrieb. Name & Preise frei anpassbar.
export const COMPANY_CONFIG = {
  id: 'farbwerk-maler',
  name: 'Farbwerk Malermeister',
  location: 'Mosbach & Umgebung',
  email: 'leowerner923@gmail.com',
  primaryColor: '#1d4ed8',
  targetGroups: ['Privatkunden', 'Hausverwaltungen', 'Gewerbe', 'Neubau'],
} as const

// Demo-Preise – Richtwerte, bitte an echte Marktpreise anpassen.
export const SERVICES: ServiceType[] = [
  {
    id: 'innenanstrich',
    company_id: COMPANY_CONFIG.id,
    name: 'Innenanstrich (Wände)',
    pricing_type: 'per_m2',
    price_per_unit: 8.0,
    unit: 'm²',
    description: 'Streichen von Innenwänden inkl. Grundierung',
  },
  {
    id: 'deckenanstrich',
    company_id: COMPANY_CONFIG.id,
    name: 'Deckenanstrich',
    pricing_type: 'per_m2',
    price_per_unit: 10.0,
    unit: 'm²',
    description: 'Streichen von Decken inkl. Vorbereitung',
  },
  {
    id: 'tapezieren',
    company_id: COMPANY_CONFIG.id,
    name: 'Tapezierarbeiten',
    pricing_type: 'per_m2',
    price_per_unit: 12.0,
    unit: 'm²',
    description: 'Tapezieren inkl. Untergrundvorbereitung',
  },
  {
    id: 'fassadenanstrich',
    company_id: COMPANY_CONFIG.id,
    name: 'Fassadenanstrich',
    pricing_type: 'per_m2',
    price_per_unit: 35.0,
    unit: 'm²',
    description: 'Außenanstrich der Fassade inkl. Grundierung',
  },
  {
    id: 'verputz',
    company_id: COMPANY_CONFIG.id,
    name: 'Verputz- & Spachtelarbeiten',
    pricing_type: 'per_m2',
    price_per_unit: 25.0,
    unit: 'm²',
    description: 'Verputzen und Glätten von Wänden',
  },
  {
    id: 'lackierarbeiten',
    company_id: COMPANY_CONFIG.id,
    name: 'Lackierarbeiten',
    pricing_type: 'per_m2',
    price_per_unit: 30.0,
    unit: 'm²',
    description: 'Lackieren von Türen, Zargen und Holzflächen',
  },
]

// Zusatzleistungen für Step 3 des Wizards
export const EXTRA_SERVICES = SERVICES.filter((s) =>
  ['fassadenanstrich', 'lackierarbeiten'].includes(s.id)
)