"use client"

import { SegmentedControl } from "@mantine/core"
import { useMemo, useState } from "react"

import { PER_PAGE_OPTIONS } from "@/src/lib/list-query"

import { TableFrame, type DataColumn, type TableSort } from "./TableFrame"

export type { DataColumn } from "./TableFrame"

export type DataFilter<T> = {
  readonly value: (row: T) => string
  readonly options: readonly string[]
  readonly allLabel?: string
  readonly onChange?: (value: string | null) => void
}

const ALL = "__all__"

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  filter,
  defaultSort,
  stickyLast = false,
  emptyText = "Belum ada data.",
}: {
  rows: readonly T[]
  columns: readonly DataColumn<T>[]
  rowKey: (row: T) => string
  filter?: DataFilter<T>
  defaultSort?: { key: string; dir: "asc" | "desc" }
  stickyLast?: boolean
  emptyText?: string
}) {
  const [filterValue, setFilterValue] = useState<string>(ALL)
  const [sort, setSort] = useState<TableSort>(defaultSort ?? null)
  const [pageSize, setPageSize] = useState<number>(PER_PAGE_OPTIONS[0])
  const [page, setPage] = useState(1)

  const visible = useMemo(() => {
    const filtered =
      filter && filterValue !== ALL ? rows.filter((r) => filter.value(r) === filterValue) : rows
    if (!sort) return filtered
    const col = columns.find((c) => c.key === sort.key)
    if (!col?.sort) return filtered
    const dir = sort.dir === "asc" ? 1 : -1
    const key = col.sort
    return [...filtered].sort((a, b) => {
      const x = key(a)
      const y = key(b)
      return (x < y ? -1 : x > y ? 1 : 0) * dir
    })
  }, [rows, columns, filter, filterValue, sort])

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize))
  const current = Math.min(page, pageCount)
  const start = (current - 1) * pageSize

  return (
    <div className="stack">
      {filter && (
        <div className="filter-scroll">
          <SegmentedControl
            size="sm"
            style={{ width: "max-content" }}
            value={filterValue}
            onChange={(v) => {
              setFilterValue(v)
              setPage(1)
              filter.onChange?.(v === ALL ? null : v)
            }}
            data={[
              { label: filter.allLabel ?? "Semua", value: ALL },
              ...filter.options.map((o) => ({ label: o, value: o })),
            ]}
          />
        </div>
      )}

      <TableFrame
        rows={visible.slice(start, start + pageSize)}
        columns={columns}
        rowKey={rowKey}
        isSortable={(c) => c.sort !== undefined}
        sort={sort}
        onSort={(key) =>
          setSort((s) =>
            s?.key === key && s.dir === "asc" ? { key, dir: "desc" } : { key, dir: "asc" },
          )
        }
        page={current}
        pageSize={pageSize}
        total={visible.length}
        onPage={setPage}
        onPageSize={(size) => {
          setPageSize(size)
          setPage(1)
        }}
        stickyLast={stickyLast}
        emptyText={emptyText}
      />
    </div>
  )
}
