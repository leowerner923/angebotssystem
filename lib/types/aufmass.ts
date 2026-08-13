export interface AufmassStrukturiert {
  raum: string | null
  leistung: string | null
  flaeche_m2: number | null
  wandhoehe_m: number | null
  untergrund: string | null
  anstriche: number | null
  decke_inklusive: boolean | null
  hinweise: string[]
  unklar: string[]
}

export type AufmassStatus = 'entwurf' | 'uebernommen' | 'verworfen'

export interface Aufmass {
  id: string
  company_id: string
  transkript: string | null
  strukturiert: AufmassStrukturiert | null
  audio_pfad: string | null
  status: AufmassStatus
  erstellt_am: string
}
