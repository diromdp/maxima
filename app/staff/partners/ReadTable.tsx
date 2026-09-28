"use client"

import type { UseQueryResult } from "@tanstack/react-query"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import type { ApiError } from "@/src/lib/api/errors"

const SKELETON_ROWS = 6

export function ReadTable<Row extends { id: string }>({
  read,
  columns,
  defaultSort,
  emptyText,
}: {
  read: UseQueryResult<{ data: Row[] }, ApiError>
  columns: readonly DataColumn<Row>[]
  defaultSort?: { key: string; dir: "asc" | "desc" }
  emptyText: string
}) {
  if (read.isError) {
    return <QueryError message={read.error.message} onRetry={() => void read.refetch()} />
  }
  if (read.isPending) {
    return (
      <div className="table-scroll" aria-busy="true">
        <span className="sr-only" role="status">
          Memuat
        </span>
        <table className="table">
          <tbody>
            <SkeletonRows columns={columns.length} rows={SKELETON_ROWS} />
          </tbody>
        </table>
      </div>
    )
  }
  return (
    <DataTable
      rows={read.data.data}
      columns={columns}
      rowKey={(row) => row.id}
      defaultSort={defaultSort}
      emptyText={emptyText}
    />
  )
}
