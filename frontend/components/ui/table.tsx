import React from 'react';
import styles from './ui.module.css';

export type Column<T> = {
  key: string;
  title: React.ReactNode;
  render?: (row: T) => React.ReactNode;
  className?: string;
};

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey?: (row: T) => string;
  onRowClick?: (row: T) => void;
  className?: string;
}

export function TableImpl<T extends Record<string, any>>({
  columns,
  data,
  rowKey,
  onRowClick,
  className = ''
}: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className={`${styles.table} ${className}`.trim()}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {data.map((row, idx) => {
            const key = rowKey ? rowKey(row) : (row.id ?? idx).toString();
            return (
              <tr key={key} className={styles.rowHover} onClick={() => onRowClick?.(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export const TableHeader = (props: React.PropsWithChildren<any>) => <thead {...props} />;
export const TableBody = (props: React.PropsWithChildren<any>) => <tbody {...props} />;
export const TableRow = (props: React.PropsWithChildren<any>) => <tr {...props} />;
export const TableHead = (props: React.PropsWithChildren<any>) => <th {...props} />;
export const TableCell = (props: React.PropsWithChildren<any>) => <td {...props} />;

// Compatibility: export a `Table` component that supports both new API (columns/data)
// and legacy usage where consumers render children (<Table>...</Table>).
export const Table: any = (props: any) => {
  if (props && props.columns && props.data) {
    return <TableImpl {...props} />;
  }
  return <table {...props}>{props.children}</table>;
};

export default Table;
