import type { ServiceType } from '@/lib/types/database'

// Abgeleitet aus UNTERNEHMENSWISSEN.md – Rheinglanz Gebäudeservice
// NIEMALS Firmendaten anderswo hardcoden. Immer aus dieser Datei importieren.

export const COMPANY_CONFIG = {
  id: 'glanz-sauber',
  name: 'Rheinglanz Gebäudeservice',
  location: 'Mosbach & Umgebung',
  primaryColor: '#1d4ed8',
  targetGroups: ['Privatkunden', 'Büros', 'Gewerbe', 'Hausverwaltungen'],
} as const

// Leistungen aus UNTERNEHMENSWISSEN.md – Preislogik (vereinfacht)
export const SERVICES: ServiceType[] = [
  {
    id: 'unterhaltsreinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Unterhaltsreinigung',
    pricing_type: 'per_m2',
    price_per_unit: 2.0,
    unit: 'm²',
    description: 'Regelmäßige Reinigung Ihrer Räume',
  },
  {
    id: 'glasreinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Glas- und Fensterreinigung',
    pricing_type: 'per_unit',
    price_per_unit: 4.0,
    unit: 'Fenster',
    description: 'Professionelle Reinigung aller Glasflächen',
  },
  {
    id: 'treppenhausreinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Treppenhausreinigung',
    pricing_type: 'per_m2',
    price_per_unit: 2.0,
    unit: 'm²',
    description: 'Reinigung von Treppenhäusern und Fluren',
  },
  {
    id: 'bauendreinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Bauendreinigung',
    pricing_type: 'per_m2',
    price_per_unit: 5.0,
    unit: 'm²',
    description: 'Gründliche Endreinigung nach Baumaßnahmen',
  },
  {
    id: 'grundreinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Grundreinigung',
    pricing_type: 'per_m2',
    price_per_unit: 4.5,
    unit: 'm²',
    description: 'Intensive Tiefenreinigung',
  },
  {
    id: 'bueroereinigung',
    company_id: COMPANY_CONFIG.id,
    name: 'Büroreinigung',
    pricing_type: 'per_m2',
    price_per_unit: 2.0,
    unit: 'm²',
    description: 'Regelmäßige Reinigung von Büroräumen',
  },
]

// Zusatzleistungen für Step 3 des Wizards
export const EXTRA_SERVICES = SERVICES.filter((s) =>
  ['grundreinigung', 'glasreinigung'].includes(s.id)
)
