"use client"

import { SegmentedControl } from "@mantine/core"

import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { remindersQuery } from "@/src/entities/invoice/queries"
import {
  REMINDER_FILTERS,
  REMINDER_STATUSES,
  type ReminderRow,
  type ReminderStatus,
} from "@/src/entities/invoice/schema"
import { queryString } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDateTime } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { euro, rupiah } from "./format"

const ALL = "all"

const REMINDER_STATUS_BADGE: Readonly<Record<ReminderStatus, string>> = {
  TERKIRIM: "badge-success",
  GAGAL: "badge-danger",
}

const COLUMNS: readonly DataColumn<ReminderRow>[] = [
  { key: "sentAt", header: "Tanggal Kirim", cell: (row) => formatDateTime(row.sentAt) },
  { key: "nis", header: "NIS", cell: (row) => <span className="tabular">{row.nis ?? DASH}</span> },
  {
    key: "name",
    header: "Siswa",
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.name ?? DASH}</span>,
  },
  {
    key: "remainingIdr",
    header: "Piutang (IDR)",
    align: "right",
    cell: (row) => (row.remainingIdr === null ? DASH : rupiah(row.remainingIdr)),
  },
  {
    key: "remainingEur",
    header: "Piutang (EURO)",
    align: "right",
    cell: (row) => euro(row.remainingEurCents),
  },
  {
    key: "status",
    header: "Status",
    wrap: true,
    cell: (row) => (
      <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
        <span className={`badge ${REMINDER_STATUS_BADGE[row.status]}`}>{row.status}</span>
        {row.failureReason && <span className="caption text-danger">{row.failureReason}</span>}
      </div>
    ),
  },
]

export function RemindersTab() {
  const { params, setParams } = useListParams(REMINDER_FILTERS)
  const reminders = useRead(remindersQuery(params))
  const summary = reminders.data?.summary
  const exportQuery = queryString({ search: params.search, status: params.status })

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 12, alignItems: "center" }}>
          <ListSearch label="Cari nama siswa atau NIS" />
          {summary && (
            <span className="caption text-muted">
              {summary.total} pengiriman
              {summary.failed > 0 && (
                <span className="text-danger">, {summary.failed} gagal (email memantul)</span>
              )}
            </span>
          )}
        </div>
        <a
          href={`/api/download/invoices/reminders/export${exportQuery}`}
          className="btn btn-secondary btn-sm"
        >
          Ekspor Log (.xlsx)
        </a>
      </div>

      <SegmentedControl
        size="sm"
        aria-label="Saring status pengiriman"
        style={{ alignSelf: "flex-start" }}
        value={params.status ?? ALL}
        onChange={(value) => setParams({ status: value === ALL ? null : value })}
        data={[
          { value: ALL, label: "Semua" },
          ...REMINDER_STATUSES.map((status) => ({ value: status, label: status })),
        ]}
      />

      {reminders.isError ? (
        <QueryError message={reminders.error.message} onRetry={() => void reminders.refetch()} />
      ) : (
        <ServerDataTable
          rows={reminders.data?.data ?? []}
          total={reminders.data?.meta.total ?? 0}
          isPending={reminders.isPending}
          columns={COLUMNS}
          rowKey={(row) => row.id}
          emptyText="Belum ada pengiriman pada saringan ini."
        />
      )}
    </section>
  )
}
