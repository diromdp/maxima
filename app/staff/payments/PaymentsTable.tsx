"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { DateInput } from "@mantine/dates"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { Notice } from "@/src/components/ui/Notice"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"

import { CashPaymentModal } from "./CashPaymentModal"
import { PaymentDetailModal } from "./PaymentDetailModal"
import {
  inRange,
  LANES,
  PAYMENT_ROWS,
  type PaymentRow,
  pendingQueue,
  STATUS_BADGE,
  STATUSES,
} from "./sample"

const ALL = "Semua"

const isoDate = (value: Date | string | null): string | null =>
  value === null ? null : new Date(value).toISOString().slice(0, 10)

export function PaymentsTable({
  canRecord,
  canRatify,
}: {
  canRecord: boolean
  canRatify: boolean
}) {
  const [query, setQuery] = useState("")
  const [lane, setLane] = useState(ALL)
  const [status, setStatus] = useState(ALL)
  const [from, setFrom] = useState<string | null>(null)
  const [to, setTo] = useState<string | null>(null)
  const [recording, setRecording] = useState(false)
  const [detail, setDetail] = useState<PaymentRow | null>(null)

  const needle = query.trim().toLowerCase()
  const rows = PAYMENT_ROWS.filter(
    (row) =>
      (lane === ALL || row.lane === lane) &&
      (status === ALL || row.status === status) &&
      inRange(row, from, to) &&
      (needle === "" ||
        row.studentName.toLowerCase().includes(needle) ||
        (row.contractNumber ?? "").toLowerCase().includes(needle)),
  )
  const pending = pendingQueue(PAYMENT_ROWS).length

  return (
    <div className="stack stack-lg">
      {pending > 0 && (
        <Notice
          tone="warning"
          title={`${pending} pembayaran menunggu pengesahan`}
          actions={
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setStatus("Menunggu")}
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
            <TextInput
              aria-label="Cari nama siswa atau nomor kontrak"
              placeholder="Cari nama siswa atau nomor kontrak"
              size="sm"
              leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              style={{ flex: "1 1 240px", maxWidth: 320 }}
            />
            <Select
              aria-label="Jalur"
              size="sm"
              w={150}
              allowDeselect={false}
              data={[ALL, ...LANES].map((value) => ({
                value,
                label: value === ALL ? "Jalur: Semua" : value,
              }))}
              value={lane}
              onChange={(value) => value && setLane(value)}
            />
            <Select
              aria-label="Status"
              size="sm"
              w={150}
              allowDeselect={false}
              data={[ALL, ...STATUSES].map((value) => ({
                value,
                label: value === ALL ? "Status: Semua" : value,
              }))}
              value={status}
              onChange={(value) => value && setStatus(value)}
            />
            <DateInput
              aria-label="Dari tanggal"
              placeholder="Dari tanggal"
              size="sm"
              w={150}
              valueFormat="DD/MM/YYYY"
              clearable
              value={from}
              onChange={(value) => setFrom(isoDate(value))}
            />
            <DateInput
              aria-label="Sampai tanggal"
              placeholder="Sampai tanggal"
              size="sm"
              w={150}
              valueFormat="DD/MM/YYYY"
              clearable
              value={to}
              onChange={(value) => setTo(isoDate(value))}
            />
          </div>
          {canRecord && (
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => setRecording(true)}
            >
              Catat Pembayaran Tunai
            </button>
          )}
        </div>

        <DataTable<PaymentRow>
          rows={rows}
          rowKey={(row) => row.id}
          defaultSort={{ key: "tanggal", dir: "desc" }}
          stickyLast
          emptyText="Tidak ada transaksi yang cocok."
          columns={[
            {
              key: "tanggal",
              header: "Tanggal",
              sort: (row) => row.date,
              cell: (row) => formatDate(row.date),
            },
            {
              key: "siswa",
              header: "Siswa",
              sort: (row) => row.studentName,
              cell: (row) => (
                <div className="stack" style={{ gap: 0 }}>
                  <span style={{ fontWeight: 600 }}>{row.studentName}</span>
                  <span className="caption text-muted">{row.nis}</span>
                </div>
              ),
            },
            {
              key: "kontrak",
              header: "No. Kontrak",
              cell: (row) => row.contractNumber ?? <span className="text-muted">{DASH}</span>,
            },
            { key: "jalur", header: "Jalur", sort: (row) => row.lane, cell: (row) => row.lane },
            {
              key: "nominal",
              header: "Nominal",
              align: "right",
              sort: (row) => row.amount.amount,
              cell: (row) => formatMoney(row.amount),
            },
            {
              key: "metode",
              header: "Metode",
              sort: (row) => row.method,
              cell: (row) => row.method,
            },
            {
              key: "status",
              header: "Status",
              sort: (row) => row.status,
              cell: (row) => (
                <span className={`badge ${STATUS_BADGE[row.status]}`}>{row.status}</span>
              ),
            },
            {
              key: "aksi",
              header: "Aksi",
              cell: (row) => (
                <button
                  type="button"
                  className={`btn btn-sm ${row.status === "Menunggu" && canRatify ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setDetail(row)}
                >
                  {row.status === "Menunggu" && canRatify ? "Sahkan" : "Detail"}
                </button>
              ),
            },
          ]}
        />
      </section>

      <CashPaymentModal opened={recording} onClose={() => setRecording(false)} />
      {detail && (
        <PaymentDetailModal
          key={detail.id}
          row={detail}
          canRatify={canRatify}
          onClose={() => setDetail(null)}
        />
      )}
    </div>
  )
}
