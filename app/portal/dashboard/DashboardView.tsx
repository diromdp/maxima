"use client"

import {
  Calendar03Icon,
  GraduationCapIcon,
  Route01Icon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"
import Link from "next/link"

import { DocumentGroupList } from "@/src/components/data/DocumentGroupList"
import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { portalDashboardQuery } from "@/src/entities/portal/queries"
import {
  type BadgeTone,
  type LevelState,
  type NextStep,
  nextPaymentLabelOf,
  paymentLabelOf,
  type PortalDashboard,
  type PortalLevelCard,
  type PortalPaymentRow,
  PORTAL_STATUS_TONE,
  RUPIAH_STATUS,
  type ServiceStatus,
} from "@/src/entities/portal/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate, formatDateLong, formatMonthYear } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

const CHAPTERS_PER_LEVEL = 12

const LEVEL_TONE: Readonly<Record<LevelState, BadgeTone>> = {
  Lulus: "beres",
  Berjalan: "berjalan",
  "Sudah diikuti": "terkunci",
  Terkunci: "terkunci",
  "Belum mulai": "terkunci",
}

const SERVICE_TONE: Readonly<Record<Exclude<ServiceStatus, "Belum Terbuka">, BadgeTone>> = {
  Terbuka: "terbuka",
  Dikerjakan: "berjalan",
  Selesai: "beres",
}

const NOTICE_TONE = { tindakan: "danger", berjalan: "warning", beres: "success" } as const
const STEP_BUTTON = {
  tindakan: "btn-danger",
  berjalan: "btn-primary",
  beres: "btn-primary",
} as const

const DECIMAL = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 })
const percentText = (value: number) => `${DECIMAL.format(value)}%`
const rupiah = (amount: number) => formatMoney(idr(amount))

type Step = {
  tone: keyof typeof NOTICE_TONE
  label: string
  title: string
  detail: string
  action: { label: string; href: string } | null
}

function stepOf(step: NextStep): Step | null {
  const current = "Langkah Anda sekarang"
  switch (step.kind) {
    case "activate":
      return {
        tone: "tindakan",
        label: current,
        title: "Portal Anda terbuka penuh setelah DP berlaku",
        detail: step.reason,
        action: { label: "Buka Pembayaran", href: "/portal/payments" },
      }
    case "leave":
      return {
        tone: "berjalan",
        label: "Anda sedang cuti",
        title: `Masa cuti mulai ${formatDateLong(step.startsOn)}`,
        detail: `Rencana masuk kembali ${formatDateLong(step.returnsOn)}. Tagihan dan pengingat berhenti selama masa cuti; pembayaran yang masuk tetap membuka layanan.`,
        action: { label: "Lihat Riwayat Cuti", href: "/portal/leave" },
      }
    case "alumni": {
      const placed = step.company !== null
      return {
        tone: "beres",
        label: "Penempatan Anda",
        title: placed
          ? [step.company, step.city].filter(Boolean).join(" · ")
          : "Data penempatan belum lengkap",
        detail: placed
          ? `${step.school ? `Sekolah ${step.school}. ` : ""}Berkas keberangkatan Anda tersimpan di Pemberkasan Alumni.`
          : "Lengkapi data penempatan Anda di Pemberkasan Alumni supaya berkasnya dapat diverifikasi.",
        action: { label: "Buka Pemberkasan Alumni", href: "/portal/alumni-files" },
      }
    }
    case "pay":
      return {
        tone: "tindakan",
        label: current,
        title: step.dueOn
          ? `Bayar ${nextPaymentLabelOf(step.installment)} sebelum ${formatDateLong(step.dueOn)}`
          : `Bayar ${nextPaymentLabelOf(step.installment)}`,
        detail: step.opensService
          ? `Setelah pembayaran masuk, layanan ${step.opensService} terbuka otomatis.`
          : "Setelah pembayaran masuk, sisa tagihan paket Anda ikut berkurang.",
        action: { label: "Bayar Sekarang", href: "/portal/payments" },
      }
    case "upcoming":
      return null
    case "none":
      return {
        tone: "beres",
        label: current,
        title: "Pembayaran Anda sudah lunas",
        detail: "Seluruh layanan pada paket Anda sudah terbuka.",
        action: null,
      }
  }
}

function identityOf({ head }: PortalDashboard): string {
  return [
    head.student.nis && `NIS ${head.student.nis}`,
    head.contract?.package.name,
    head.branch?.name,
    head.contract && `Masuk ${formatMonthYear(head.contract.enrolledAt)}`,
    head.pic && `PIC ${head.pic}`,
  ]
    .filter(Boolean)
    .join(" · ")
}

function levelCaption(card: PortalLevelCard): string {
  if (card.state === "Lulus" && card.finalScore !== null) return `Lulus · nilai ${card.finalScore}`
  if (card.state === "Berjalan" && card.chapter !== null) return `Berjalan · bab ${card.chapter}`
  if (card.state === "Terkunci" && card.shortfallIdr !== null) {
    return `Terkunci · kurang ${rupiah(card.shortfallIdr)}`
  }
  return card.state
}

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

function StepPanel({ step }: { step: Step }) {
  return (
    <Notice
      tone={NOTICE_TONE[step.tone]}
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
  )
}

function NumberCards({
  numbers,
  showsAttendance,
}: {
  numbers: NonNullable<PortalDashboard["numbers"]>
  showsAttendance: boolean
}) {
  const pending = numbers.totalServices - numbers.openServices
  return (
    <div className="grid-4">
      <StatCard
        label="Sisa pembayaran"
        icon={Wallet01Icon}
        value={rupiah(numbers.remainingIdr)}
        valueClass={numbers.remainingIdr > 0 ? "text-danger" : undefined}
        caption={`dari ${rupiah(numbers.finalPriceIdr)}`}
      />

      <StatCard
        label="Level saat ini"
        icon={GraduationCapIcon}
        value={numbers.level?.name ?? "Belum mulai"}
        caption={
          numbers.level?.chapter
            ? `Bab ${numbers.level.chapter} dari ${CHAPTERS_PER_LEVEL}`
            : "Belum ada bab berjalan"
        }
      />

      {showsAttendance && (
        <StatCard
          label="Kehadiran"
          icon={Calendar03Icon}
          value={numbers.attendancePercent === null ? DASH : percentText(numbers.attendancePercent)}
          caption={
            numbers.attendanceThisMonthPercent === null
              ? "Belum ada pertemuan bulan ini"
              : `Bulan ini ${percentText(numbers.attendanceThisMonthPercent)}`
          }
        />
      )}

      <StatCard
        label="Layanan terbuka"
        icon={Route01Icon}
        value={`${numbers.openServices} dari ${numbers.totalServices}`}
        caption={
          pending > 0 ? `${pending} menunggu pembayaran` : "Seluruh layanan paket sudah terbuka"
        }
      />
    </div>
  )
}

function LearningCard({ learning }: { learning: NonNullable<PortalDashboard["learning"]> }) {
  return (
    <section className="card stack">
      <CardHead
        title="Progres Pembelajaran"
        aside={
          <Link className="link" href="/portal/learning">
            Lihat rapor
          </Link>
        }
      />

      {learning.levels.length > 0 ? (
        <div className="level-grid">
          {learning.levels.map((card) => (
            <div key={card.level.id} className={`level-card level-card-${LEVEL_TONE[card.state]}`}>
              <span className="h6 text-ink">{card.level.name}</span>
              <span className="caption">{levelCaption(card)}</span>
            </div>
          ))}
        </div>
      ) : (
        <span className="body-sm text-muted">Paket Anda belum memuat level bahasa.</span>
      )}

      {learning.class ? (
        <p className="body-sm text-muted">
          {[learning.class.name, learning.class.schedule, learning.class.teacher]
            .filter(Boolean)
            .join(" · ")}
        </p>
      ) : (
        <Notice tone="warning">
          Classroom Anda belum terisi. Hubungi PIC cabang untuk melengkapinya.
        </Notice>
      )}
    </section>
  )
}

function PaymentsCard({
  rows,
  nextStep,
}: {
  rows: readonly PortalPaymentRow[]
  nextStep: NextStep
}) {
  return (
    <section className="card stack">
      <CardHead
        title="Riwayat Pembayaran"
        aside={
          <Link className="link" href="/portal/payments">
            Lihat semua
          </Link>
        }
      />

      {rows.length === 0 ? (
        <span className="body-sm text-muted">Belum ada pembayaran tercatat.</span>
      ) : (
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
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{formatDate(row.paidOn)}</td>
                  <td>{paymentLabelOf(row)}</td>
                  <td className="numeric tabular">{rupiah(row.amount)}</td>
                  <td>
                    <span className={`badge badge-${RUPIAH_STATUS[row.status].tone}`}>
                      {RUPIAH_STATUS[row.status].label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(nextStep.kind === "pay" || nextStep.kind === "upcoming") && nextStep.dueOn && (
        <span className="caption text-muted">
          {nextPaymentLabelOf(nextStep.installment)} jatuh tempo {formatDate(nextStep.dueOn)}.
        </span>
      )}
    </section>
  )
}

function ServicesCard({ services }: { services: PortalDashboard["services"] }) {
  return (
    <section className="card stack">
      <div className="stack" style={{ gap: 2 }}>
        <CardHead
          title={`Progres ${services.length} Layanan`}
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

      {services.length === 0 ? (
        <span className="body-sm text-muted">Paket Anda belum memuat layanan.</span>
      ) : (
        <div className="list-rows">
          {services.map((service) => (
            <div key={service.code} className="row row-between">
              <span className="body-sm">{service.name}</span>
              {service.status === "Belum Terbuka" ? (
                <span className="body-sm tabular text-danger">
                  kurang {rupiah(service.shortfallIdr)}
                </span>
              ) : (
                <span className={`badge badge-${SERVICE_TONE[service.status]}`}>
                  {service.status}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function DocumentsCard({
  groups,
  isOnLeave,
}: {
  groups: NonNullable<PortalDashboard["documents"]>
  isOnLeave: boolean
}) {
  return (
    <section className="card stack">
      <CardHead
        title="Dokumen Saya"
        aside={<span className="caption text-muted">{groups.length} kelompok</span>}
      />

      <DocumentGroupList groups={groups} />

      {isOnLeave ? (
        <>
          <button type="button" className="btn btn-secondary btn-block" disabled>
            Unggah Dokumen
          </button>
          <span className="caption text-muted">
            Unggah dokumen dibuka lagi setelah masa cuti Anda selesai.
          </span>
        </>
      ) : (
        <Link className="btn btn-secondary btn-block" href="/portal/documents">
          Unggah Dokumen
        </Link>
      )}
    </section>
  )
}

export function DashboardView() {
  const dashboard = useRead(portalDashboardQuery())

  if (dashboard.isError) {
    return <QueryError message={dashboard.error.message} onRetry={() => void dashboard.refetch()} />
  }
  if (dashboard.isPending) return <DashboardSkeleton />

  const view = dashboard.data
  const { student } = view.head
  const isActivated = view.numbers !== null
  const step = stepOf(view.nextStep)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Halo, ${student.name}`}
        badge={
          <span className={`badge badge-${PORTAL_STATUS_TONE[student.status]}`}>
            {student.status}
          </span>
        }
        subtitle={identityOf(view)}
      />

      {step && <StepPanel step={step} />}

      {view.numbers && (
        <NumberCards numbers={view.numbers} showsAttendance={student.status !== "Cuti"} />
      )}

      {isActivated ? (
        <div className="grid-main-aside">
          <div className="stack stack-lg">
            {view.learning && <LearningCard learning={view.learning} />}
            <PaymentsCard rows={view.lastPayments} nextStep={view.nextStep} />
          </div>

          <div className="stack stack-lg">
            <ServicesCard services={view.services} />
            {view.documents && (
              <DocumentsCard groups={view.documents} isOnLeave={student.status === "Cuti"} />
            )}
          </div>
        </div>
      ) : (
        <PaymentsCard rows={view.lastPayments} nextStep={view.nextStep} />
      )}
    </div>
  )
}

const LEVEL_SLOTS = 4
const HISTORY_SLOTS = 4
const SERVICE_SLOTS = 9
const DOCUMENT_SLOTS = 4

const slots = (count: number, height: number) =>
  Array.from({ length: count }, (_, index) => <Skeleton key={index} height={height} radius="sm" />)

export function DashboardSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>

      <div className="stack stack-sm" aria-hidden>
        <Skeleton height={32} width="40%" radius="xl" />
        <Skeleton height={16} width="70%" radius="xl" />
      </div>

      <Skeleton height={96} radius="sm" aria-hidden />

      <div className="grid-4" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={104} radius="md" />
        ))}
      </div>

      <div className="grid-main-aside" aria-hidden>
        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <div className="grid-4">
              {Array.from({ length: LEVEL_SLOTS }, (_, index) => (
                <Skeleton key={index} height={72} radius="md" />
              ))}
            </div>
            <Skeleton height={16} width="80%" radius="xl" />
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <Skeleton height={36} radius="sm" />
            {slots(HISTORY_SLOTS, 44)}
          </section>
        </div>

        <div className="stack stack-lg">
          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            <Skeleton height={16} width="70%" radius="xl" />
            {slots(SERVICE_SLOTS, 28)}
          </section>

          <section className="card stack stack-sm">
            <Skeleton height={24} width="50%" radius="xl" />
            {slots(DOCUMENT_SLOTS, 28)}
          </section>
        </div>
      </div>
    </div>
  )
}
