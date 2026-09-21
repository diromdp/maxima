"use client"

import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { MonthPickerInput } from "@mantine/dates"
import { useState } from "react"

import { formatDateTime } from "@/src/lib/format"

import { DebtCard } from "./DebtCard"
import { DistributionCard, SummaryCards } from "./PeriodReport"
import {
  debtRowsAt,
  DEFAULT_MONTH,
  endOfMonth,
  LAST_UPDATED,
  MAX_MONTH,
  MIN_MONTH,
  monthKey,
  monthLabel,
  monthlySummary,
  shiftMonth,
  weeklyRows,
} from "./sample"

const toDate = (month: string) => new Date(`${month}-01T00:00:00`)

export function MonthlyTab() {
  const [month, setMonth] = useState(DEFAULT_MONTH)
  const summary = monthlySummary(month)
  const until = endOfMonth(month)
  const debt = debtRowsAt(until)

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap">
        <div className="row" style={{ gap: 4 }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Bulan sebelumnya"
            disabled={month <= MIN_MONTH}
            onClick={() => setMonth(shiftMonth(month, -1))}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} strokeWidth={1.5} />
          </button>
          <MonthPickerInput
            aria-label="Pilih bulan"
            size="sm"
            w={180}
            valueFormat="MMMM YYYY"
            minDate={toDate(MIN_MONTH)}
            maxDate={toDate(MAX_MONTH)}
            value={toDate(month)}
            onChange={(value) => value && setMonth(monthKey(new Date(value).toISOString()))}
            allowDeselect={false}
          />
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-icon"
            aria-label="Bulan berikutnya"
            disabled={month >= MAX_MONTH}
            onClick={() => setMonth(shiftMonth(month, 1))}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </button>
        </div>
        <span className="caption text-muted">
          Terakhir diperbarui: {formatDateTime(LAST_UPDATED)}
        </span>
      </div>

      <SummaryCards summary={summary} unit="Bulanan" debt={debt} />

      <DistributionCard
        title="Distribusi Pemasukan per Minggu"
        caption={`${monthLabel(month)}, Rupiah dalam juta. Minggu 1-7, 8-14, 15-21, 22 sampai akhir bulan.`}
        periodHead="Periode Minggu"
        rows={weeklyRows(month)}
        summary={summary}
        emptyText={`Belum ada transaksi Rupiah pada ${monthLabel(month)}.`}
      />

      <DebtCard rows={debt} until={until} label={monthLabel(month)} />
    </div>
  )
}
