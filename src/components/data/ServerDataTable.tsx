"use client"

import { useListParams } from "@/src/lib/use-list-params"

import { TableFrame, type DataColumn, type HeaderGroup } from "./TableFrame"

export function ServerDataTable<T>({
  rows,
  total,
  isPending,
  columns,
  rowKey,
  stickyLast = false,
  emptyText = "Belum ada data.",
  headerGroups,
}: {
  rows: readonly T[]
  total: number
  isPending: boolean
  columns: readonly DataColumn<T>[]
  rowKey: (row: T) => string
  stickyLast?: boolean
  emptyText?: string
  headerGroups?: readonly HeaderGroup[]
}) {
  const { params, setParams } = useListParams()
  const order = params.order ?? "asc"
  const sorted = columns.find((c) => c.sortKey !== undefined && c.sortKey === params.sort)

  return (
    <div className="stack">
      <TableFrame
        rows={rows}
        columns={columns}
        rowKey={rowKey}
        isSortable={(c) => c.sortKey !== undefined}
        sort={sorted ? { key: sorted.key, dir: order } : null}
        onSort={(key) => {
          const isAscending = sorted?.key === key && order === "asc"
          setParams({
            sort: columns.find((c) => c.key === key)?.sortKey,
            order: isAscending ? "desc" : "asc",
          })
        }}
        page={params.page}
        pageSize={params.perPage}
        total={total}
        onPage={(page) => setParams({ page })}
        onPageSize={(perPage) => setParams({ perPage })}
        isPending={isPending}
        stickyLast={stickyLast}
        emptyText={emptyText}
        headerGroups={headerGroups}
      />
    </div>
  )
}
