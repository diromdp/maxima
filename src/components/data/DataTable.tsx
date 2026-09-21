"use client"

import { useMemo, useState } from "react"
import { ActionIcon, Group, NativeSelect, SegmentedControl, Text } from "@mantine/core"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"

export type DataColumn<T> = {
  readonly key: string
  readonly header: string
  readonly cell: (row: T) => React.ReactNode
  readonly sort?: (row: T) => string | number
  readonly align?: "right"
  readonly wrap?: boolean
}

export type DataFilter<T> = {
  readonly value: (row: T) => string
  readonly options: readonly string[]
  readonly allLabel?: string
}

const PAGE_SIZES = [10, 25, 50] as const
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
  /** Kolom terakhir (biasanya Aksi) menempel di kanan saat tabel menggulir mendatar. */
  stickyLast?: boolean
  emptyText?: string
}) {
  const [filterValue, setFilterValue] = useState<string>(ALL)
  const [sort, setSort] = useState(defaultSort ?? null)
  const [pageSize, setPageSize] = useState<number>(PAGE_SIZES[0])
  const [page, setPage] = useState(0)

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
  const current = Math.min(page, pageCount - 1)
  const start = current * pageSize
  const pageRows = visible.slice(start, start + pageSize)

  function toggleSort(key: string) {
    setSort((s) => (s?.key === key && s.dir === "asc" ? { key, dir: "desc" } : { key, dir: "asc" }))
  }

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
              setPage(0)
            }}
            data={[
              { label: filter.allLabel ?? "Semua", value: ALL },
              ...filter.options.map((o) => ({ label: o, value: o })),
            ]}
          />
        </div>
      )}

      <div className="table-scroll">
        <table className={stickyLast ? "table table-sticky-last" : "table"}>
          <thead>
            <tr>
              {columns.map((c) => {
                const active = sort?.key === c.key
                const icon = !active
                  ? ArrowUpDownIcon
                  : sort.dir === "asc"
                    ? ArrowUp01Icon
                    : ArrowDown01Icon
                return (
                  <th
                    key={c.key}
                    scope="col"
                    className={c.align === "right" ? "numeric" : undefined}
                    aria-sort={
                      active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {c.sort ? (
                      <button
                        type="button"
                        className="table-sort"
                        onClick={() => toggleSort(c.key)}
                      >
                        {c.header}
                        <HugeiconsIcon icon={icon} size={14} strokeWidth={1.5} />
                      </button>
                    ) : (
                      c.header
                    )}
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="wrap text-muted"
                  style={{ textAlign: "center" }}
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              pageRows.map((r) => (
                <tr key={rowKey(r)}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={
                        [c.align === "right" ? "numeric tabular" : "", c.wrap ? "wrap" : ""]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                    >
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="table-foot">
        <Group gap="xs" wrap="nowrap">
          <Text size="13px" c="dimmed" style={{ whiteSpace: "nowrap" }}>
            Baris per halaman
          </Text>
          <NativeSelect
            size="xs"
            radius="xl"
            aria-label="Baris per halaman"
            value={String(pageSize)}
            onChange={(e) => {
              setPageSize(Number(e.currentTarget.value))
              setPage(0)
            }}
            data={PAGE_SIZES.map(String)}
          />
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Text size="13px" c="dimmed" className="tabular" style={{ whiteSpace: "nowrap" }}>
            {visible.length === 0
              ? "0 dari 0"
              : `${start + 1}-${Math.min(start + pageSize, visible.length)} dari ${visible.length}`}
          </Text>
          <ActionIcon
            variant="default"
            size="md"
            aria-label="Halaman sebelumnya"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          </ActionIcon>
          <Text size="13px" fw={500} className="tabular">
            {current + 1}
          </Text>
          <ActionIcon
            variant="default"
            size="md"
            aria-label="Halaman berikutnya"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </div>
  )
}
