"use client"

import { useState } from "react"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { Notice } from "@/src/components/ui/Notice"
import { paymentsQuery, pendingPaymentsQuery } from "@/src/entities/payment/queries"
import {
  LANE_LABEL,
  PAYMENT_FILTERS,
  PAYMENT_STATUS_BADGE,
  PAYMENT_STATUSES,
  type PaymentRow,
} from "@/src/entities/payment/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"
import { useListParams } from "@/src/lib/use-list-params"

import { CashPaymentModal } from "./CashPaymentModal"
import { ListDateFilter } from "./ListDateFilter"
import { PaymentDetailModal } from "./PaymentDetailModal"

const LANE_OPTIONS = (["IDR", "EUR"] as const).map((value) => ({
  value,
  label: LANE_LABEL[value],
}))
const STATUS_OPTIONS = PAYMENT_STATUSES.map((value) => ({ value, label: value }))

export function PaymentsTable({
  canRecord,
  canRatify,
  viewerId,
}: {
  canRecord: boolean
  canRatify: boolean
  viewerId: string
}) {
  const { params, setParams } = useListParams(PAYMENT_FILTERS)
  const payments = useRead(paymentsQuery(params))
  const pending = useRead(pendingPaymentsQuery())
  const [isRecording, setIsRecording] = useState(false)
  const [detailId, setDetailId] = useState<string | null>(null)
  const pendingTotal = pending.data?.total ?? 0

  const columns: readonly DataColumn<PaymentRow>[] = [
    { key: "tanggal", header: "Tanggal", cell: (row) => formatDate(row.paidOn) },
    {
      key: "siswa",
      header: "Siswa",
      cell: (row) => (
        <div className="stack" style={{ gap: 0 }}>
          <span style={{ fontWeight: 600 }}>{row.student.name}</span>
          <span className="caption text-muted">{row.student.nis ?? "Belum ber-NIS"}</span>
        </div>
      ),
    },
    {
      key: "kontrak",
      header: "No. Kontrak",
      cell: (row) => row.contractNumber ?? <span className="text-muted">{DASH}</span>,
    },
    { key: "jalur", header: "Jalur", cell: (row) => LANE_LABEL[row.currency] },
    {
      key: "nominal",
      header: "Nominal",
      align: "right",
      cell: (row) => (
        <span className="tabular">
          {formatMoney({ amount: row.amount, currency: row.currency })}
        </span>
      ),
    },
    { key: "metode", header: "Metode", cell: (row) => row.method },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={`badge ${PAYMENT_STATUS_BADGE[row.status]}`}>{row.status}</span>
      ),
    },
    {
      key: "aksi",
      header: "Aksi",
      cell: (row) => {
        const isRatifying = row.status === "Menunggu" && canRatify
        return (
          <button
            type="button"
            className={`btn btn-sm ${isRatifying ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setDetailId(row.id)}
          >
            {isRatifying ? "Sahkan" : "Detail"}
          </button>
        )
      },
    },
  ]

  return (
    <div className="stack stack-lg">
      {pendingTotal > 0 && (
        <Notice
          tone="warning"
          title={`${pendingTotal} pembayaran menunggu pengesahan`}
          actions={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setParams({ status: "Menunggu" })}
            >
              Lihat antrian
            </button>
          }
        >
          Tunai Euro, dana talang, dan Bayar Cash dari portal berlaku setelah Manajer Finance
          mengesahkannya. Penolakan tidak menghapus catatan.
        </Notice>
      )}

      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="row row-wrap" style={{ gap: 8 }}>
            <ListSearch label="Cari nama siswa atau nomor kontrak" />
            <ListFilter
              name="currency"
              label="jalur"
              placeholder="Jalur: Semua"
              options={LANE_OPTIONS}
            />
            <ListFilter
              name="status"
              label="status"
              placeholder="Status: Semua"
              options={STATUS_OPTIONS}
            />
            <ListDateFilter name="from" label="Dari tanggal" />
            <ListDateFilter name="to" label="Sampai tanggal" />
          </div>
          {canRecord && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setIsRecording(true)}
            >
              Catat Pembayaran Tunai
            </button>
          )}
        </div>

        {payments.isError ? (
          <QueryError message={payments.error.message} onRetry={() => void payments.refetch()} />
        ) : (
          <ServerDataTable
            rows={payments.data?.data ?? []}
            total={payments.data?.meta.total ?? 0}
            isPending={payments.isPending}
            columns={columns}
            rowKey={(row) => row.id}
            stickyLast
            emptyText="Tidak ada transaksi yang cocok."
          />
        )}
      </section>

      {isRecording && <CashPaymentModal onClose={() => setIsRecording(false)} />}
      {detailId && (
        <PaymentDetailModal
          key={detailId}
          paymentId={detailId}
          canRatify={canRatify}
          viewerId={viewerId}
          onClose={() => setDetailId(null)}
        />
      )}
    </div>
  )
}
