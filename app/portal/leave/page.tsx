import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { CardHeader } from "./CardHeader"
import {
  activeApplication,
  APPLICATIONS,
  durationLabel,
  historyBadge,
  historyCounts,
  historyNote,
  paymentSummary,
  periodLabel,
  STAGES,
} from "./leave"

const PAGE_SUBTITLE = "Semua riwayat pengajuan cuti, termasuk pembayaran dan hasil verifikasi Anda."

function HistoryCounts() {
  const counts = historyCounts(APPLICATIONS)
  const active = activeApplication(APPLICATIONS)

  const cards = [
    { label: "Total Pengajuan", value: counts.total, caption: "sepanjang masa belajar" },
    { label: "Disetujui", value: counts.approved, caption: "cuti hanya bisa satu kali" },
    {
      label: "Dalam Proses",
      value: counts.inProgress,
      caption: active ? historyBadge(active.state).label : "tidak ada yang berjalan",
    },
    { label: "Ditolak", value: counts.rejected, caption: "tetap tersimpan sebagai riwayat" },
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

function ApplicationList() {
  if (APPLICATIONS.length === 0) {
    return (
      <section className="card stack items-center py-10 text-center">
        <span className="title">Belum ada pengajuan cuti</span>
        <span className="body-sm text-muted">
          Cuti hanya bisa diambil satu kali dan maksimal 6 bulan. Ajukan minimal 1 bulan sebelum
          tanggal mulai.
        </span>
        <Link className="btn btn-primary" href="/portal/leave/new">
          Ajukan Cuti
        </Link>
      </section>
    )
  }

  return (
    <section className="card stack">
      <CardHeader title="Daftar Pengajuan" note={`${APPLICATIONS.length} pengajuan`} />

      <ul className="list-rows" style={{ margin: 0, padding: 0, listStyle: "none" }}>
        {APPLICATIONS.map((application) => {
          const badge = historyBadge(application.state)
          const payment = paymentSummary(application)
          const note = historyNote(application)

          return (
            <li key={application.id} className="stack">
              <div className="row row-between row-wrap">
                <div className="row row-wrap" style={{ gap: 8 }}>
                  <span className={`badge badge-${badge.tone}`}>{badge.label}</span>
                  <span className="caption text-muted">
                    Diajukan {formatDate(application.submittedAt)}
                  </span>
                </div>
                <Link className="btn btn-secondary btn-sm" href={`/portal/leave/${application.id}`}>
                  Lihat Detail
                </Link>
              </div>

              <dl className="grid-3" style={{ margin: 0 }}>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Periode cuti</dt>
                  <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                    {periodLabel(application)}
                    <span className="text-muted" style={{ fontWeight: 400 }}>
                      {" "}
                      · {durationLabel(application)}
                    </span>
                  </dd>
                </div>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Pembayaran</dt>
                  <dd className="body-sm" style={{ margin: 0, fontWeight: 600 }}>
                    {payment.amount ? (
                      <>
                        <span className="tabular">{formatMoney(payment.amount)}</span>
                        <span className="text-muted" style={{ fontWeight: 400 }}>
                          {" "}
                          · {payment.label}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted" style={{ fontWeight: 400 }}>
                        {payment.label}
                      </span>
                    )}
                  </dd>
                </div>
                <div className="stack" style={{ gap: 2 }}>
                  <dt className="spec-name">Keterangan</dt>
                  <dd
                    className={`body-sm${note.tone ? ` text-${note.tone}` : ""}`}
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

export default async function LeaveHistoryPage() {
  await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Riwayat Cuti"
        subtitle={PAGE_SUBTITLE}
        actions={
          <Link className="btn btn-primary" href="/portal/leave/new">
            Ajukan Cuti
          </Link>
        }
      />

      <HistoryCounts />
      <ApplicationList />
      <StageReminder />
    </div>
  )
}
