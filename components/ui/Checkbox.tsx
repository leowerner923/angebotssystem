'use client'

interface CheckboxProps {
  label: string
  name: string
  checked: boolean
  onChange: (checked: boolean) => void
  description?: string
}

export default function Checkbox({ label, name, checked, onChange, description }: CheckboxProps) {
  return (
    <label
      htmlFor={name}
      className="flex cursor-pointer items-start gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
    >
      <input
        id={name}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[var(--brand-primary)]"
      />
      <div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
        {description && <p className="mt-0.5 text-xs text-gray-500">{description}</p>}
      </div>
    </label>
  )
}
