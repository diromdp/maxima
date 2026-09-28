import Link from "next/link"

import type { BadgeTone } from "@/src/entities/portal/schema"

type GroupCount = { group: string; complete: number; total: number }

function toneOf(group: GroupCount): BadgeTone {
  if (group.total > 0 && group.complete === group.total) return "beres"
  return group.complete > 0 ? "berjalan" : "terkunci"
}

const anchorOf = (group: string) => group.toLowerCase().replaceAll(" ", "-")

export function DocumentGroupList({ groups }: { groups: readonly GroupCount[] }) {
  return (
    <div className="list-rows">
      {groups.map((group) => (
        <Link
          key={group.group}
          href={`/portal/documents#${anchorOf(group.group)}`}
          className="row row-between text-inherit no-underline"
        >
          <span className="body-sm">{group.group}</span>
          <span className={`badge badge-${toneOf(group)}`}>
            {group.complete} dari {group.total}
          </span>
        </Link>
      ))}
    </div>
  )
}
