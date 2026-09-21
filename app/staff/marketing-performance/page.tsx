import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { requirePermission } from "@/src/lib/auth/session"

import { ConsultantTable } from "./ConsultantTable"
import { Demography } from "./Demography"
import { LeadSources } from "./LeadSources"
import {
  CONSULTANTS,
  consultantTotals,
  COVERED_PERCENT,
  LEAD_SOURCES,
  leadShare,
  PERIOD,
  ratio,
} from "./sample"

function StatCard({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: string
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

export default async function MarketingPerformancePage() {
  await requirePermission("marketing-performance")

  const totals = consultantTotals(CONSULTANTS)
  const topSource = leadShare(LEAD_SOURCES)[0]!

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Performa Marketing"
        subtitle={`Analisis penjualan dan produktivitas konsultan, ${PERIOD}.`}
      />

      <Notice tone="info" title="Bukan alat ukur konversi penuh">
        Calon yang batal tidak pernah masuk sistem, jadi halaman ini menjawab berapa siswa datang
        dari satu sumber, bukan berapa persen lead jadi siswa. Cakupannya {COVERED_PERCENT}% siswa;{" "}
        {100 - COVERED_PERCENT}% data lama belum punya PIC Konsultan.
      </Notice>

      <div className="grid-4">
        <StatCard
          label="Siswa dihandle"
          value={String(totals.handled)}
          caption={`oleh ${CONSULTANTS.length} PIC konsultan`}
        />
        <StatCard
          label="Kontrak berhasil"
          value={String(totals.signed)}
          caption={`${ratio(totals.signed, totals.handled)}% dari siswa dihandle`}
        />
        <StatCard
          label="Siswa aktif"
          value={String(totals.active)}
          caption={`${ratio(totals.active, totals.downPayment)}% dari yang DP-nya masuk`}
          tone="success"
        />
        <StatCard
          label="Keluar / cuti"
          value={String(totals.leftOrOnLeave)}
          caption={`${ratio(totals.leftOrOnLeave, totals.downPayment)}% dari yang DP-nya masuk`}
          tone="danger"
        />
      </div>

      <ConsultantTable />

      <div className="grid-2" style={{ alignItems: "start" }}>
        <LeadSources />
        <Demography />
      </div>

      <span className="caption text-muted">
        Sumber lead terbesar: {topSource.name} ({topSource.percent}%). Seluruh angka di halaman ini
        hitungan, tidak ada kolom isian.
      </span>
    </div>
  )
}
