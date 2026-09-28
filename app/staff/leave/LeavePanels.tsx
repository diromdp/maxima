"use client"

import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import {
  type LeaveDetail,
  leaveMonths,
  type LeaveState,
  STAGE_TONE,
  STAGES,
  stageStatusOf,
  STATE_BADGE,
} from "@/src/entities/leave/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { formatDate, formatDateTime } from "@/src/lib/format"

export function Panel({
  title,
  aside,
  children,
}: {
  title: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <h2 className="h6">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

export function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="stack" style={{ gap: 2, minWidth: 0 }}>
      <span className="caption text-muted">{label}</span>
      <span className="body-sm" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
        {value}
      </span>
    </div>
  )
}

export function FileRow({ name, path }: { name: string; path: string }) {
  return (
    <div className="row-soft">
      <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
        <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
        {name}
      </span>
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => void previewPresigned(path)}
      >
        Pratinjau
      </button>
    </div>
  )
}

const STAGES_REACHED_BY: Readonly<Partial<Record<LeaveState, readonly number[]>>> = {
  "awaiting-finance": [2],
  "payment-set": [3, 4],
  processing: [5],
  approved: [6],
  "on-leave": [7],
}

function stageTimes(leave: LeaveDetail): ReadonlyMap<number, string> {
  const times = new Map<number, string>([[1, leave.submittedAt]])
  for (const event of leave.timeline) {
    for (const stage of STAGES_REACHED_BY[event.kind] ?? []) times.set(stage, event.at)
    if (event.kind === "rejected") times.set(leave.stage, event.at)
  }
  return times
}

export function TimelinePanel({ leave }: { leave: LeaveDetail }) {
  const times = stageTimes(leave)

  return (
    <Panel title="Timeline">
      <ol className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {STAGES.map((label, index) => {
          const stage = index + 1
          const status = stageStatusOf(leave, stage)
          const at = times.get(stage)
          return (
            <li key={stage} className="row row-between" style={{ alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 0 }}>
                <span className={`body-sm${status === "Menunggu" ? " text-faint" : ""}`}>
                  {stage} · {label}
                </span>
                <span className="caption text-muted tabular">{at ? formatDateTime(at) : "-"}</span>
              </div>
              <span className={`badge badge-${STAGE_TONE[status]}`}>{status}</span>
            </li>
          )
        })}
      </ol>
    </Panel>
  )
}

export function PreviousLeavesPanel({ leave }: { leave: LeaveDetail }) {
  return (
    <Panel title="Riwayat Cuti Sebelumnya">
      {leave.previous.length === 0 ? (
        <span className="body-sm text-muted">Belum pernah cuti. Ini pengajuan pertama.</span>
      ) : (
        <div className="list-rows">
          {leave.previous.map((earlier) => {
            const badge = STATE_BADGE[earlier.state]
            return (
              <div key={earlier.id} className="row row-between">
                <Link
                  href={`/staff/leave/${earlier.id}`}
                  className="stack"
                  style={{ gap: 0, textDecoration: "none" }}
                >
                  <span className="body-sm text-ink" style={{ fontWeight: 600 }}>
                    {formatDate(earlier.startsOn)} - {formatDate(earlier.returnsOn)}
                  </span>
                  <span className="caption text-muted">
                    {leaveMonths(earlier.startsOn, earlier.returnsOn)} bulan
                  </span>
                </Link>
                <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
