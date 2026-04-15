import type { WizardState, PriceEstimate } from '@/lib/types/wizard'
import { SERVICES } from '@/lib/company-config'

export function calculateEstimate(state: WizardState): PriceEstimate {
  if (!state.selectedServiceId) {
    return { base: 0, extras: 0, total: 0, currency: 'EUR' }
  }

  const service = SERVICES.find((s) => s.id === state.selectedServiceId)
  if (!service) {
    return { base: 0, extras: 0, total: 0, currency: 'EUR' }
  }

  let base = 0
  if (service.pricing_type === 'per_m2') {
    base = service.price_per_unit * (state.areaM2 ?? 0)
  } else if (service.pricing_type === 'per_unit') {
    base = service.price_per_unit * (state.windowCount ?? 0)
  } else {
    base = service.price_per_unit
  }

  let extras = 0
  for (const extraId of state.selectedExtras) {
    const extra = SERVICES.find((s) => s.id === extraId)
    if (!extra) continue
    if (extra.pricing_type === 'per_m2') {
      extras += extra.price_per_unit * (state.areaM2 ?? 0)
    } else if (extra.pricing_type === 'per_unit') {
      extras += extra.price_per_unit * (state.windowCount ?? 0)
    } else {
      extras += extra.price_per_unit
    }
  }

  return { base, extras, total: base + extras, currency: 'EUR' }
}
