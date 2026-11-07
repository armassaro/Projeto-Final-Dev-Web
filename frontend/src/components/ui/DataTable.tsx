import { useState, type ReactNode } from "react";
import { IoIosArrowDown } from "react-icons/io";

type SortValue = string | number | null;

type SortState = {
  header: string;
  direction: "asc" | "desc";
};

export type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  sortValue?: (row: T) => SortValue;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage: string;
  onRowClick?: (row: T) => void;
};

function compareValues(a: SortValue, b: SortValue, direction: SortState["direction"]) {
  // Valores ausentes ficam sempre no fim, em qualquer direção.
  if (a === null || b === null) return Number(a === null) - Number(b === null);
  const result =
    typeof a === "number" && typeof b === "number"
      ? a - b
      : String(a).localeCompare(String(b), "pt-BR", { sensitivity: "base" });
  return direction === "asc" ? result : -result;
}

export function DataTable<T>({ columns, rows, rowKey, emptyMessage, onRowClick }: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState | null>(null);

  if (rows.length === 0) {
    return <p className="py-3 text-sm text-slate-500">{emptyMessage}</p>;
  }

  const sortValue = columns.find((column) => column.header === sort?.header)?.sortValue;
  const sortedRows =
    sort && sortValue
      ? [...rows].sort((a, b) => compareValues(sortValue(a), sortValue(b), sort.direction))
      : rows;

  function toggleSort(header: string) {
    setSort((current) => ({
      header,
      direction: current?.header === header && current.direction === "asc" ? "desc" : "asc",
    }));
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            {columns.map((column) => {
              const direction = sort?.header === column.header ? sort.direction : null;
              return (
                <th
                  key={column.header}
                  className="px-2 py-2 font-medium"
                  aria-sort={
                    column.sortValue
                      ? direction === "asc"
                        ? "ascending"
                        : direction === "desc"
                          ? "descending"
                          : "none"
                      : undefined
                  }
                >
                  {column.sortValue ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(column.header)}
                      className="flex w-full cursor-pointer items-center justify-between font-medium"
                    >
                      {column.header}
                      <IoIosArrowDown
                        className={`${direction ? "opacity-100" : "opacity-40"} ${direction === "asc" ? "rotate-180" : ""}`}
                      />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
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
