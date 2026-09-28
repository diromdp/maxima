"use client"

import {
  ArrowDown01Icon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUp01Icon,
  ArrowUpDownIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { ActionIcon, Group, NativeSelect, Text } from "@mantine/core"

import { PER_PAGE_OPTIONS, type SortOrder } from "@/src/lib/list-query"

import { SkeletonRows } from "./SkeletonRows"

export type DataColumn<T> = {
  readonly key: string
  readonly header: string
  readonly cell: (row: T) => React.ReactNode
  readonly sort?: (row: T) => string | number
  readonly sortKey?: string
  readonly align?: "right" | "center"
  readonly wrap?: boolean
  readonly title?: string
}

export type HeaderGroup = { readonly label: string; readonly span: number }

export type TableSort = { key: string; dir: SortOrder } | null

export function TableFrame<T>({
  rows,
  columns,
  rowKey,
  isSortable,
  sort,
  onSort,
  page,
  pageSize,
  total,
  onPage,
  onPageSize,
  isPending = false,
  stickyLast = false,
  emptyText,
  headerGroups,
}: {
  rows: readonly T[]
  columns: readonly DataColumn<T>[]
  rowKey: (row: T) => string
  isSortable: (column: DataColumn<T>) => boolean
  sort: TableSort
  onSort: (key: string) => void
  page: number
  pageSize: number
  total: number
  onPage: (page: number) => void
  onPageSize: (size: number) => void
  isPending?: boolean
  stickyLast?: boolean
  emptyText: string
  headerGroups?: readonly HeaderGroup[]
}) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const start = (page - 1) * pageSize

  return (
    <>
      <div className="table-scroll" aria-busy={isPending || undefined}>
        {isPending && (
          <span className="sr-only" role="status">
            Memuat
          </span>
        )}
        <table className={stickyLast ? "table table-sticky-last" : "table"}>
          <thead>
            {headerGroups && (
              <tr>
                {headerGroups.map((group) => (
                  <th
                    key={group.label}
                    colSpan={group.span}
                    scope="colgroup"
                    className="text-muted"
                    style={{ fontWeight: 600 }}
                  >
                    {group.label}
                  </th>
                ))}
              </tr>
            )}
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
                    style={c.align === "center" ? { textAlign: "center" } : undefined}
                    title={c.title}
                    aria-sort={
                      active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined
                    }
                  >
                    {isSortable(c) ? (
                      <button type="button" className="table-sort" onClick={() => onSort(c.key)}>
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
            {isPending ? (
              <SkeletonRows columns={columns.length} rows={pageSize} />
            ) : rows.length === 0 ? (
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
              rows.map((r) => (
                <tr key={rowKey(r)}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={
                        [c.align === "right" ? "numeric tabular" : "", c.wrap ? "wrap" : ""]
                          .filter(Boolean)
                          .join(" ") || undefined
                      }
                      style={c.align === "center" ? { textAlign: "center" } : undefined}
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
            onChange={(e) => onPageSize(Number(e.currentTarget.value))}
            data={PER_PAGE_OPTIONS.map(String)}
          />
        </Group>

        <Group gap="xs" wrap="nowrap">
          <Text size="13px" c="dimmed" className="tabular" style={{ whiteSpace: "nowrap" }}>
            {total === 0
              ? "0 dari 0"
              : `${start + 1}-${Math.min(start + pageSize, total)} dari ${total}`}
          </Text>
          <ActionIcon
            variant="default"
            size="md"
            aria-label="Halaman sebelumnya"
            disabled={page <= 1}
            onClick={() => onPage(page - 1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          </ActionIcon>
          <Text size="13px" fw={500} className="tabular">
            {page}
          </Text>
          <ActionIcon
            variant="default"
            size="md"
            aria-label="Halaman berikutnya"
            disabled={page >= pageCount}
            onClick={() => onPage(page + 1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </ActionIcon>
        </Group>
      </div>
    </>
  )
}
