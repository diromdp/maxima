"use client"

import { Title } from "@mantine/core"

import { DataTable } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { installmentLabel, TRANSACTIONS } from "./payments"

const BADGE = {
  Lunas: "badge-beres",
  Menunggu: "badge-berjalan",
} as const

export function PaymentHistory() {
  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <Title order={2} size="h5">
          Riwayat Pembayaran
        </Title>
        <span className="caption text-muted">{TRANSACTIONS.length} transaksi</span>
      </div>

      <DataTable
        rows={TRANSACTIONS.map((t, i) => ({ ...t, keterangan: installmentLabel(i) }))}
        rowKey={(t) => t.id}
        defaultSort={{ key: "tanggal", dir: "desc" }}
        filter={{ value: (t) => t.status, options: ["Lunas", "Menunggu"] }}
        columns={[
          {
            key: "tanggal",
            header: "Tanggal",
            sort: (t) => t.date,
            cell: (t) => formatDate(t.date),
          },
          { key: "keterangan", header: "Keterangan", cell: (t) => t.keterangan },
          { key: "metode", header: "Metode", sort: (t) => t.method, cell: (t) => t.method },
          {
            key: "nominal",
            header: "Nominal",
            align: "right",
            sort: (t) => t.amount.amount,
            cell: (t) => formatMoney(t.amount),
          },
          {
            key: "status",
            header: "Status",
            sort: (t) => t.status,
            cell: (t) => <span className={`badge ${BADGE[t.status]}`}>{t.status}</span>,
          },
          {
            key: "kwitansi",
            header: "Kwitansi",
            cell: (t) =>
              t.status === "Lunas" ? (
                <a className="link" href={`/receipts/${t.id}.pdf`} download>
                  Unduh
                </a>
              ) : (
                <span className="caption text-muted">Menunggu verifikasi Finance</span>
              ),
          },
        ]}
      />
    </section>
  )
}
