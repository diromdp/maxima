"use client"

import { useState } from "react"

import { formatMoney } from "@/src/lib/money"

import { RECEIVABLES } from "../invoices/sample"
import { PACKAGE_ROWS } from "../packages-promos/sample"
import { BY_PACKAGE, TOTAL } from "./sample"
import { StudentsModal } from "./StudentsModal"
import { SummaryTable } from "./SummaryTable"

const priceLabel = (id: string) => {
  const pkg = PACKAGE_ROWS.find((candidate) => candidate.id === id)
  return pkg ? `Harga ${formatMoney(pkg.price)}` : ""
}

export function PackagesTab() {
  const [detail, setDetail] = useState<string | null>(null)
  const pkg = PACKAGE_ROWS.find((candidate) => candidate.id === detail)

  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per Paket Program</h2>
        <span className="caption text-muted">
          Penagihan = harga paket seluruh siswa; pemasukan = transaksi berlaku; piutang selisihnya.
          Rupiah dan Euro tidak dijumlahkan.
        </span>
      </div>
      <SummaryTable
        head="Nama Paket"
        rows={BY_PACKAGE}
        total={TOTAL}
        extra={(row) => (
          <div className="row" style={{ gap: 8 }}>
            <span className="caption text-muted">{priceLabel(row.key)}</span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDetail(row.key)}
            >
              Lihat siswa
            </button>
          </div>
        )}
      />
      {pkg && (
        <StudentsModal
          title={`Siswa paket ${pkg.name}`}
          rows={RECEIVABLES.filter((row) => row.pkg.id === pkg.id)}
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  )
}
