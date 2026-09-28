import { type LeaveState, STAGE_TONE, STAGES, stageStatusOf } from "@/src/entities/leave/schema"

import { CardHeader } from "./CardHeader"

export function StageProgress({ leave }: { leave: { state: LeaveState; stage: number } }) {
  return (
    <section className="card stack">
      <CardHeader title="Kemajuan Pengajuan" note="tujuh langkah" />

      <ol className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {STAGES.map((label, index) => {
          const status = stageStatusOf(leave, index + 1)

          return (
            <li key={label} className="row row-between">
              <span className="body-sm">
                {index + 1} · {label}
              </span>
              <span className={`badge badge-${STAGE_TONE[status]}`}>{status}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
