"use client";

import { ChartColumn, Table2 } from "lucide-react";
import { useId, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface ChartTable {
  columns: readonly { key: string; label: string; numeric?: boolean }[];
  rows: readonly Record<string, ReactNode>[];
}

/**
 * A dashboard panel: title, a one-line description, optional legend or
 * actions, and the chart. With `table`, a Chart ⇄ Table switch shows the
 * same numbers as a table (the accessible twin of every chart).
 */
export function ChartCard({
  title,
  description,
  actions,
  table,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  table?: ChartTable;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const [asTable, setAsTable] = useState(false);
  const titleId = useId();

  return (
    <section className={cn("fx-card fx-panel", className)} aria-labelledby={titleId}>
      <header className="fx-panel-head">
        <div className="min-w-0">
          <h2 id={titleId} className="fx-panel-title">
            {title}
          </h2>
          {description ? <p className="fx-panel-desc">{description}</p> : null}
        </div>
        {actions || table ? (
          <div className="flex flex-none flex-wrap items-center justify-end gap-3">
            {actions}
            {table ? (
              <button
                type="button"
                className="fx-view-toggle"
                aria-pressed={asTable}
                aria-label={asTable ? `Show ${title} as a chart` : `Show ${title} as a table`}
                title={asTable ? "Show chart" : "Show table"}
                onClick={() => setAsTable((value) => !value)}
              >
                {asTable ? <ChartColumn size={15} aria-hidden="true" /> : <Table2 size={15} aria-hidden="true" />}
              </button>
            ) : null}
          </div>
        ) : null}
      </header>
      <div className={cn("fx-panel-body", bodyClassName)}>
        {asTable && table ? (
          <div className="fx-table-wrap max-h-[320px] overflow-y-auto">
            <table className="fx-table fx-table--compact">
              <caption className="sr-only">{title}</caption>
              <thead>
                <tr>
                  {table.columns.map((column) => (
                    <th key={column.key} scope="col" className={cn(column.numeric && "fx-right")}>
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.rows.map((row, index) => (
                  <tr key={index}>
                    {table.columns.map((column) => (
                      <td key={column.key} className={cn(column.numeric && "fx-right fx-num")}>
                        {row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          children
        )}
      </div>
    </section>
  );
}
