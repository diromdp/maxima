"use client"

import { BarChart, ResponsiveChart } from "@derpdaderp/chartkit"
import { Skeleton } from "@mantine/core"
import { useQueries } from "@tanstack/react-query"
import Link from "next/link"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { yearlyReportQuery } from "@/src/entities/report/queries"
import { readApi } from "@/src/lib/api/read"
import { type Currency, formatMoneyShort } from "@/src/lib/money"
import { CHART_THEME } from "@/src/styles/chart-theme"

import { type FinanceMonth, lastTwelveMonths, WINDOW_MONTHS, windowYears } from "./finance-window"

const CURRENCIES: readonly Currency[] = ["IDR", "EUR"]
const CURRENCY_LABEL: Readonly<Record<Currency, string>> = { IDR: "Rupiah", EUR: "Euro" }
const CURRENCY_UNIT: Readonly<Record<Currency, string>> = {
  IDR: "dalam rupiah",
  EUR: "dalam euro",
}
const INCOME = "Pemasukan"
const OVERDUE = "Piutang belum dibayar"

const SHORT_MONTH = new Intl.DateTimeFormat("id-ID", { month: "short", timeZone: "UTC" })
const LONG_MONTH = new Intl.DateTimeFormat("id-ID", { month: "long", timeZone: "UTC" })

const monthName = (row: FinanceMonth, format: Intl.DateTimeFormat) =>
  format.format(Date.UTC(row.year, row.month - 1, 1))

const incomeOf: Readonly<Record<Currency, (row: FinanceMonth) => number>> = {
  IDR: (row) => row.incomeIdr,
  EUR: (row) => row.incomeEurCents,
}
const overdueOf = (row: FinanceMonth | undefined) => row?.overdueIdr ?? 0

function Kpi({
  label,
  value,
  caption,
  tone,
}: {
  label: string
  value: string
  caption: string
  tone: "success" | "danger"
}) {
  return (
    <div className="row-soft stack" style={{ gap: 2, alignItems: "flex-start" }}>
      <span className="label text-muted">{label}</span>
      <span className={`h4 tabular text-${tone}`}>{value}</span>
      <span className="caption text-muted">{caption}</span>
    </div>
  )
}

export function FinanceBalance({ invoicesHref }: { invoicesHref: string }) {
  const [now] = useState(() => new Date())
  const [currency, setCurrency] = useState<Currency>("IDR")
  const reports = useQueries({
    queries: windowYears(now).map((year) => {
      const read = yearlyReportQuery(year)
      return { queryKey: read.queryKey, queryFn: () => readApi(read) }
    }),
  })

  const failed = reports.find((report) => report.isError)
  if (failed?.error) {
    return (
      <QueryError
        message={failed.error.message}
        onRetry={() => reports.forEach((report) => void report.refetch())}
      />
    )
  }
  if (reports.some((report) => report.isPending)) return <FinanceBalanceSkeleton />

  const months = lastTwelveMonths(
    reports.flatMap((report) => (report.data ? [report.data] : [])),
    now,
  )
  const first = months.at(0)
  const current = months.at(-1)
  const previous = months.at(-2)
  if (!first || !current || !previous) return null

  const format = (amount: number) => formatMoneyShort({ amount, currency })
  const income = incomeOf[currency]
  const hasOverdue = currency === "IDR"
  const previousName = monthName(previous, LONG_MONTH)
  const currentName = monthName(current, LONG_MONTH)
  const period = `${monthName(first, LONG_MONTH)} ${first.year} sampai ${currentName} ${current.year}`
  const totalIncome = months.reduce((sum, row) => sum + income(row), 0)
  const averageOverdue = months.reduce((sum, row) => sum + overdueOf(row), 0) / WINDOW_MONTHS
  const changeFrom = (value: number, before: number) =>
    `${value >= before ? "naik" : "turun"} ${format(Math.abs(value - before))} dari ${previousName}`
  const chartData = months.map((row) => ({
    bulan:
      row.month === 1 ? `${monthName(row, SHORT_MONTH)} ${row.year}` : monthName(row, SHORT_MONTH),
    [INCOME]: income(row),
    [OVERDUE]: overdueOf(row),
  }))

  return (
    <section className="chart-card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          <h2 className="h5">Neraca Keuangan</h2>
          <span className="caption text-muted">
            {hasOverdue
              ? `Pemasukan dan piutang cicilan yang belum dibayar per bulan, ${period}, ${CURRENCY_UNIT.IDR}.`
              : `Pemasukan per bulan, ${period}, ${CURRENCY_UNIT.EUR}. Euro tidak punya jadwal tagih, jadi tidak punya piutang bulanan.`}
          </span>
        </div>
        <div className="row row-wrap">
          <div className="segmented" role="tablist" aria-label="Mata uang">
            {CURRENCIES.map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={currency === option}
                className={`segmented-item${currency === option ? " is-active" : ""}`}
                onClick={() => setCurrency(option)}
              >
                {CURRENCY_LABEL[option]}
              </button>
            ))}
          </div>
          <Link className="link" href={invoicesHref}>
            Lihat Tagihan & Piutang
          </Link>
        </div>
      </div>

      <div className="chart-kpis">
        <Kpi
          label={`Pemasukan ${WINDOW_MONTHS} bulan`}
          value={format(totalIncome)}
          caption={`rata-rata ${format(totalIncome / WINDOW_MONTHS)} per bulan`}
          tone="success"
        />
        <Kpi
          label={`Pemasukan ${currentName}`}
          value={format(income(current))}
          caption={changeFrom(income(current), income(previous))}
          tone="success"
        />
        {hasOverdue && (
          <>
            <Kpi
              label={`Piutang belum dibayar ${currentName}`}
              value={format(overdueOf(current))}
              caption={changeFrom(overdueOf(current), overdueOf(previous))}
              tone="danger"
            />
            <Kpi
              label={`Rata-rata piutang ${WINDOW_MONTHS} bulan`}
              value={format(averageOverdue)}
              caption="saldo akhir tiap bulan"
              tone="danger"
            />
          </>
        )}
      </div>

      <ResponsiveChart height={360} minWidth={320} placeholder={<div className="chart-skeleton" />}>
        {({ width, height }) => (
          <BarChart
            key={currency}
            data={chartData}
            dataKey={hasOverdue ? [INCOME, OVERDUE] : [INCOME]}
            categoryKey="bulan"
            theme={CHART_THEME}
            width={width}
            height={height}
            format={format}
            barRadius={4}
            barGap={0.15}
            groupGap={0.35}
            showLabels={width >= 640}
          />
        )}
      </ResponsiveChart>
    </section>
  )
}

export function FinanceBalanceSkeleton() {
  return (
    <section className="chart-card stack" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={24} width="30%" radius="xl" aria-hidden />
      <div className="chart-kpis" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={88} radius="sm" />
        ))}
      </div>
      <Skeleton height={360} radius="sm" aria-hidden />
    </section>
  )
}
