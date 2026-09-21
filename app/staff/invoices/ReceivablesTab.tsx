"use client"

import { Select } from "@mantine/core"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { Notice } from "@/src/components/ui/Notice"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney, type Money } from "@/src/lib/money"

import { BRANCHES } from "../classes/sample"
import { type Receivable, RECEIVABLES } from "./sample"

const ALL = "Semua"

const STATUSES = Array.from(new Set(RECEIVABLES.map((row) => row.student.status)))

const due = (value: Money | null) =>
  value === null ? (
    <span className="text-muted">{DASH}</span>
  ) : (
    <span className={value.amount > 0 ? "text-danger" : ""}>{formatMoney(value)}</span>
  )

const optional = (value: Money | null) =>
  value === null ? <span className="text-muted">{DASH}</span> : formatMoney(value)

export function ReceivablesTab() {
  const [branch, setBranch] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  const rows = RECEIVABLES.filter(
    (row) =>
      (branch === ALL || row.student.branch === branch) &&
      (status === ALL || row.student.status === status),
  )

  return (
    <div className="stack stack-lg">
      <Notice tone="info" title="Informasi Sistem">
        Siswa berstatus Cuti tetap tampil di piutang, namun tidak akan dikirimkan reminder tagihan
        jatuh tempo otomatis. Rupiah dan Euro tidak pernah dijumlahkan.
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <Select
              label="Cabang"
              size="sm"
              w={160}
              allowDeselect={false}
              data={[ALL, ...BRANCHES]}
              value={branch}
              onChange={(value) => value && setBranch(value)}
            />
            <Select
              label="Status Program"
              size="sm"
              w={180}
              allowDeselect={false}
              data={[ALL, ...STATUSES]}
              value={status}
              onChange={(value) => value && setStatus(value)}
            />
          </div>
          <span className="caption text-muted">{rows.length} siswa</span>
        </div>

        <DataTable<Receivable>
          rows={rows}
          rowKey={(row) => row.student.nis}
          defaultSort={{ key: "piutang-idr", dir: "desc" }}
          columns={[
            {
              key: "nama",
              header: "Nama Siswa",
              sort: (row) => row.student.name,
              cell: (row) => (
                <div className="stack" style={{ gap: 0 }}>
                  <span style={{ fontWeight: 600 }}>{row.student.name}</span>
                  <span className="caption text-muted">
                    {row.student.nis} · {row.student.status}
                  </span>
                </div>
              ),
            },
            {
              key: "paket",
              header: "Paket",
              sort: (row) => row.pkg.name,
              cell: (row) => row.pkg.name,
            },
            {
              key: "harga-idr",
              header: "Harga (IDR)",
              align: "right",
              cell: (row) => formatMoney(row.priceIdr),
            },
            {
              key: "dibayar-idr",
              header: "Dibayar (IDR)",
              align: "right",
              sort: (row) => row.paidIdr.amount,
              cell: (row) => formatMoney(row.paidIdr),
            },
            {
              key: "piutang-idr",
              header: "Piutang (IDR)",
              align: "right",
              sort: (row) => row.dueIdr.amount,
              cell: (row) => due(row.dueIdr),
            },
            {
              key: "harga-eur",
              header: "Harga (EURO)",
              align: "right",
              cell: (row) => optional(row.priceEur),
            },
            {
              key: "dibayar-eur",
              header: "Dibayar (EURO)",
              align: "right",
              cell: (row) => (row.priceEur ? formatMoney(row.paidEur) : optional(null)),
            },
            {
              key: "piutang-eur",
              header: "Piutang (EURO)",
              align: "right",
              sort: (row) => row.dueEur?.amount ?? -1,
              cell: (row) => due(row.dueEur),
            },
            {
              key: "terakhir",
              header: "Terakhir Bayar",
              sort: (row) => row.lastPaid ?? "",
              cell: (row) =>
                row.lastPaid ? (
                  formatDate(row.lastPaid)
                ) : (
                  <span className="text-muted">{DASH}</span>
                ),
            },
            {
              key: "trx",
              header: "TRX",
              align: "right",
              sort: (row) => row.transactionCount,
              cell: (row) => row.transactionCount,
            },
          ]}
        />
      </section>
    </div>
  )
}
