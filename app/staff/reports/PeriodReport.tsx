"use client"

import { BarChart, ResponsiveChart } from "@derpdaderp/chartkit"
import { Skeleton } from "@mantine/core"

import type { IncomeSummary, IncomeTotals, OverdueReport } from "@/src/entities/report/schema"
import { eur, formatMoney, formatMoneyShort, idr } from "@/src/lib/money"
import { CHART_THEME } from "@/src/styles/chart-theme"

export type PeriodRow = IncomeTotals & {
  readonly key: string
  readonly label: string
  readonly caption?: string
  readonly overdueIdr?: number | null
}

const SUMMARY_CARDS = 6

export function SummaryCards({
  summary,
  overdue,
  unit,
}: {
  summary: IncomeSummary
  overdue: OverdueReport
  unit: string
}) {
  const cards = [
    {
      label: `Total Pemasukan ${unit} (Rp)`,
      value: formatMoney(idr(summary.totalIdr)),
      caption: "Dari seluruh transaksi Rupiah yang berlaku",
      tone: "success",
    },
    {
      label: "Total Siswa Membayar",
      value: `${summary.payingStudents} Siswa`,
      caption: "Siswa yang melakukan pembayaran Rupiah",
    },
    {
      label: "Piutang Belum Dibayar (Rp)",
      value: formatMoney(idr(overdue.totalIdr)),
      caption: `${overdue.studentCount} siswa dengan cicilan jatuh tempo belum dibayar`,
      tone: "danger",
    },
    {
      label: `Total Pemasukan ${unit} (EUR)`,
      value: formatMoney(eur(summary.totalEurCents)),
      caption: "Dari seluruh transaksi Euro yang berlaku",
      tone: "success",
    },
    {
      label: "Siswa Membayar EUR",
      value: `${summary.payingStudentsEur} Siswa`,
      caption: "Siswa yang membayar Euro",
    },
    {
      label: "Rata-rata per Siswa (Rp / EUR)",
      value: `${formatMoney(idr(summary.averageIdr))} · ${formatMoney(eur(summary.averageEurCents))}`,
      caption: "Pemasukan dibagi siswa membayar, tiap mata uang",
    },
  ]

  return (
    <div className="grid-3">
      {cards.map(({ label, value, caption, tone }) => (
        <section key={label} className="card stack stack-sm">
          <span className="label text-muted">{label}</span>
          <span className={`h4 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
          <span className="caption text-muted">{caption}</span>
        </section>
      ))}
    </div>
  )
}

export function DistributionCard({
  title,
  caption,
  periodHead,
  rows,
  total,
  emptyText,
}: {
  title: string
  caption: string
  periodHead: string
  rows: readonly PeriodRow[]
  total: IncomeTotals & { readonly overdueIdr?: number | null }
  emptyText: string
}) {
  const top = [...rows].sort((a, b) => b.totalIdr - a.totalIdr)[0]
  const hasTop = top !== undefined && top.totalIdr > 0
  const hasDebt = rows.some((row) => row.overdueIdr !== undefined)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h6">{title}</h2>
          <span className="caption text-muted">{caption}</span>
        </div>
        {hasTop && (
          <span className="caption text-muted">
            Tertinggi <strong>{top.label}</strong> · {formatMoney(idr(top.totalIdr))}
          </span>
        )}
      </div>

      {total.totalIdr === 0 ? (
        <div className="row-soft">
          <span className="body-sm text-muted">{emptyText}</span>
        </div>
      ) : (
        <ResponsiveChart
          height={320}
          minWidth={280}
          placeholder={<div className="chart-skeleton" />}
        >
          {({ width, height }) => (
            <BarChart
              key={rows.map((row) => row.key).join(",")}
              data={rows.map((row) => ({
                periode: row.label,
                Pemasukan: row.totalIdr,
                "Piutang belum dibayar": row.overdueIdr ?? 0,
              }))}
              dataKey={hasDebt ? ["Pemasukan", "Piutang belum dibayar"] : "Pemasukan"}
              categoryKey="periode"
              theme={CHART_THEME}
              width={width}
              height={height}
              format={(amount) => formatMoneyShort(idr(amount))}
              barRadius={4}
              barGap={hasDebt ? 0.15 : rows.length > 6 ? 0.35 : 0.6}
              groupGap={0.35}
              showLabels={width >= 640}
            />
          )}
        </ResponsiveChart>
      )}

      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th>{periodHead}</th>
              <th className="numeric">Jumlah Transaksi</th>
              <th>Metode Terbanyak</th>
              <th className="numeric">Total Nominal (Rp)</th>
              <th className="numeric">Total (EUR)</th>
              {hasDebt && <th className="numeric">Piutang Belum Dibayar (Rp)</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.key}>
                <td>
                  <span className="stack" style={{ gap: 0 }}>
                    <span style={{ fontWeight: 600 }}>{row.label}</span>
                    {row.caption && <span className="caption text-muted">{row.caption}</span>}
                  </span>
                </td>
                <td className="numeric tabular">
                  {row.transactionCount === 0 ? (
                    <span className="text-muted">-</span>
                  ) : (
                    `${row.transactionCount} transaksi`
                  )}
                </td>
                <td>{row.topMethod ?? <span className="text-muted">-</span>}</td>
                <td className="numeric tabular">{formatMoney(idr(row.totalIdr))}</td>
                <td className="numeric tabular">{formatMoney(eur(row.totalEurCents))}</td>
                {hasDebt && (
                  <td className="numeric tabular text-danger">
                    {row.overdueIdr === null || row.overdueIdr === undefined ? (
                      <span className="text-muted">-</span>
                    ) : (
                      formatMoney(idr(row.overdueIdr))
                    )}
                  </td>
                )}
              </tr>
            ))}
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td>
              <td className="numeric tabular">{total.transactionCount} transaksi</td>
              <td>{total.topMethod ?? ""}</td>
              <td className="numeric tabular">{formatMoney(idr(total.totalIdr))}</td>
              <td className="numeric tabular">{formatMoney(eur(total.totalEurCents))}</td>
              {hasDebt && (
                <td className="numeric tabular text-danger">
                  {total.overdueIdr === null || total.overdueIdr === undefined
                    ? "-"
                    : formatMoney(idr(total.overdueIdr))}
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function PeriodSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="grid-3" aria-hidden>
        {Array.from({ length: SUMMARY_CARDS }, (_, index) => (
          <Skeleton key={index} height={112} radius="md" />
        ))}
      </div>
      <Skeleton height={420} radius="md" aria-hidden />
      <Skeleton height={240} radius="md" aria-hidden />
    </div>
  )
}
