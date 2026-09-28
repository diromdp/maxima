"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Skeleton } from "@mantine/core"
import Link from "next/link"
import type { ReactNode } from "react"

import { Busy, PanelSkeleton, StatCardsSkeleton } from "@/src/components/data/Busy"
import { QueryError } from "@/src/components/data/QueryError"
import { homeQuery } from "@/src/entities/home/queries"
import type {
  FinanceLeadStats,
  FinanceStaffStats,
  Funnel,
  FunnelStage,
  HomeView,
  QueueItem,
  StudentStatus,
  Tally,
} from "@/src/entities/home/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"

const STUDENTS = "/staff/students"
const CLASSES = "/staff/classes"
const INVOICES = "/staff/invoices"

const CARD_LINK = { color: "inherit", textDecoration: "none" } as const

type BadgeTone = "beres" | "berjalan" | "tindakan" | "terkunci"

type StatCard = {
  readonly label: string
  readonly value: string
  readonly caption: string
  readonly href?: string
  readonly badge?: { readonly tone: BadgeTone; readonly text: string }
}

const STATUS_BADGE: Readonly<
  Record<Exclude<StudentStatus, "Alumni">, { tone: BadgeTone; text: string }>
> = {
  Aktif: { tone: "beres", text: "Aktif" },
  Cuti: { tone: "berjalan", text: "Cuti" },
  "Mengundurkan Diri": { tone: "tindakan", text: "Mundur" },
  "Selesai Kursus": { tone: "terkunci", text: "Selesai" },
}

const STATUS_LABEL: Readonly<Record<Exclude<StudentStatus, "Alumni">, string>> = {
  Aktif: "Siswa Aktif",
  Cuti: "Siswa Cuti",
  "Mengundurkan Diri": "Mengundurkan Diri",
  "Selesai Kursus": "Selesai Kursus",
}

const STATUSES_BY_LAYOUT: Partial<
  Record<HomeView["layout"], readonly Exclude<StudentStatus, "Alumni">[]>
> = {
  admission: ["Aktif", "Cuti", "Mengundurkan Diri", "Selesai Kursus"],
  marketing: ["Aktif", "Cuti"],
  "marketing-lead": ["Aktif", "Cuti", "Mengundurkan Diri"],
}

const DECIMAL = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 })

const countText = (value: number | null) => (value === null ? DASH : String(value))
const percentText = (value: number | null) => (value === null ? DASH : `${DECIMAL.format(value)}%`)
const scoreText = (value: number | null) => (value === null ? DASH : DECIMAL.format(value))

function studentCards(view: HomeView): StatCard[] {
  const counts = view.students
  if (!counts) return []
  const statusCards = (STATUSES_BY_LAYOUT[view.layout] ?? []).map((status) => ({
    label: STATUS_LABEL[status],
    value: String(counts[status]),
    caption: "Lihat daftarnya di Siswa",
    href: `${STUDENTS}?status=${encodeURIComponent(status)}`,
    badge: STATUS_BADGE[status],
  }))
  if (view.layout !== "marketing") return statusCards
  return [
    {
      label: "Siswa Saya",
      value: String(counts.total),
      caption: "Lihat daftarnya di Siswa",
      href: STUDENTS,
    },
    ...statusCards,
  ]
}

function academicCards(view: HomeView): StatCard[] {
  const stats = view.academic
  if (!stats) return []
  if (view.layout === "teacher") {
    return [
      {
        label: "Kelas Saya",
        value: String(stats.classes),
        caption: "Kelas aktif yang Anda ajar",
        href: CLASSES,
      },
      {
        label: "Jumlah Siswa",
        value: String(stats.students),
        caption: "Anggota aktif di kelas Anda",
        href: CLASSES,
      },
    ]
  }
  return [
    { label: "Siswa", value: String(stats.students), caption: "Anggota aktif di kelas aktif" },
    { label: "Kelas", value: String(stats.classes), caption: "Kelas aktif", href: CLASSES },
    {
      label: "Pengajar Aktif",
      value: countText(stats.activeTeachers),
      caption: "Mengajar sedikitnya satu kelas",
    },
    {
      label: "Rata-rata Kehadiran",
      value: percentText(stats.averageAttendance),
      caption: "Seluruh kelas aktif",
    },
    {
      label: "Rata-rata Nilai",
      value: scoreText(stats.averageScore),
      caption: "Seluruh kelas aktif",
    },
  ]
}

function financeCards(view: HomeView): StatCard[] {
  const stats = view.finance
  if (!stats) return []
  if ("receivedThisMonthIdr" in stats) {
    const staff: FinanceStaffStats = stats
    return [
      {
        label: "Diterima Bulan Ini (Rp)",
        value: formatMoney(idr(staff.receivedThisMonthIdr)),
        caption: "Pembayaran berlaku bulan ini",
      },
      {
        label: "Diterima Bulan Ini (EUR)",
        value: formatMoney(eur(staff.receivedThisMonthEurCents)),
        caption: "Pembayaran berlaku bulan ini",
      },
      {
        label: "Kekurangan Cabang",
        value: formatMoney(idr(staff.overdueIdr)),
        caption: "Cicilan jatuh tempo yang belum dibayar",
        href: INVOICES,
      },
    ]
  }
  const lead: FinanceLeadStats = stats
  return [
    {
      label: "Tagihan (Rp)",
      value: formatMoney(idr(lead.billedIdr)),
      caption: "Harga akhir kontrak aktif",
    },
    {
      label: "Diterima (Rp)",
      value: formatMoney(idr(lead.receivedIdr)),
      caption: "Pembayaran berlaku",
    },
    {
      label: "Kekurangan (Rp)",
      value: formatMoney(idr(lead.remainingIdr)),
      caption: "Sisa bayar kontrak aktif",
      href: INVOICES,
    },
    {
      label: "Tagihan (EUR)",
      value: formatMoney(eur(lead.billedEurCents)),
      caption: "Harga akhir kontrak aktif",
    },
    {
      label: "Diterima (EUR)",
      value: formatMoney(eur(lead.receivedEurCents)),
      caption: "Pembayaran berlaku",
    },
    {
      label: "Kekurangan (EUR)",
      value: formatMoney(eur(lead.remainingEurCents)),
      caption: "Sisa bayar kontrak aktif",
      href: INVOICES,
    },
    { label: "Lunas", value: String(lead.paidOff), caption: "Kontrak tanpa sisa bayar" },
    {
      label: "Jatuh Tempo",
      value: String(lead.dueCount),
      caption: "Siswa dengan cicilan terlambat",
      href: INVOICES,
    },
  ]
}

function CardHead({
  title,
  caption,
  aside,
}: {
  title: string
  caption?: string
  aside?: ReactNode
}) {
  return (
    <div className="row row-between row-wrap">
      <div className="stack" style={{ gap: 2 }}>
        <h2 className="h5">{title}</h2>
        {caption && <span className="caption text-muted">{caption}</span>}
      </div>
      {aside}
    </div>
  )
}

function QueueCard({ queue }: { queue: readonly QueueItem[] }) {
  const pending = queue.reduce((sum, item) => sum + (item.count ?? 0), 0)
  return (
    <section className="card stack">
      <CardHead
        title="Antrian Pekerjaan Utama"
        caption="Tiap baris membuka halamannya langsung, bukan sekadar angka."
        aside={
          pending > 0 ? (
            <span className="badge badge-tindakan">{pending} perlu tindakan</span>
          ) : (
            <span className="badge badge-beres">Tidak ada yang menunggu</span>
          )
        }
      />
      <div className="stack stack-sm">
        {queue.map((item) => (
          <Link key={item.key} href={item.href} className="row-soft" style={CARD_LINK}>
            <div className="row" style={{ minWidth: 0 }}>
              <span className={`badge badge-${item.count ? "tindakan" : "beres"}-solid tabular`}>
                {countText(item.count)}
              </span>
              <span className="body-sm">{item.label}</span>
            </div>
            <span className="row link" style={{ gap: 4, flexShrink: 0 }}>
              <span className="hide-mobile">{item.linkLabel}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

const funnelHrefOf = (stage: FunnelStage) =>
  stage === "Prospek" ? "/staff/registrations" : `${STUDENTS}?stage=${encodeURIComponent(stage)}`

function FunnelCard({ funnel }: { funnel: Funnel }) {
  const largest = Math.max(1, ...funnel.stages.map((stage) => stage.count))
  return (
    <section className="card stack">
      <CardHead
        title="Angka Ringkas Pipeline"
        caption="Alur tahapan program penempatan Jerman. Satu siswa berada tepat di satu tahap."
        aside={<span className="pill tabular">Total {funnel.total} siswa</span>}
      />
      <div className="journey" style={{ gap: 12 }}>
        {funnel.stages.map(({ stage, count }) => (
          <Link key={stage} href={funnelHrefOf(stage)} className="level-card" style={CARD_LINK}>
            <span className="label text-muted">{stage}</span>
            <span className="h4 tabular">{count}</span>
            <div className="progress progress-info" aria-hidden>
              <div className="progress-fill" style={{ width: `${(count / largest) * 100}%` }} />
            </div>
            <span className="caption text-muted tabular">
              {funnel.total ? Math.round((count / funnel.total) * 100) : 0}% dari total
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function TallyList({ title, rows }: { title: string; rows: readonly Tally[] }) {
  return (
    <div className="stack stack-sm">
      <span className="label text-muted">{title}</span>
      {rows.length === 0 ? (
        <span className="body-sm text-muted">Belum ada siswa aktif.</span>
      ) : (
        rows.map((row) => (
          <div key={row.name} className="row-soft">
            <span className="body-sm">{row.name}</span>
            <span className="body-sm tabular">{row.count}</span>
          </div>
        ))
      )}
    </div>
  )
}

function SpreadCard({ spread }: { spread: NonNullable<HomeView["spread"]> }) {
  return (
    <section className="card stack">
      <CardHead
        title="Sebaran Siswa Aktif"
        caption="Per cabang belajar dan per program kontrak aktif."
      />
      <div className="grid-2">
        <TallyList title="Cabang" rows={spread.branches} />
        <TallyList title="Program" rows={spread.programs} />
      </div>
    </section>
  )
}

function StatGrid({ cards }: { cards: readonly StatCard[] }) {
  return (
    <div className="grid-4">
      {cards.map((card) => {
        const body = (
          <>
            <div className="row row-between">
              <span className="label text-muted">{card.label}</span>
              {card.badge && (
                <span className={`badge badge-${card.badge.tone}`}>{card.badge.text}</span>
              )}
            </div>
            <span className="h3 tabular">{card.value}</span>
            <span className="caption text-muted">{card.caption}</span>
          </>
        )
        return card.href ? (
          <Link key={card.label} href={card.href} className="card stack stack-sm" style={CARD_LINK}>
            {body}
          </Link>
        ) : (
          <div key={card.label} className="card stack stack-sm">
            {body}
          </div>
        )
      })}
    </div>
  )
}

export function HomeSections() {
  const home = useRead(homeQuery())

  if (home.isError) {
    return <QueryError message={home.error.message} onRetry={() => void home.refetch()} />
  }
  if (home.isPending) return <HomeSectionsSkeleton />

  const view = home.data
  const cards = [...financeCards(view), ...academicCards(view), ...studentCards(view)]

  return (
    <>
      {view.queue.length > 0 && <QueueCard queue={view.queue} />}
      {view.funnel && <FunnelCard funnel={view.funnel} />}
      {cards.length > 0 && <StatGrid cards={cards} />}
      {view.spread && <SpreadCard spread={view.spread} />}
    </>
  )
}

export function HomeSectionsSkeleton() {
  return (
    <Busy className="stack stack-lg">
      <PanelSkeleton rows={4} rowHeight={56} />
      <section className="card stack" aria-hidden>
        <Skeleton height={24} width="40%" radius="xl" />
        <div className="journey" style={{ gap: 12 }}>
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} height={108} radius="sm" />
          ))}
        </div>
      </section>
      <StatCardsSkeleton />
    </Busy>
  )
}
