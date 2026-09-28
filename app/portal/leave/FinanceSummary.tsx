"use client"

import Link from "next/link"

import type { LeaveDetail } from "@/src/entities/leave/schema"
import { Notice } from "@/src/components/ui/Notice"
import { previewPresigned } from "@/src/lib/api/download"
import { formatDateLong } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

import { CardHeader } from "./CardHeader"
import { SpecList } from "./SpecList"
import { UploadProofButton } from "./UploadProofButton"

export function FinanceSummary({ leave }: { leave: LeaveDetail }) {
  const { paidIdr, minimumIdr, amountIdr, deadline, note } = leave.finance
  const due = idr(amountIdr ?? 0)
  const deadlineLabel = deadline ? `${formatDateLong(deadline)} pukul 23.59 WIB` : "-"
  const proofRejection = leave.hasProof
    ? null
    : leave.timeline.findLast((event) => event.kind === "payment-set")?.note

  return (
    <section className="card stack">
      <CardHeader
        title="Ringkasan Perhitungan Finance"
        note={leave.hasProof ? "menunggu verifikasi Finance" : "selesaikan sebelum batas waktu"}
      />

      {proofRejection && (
        <Notice tone="danger">
          Bukti pembayaran sebelumnya ditolak Finance: {proofRejection} Unggah bukti yang benar
          sebelum {deadlineLabel}.
        </Notice>
      )}

      <div className="row row-between row-wrap" style={{ gap: 16 }}>
        <div className="stack" style={{ gap: 2 }}>
          <span className="spec-name">Kekurangan yang harus dibayar</span>
          <span className={`h4 tabular${leave.hasProof ? "" : " text-danger"}`}>
            {formatMoney(due)}
          </span>
          <span className="caption text-muted">Batas pembayaran {deadlineLabel}</span>
        </div>
        {!leave.hasProof && <UploadProofButton leave={leave} />}
      </div>

      <div className="grid-2">
        <SpecList items={[{ name: "Total Pembayaran", value: formatMoney(idr(paidIdr)) }]} />
        <SpecList
          items={[{ name: "Cicilan Minimum sebelum cuti", value: formatMoney(idr(minimumIdr)) }]}
        />
      </div>

      {note && <SpecList items={[{ name: "Catatan Finance", value: note }]} />}

      {leave.hasProof ? (
        <div className="row-soft">
          <span className="body-sm">Bukti Pembayaran · {formatMoney(due)}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => void previewPresigned(`/leaves/me/${leave.id}/proof`)}
          >
            Pratinjau
          </button>
        </div>
      ) : (
        <div className="card-soft card-tight row row-between row-wrap" style={{ gap: 12 }}>
          <span className="body-sm text-muted">
            Bayar lewat halaman Pembayaran. Pengajuan maju sendiri begitu pembayarannya berlaku;
            unggah bukti hanya bila Anda membayar di luar portal.
          </span>
          <Link
            href={`/portal/payments?leave=${encodeURIComponent(leave.id)}`}
            className="btn btn-secondary btn-sm"
          >
            Bayar Sekarang
          </Link>
        </div>
      )}
    </section>
  )
}
