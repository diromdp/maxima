import { Skeleton } from "@mantine/core"

import { DEFAULT_PER_PAGE } from "@/src/lib/list-query"

import { SkeletonRows } from "./SkeletonRows"

export function TableSkeleton({
  columns,
  rows = DEFAULT_PER_PAGE,
}: {
  columns: number
  rows?: number
}) {
  return (
    <div className="table-scroll" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <table className="table">
        <thead aria-hidden>
          <tr>
            {Array.from({ length: columns }, (_, column) => (
              <th key={column} scope="col">
                <Skeleton height={12} radius="xl" width="60%" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <SkeletonRows columns={columns} rows={rows} />
        </tbody>
      </table>
    </div>
  )
}
