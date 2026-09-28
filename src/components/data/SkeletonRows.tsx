import { Skeleton } from "@mantine/core"

export function SkeletonRows({ columns, rows }: { columns: number; rows: number }) {
  return Array.from({ length: rows }, (_, row) => (
    <tr key={row} aria-hidden>
      {Array.from({ length: columns }, (_, column) => (
        <td key={column}>
          <Skeleton height={14} radius="xl" width={column === 0 ? "70%" : "50%"} />
        </td>
      ))}
    </tr>
  ))
}
