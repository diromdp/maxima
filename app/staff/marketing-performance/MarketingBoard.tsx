"use client"

import { Skeleton } from "@mantine/core"

import { Busy, PanelSkeleton, StatCardsSkeleton } from "@/src/components/data/Busy"
import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { marketingPerformanceQuery } from "@/src/entities/home/queries"
import type { ConsultantRow } from "@/src/entities/home/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatPercent } from "@/src/lib/format"

import { ConsultantTable } from "./ConsultantTable"
import { Demography } from "./Demography"
import { LeadSources } from "./LeadSources"

const SKELETON_CONSULTANTS = 4
const SKELETON_LEAD_SOURCES = 6
const DEMOGRAPHY_GROUPS = 3

type ConsultantTotals = Omit<ConsultantRow, "pic">

function totalsOf(rows: readonly ConsultantRow[]): ConsultantTotals {
  return rows.reduce<ConsultantTotals>(
    (total, row) => ({
      handled: total.handled + row.handled,
      contracts: total.contracts + row.contracts,
      downPayments: total.downPayments + row.downPayments,
      active: total.active + row.active,
      leftOrOnLeave: total.leftOrOnLeave + row.leftOrOnLeave,
    }),
    { handled: 0, contracts: 0, downPayments: 0, active: 0, leftOrOnLeave: 0 },
  )
}

const shareOf = (part: number, whole: number): string =>
  formatPercent(whole === 0 ? 0 : part / whole)

function StatCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: number
  caption: string
  tone?: "success" | "danger"
}) {
  return (
    <section className="card stack stack-sm">
      <span className="label text-muted">{label}</span>
      <span className={`h4 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
      <span className="caption text-muted">{caption}</span>
    </section>
  )
}

function CoverageNotice({ coverage }: { coverage: number | null }) {
  const covered = coverage === null ? null : Math.round(coverage)
  return (
    <Notice tone="info" title="Bukan alat ukur konversi penuh">
      Calon yang batal tidak pernah masuk sistem, jadi halaman ini menjawab berapa siswa datang dari
      satu sumber, bukan berapa persen lead jadi siswa.{" "}
      {covered === null
        ? "Cakupan PIC Konsultan belum dapat dihitung karena belum ada siswa ber-NIS."
        : `Cakupannya ${covered}% siswa; ${100 - covered}% data lama belum punya PIC Konsultan.`}
    </Notice>
  )
}

export function MarketingBoard() {
  const performance = useRead(marketingPerformanceQuery())

  if (performance.isError) {
    return (
      <QueryError message={performance.error.message} onRetry={() => void performance.refetch()} />
    )
  }

  if (performance.isPending) return <MarketingBoardSkeleton />

  const { picCoverage, consultants, leadSources, programs, branches, education } = performance.data
  const totals = totalsOf(consultants)

  return (
    <>
      <CoverageNotice coverage={picCoverage} />

      <div className="grid-4">
        <StatCard
          label="Siswa dihandle"
          value={totals.handled}
          caption={`oleh ${consultants.length} PIC konsultan`}
        />
        <StatCard
          label="Kontrak berhasil"
          value={totals.contracts}
          caption={`${shareOf(totals.contracts, totals.handled)} dari siswa dihandle`}
        />
        <StatCard
          label="Siswa aktif"
          value={totals.active}
          caption={`${shareOf(totals.active, totals.downPayments)} dari yang DP-nya masuk`}
          tone="success"
        />
        <StatCard
          label="Keluar / cuti"
          value={totals.leftOrOnLeave}
          caption={`${shareOf(totals.leftOrOnLeave, totals.downPayments)} dari yang DP-nya masuk`}
          tone="danger"
        />
      </div>

      <ConsultantTable consultants={consultants} />

      <div className="grid-2" style={{ alignItems: "start" }}>
        <LeadSources sources={leadSources} />
        <Demography
          groups={[
            { title: "Program Terfavorit", items: programs },
            { title: "Asal Cabang", items: branches },
            { title: "Pendidikan Terakhir", items: education },
          ]}
        />
      </div>

      <span className="caption text-muted">
        Seluruh angka di halaman ini hitungan, tidak ada kolom isian.
      </span>
    </>
  )
}

export function MarketingBoardSkeleton() {
  return (
    <Busy className="stack stack-lg">
      <Skeleton height={80} radius="md" aria-hidden />
      <StatCardsSkeleton />
      <PanelSkeleton rows={SKELETON_CONSULTANTS} rowHeight={52} titleWidth="30%" />
      <div className="grid-2">
        <PanelSkeleton rows={SKELETON_LEAD_SOURCES} rowHeight={36} titleWidth="50%" />
        <PanelSkeleton rows={DEMOGRAPHY_GROUPS} rowHeight={64} titleWidth="60%" />
      </div>
    </Busy>
  )
}
