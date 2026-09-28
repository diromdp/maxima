"use client"

import { Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { ownLeavesQuery } from "@/src/entities/leave/queries"
import {
  leaveMonths,
  type OwnLeaveRow,
  type OwnLeaves,
  STAGES,
  STATE_BADGE,
} from "@/src/entities/leave/schema"
import { useRead } from "@/src/lib/api/use-read"
import type { PortalStatus } from "@/src/lib/auth/session"
import { formatDate } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

import { CardHeader } from "./CardHeader"
import { applyBlockOf, noteOf, paymentOf } from "./leave"

const PAGE_SUBTITLE = "Semua riwayat pengajuan cuti, termasuk pembayaran dan hasil verifikasi Anda."
const IN_PROGRESS: readonly OwnLeaveRow["state"][] = [
  "awaiting-finance",
  "payment-set",
  "awaiting-payment-check",
  "processing",
]

function ApplyButton({ block }: { block: string | null }) {
  if (!block) {
    return (
      <Link className="btn btn-primary" href="/portal/leave/new">
        Ajukan Cuti
      </Link>
    )
  }
  return (
    <div className="stack" style={{ gap: 4, alignItems: "flex-end" }}>
      <button type="button" className="btn btn-primary" disabled>
        Ajukan Cuti
      </button>
      <span className="caption text-muted" style={{ maxWidth: 320, textAlign: "right" }}>
        {block}
      </span>
    </div>
  )
}

function HistoryCounts({ history }: { history: OwnLeaves }) {
  const active = history.data.find((row) => IN_PROGRESS.includes(row.state))
  const cards = [
    { label: "Total Pengajuan", value: history.summary.total, caption: "sepanjang masa belajar" },
    { label: "Disetujui", value: history.summary.approved, caption: "cuti hanya bisa satu kali" },
    {
      label: "Dalam Proses",
      value: history.summary.inProgress,
      caption: active ? STATE_BADGE[active.state].label : "tidak ada yang berjalan",
    },
    {
      label: "Ditolak",
      value: history.summary.rejected,
      caption: "termasuk yang gugur, tetap tersimpan",
    },
  ]

  return (
    <div className="grid-4">
      {cards.map(({ label, value, caption }) => (
        <section key={label} className="card stack stack-sm">
          <span className="label text-muted">{label}</span>
          <span className="h4 tabular">{value}</span>
          <span className="caption text-muted">{caption}</span>
        </section>
      ))}
    </div>
  )
}

function ApplicationList({ rows, block }: { rows: readonly OwnLeaveRow[]; block: string | null }) {
  if (rows.length === 0) {
    return (
      <section className="card stack items-center py-10 text-center">
        <span className="title">Belum ada pengajuan cuti</span>
        <span className="body-sm text-muted">
          Cuti hanya bisa diambil satu kali dan maksimal 6 bulan. Ajukan minimal 1 bulan sebelum
          tanggal mulai.
        </span>
        <ApplyButton block={block} />
      </section>
    )
  }

  return (
    <section className="card stack">
      <CardHeader title="Daftar Pengajuan" note={`${rows.length} pengajuan`} />

      <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {rows.map((row) => {
          const badge = STATE_BADGE[row.state]
          const payment = paymentOf(row)
          const note = noteOf(row)

          return (
            <li key={row.id} className="stack">
              <div className="row row-between row-wrap">
                <div className="row row-wrap" style={{ gap: 8 }}>
                  <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
                  <span className="caption text-muted">
                    {row.number} · diajukan {formatDate(row.submittedAt)}
                  </span>
                </div>
                <Link className="btn btn-secondary btn-sm" href={`/portal/leave/${row.id}`}>
                  Lihat Detail
                </Link>
              </div>

              <dl className="grid-3" style={{ margin: 0 }}>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Periode cuti</dt>
                  <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                    {formatDate(row.startsOn)} - {formatDate(row.returnsOn)}
                    <span className="text-muted" style={{ fontWeight: 400 }}>
                      {" "}
                      · {leaveMonths(row.startsOn, row.returnsOn)} bulan
                    </span>
                  </dd>
                </div>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Pembayaran</dt>
                  <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                    {payment.amountIdr !== null && (
                      <span className="tabular">{formatMoney(idr(payment.amountIdr))} · </span>
                    )}
                    <span className="text-muted" style={{ fontWeight: 400 }}>
                      {payment.label}
                    </span>
                  </dd>
                </div>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Keterangan</dt>
                  <dd
                    className={`body-sm${note.isAlert ? " text-tindakan" : ""}`}
                    style={{ margin: 0 }}
                  >
                    {note.text}
                  </dd>
                </div>
              </dl>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function StageReminder() {
  return (
    <section className="card stack">
      <CardHeader title="Tahapan Pengajuan Cuti" note="tujuh langkah, urut" />
      <ol className="journey" aria-label="Tahapan pengajuan cuti">
        {STAGES.map((label, index) => (
          <li key={label} className="journey-node">
            <span className="journey-dot" aria-hidden>
              {index + 1}
            </span>
            <span className="body-sm" style={{ fontWeight: 600 }}>
              {label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  )
}

export function LeaveHistory({ status }: { status: PortalStatus }) {
  const history = useRead(ownLeavesQuery())
  const block = history.data ? applyBlockOf(history.data.data, status) : null

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Riwayat Cuti"
        subtitle={PAGE_SUBTITLE}
        actions={history.data && <ApplyButton block={block} />}
      />

      {history.isError ? (
        <QueryError message={history.error.message} onRetry={() => void history.refetch()} />
      ) : history.isPending ? (
        <LeaveHistorySkeleton />
      ) : (
        <>
          <HistoryCounts history={history.data} />
          <ApplicationList rows={history.data.data} block={block} />
          <StageReminder />
        </>
      )}
    </div>
  )
}

export function LeaveHistorySkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="grid-4" aria-hidden>
        {[0, 1, 2, 3].map((card) => (
          <Skeleton key={card} height={112} radius="md" />
        ))}
      </div>
      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="30%" radius="xl" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} height={88} radius="sm" />
        ))}
      </section>
    </div>
  )
}
