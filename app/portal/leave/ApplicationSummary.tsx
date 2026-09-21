import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { formatDateTime } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { durationLabel, periodLabel, type LeaveApplication } from "./leave"
import { SpecList } from "./SpecList"

export function ApplicationSummary({ application }: { application: LeaveApplication }) {
  return (
    <section className="card stack">
      <CardHeader title="Ringkasan Pengajuan" />

      <div className="grid-2">
        <SpecList
          items={[
            { name: "Nomor Pengajuan", value: application.id },
            {
              name: "Periode Cuti",
              value: `${periodLabel(application)} (${durationLabel(application)})`,
            },
          ]}
        />
        <SpecList
          items={[
            { name: "Tanggal Pengajuan", value: formatDateTime(application.submittedAt) },
            { name: "Alasan Cuti", value: application.reason },
          ]}
        />
      </div>

      <div className="stack stack-sm">
        <span className="spec-name">Dokumen Pendukung</span>
        <div className="row-soft">
          <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
            <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
            {application.document.name}
          </span>
          <a
            className="btn btn-secondary btn-sm"
            href={application.document.href}
            target="_blank"
            rel="noreferrer"
          >
            Pratinjau
          </a>
        </div>
      </div>
    </section>
  )
}
