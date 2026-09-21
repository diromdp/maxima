"use client"

import { BarChart, ResponsiveChart } from "@derpdaderp/chartkit"

import { formatMoney } from "@/src/lib/money"
import { CHART_THEME } from "@/src/styles/chart-theme"

import { type DebtRow, debtTotal, type MonthlySummary, type PeriodRow } from "./sample"

const toMillions = (amount: number) => Math.round(amount / 100_000) / 10

export function SummaryCards({
  summary,
  unit,
  debt,
}: {
  summary: MonthlySummary
  unit: string
  debt: readonly DebtRow[]
}) {
  const cards = [
    {
      label: `Total Pemasukan ${unit} (Rp)`,
      value: formatMoney(summary.paidIdr),
      caption: "Dari seluruh transaksi Rupiah yang berlaku",
      tone: "success",
    },
    {
      label: "Total Siswa Membayar",
      value: `${summary.payersIdr} Siswa`,
      caption: "Siswa yang melakukan pembayaran Rupiah",
    },
    {
      label: "Piutang Belum Dibayar (Rp)",
      value: formatMoney(debtTotal(debt)),
      caption: `${debt.length} siswa dengan cicilan jatuh tempo belum dibayar`,
      tone: "danger",
    },
    {
      label: `Total Pemasukan ${unit} (EUR)`,
      value: formatMoney(summary.paidEur),
      caption: "Dari seluruh transaksi Euro yang disahkan",
      tone: "success",
    },
    {
      label: "Siswa Membayar EUR",
      value: `${summary.payersEur} Siswa`,
      caption: "Siswa yang membayar Euro",
    },
    {
      label: "Rata-rata per Siswa (Rp / EUR)",
      value: `${formatMoney(summary.averageIdr)} · ${formatMoney(summary.averageEur)}`,
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
  summary,
  emptyText,
}: {
  title: string
  caption: string
  periodHead: string
  rows: readonly PeriodRow[]
  summary: MonthlySummary
  emptyText: string
}) {
  const top = [...rows].sort((a, b) => b.totalIdr.amount - a.totalIdr.amount)[0]
  const hasTop = top !== undefined && top.totalIdr.amount > 0
  const hasDebt = rows.some((row) => row.debtIdr !== null)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h6">{title}</h2>
          <span className="caption text-muted">{caption}</span>
        </div>
        {hasTop && (
          <span className="caption text-muted">
            Tertinggi <strong>{top.label}</strong> · {formatMoney(top.totalIdr)}
          </span>
        )}
      </div>

      {summary.paidIdr.amount === 0 ? (
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
                Pemasukan: toMillions(row.totalIdr.amount),
                "Piutang belum dibayar": toMillions(row.debtIdr?.amount ?? 0),
              }))}
              dataKey={hasDebt ? ["Pemasukan", "Piutang belum dibayar"] : "Pemasukan"}
              categoryKey="periode"
              theme={CHART_THEME}
              width={width}
              height={height}
              format={(value) => `${value} jt`}
              barRadius={4}
              barGap={hasDebt ? 0.15 : rows.length > 6 ? 0.35 : 0.6}
              groupGap={0.35}
              showLabels
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
                <td style={{ fontWeight: 600 }}>{row.label}</td>
                <td className="numeric tabular">
                  {row.count === 0 ? (
                    <span className="text-muted">-</span>
                  ) : (
                    `${row.count} transaksi`
                  )}
                </td>
                <td>{row.count === 0 ? <span className="text-muted">-</span> : row.topMethod}</td>
                <td className="numeric tabular">{formatMoney(row.totalIdr)}</td>
                <td className="numeric tabular">{formatMoney(row.totalEur)}</td>
                {hasDebt && (
                  <td className="numeric tabular text-danger">
                    {row.debtIdr ? formatMoney(row.debtIdr) : <span className="text-muted">-</span>}
                  </td>
                )}
              </tr>
            ))}
            <tr style={{ fontWeight: 700 }}>
              <td>Total</td>
              <td className="numeric tabular">
                {rows.reduce((sum, row) => sum + row.count, 0)} transaksi
              </td>
              <td />
              <td className="numeric tabular">{formatMoney(summary.paidIdr)}</td>
              <td className="numeric tabular">{formatMoney(summary.paidEur)}</td>
              {hasDebt && <td />}
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  )
}
