import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { formatDateTime } from "@/src/lib/format"

import { durationLabel, periodLabel } from "../../portal/leave/leave"
import { type StaffLeave, timeline } from "./sample"

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

export function StudentCard({ leave }: { leave: StaffLeave }) {
  return (
    <Panel title={`${leave.student.name} · NIS ${leave.student.nis}`}>
      <div className="grid-2">
        <Field label="Program / Level" value={`${leave.student.packageName} · ${leave.position}`} />
        <Field label="Periode Cuti" value={`${periodLabel(leave)} (${durationLabel(leave)})`} />
      </div>
      <Field label="Alasan" value={leave.reason} />
      <div className="stack" style={{ gap: 4 }}>
        <span className="caption text-muted">Dokumen Pendukung</span>
        <div className="row-soft">
          <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
            <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
            {leave.document.name}
          </span>
          <a
            className="btn btn-secondary btn-sm"
            href={leave.document.href}
            target="_blank"
            rel="noreferrer"
          >
            Pratinjau
          </a>
        </div>
      </div>
    </Panel>
  )
}

export function TimelinePanel({ leave }: { leave: StaffLeave }) {
  return (
    <Panel title="Timeline">
      <ol className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {timeline(leave).map((entry) => (
          <li key={entry.stage} className="stack" style={{ gap: 0 }}>
            <span className="caption text-muted tabular">
              {entry.at ? formatDateTime(entry.at) : entry.current ? "Sedang berjalan" : "Belum"}
            </span>
            <span
              className={`body-sm${entry.done || entry.current ? "" : " text-faint"}`}
              style={{ fontWeight: entry.current ? 600 : 400 }}
            >
              {entry.stage} · {entry.label}
            </span>
          </li>
        ))}
      </ol>
    </Panel>
  )
}

export function PreviousLeavesPanel({ leave }: { leave: StaffLeave }) {
  return (
    <Panel title="Riwayat Cuti Sebelumnya">
      {leave.previousLeaves.length === 0 ? (
        <span className="body-sm text-muted">Belum pernah cuti. Ini pengajuan pertama.</span>
      ) : (
        <div className="list-rows">
          {leave.previousLeaves.map((item) => (
            <div key={item.period} className="row row-between">
              <div className="stack" style={{ gap: 0 }}>
                <span className="body-sm" style={{ fontWeight: 600 }}>
                  {item.reason}
                </span>
                <span className="caption text-muted">{item.period}</span>
              </div>
              <span className="badge badge-beres">{item.status}</span>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}
