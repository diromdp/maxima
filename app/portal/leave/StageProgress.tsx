import { CardHeader } from "./CardHeader"
import { STAGE_BADGE, STAGES, stageStatus, type LeaveState } from "./leave"

export function StageProgress({ state }: { state: LeaveState }) {
  return (
    <section className="card stack">
      <CardHeader title="Kemajuan Pengajuan" note="tujuh langkah" />

      <ol className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {STAGES.map((label, index) => {
          const status = stageStatus(state, index + 1)

          return (
            <li key={label} className="row row-between">
              <span className="body-sm">
                {index + 1} · {label}
              </span>
              <span className={`badge ${STAGE_BADGE[status]}`}>{status}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
