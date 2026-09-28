"use client"

import Link from "next/link"

import type { OverdueReport } from "@/src/entities/report/schema"
import { formatDate } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"

export function DebtCard({ overdue, label }: { overdue: OverdueReport; label: string }) {
  const { asOf, rows } = overdue
  const until = asOf ? formatDate(asOf) : null

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h6">Piutang Belum Dibayar per Siswa</h2>
          <span className="caption text-muted">
            {until
              ? `Cicilan yang sudah jatuh tempo tetapi belum dibayar sampai ${until} (${label}). Angka yang sama dengan Neraca Keuangan di Beranda; hanya Rupiah karena Euro tanpa jadwal.`
              : `Periode ${label} belum berjalan, jadi belum ada cicilan yang jatuh tempo.`}
          </span>
        </div>
        <div className="stack" style={{ gap: 0, alignItems: "flex-end" }}>
          <span className="h5 tabular text-danger">{formatMoney(idr(overdue.totalIdr))}</span>
          <span className="caption text-muted">{overdue.studentCount} siswa tertunggak</span>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="row-soft">
          <span className="body-sm text-muted">Tidak ada cicilan tertunggak pada {label}.</span>
        </div>
      ) : (
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Siswa</th>
                <th>Paket</th>
                <th>Cabang</th>
                <th>PIC</th>
                <th className="numeric">Target sampai {until}</th>
                <th className="numeric">Dibayar sampai {until}</th>
                <th className="numeric">Piutang (Rp)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.contractId}>
                  <td>
                    <div className="stack" style={{ gap: 0 }}>
                      <Link className="link" href={`/staff/students/${row.nis}?tab=finance`}>
                        {row.name}
                      </Link>
                      <span className="caption text-muted">{row.nis}</span>
                    </div>
                  </td>
                  <td>{row.package.name}</td>
                  <td>{row.branch?.name ?? <span className="text-faint">Tanpa cabang</span>}</td>
                  <td>{row.pic?.name ?? <span className="text-faint">Tanpa PIC</span>}</td>
                  <td className="numeric tabular">{formatMoney(idr(row.targetIdr))}</td>
                  <td className="numeric tabular text-success">{formatMoney(idr(row.paidIdr))}</td>
                  <td className="numeric tabular text-danger">
                    {formatMoney(idr(row.overdueIdr))}
                  </td>
                </tr>
              ))}
              <tr style={{ fontWeight: 700 }}>
                <td colSpan={6}>Total piutang belum dibayar</td>
                <td className="numeric tabular text-danger">
                  {formatMoney(idr(overdue.totalIdr))}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
