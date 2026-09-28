"use client"

import { Title } from "@mantine/core"

import { DataTable } from "@/src/components/data/DataTable"
import { paymentLabelOf, type PortalPaymentRow, RUPIAH_STATUS } from "@/src/entities/portal/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { formatDate } from "@/src/lib/format"
import { formatMoney, idr } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

const STATUS_OPTIONS = [...new Set(Object.values(RUPIAH_STATUS).map((status) => status.label))]

async function downloadReceipt(id: string) {
  try {
    await openRenderedFile(`/print/me/receipts/${encodeURIComponent(id)}`)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

function ReceiptCell({ row }: { row: PortalPaymentRow }) {
  if (row.hasReceipt) {
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => void downloadReceipt(row.id)}
      >
        Unduh
      </button>
    )
  }
  return (
    <span className="caption text-muted">
      {row.status === "Menunggu" ? "Menunggu verifikasi Finance" : "Tidak terbit"}
    </span>
  )
}

export function PaymentHistory({ rows }: { rows: readonly PortalPaymentRow[] }) {
  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <Title order={2} size="h5">
          Riwayat Pembayaran
        </Title>
        <span className="caption text-muted">{rows.length} transaksi</span>
      </div>

      <DataTable
        rows={rows}
        rowKey={(row) => row.id}
        defaultSort={{ key: "tanggal", dir: "desc" }}
        filter={{ value: (row) => RUPIAH_STATUS[row.status].label, options: STATUS_OPTIONS }}
        emptyText="Belum ada pembayaran tercatat."
        columns={[
          {
            key: "tanggal",
            header: "Tanggal",
            sort: (row) => row.paidOn,
            cell: (row) => formatDate(row.paidOn),
          },
          {
            key: "keterangan",
            header: "Keterangan",
            cell: (row) =>
              row.rejectReason ? (
                <div className="stack" style={{ gap: 2 }}>
                  <span>{paymentLabelOf(row)}</span>
                  <span className="caption text-danger">{row.rejectReason}</span>
                </div>
              ) : (
                paymentLabelOf(row)
              ),
          },
          { key: "metode", header: "Metode", sort: (row) => row.method, cell: (row) => row.method },
          {
            key: "nominal",
            header: "Nominal",
            align: "right",
            sort: (row) => row.amount,
            cell: (row) => formatMoney(idr(row.amount)),
          },
          {
            key: "status",
            header: "Status",
            sort: (row) => RUPIAH_STATUS[row.status].label,
            cell: (row) => (
              <span className={`badge badge-${RUPIAH_STATUS[row.status].tone}`}>
                {RUPIAH_STATUS[row.status].label}
              </span>
            ),
          },
          { key: "kwitansi", header: "Kwitansi", cell: (row) => <ReceiptCell row={row} /> },
        ]}
      />
    </section>
  )
}
