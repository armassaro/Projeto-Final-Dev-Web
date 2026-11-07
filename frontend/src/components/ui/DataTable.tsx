import type { ReactNode } from "react";

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
};

export function DataTable<T>({ columns, rows, rowKey, emptyMessage, onRowClick }: DataTableProps<T>) {
  if (rows.length === 0) {
    return <p className="py-3 text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {columns.map((column) => (
              <th key={column.header} className="px-2 py-2 font-medium">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter") onRowClick(row);
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              className={`border-b border-slate-100 ${onRowClick ? "cursor-pointer hover:bg-slate-50" : ""}`}
            >
              {columns.map((column) => (
                <td key={column.header} className="px-2 py-2">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
