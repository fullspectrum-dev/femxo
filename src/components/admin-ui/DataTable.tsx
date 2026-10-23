"use client";

import { ArrowDown, ArrowUp, ArrowUpDown, Search } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";
import { SelectInput } from "./FormField";
import { ErrorState, LoadingSkeleton } from "./States";

export interface Column<R> {
  key: string;
  header: string;
  render: (row: R) => ReactNode;
  sortable?: boolean;
  align?: "left" | "right";
  /** Shown as the card title on phones (one column per table). */
  primary?: boolean;
  /** Left out of the phone card to keep it short. */
  hideOnMobile?: boolean;
}

export type SortDirection = "asc" | "desc";
export interface SortState {
  key: string;
  direction: SortDirection;
}

export interface StatusOption {
  value: string;
  label: string;
}

export type TableState = "loading" | "error" | "ready";

/**
 * Foundations data table: search, status filter, sortable headers, a "View"
 * row action and cursor pagination ("Previous · Next"). It only renders; the
 * caller owns the data, so the same table works on mock data now and the API
 * later. When the table itself is narrower than 576px (a phone, or a tablet
 * with the sidebar expanded) rows become cards, so nothing scrolls sideways.
 */
export function DataTable<R>({
  label,
  columns,
  rows,
  getRowId,
  state,
  onRetry,
  empty,
  search,
  statusFilter,
  sort,
  onSortChange,
  onView,
  viewLabel = "View",
  pager,
  toolbarExtra,
}: {
  label: string;
  columns: readonly Column<R>[];
  rows: readonly R[];
  getRowId: (row: R) => string;
  state: TableState;
  onRetry?: () => void;
  empty: ReactNode;
  search?: { value: string; onChange: (value: string) => void; placeholder: string };
  statusFilter?: { value: string; onChange: (value: string) => void; options: readonly StatusOption[] };
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  onView?: (row: R) => void;
  viewLabel?: string;
  pager?: { summary: string; hasPrevious: boolean; hasNext: boolean; onPrevious: () => void; onNext: () => void };
  toolbarExtra?: ReactNode;
}) {
  const primary = columns.find((column) => column.primary) ?? columns[0];
  const statusColumn = columns.find((column) => column.key === "status");

  function toggleSort(key: string) {
    if (!onSortChange) return;
    const direction: SortDirection = sort?.key === key && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ key, direction });
  }

  return (
    <div className="fx-card @container overflow-hidden" style={{ padding: 0 }}>
      {search || statusFilter || toolbarExtra ? (
        <div className="flex flex-col gap-3 border-b border-[var(--fx-border)] p-4 sm:flex-row sm:items-center">
          {search ? (
            // flex-none on phones: in the column layout flex-1 would collapse its height.
            <label className="fx-search h-[42px] flex-none sm:max-w-[360px] sm:flex-1">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search</span>
              <input
                type="search"
                value={search.value}
                placeholder={search.placeholder}
                onChange={(event) => search.onChange(event.target.value)}
              />
            </label>
          ) : null}
          {statusFilter ? (
            <label className="flex items-center gap-2 sm:w-[220px]">
              <span className="sr-only">Filter by status</span>
              <SelectInput value={statusFilter.value} onChange={(event) => statusFilter.onChange(event.target.value)}>
                <option value="">All statuses</option>
                {statusFilter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </SelectInput>
            </label>
          ) : null}
          {toolbarExtra ? <div className="sm:ml-auto">{toolbarExtra}</div> : null}
        </div>
      ) : null}

      {state === "loading" ? (
        <LoadingSkeleton label={`Loading ${label.toLowerCase()}`} />
      ) : state === "error" ? (
        <ErrorState
          action={
            onRetry ? (
              <Button variant="secondary" onClick={onRetry}>
                Try again
              </Button>
            ) : undefined
          }
        />
      ) : rows.length === 0 ? (
        empty
      ) : (
        <>
          {/* Wide enough for columns */}
          <div className="fx-table-wrap hidden @xl:block">
            <table className="fx-table">
              <caption className="sr-only">{label}</caption>
              <thead>
                <tr>
                  {columns.map((column) => {
                    const active = sort?.key === column.key;
                    return (
                      <th
                        key={column.key}
                        scope="col"
                        className={cn(column.align === "right" && "fx-right")}
                        aria-sort={active ? (sort.direction === "asc" ? "ascending" : "descending") : undefined}
                      >
                        {column.sortable && onSortChange ? (
                          <button type="button" onClick={() => toggleSort(column.key)}>
                            {column.header}
                            {active ? (
                              sort.direction === "asc" ? (
                                <ArrowUp size={12} aria-hidden="true" />
                              ) : (
                                <ArrowDown size={12} aria-hidden="true" />
                              )
                            ) : (
                              <ArrowUpDown size={12} aria-hidden="true" />
                            )}
                          </button>
                        ) : (
                          column.header
                        )}
                      </th>
                    );
                  })}
                  {onView ? (
                    <th scope="col">
                      <span>Action</span>
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={getRowId(row)}>
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={cn(column.align === "right" && "fx-right fx-num", column.primary && "font-semibold")}
                      >
                        {column.render(row)}
                      </td>
                    ))}
                    {onView ? (
                      <td>
                        <Button size="sm" variant="secondary" onClick={() => onView(row)}>
                          {viewLabel}
                        </Button>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Narrow: one card per row */}
          <ul className="grid gap-3 p-3 @xl:hidden" aria-label={label}>
            {rows.map((row) => (
              <li key={getRowId(row)} className="rounded-[16px] border border-[var(--fx-border)] bg-[var(--fx-surface)] p-4 shadow-[var(--fx-shelf-control)]">
                <div className="flex items-start justify-between gap-3">
                  <p className="min-w-0 font-semibold">{primary?.render(row)}</p>
                  {statusColumn && statusColumn !== primary ? statusColumn.render(row) : null}
                </div>
                <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12.5px]">
                  {columns
                    .filter((column) => column !== primary && column !== statusColumn && !column.hideOnMobile)
                    .slice(0, 4)
                    .map((column) => (
                      <div key={column.key} className="min-w-0">
                        <dt className="fx-muted">{column.header}</dt>
                        <dd className="truncate">{column.render(row)}</dd>
                      </div>
                    ))}
                </dl>
                {onView ? (
                  <Button size="sm" variant="secondary" className="mt-3" block onClick={() => onView(row)}>
                    {viewLabel}
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </>
      )}

      {pager && state === "ready" && rows.length > 0 ? (
        <nav className="fx-pager" aria-label={`${label} pages`}>
          <span>{pager.summary}</span>
          <span className="flex items-center gap-2">
            <button type="button" disabled={!pager.hasPrevious} onClick={pager.onPrevious}>
              Previous
            </button>
            <span aria-hidden="true">·</span>
            <button type="button" disabled={!pager.hasNext} onClick={pager.onNext}>
              Next
            </button>
          </span>
        </nav>
      ) : null}
    </div>
  );
}
