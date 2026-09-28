"use client"

import { File01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { type LeaveDetail, leaveMonths } from "@/src/entities/leave/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { formatDateLong, formatDateTime } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { SpecList } from "./SpecList"

export function ApplicationSummary({ leave }: { leave: LeaveDetail }) {
  return (
    <section className="card stack">
      <CardHeader title="Ringkasan Pengajuan" />

      <div className="grid-2">
        <SpecList
          items={[
            { name: "Nomor Pengajuan", value: leave.number },
            {
              name: "Periode Cuti",
              value: `${formatDateLong(leave.startsOn)} - ${formatDateLong(leave.returnsOn)} (${leaveMonths(leave.startsOn, leave.returnsOn)} bulan)`,
            },
          ]}
        />
        <SpecList
          items={[
            { name: "Tanggal Pengajuan", value: formatDateTime(leave.submittedAt) },
            { name: "Alasan Cuti", value: leave.reason },
          ]}
        />
      </div>

      {leave.hasEvidence && (
        <div className="stack stack-sm">
          <span className="spec-name">Dokumen Pendukung</span>
          <div className="row-soft">
            <span className="row body-sm" style={{ gap: 8, minWidth: 0 }}>
              <HugeiconsIcon icon={File01Icon} size={16} strokeWidth={1.5} />
              Dokumen Pendukung
            </span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => void previewPresigned(`/leaves/me/${leave.id}/evidence`)}
            >
              Pratinjau
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
