"use client"

import { Select } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { yearlyReportQuery } from "@/src/entities/report/queries"
import type { ReportPeriods } from "@/src/entities/report/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateTime } from "@/src/lib/format"

import { DebtCard } from "./DebtCard"
import { DistributionCard, PeriodSkeleton, SummaryCards } from "./PeriodReport"
import { useReportYear } from "./use-report-param"

const MONTH_NAME = new Intl.DateTimeFormat("id-ID", { month: "long" })

const monthName = (month: number) => MONTH_NAME.format(new Date(2026, month - 1, 1))

export function YearlyTab({ periods }: { periods: ReportPeriods }) {
  const [year, setYear] = useReportYear()
  const report = useRead(yearlyReportQuery(Number(year)))
  const years = periods.years.length > 0 ? periods.years.map(String) : [year]

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap">
        <Select
          aria-label="Pilih tahun"
          size="sm"
          w={140}
          allowDeselect={false}
          data={years}
          value={year}
          onChange={(value) => value && setYear(value)}
        />
        {report.isSuccess && (
          <span className="caption text-muted">
            Terakhir diperbarui: {formatDateTime(report.data.generatedAt)}
          </span>
        )}
      </div>

      {report.isError ? (
        <QueryError message={report.error.message} onRetry={() => void report.refetch()} />
      ) : report.isPending ? (
        <PeriodSkeleton />
      ) : (
        <>
          <SummaryCards
            summary={report.data.summary}
            overdue={report.data.overdue}
            unit="Tahunan"
          />
          <DistributionCard
            title="Distribusi Pemasukan per Bulan"
            caption={`Tahun ${year}, Rupiah dalam juta. Januari sampai Desember; piutang dihitung pada akhir tiap bulan.`}
            periodHead="Bulan"
            rows={report.data.months.map((month) => ({
              ...month,
              key: String(month.month),
              label: monthName(month.month),
            }))}
            total={report.data.total}
            emptyText={`Belum ada transaksi Rupiah pada tahun ${year}.`}
          />
          <DebtCard overdue={report.data.overdue} label={`akhir periode ${year}`} />
        </>
      )}
    </div>
  )
}
