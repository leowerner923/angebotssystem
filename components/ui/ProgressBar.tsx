'use client'

interface ProgressBarProps {
  currentStep: number
  totalSteps: number
  stepLabels?: string[]
}

export default function ProgressBar({ currentStep, totalSteps, stepLabels }: ProgressBarProps) {
  return (
    <div className="w-full">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1
          const isCompleted = step < currentStep
          const isCurrent = step === currentStep

          return (
            <div key={step} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    isCompleted
                      ? 'bg-[var(--brand-primary)] text-white'
                      : isCurrent
                        ? 'border-2 border-[var(--brand-primary)] bg-white text-[var(--brand-primary)]'
                        : 'border-2 border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {stepLabels?.[i] && (
                  <span
                    className={`mt-1 hidden text-xs sm:block ${
                      isCurrent ? 'font-medium text-[var(--brand-primary)]' : 'text-gray-400'
                    }`}
                  >
                    {stepLabels[i]}
                  </span>
                )}
              </div>
              {step < totalSteps && (
                <div
                  className={`mx-1 h-0.5 flex-1 transition-colors ${
                    isCompleted ? 'bg-[var(--brand-primary)]' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
