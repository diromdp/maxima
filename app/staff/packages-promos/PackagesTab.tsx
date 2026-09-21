"use client"

import { PencilEdit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"

import { DASH } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { PackageFormModal } from "./PackageFormModal"
import { formatGate, GATE_NAMES, GATES_BY_PACKAGE, PACKAGE_ROWS, type PackageRow } from "./sample"

const yesNo = (value: boolean) => (value ? "Ya" : "Tidak")

export function PackagesTab({ readOnly }: { readOnly: boolean }) {
  const [editing, setEditing] = useState<PackageRow | null>(null)
  const [adding, setAdding] = useState(false)

  return (
    <div className="stack stack-lg">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack stack-sm">
            <h2 className="h6">Paket Program</h2>
            <span className="caption text-muted">
              {PACKAGE_ROWS.length} paket. Nominal bulanan dan tanggal tagih melekat pada paket,
              bukan pada siswa.
            </span>
          </div>
          {!readOnly && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setAdding(true)}
            >
              + Tambah Paket
            </button>
          )}
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Paket</th>
                <th className="numeric">Harga Layanan (Rp)</th>
                <th className="numeric">Harga Layanan (Euro)</th>
                <th>Dana Talang ID</th>
                <th>Dana Talang DE</th>
                <th className="numeric">Nominal Bulanan</th>
                <th>Tanggal Tagih</th>
                {!readOnly && <th>Aksi</th>}
              </tr>
            </thead>
            <tbody>
              {PACKAGE_ROWS.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  <td className="numeric tabular">{formatMoney(row.price)}</td>
                  <td className="numeric tabular">
                    {row.serviceFeeEur ? formatMoney(row.serviceFeeEur) : DASH}
                  </td>
                  <td>{yesNo(row.bridgingId)}</td>
                  <td>{yesNo(row.bridgingDe)}</td>
                  <td className="numeric tabular">
                    {row.monthly ? formatMoney(row.monthly) : DASH}
                  </td>
                  <td>{row.billingDay === null ? DASH : `Tgl ${row.billingDay}`}</td>
                  {!readOnly && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setEditing(row)}
                      >
                        <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
                        Edit
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card stack">
        <div className="stack stack-sm">
          <h2 className="h6">9 Gerbang Pembayaran (Rincian Termin Minimum)</h2>
          <span className="caption text-muted">
            Uang Rupiah yang harus masuk sebelum layanan itu dibuka, dibandingkan dengan total
            masuk. Euro tidak menahan gerbang mana pun.
          </span>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Paket Program</th>
                {GATE_NAMES.map((gate) => (
                  <th key={gate} className="numeric">
                    {gate}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKAGE_ROWS.map((row) => (
                <tr key={row.id}>
                  <td style={{ fontWeight: 600 }}>{row.name}</td>
                  {(GATES_BY_PACKAGE[row.id] ?? []).map((value, index) => (
                    <td
                      key={GATE_NAMES[index]}
                      className={`numeric tabular${value === null ? " text-muted" : value === 0 ? " text-success" : ""}`}
                    >
                      {formatGate(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stack" style={{ gap: 2 }}>
          <span className="caption text-muted">
            Keterangan: <strong>0</strong> = langsung terbuka (termasuk paket). <strong>—</strong> =
            tidak termasuk layanan paket program.
          </span>
          <span className="caption text-muted">Setiap perubahan dicatat di log aktivitas.</span>
        </div>
      </section>

      <PackageFormModal opened={adding} onClose={() => setAdding(false)} />
      {editing && <PackageFormModal opened onClose={() => setEditing(null)} initial={editing} />}
    </div>
  )
}
