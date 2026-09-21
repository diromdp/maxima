import {
  Calendar03Icon,
  GraduationCapIcon,
  Route01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { requireSession } from "@/src/lib/auth/session"
import { formatDate, formatDateLong, formatPercent } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { DOCUMENT_GROUPS } from "../documents/documents"
import {
  nextDueDate,
  nextInstallmentNumber,
  paidPercent,
  priceAfterPromo,
  SERVICES,
  shortfallAmount,
  totalPaid,
  TRANSACTIONS,
} from "../payments/payments"
import {
  ATTENDANCE,
  CHAPTERS_PER_LEVEL,
  CLASS_AVERAGE,
  CLASSROOM,
  deriveAttendance,
  deriveCurrentLevel,
  deriveCurrentStep,
  deriveDocuments,
  deriveHistory,
  deriveIdentity,
  deriveLevelLabel,
  deriveServices,
  deriveServiceSummary,
  HAS_VERTRAG,
  LEVELS,
  showAttendance,
  STUDENT,
  type LevelStatus,
  type StudentStatus,
} from "./dashboard"

const BADGE: Readonly<Record<"Lunas" | "Menunggu" | LevelStatus, string>> = {
  Lunas: "badge-beres",
  Lulus: "badge-beres",
  Menunggu: "badge-berjalan",
  Berjalan: "badge-berjalan",
  "Belum mulai": "badge-terkunci",
}

const STATUS_BADGE: Readonly<Record<StudentStatus, { label: string; tone: string }>> = {
  active: { label: "Aktif", tone: "badge-beres" },
  leave: { label: "Cuti", tone: "badge-berjalan" },
  alumni: { label: "Alumni", tone: "badge-terkunci" },
}

const STEP_TONE = { tindakan: "danger", berjalan: "warning", beres: "success" } as const
const STEP_BUTTON = {
  tindakan: "btn-danger",
  berjalan: "btn-primary",
  beres: "btn-primary",
} as const

const HISTORY_LIMIT = 4

function StatCard({
  label,
  icon,
  value,
  valueClass,
  caption,
}: {
  label: string
  icon: typeof Wallet01Icon
  value: string
  valueClass?: string
  caption: string
}) {
  return (
    <div className="card stack stack-sm">
      <div className="row row-between">
        <span className="label text-muted">{label}</span>
        <span className="text-faint">
          <HugeiconsIcon icon={icon} size={18} strokeWidth={1.5} />
        </span>
      </div>
      <span className={`h4 tabular ${valueClass ?? ""}`}>{value}</span>
      <span className="caption text-muted">{caption}</span>
    </div>
  )
}

function CardHead({ title, aside }: { title: string; aside?: React.ReactNode }) {
  return (
    <div className="row row-between">
      <h2 className="h5">{title}</h2>
      {aside}
    </div>
  )
}

export default async function DashboardPage() {
  const session = await requireSession("student")

  const paid = totalPaid(TRANSACTIONS)
  const remaining = shortfallAmount(TRANSACTIONS)
  const step = deriveCurrentStep(STUDENT, TRANSACTIONS, SERVICES, formatDateLong)
  const services = deriveServices(SERVICES, paid, HAS_VERTRAG)
  const summary = deriveServiceSummary(services)
  const currentLevel = deriveCurrentLevel(LEVELS)
  const history = deriveHistory(TRANSACTIONS, HISTORY_LIMIT)
  const documents = deriveDocuments(DOCUMENT_GROUPS, HAS_VERTRAG)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Halo, ${session.name}`}
        badge={
          <span className={`badge ${STATUS_BADGE[STUDENT.status].tone}`}>
            {STATUS_BADGE[STUDENT.status].label}
          </span>
        }
        subtitle={deriveIdentity(STUDENT)}
      />

      <Notice
        tone={STEP_TONE[step.tone]}
        actions={
          step.action && (
            <Link className={`btn ${STEP_BUTTON[step.tone]}`} href={step.action.href}>
              {step.action.label}
            </Link>
          )
        }
      >
        <div className="stack" style={{ gap: 2 }}>
          <span className="label">{step.label}</span>
          <strong className="title">{step.title}</strong>
          <span className="body-sm">{step.detail}</span>
        </div>
      </Notice>

      <div className="grid-4">
        <StatCard
          label="Sisa pembayaran"
          icon={Wallet01Icon}
          value={formatMoney(remaining)}
          valueClass="text-danger"
          caption={`${paidPercent(TRANSACTIONS)}% dari ${formatMoney(priceAfterPromo())} terbayar`}
        />

        <StatCard
          label="Level saat ini"
          icon={GraduationCapIcon}
          value={currentLevel?.level ?? "Belum mulai"}
          caption={
            currentLevel?.chapter
              ? `Bab ${currentLevel.chapter} dari ${CHAPTERS_PER_LEVEL}`
              : "Belum ada bab berjalan"
          }
        />

        {showAttendance(STUDENT) && (
          <StatCard
            label="Kehadiran"
            icon={Calendar03Icon}
            value={formatPercent(deriveAttendance(ATTENDANCE))}
            caption={`${ATTENDANCE.present} dari ${ATTENDANCE.expected} sesi, rata-rata kelas ${CLASS_AVERAGE}%`}
          />
        )}

        <StatCard
          label="Layanan terbuka"
          icon={Route01Icon}
          value={`${summary.unlocked} dari ${summary.total}`}
          caption={
            summary.pending > 0
              ? `${summary.pending} lagi terbuka lewat pembayaran`
              : "Seluruh layanan berambang sudah terbuka"
          }
        />
      </div>

      <div className="grid-main-aside">
        <div className="stack stack-lg">
          <section className="card stack">
            <CardHead
              title="Progres Pembelajaran"
              aside={
                <Link className="link" href="/portal/learning">
                  Lihat rapor
                </Link>
              }
            />

            <div className="level-grid">
              {LEVELS.map((l) => (
                <div
                  key={l.level}
                  className={`level-card level-card-${BADGE[l.status].replace("badge-", "")}`}
                >
                  <span className="h6 text-ink">{l.level}</span>
                  <span className="caption">{deriveLevelLabel(l)}</span>
                </div>
              ))}
            </div>

            {CLASSROOM ? (
              <p className="body-sm text-muted">
                {CLASSROOM.name} · {CLASSROOM.schedule} · {CLASSROOM.teacher}
              </p>
            ) : (
              <Notice tone="warning">
                Classroom Anda belum terisi. Hubungi PIC cabang untuk melengkapinya.
              </Notice>
            )}
          </section>

          <section className="card stack">
            <CardHead
              title="Riwayat Pembayaran"
              aside={
                <Link className="link" href="/portal/payments">
                  Lihat semua
                </Link>
              }
            />

            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Tanggal</th>
                    <th scope="col">Keterangan</th>
                    <th scope="col" className="numeric">
                      Nominal
                    </th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((r) => (
                    <tr key={r.id}>
                      <td>{formatDate(r.date)}</td>
                      <td>{r.description}</td>
                      <td className="numeric tabular">{formatMoney(r.amount)}</td>
                      <td>
                        <span className={`badge ${BADGE[r.status]}`}>{r.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <span className="caption text-muted">
              Angsuran ke-{nextInstallmentNumber(TRANSACTIONS)} jatuh tempo{" "}
              {formatDate(nextDueDate(TRANSACTIONS))}.
            </span>
          </section>
        </div>

        <div className="stack stack-lg">
          <section className="card stack">
            <div className="stack" style={{ gap: 2 }}>
              <CardHead
                title="Progres 9 Layanan"
                aside={
                  <Link className="link" href="/portal/admin-progress">
                    Lihat detail
                  </Link>
                }
              />
              <span className="caption text-muted">
                Terbuka otomatis mengikuti total pembayaran Anda.
              </span>
            </div>

            <div className="list-rows">
              {services.map((s) => (
                <div key={s.name} className="row row-between">
                  <span className="body-sm">{s.name}</span>
                  {s.unlocked ? (
                    <span className="badge badge-terbuka">Terbuka</span>
                  ) : s.remaining ? (
                    <span className="body-sm tabular text-danger">
                      kurang {formatMoney(s.remaining)}
                    </span>
                  ) : (
                    <span className="caption text-muted">setelah Dapat Vertrag</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="card stack">
            <CardHead
              title="Dokumen Saya"
              aside={
                <Link className="link" href="/portal/documents">
                  Buka
                </Link>
              }
            />

            <div className="list-rows">
              {documents.map((d) => (
                <Link
                  key={d.id}
                  href={`/portal/documents#${d.id}`}
                  className="row row-between text-inherit no-underline"
                >
                  <span className="body-sm">{d.name}</span>
                  <span className={`badge badge-${d.tone}`}>{d.description}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
