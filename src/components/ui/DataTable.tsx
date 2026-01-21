import React from "react";
import { cn } from "@/lib/cn";

export interface DataColumn<T> {
  key: string;
  header: string;
  width?: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> extends React.TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: DataColumn<T>[];
  density?: "compact" | "comfortable";
  emptyMessage?: string;
  rowKey: (row: T) => string;
}

export const DataTable = <T,>({
  data,
  columns,
  density = "comfortable",
  emptyMessage = "データがありません",
  rowKey,
  className,
  ...props
}: DataTableProps<T>) => {
  if (!data.length) {
    return <div className="ui-muted">{emptyMessage}</div>;
  }

  return (
    <table className={cn("ui-table", className)} data-density={density} {...props}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key} style={column.width ? { width: column.width } : undefined}>
              {column.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((column) => (
              <td key={column.key}>{column.render ? column.render(row) : (row as any)[column.key]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
