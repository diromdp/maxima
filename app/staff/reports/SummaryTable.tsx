"use client"

import type { ReactNode } from "react"

import type { GroupReportRow, GroupTotals } from "@/src/entities/report/schema"
import { formatPercent } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"

const HIGH_COLLECTIBILITY = 60
const MID_COLLECTIBILITY = 30

const collectibilityBadge = (percent: number) =>
  percent >= HIGH_COLLECTIBILITY
    ? "badge-success"
    : percent >= MID_COLLECTIBILITY
      ? "badge-warning"
      : "badge-danger"

function TotalsCells({ row }: { row: GroupTotals }) {
  return (
    <>
      <td className="numeric tabular">{row.studentCount} siswa</td>
      <td className="numeric tabular">{formatMoney(idr(row.billedIdr))}</td>
      <td className="numeric tabular text-success">{formatMoney(idr(row.paidIdr))}</td>
      <td className="numeric tabular text-success">{formatMoney(eur(row.paidEurCents))}</td>
      <td className={`numeric tabular${row.remainingIdr > 0 ? " text-danger" : ""}`}>
        {formatMoney(idr(row.remainingIdr))}
      </td>
      <td className={`numeric tabular${row.remainingEurCents > 0 ? " text-danger" : ""}`}>
        {formatMoney(eur(row.remainingEurCents))}
      </td>
      <td className="numeric tabular">
        <span className={`badge ${collectibilityBadge(row.collectibilityPercent)}`}>
          {formatPercent(row.collectibilityPercent / 100)}
        </span>
      </td>
    </>
  )
}

export function SummaryTable({
  head,
  rows,
  total,
  extra,
}: {
  head: string
  rows: readonly GroupReportRow[]
  total: GroupTotals
  extra: (row: GroupReportRow) => ReactNode
}) {
  return (
    <div className="table-scroll">
      <table className="table">
        <thead>
          <tr>
            <th>{head}</th>
            <th />
            <th className="numeric">Jumlah Siswa</th>
            <th className="numeric">Total Penagihan (Rp)</th>
            <th className="numeric">Pemasukan (Rp)</th>
            <th className="numeric">Pemasukan (EUR)</th>
            <th className="numeric">Piutang (Rp)</th>
            <th className="numeric">Piutang (EUR)</th>
            <th className="numeric">Kolektibilitas</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id ?? "none"}>
              <td style={{ fontWeight: 600 }}>{row.name}</td>
              <td className="text-muted">{extra(row)}</td>
              <TotalsCells row={row} />
            </tr>
          ))}
          <tr style={{ fontWeight: 700 }}>
            <td>TOTAL KESELURUHAN</td>
            <td />
            <TotalsCells row={total} />
          </tr>
        </tbody>
      </table>
    </div>
  )
}
