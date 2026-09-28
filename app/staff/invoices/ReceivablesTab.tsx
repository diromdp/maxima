"use client"

import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { Notice } from "@/src/components/ui/Notice"
import { receivablesQuery } from "@/src/entities/invoice/queries"
import {
  RECEIVABLE_FILTERS,
  STUDENT_STATUSES,
  type ReceivableRow,
} from "@/src/entities/invoice/schema"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { euro, rupiah } from "./format"

const owed = (value: string, isOwed: boolean) => (
  <span className={isOwed ? "text-danger" : undefined}>{value}</span>
)

const COLUMNS: readonly DataColumn<ReceivableRow>[] = [
  {
    key: "name",
    header: "Nama Siswa",
    cell: (row) => (
      <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
        <span style={{ fontWeight: 600 }}>{row.name}</span>
        <span className="caption text-muted">
          {row.nis} · {row.studentStatus}
        </span>
        {row.needsDifferenceBilling && (
          <span
            className="badge badge-warning"
            title="Kembali dari cuti ke level lebih rendah. Nominal selisih dihitung Finance."
          >
            Perlu Tagihan Selisih
          </span>
        )}
      </div>
    ),
  },
  { key: "package", header: "Paket", cell: (row) => row.package.name },
  { key: "priceIdr", header: "Harga (IDR)", align: "right", cell: (row) => rupiah(row.priceIdr) },
  { key: "paidIdr", header: "Dibayar (IDR)", align: "right", cell: (row) => rupiah(row.paidIdr) },
  {
    key: "remainingIdr",
    header: "Piutang (IDR)",
    align: "right",
    cell: (row) => owed(rupiah(row.remainingIdr), row.remainingIdr > 0),
  },
  {
    key: "priceEur",
    header: "Harga (EURO)",
    align: "right",
    cell: (row) => euro(row.priceEurCents),
  },
  {
    key: "paidEur",
    header: "Dibayar (EURO)",
    align: "right",
    cell: (row) => (row.priceEurCents === null ? DASH : euro(row.paidEurCents)),
  },
  {
    key: "remainingEur",
    header: "Piutang (EURO)",
    align: "right",
    cell: (row) => owed(euro(row.remainingEurCents), (row.remainingEurCents ?? 0) > 0),
  },
  {
    key: "lastPaid",
    header: "Terakhir Bayar",
    cell: (row) => (row.lastPaidOn ? formatDate(row.lastPaidOn) : DASH),
  },
  {
    key: "transactions",
    header: "TRX",
    align: "right",
    cell: (row) => <span className="tabular">{row.transactionCount}</span>,
  },
]

export function ReceivablesTab() {
  const { params } = useListParams(RECEIVABLE_FILTERS)
  const receivables = useRead(receivablesQuery(params))
  const { branches } = useMasterOptions()

  return (
    <div className="stack stack-lg">
      <Notice tone="info" title="Informasi Sistem">
        Siswa berstatus Cuti tetap tampil di piutang, namun tidak akan dikirimkan reminder tagihan
        jatuh tempo otomatis. Rupiah dan Euro tidak pernah dijumlahkan.
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <ListFilter name="branch" label="Cabang" options={branches} />
            <ListFilter
              name="status"
              label="Status Program"
              options={STUDENT_STATUSES.map((status) => ({ value: status, label: status }))}
            />
          </div>
          {receivables.data && (
            <span className="caption text-muted tabular">
              {receivables.data.meta.total} kontrak
            </span>
          )}
        </div>

        {receivables.isError ? (
          <QueryError
            message={receivables.error.message}
            onRetry={() => void receivables.refetch()}
          />
        ) : (
          <ServerDataTable
            rows={receivables.data?.data ?? []}
            total={receivables.data?.meta.total ?? 0}
            isPending={receivables.isPending}
            columns={COLUMNS}
            rowKey={(row) => row.contractId}
            emptyText="Tidak ada piutang pada saringan ini."
          />
        )}
      </section>
    </div>
  )
}
