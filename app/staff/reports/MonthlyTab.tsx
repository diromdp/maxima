"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MonthPickerInput } from "@mantine/dates"
import dayjs from "dayjs"

import { QueryError } from "@/src/components/data/QueryError"
import { monthlyReportQuery } from "@/src/entities/report/queries"
import type { ReportPeriods } from "@/src/entities/report/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateTime } from "@/src/lib/format"

import { DebtCard } from "./DebtCard"
import { DistributionCard, PeriodSkeleton, SummaryCards } from "./PeriodReport"
import { useReportMonth } from "./use-report-param"

const MONTH_TITLE = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" })
const DAY_MONTH = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short" })

const toDate = (month: string) => new Date(`${month}-01T00:00:00`)
const monthLabel = (month: string) => MONTH_TITLE.format(toDate(month))
const shiftMonth = (month: string, by: number) =>
  dayjs(toDate(month)).add(by, "month").format("YYYY-MM")
const dayLabel = (date: string) => DAY_MONTH.format(new Date(`${date}T00:00:00`))

export function MonthlyTab({ periods }: { periods: ReportPeriods }) {
  const [month, setMonth] = useReportMonth()
  const report = useRead(monthlyReportQuery(month))
  const first = periods.firstMonth ?? periods.currentMonth
  const last = periods.currentMonth

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap">
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Bulan sebelumnya"
            disabled={month <= first}
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          </button>
          <MonthPickerInput
            aria-label="Pilih bulan"
            size="sm"
            w={180}
            valueFormat="MMMM YYYY"
            minDate={toDate(first)}
            maxDate={toDate(last)}
            value={toDate(month)}
            onChange={(value) => value && setMonth(dayjs(value).format("YYYY-MM"))}
            allowDeselect={false}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Bulan berikutnya"
            disabled={month >= last}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </button>
        </div>
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
            unit="Bulanan"
          />
          <DistributionCard
            title={`Distribusi Pemasukan per Minggu (${monthLabel(month)})`}
            caption="Rupiah dalam juta. Minggu 1-7, 8-14, 15-21, 22 sampai akhir bulan."
            periodHead="Periode Minggu"
            rows={report.data.weeks.map((week) => ({
              ...week,
              key: String(week.week),
              label: `Minggu ${week.week}`,
              caption: `${dayLabel(week.from)} - ${dayLabel(week.to)}`,
            }))}
            total={report.data.total}
            emptyText={`Belum ada transaksi Rupiah pada ${monthLabel(month)}.`}
          />
          <DebtCard overdue={report.data.overdue} label={monthLabel(month)} />
        </>
      )}
    </div>
  )
}
