import type { WizardState } from '@/lib/types/wizard'

export function calculateLeadScore(state: WizardState, estimatedTotal: number): number {
  let score = 0

  if (estimatedTotal >= 500) score += 10
  if (state.cleaningInterval === 'weekly') score += 5
  if (state.contactCompany.trim().length > 0) score += 5
  if ((state.areaM2 ?? 0) >= 200) score += 3

  return Math.min(100, Math.max(0, score))
}
