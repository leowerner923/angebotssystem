'use client'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps {
  label: string
  name: string
  value: string
  options: SelectOption[]
  onChange: (value: string) => void
  error?: string
  required?: boolean
}

export default function Select({
  label,
  name,
  value,
  options,
  onChange,
  error,
  required = false,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] bg-white ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="" disabled>
          Bitte wählen...
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
