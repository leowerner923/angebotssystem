'use client'

interface TableColumn<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
  width?: string
}

interface TableProps<T> {
  columns: TableColumn<T>[]
  data: T[]
  emptyMessage?: string
  loading?: boolean
}

export default function Table<T extends object>({
  columns,
  data,
  emptyMessage = 'Keine Daten vorhanden.',
  loading = false,
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-8 text-center text-gray-400">
        Laden...
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 px-4 py-8 text-center text-gray-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Ab md: normale Tabelle */}
      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 md:block">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className="px-4 py-3" style={col.width ? { width: col.width } : undefined}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-gray-700">
                    {col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Unter md: Karten statt Tabelle */}
      <div className="flex flex-col gap-3 md:hidden">
        {data.map((row, rowIndex) => (
          <div key={rowIndex} className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-4">
            {columns.map((col) => {
              const value = col.render ? col.render(row) : String(row[col.key as keyof T] ?? '')
              return (
                <div key={String(col.key)} className="flex flex-col gap-0.5">
                  {col.header && (
                    <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{col.header}</span>
                  )}
                  <div className="text-sm text-gray-700">{value}</div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </>
  )
}
