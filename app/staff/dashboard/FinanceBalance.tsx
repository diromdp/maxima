"use client"

import { BarChart, ResponsiveChart } from "@derpdaderp/chartkit"
import Link from "next/link"
import { useState } from "react"

import { CHART_THEME } from "@/src/styles/chart-theme"

import {
  BULAN_PANJANG,
  type Currency,
  CURRENCY_LABEL,
  CURRENCY_UNIT,
  FINANCE,
  FINANCE_PERIOD,
} from "./sample"

const CURRENCIES: readonly Currency[] = ["IDR", "EUR"]

// Rupiah dalam juta, Euro dalam ribu - satuan ikut data di sample.ts.
const FORMAT: Readonly<Record<Currency, (value: number) => string>> = {
  IDR: (v) => `${v} jt`,
  EUR: (v) => `€ ${v} rb`,
}

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
      <span className="caption text-muted tabular">{caption}</span>
    </div>
  )
}

export function FinanceBalance({ invoicesHref }: { invoicesHref: string }) {
  const [currency, setCurrency] = useState<Currency>("IDR")
  const data = FINANCE[currency]
  const fmt = FORMAT[currency]

  const thisMonth = data.at(-1)!
  const lastMonth = data.at(-2)!
  const yearIncome = data.reduce((sum, m) => sum + m.Pemasukan, 0)
  const yearDebt = data.reduce((sum, m) => sum + m["Piutang belum dibayar"], 0)
  const thisName = BULAN_PANJANG[thisMonth.bulan] ?? thisMonth.bulan
  const lastName = BULAN_PANJANG[lastMonth.bulan] ?? lastMonth.bulan
  const delta = (now: number, before: number) =>
    `${now >= before ? "naik" : "turun"} ${fmt(Math.abs(now - before))} dari ${lastName}`

  return (
    <section className="chart-card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2, flex: 1, minWidth: 0 }}>
          <h2 className="h5">Neraca Keuangan</h2>
          <span className="caption text-muted">
            Pemasukan dan piutang cicilan yang belum dibayar per bulan, {FINANCE_PERIOD},{" "}
            {CURRENCY_UNIT[currency]}.
          </span>
        </div>
        <div className="row row-wrap">
          <div className="segmented" role="tablist" aria-label="Mata uang">
            {CURRENCIES.map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={currency === c}
                className={`segmented-item${currency === c ? " is-active" : ""}`}
                onClick={() => setCurrency(c)}
              >
                {CURRENCY_LABEL[c]}
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
          label="Pemasukan 12 bulan"
          value={fmt(yearIncome)}
          caption={`rata-rata ${fmt(Math.round(yearIncome / data.length))} per bulan`}
          tone="success"
        />
        <Kpi
          label="Piutang belum dibayar 12 bulan"
          value={fmt(yearDebt)}
          caption={`rata-rata ${fmt(Math.round(yearDebt / data.length))} per bulan`}
          tone="danger"
        />
        <Kpi
          label={`Pemasukan ${thisName}`}
          value={fmt(thisMonth.Pemasukan)}
          caption={delta(thisMonth.Pemasukan, lastMonth.Pemasukan)}
          tone="success"
        />
        <Kpi
          label={`Piutang belum dibayar ${thisName}`}
          value={fmt(thisMonth["Piutang belum dibayar"])}
          caption={delta(thisMonth["Piutang belum dibayar"], lastMonth["Piutang belum dibayar"])}
          tone="danger"
        />
      </div>

      <ResponsiveChart height={360} minWidth={320} placeholder={<div className="chart-skeleton" />}>
        {({ width, height }) => (
          <BarChart
            key={currency}
            data={[...data]}
            dataKey={["Pemasukan", "Piutang belum dibayar"]}
            categoryKey="bulan"
            theme={CHART_THEME}
            width={width}
            height={height}
            format={fmt}
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
