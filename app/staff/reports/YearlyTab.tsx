"use client"

import { Select } from "@mantine/core"
import { useState } from "react"

import { formatDateTime } from "@/src/lib/format"

import { DebtCard } from "./DebtCard"
import { DistributionCard, SummaryCards } from "./PeriodReport"
import {
  debtRowsAt,
  DEFAULT_YEAR,
  endOfMonth,
  LAST_UPDATED,
  MAX_MONTH,
  monthlyRows,
  YEARS,
  yearlySummary,
} from "./sample"

export function YearlyTab() {
  const [year, setYear] = useState(DEFAULT_YEAR)
  const summary = yearlySummary(year)
  const until = endOfMonth(year === MAX_MONTH.slice(0, 4) ? MAX_MONTH : `${year}-12`)
  const debt = debtRowsAt(until)

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap">
        <Select
          aria-label="Pilih tahun"
          size="sm"
          w={140}
          allowDeselect={false}
          data={[...YEARS]}
          value={year}
          onChange={(value) => value && setYear(value)}
        />
        <span className="caption text-muted">
          Terakhir diperbarui: {formatDateTime(LAST_UPDATED)}
        </span>
      </div>

      <SummaryCards summary={summary} unit="Tahunan" debt={debt} />

      <DistributionCard
        title="Distribusi Pemasukan per Bulan"
        caption={`Tahun ${year}, Rupiah dalam juta. Januari sampai Desember.`}
        periodHead="Bulan"
        rows={monthlyRows(year)}
        summary={summary}
        emptyText={`Belum ada transaksi Rupiah pada tahun ${year}.`}
      />

      <DebtCard rows={debt} until={until} label={`akhir periode ${year}`} />
    </div>
  )
}
