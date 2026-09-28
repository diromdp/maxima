import Link from "next/link"

import { Notice } from "@/src/components/ui/Notice"
import { type LeaveDetail, STAGES } from "@/src/entities/leave/schema"
import { formatDateLong, formatDateTime } from "@/src/lib/format"

import { CardHeader } from "./CardHeader"
import { SpecList } from "./SpecList"

export function RejectionCard({
  leave,
  applyBlock,
}: {
  leave: LeaveDetail
  applyBlock: string | null
}) {
  const isExpired = leave.state === "expired"
  const decidedAt = leave.timeline.findLast((event) => event.kind === "rejected")?.at

  return (
    <section className="card stack">
      <CardHeader title={isExpired ? "Pengajuan Gugur" : "Alasan Penolakan"} />

      {isExpired ? (
        <Notice tone="danger">
          Batas pembayaran{" "}
          {leave.finance.deadline
            ? `${formatDateLong(leave.finance.deadline)} pukul 23.59 WIB`
            : ""}{" "}
          terlewat tanpa bukti pembayaran, jadi pengajuan ini gugur. Ajukan ulang bila masih perlu
          cuti.
        </Notice>
      ) : (
        <>
          <SpecList
            items={[
              { name: "Tahap Penolakan", value: STAGES[leave.stage - 1] ?? "-" },
              { name: "Diputuskan pada", value: decidedAt ? formatDateTime(decidedAt) : "-" },
            ]}
          />
          <Notice tone="danger">
            {leave.rejectReason}
            {leave.reapplyFrom &&
              ` Dapat diajukan ulang mulai ${formatDateLong(leave.reapplyFrom)}.`}
          </Notice>
        </>
      )}

      <div className="row row-wrap" style={{ gap: 12 }}>
        {applyBlock ? (
          <>
            <button type="button" className="btn btn-primary" disabled>
              Ajukan Kembali
            </button>
            <span className="caption text-muted">{applyBlock}</span>
          </>
        ) : (
          <Link className="btn btn-primary" href="/portal/leave/new">
            Ajukan Kembali
          </Link>
        )}
      </div>
    </section>
  )
}
