const Table = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (!data?.length) {
    return (
      <div className="text-center py-16 text-slate-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-100">
            {columns.map((col) => (
              <th
                key={col.key}
                className="text-left px-4 py-3 text-xs font-semibold
                           text-slate-500 uppercase tracking-wide
                           whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 bg-white">
          {data.map((row, i) => (
            <tr key={row._id || i}
                className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key}
                    className="px-4 py-3 text-sm text-slate-700 whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table