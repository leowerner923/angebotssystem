'use client'

interface InputProps {
  label: string
  name: string
  type?: 'text' | 'email' | 'tel' | 'number'
  value: string | number
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
}

export default function Input({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  min,
  max,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        className={`rounded-lg border px-4 py-3 text-sm outline-none transition-colors focus:ring-2 focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
