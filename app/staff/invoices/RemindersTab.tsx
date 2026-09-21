"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatDateTime } from "@/src/lib/format"
import { formatMoney } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import { type Reminder, REMINDER_STATUS_BADGE, REMINDERS, receivableByNis } from "./sample"

type ReminderRow = Reminder & {
  readonly studentName: string
  readonly dueIdr: string
  readonly dueEur: string
}

const ROWS: readonly ReminderRow[] = REMINDERS.map((reminder) => {
  const receivable = receivableByNis(reminder.nis)
  return {
    ...reminder,
    studentName: receivable?.student.name ?? reminder.nis,
    dueIdr: receivable ? formatMoney(receivable.dueIdr) : DASH,
    dueEur: receivable?.dueEur ? formatMoney(receivable.dueEur) : DASH,
  }
})

export function RemindersTab() {
  const [query, setQuery] = useState("")
  const needle = query.trim().toLowerCase()
  const rows = ROWS.filter(
    (row) =>
      needle === "" || row.studentName.toLowerCase().includes(needle) || row.nis.includes(needle),
  )
  const failed = rows.filter((row) => row.status === "GAGAL").length

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 12, alignItems: "center" }}>
          <TextInput
            aria-label="Cari pengiriman"
            placeholder="Cari nama siswa atau NIS"
            size="sm"
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px", maxWidth: 320 }}
          />
          <span className="caption text-muted">
            {rows.length} pengiriman
            {failed > 0 && <span className="text-danger">, {failed} gagal (email memantul)</span>}
          </span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => notify.success(`Log ${rows.length} pengiriman diekspor ke CSV.`)}
        >
          Ekspor Log (.CSV)
        </button>
      </div>

      <DataTable<ReminderRow>
        rows={rows}
        rowKey={(row) => row.id}
        defaultSort={{ key: "tanggal", dir: "desc" }}
        filter={{ value: (row) => row.status, options: ["TERKIRIM", "GAGAL"] }}
        emptyText="Belum ada pengiriman."
        columns={[
          {
            key: "tanggal",
            header: "Tanggal Kirim",
            sort: (row) => row.sentAt,
            cell: (row) => formatDateTime(row.sentAt),
          },
          { key: "nis", header: "NIS", cell: (row) => row.nis },
          {
            key: "siswa",
            header: "Siswa",
            sort: (row) => row.studentName,
            cell: (row) => <span style={{ fontWeight: 600 }}>{row.studentName}</span>,
          },
          {
            key: "piutang-idr",
            header: "Piutang (IDR)",
            align: "right",
            cell: (row) => row.dueIdr,
          },
          {
            key: "piutang-eur",
            header: "Piutang (EURO)",
            align: "right",
            cell: (row) => row.dueEur,
          },
          {
            key: "status",
            header: "Status",
            sort: (row) => row.status,
            cell: (row) => (
              <div className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
                <span className={`badge ${REMINDER_STATUS_BADGE[row.status]}`}>{row.status}</span>
                {row.failure && <span className="caption text-danger">{row.failure}</span>}
              </div>
            ),
          },
        ]}
      />
    </section>
  )
}
