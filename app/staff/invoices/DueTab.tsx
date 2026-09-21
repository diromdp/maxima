"use client"

import { ArrowRight01Icon, Mail01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select } from "@mantine/core"
import { modals } from "@mantine/modals"
import Link from "next/link"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatDate } from "@/src/lib/format"
import { formatMoney, type Money } from "@/src/lib/money"
import { notify } from "@/src/lib/notify"

import { BRANCHES } from "../classes/sample"
import {
  averageDaysLate,
  DUE_ROWS,
  DUE_STATUS_BADGE,
  type DueRow,
  overdueCount,
  overdueTotal,
  REMINDER_OFFSETS,
} from "./sample"

const ALL = "Semua"

const optional = (value: Money | null) =>
  value === null ? <span className="text-muted">{DASH}</span> : formatMoney(value)

export function DueTab() {
  const [branch, setBranch] = useState(ALL)
  const [status, setStatus] = useState(ALL)

  const rows = DUE_ROWS.filter(
    (row) =>
      (branch === ALL || row.student.branch === branch) &&
      (status === ALL || row.status === status),
  )
  const late = overdueCount(rows)

  const cards = [
    {
      label: "Total Piutang Jatuh Tempo (Rp)",
      value: formatMoney(overdueTotal(rows)),
      caption: `Dari ${late} siswa tertunggak`,
      tone: "danger",
    },
    { label: "Siswa Tertunggak", value: String(late), caption: "Melewati tanggal tagih" },
    {
      label: "Rata-rata Keterlambatan",
      value: `${averageDaysLate(rows)} Hari`,
      caption: "Hari sejak tanggal tempo",
    },
  ]

  function confirmSingleReminder(row: DueRow) {
    modals.openConfirmModal({
      title: `Kirim pengingat ke ${row.student.name}?`,
      children: `Email tagihan jatuh tempo ${formatDate(row.dueDate)} dengan kekurangan ${formatMoney(row.shortfallIdr)} dikirim ke email siswa. Hasilnya tercatat di Riwayat Reminder.`,
      labels: { confirm: "Kirim Sekarang", cancel: "Batal" },
      onConfirm: () => notify.success(`Pengingat dikirim ke ${row.student.name}.`),
    })
  }

  function confirmBulkReminder() {
    modals.openConfirmModal({
      title: `Kirim pengingat ke ${rows.length} siswa?`,
      children: `Email tagihan dikirim ke seluruh baris yang tersaring saat ini (${rows.length} siswa). Hasil pengiriman tercatat di Riwayat Reminder.`,
      labels: { confirm: "Kirim Sekarang", cancel: "Batal" },
      onConfirm: () => notify.success(`Pengingat dikirim ke ${rows.length} siswa.`),
    })
  }

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <span className="caption text-muted">
          Reminder otomatis terbit {REMINDER_OFFSETS.join(" · ")} terhadap Tanggal Tagih paket,
          hanya lewat email. Siswa Cuti dan paket tanpa cicilan bulanan tidak ditagih.
        </span>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => notify.success("Daftar tunggakan diteruskan ke PIC tiap cabang.")}
          >
            Hubungi PIC
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={rows.length === 0}
            onClick={confirmBulkReminder}
          >
            Kirim Pengingat Massal
          </button>
        </div>
      </div>

      <div className="grid-3">
        {cards.map(({ label, value, caption, tone }) => (
          <section key={label} className="card stack stack-sm">
            <span className="label text-muted">{label}</span>
            <span className={`h4 tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
            <span className="caption text-muted">{caption}</span>
          </section>
        ))}
      </div>

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
              label="Status"
              size="sm"
              w={170}
              allowDeselect={false}
              data={[ALL, "TERLAMBAT", "HAMPIR JATUH"]}
              value={status}
              onChange={(value) => value && setStatus(value)}
            />
          </div>
          <span className="caption text-muted">{rows.length} tagihan</span>
        </div>

        <DataTable<DueRow>
          rows={rows}
          rowKey={(row) => row.student.nis}
          defaultSort={{ key: "terlambat", dir: "desc" }}
          emptyText="Tidak ada tagihan jatuh tempo pada saringan ini."
          columns={[
            { key: "nis", header: "NIS", cell: (row) => row.student.nis },
            {
              key: "nama",
              header: "Nama Siswa",
              sort: (row) => row.student.name,
              cell: (row) => <span style={{ fontWeight: 600 }}>{row.student.name}</span>,
            },
            {
              key: "kurang-idr",
              header: "Kekurangan (IDR)",
              align: "right",
              sort: (row) => row.shortfallIdr.amount,
              cell: (row) => <span className="text-danger">{formatMoney(row.shortfallIdr)}</span>,
            },
            {
              key: "target-idr",
              header: "Target (IDR)",
              align: "right",
              cell: (row) => formatMoney(row.targetIdr),
            },
            {
              key: "kurang-eur",
              header: "Kekurangan (EURO)",
              align: "right",
              cell: (row) =>
                row.shortfallEur && row.shortfallEur.amount > 0 ? (
                  <span className="text-danger">{formatMoney(row.shortfallEur)}</span>
                ) : (
                  optional(row.shortfallEur)
                ),
            },
            {
              key: "target-eur",
              header: "Target (EURO)",
              align: "right",
              cell: (row) => optional(row.targetEur),
            },
            {
              key: "tempo",
              header: "Jatuh Tempo",
              sort: (row) => row.dueDate,
              cell: (row) => formatDate(row.dueDate),
            },
            {
              key: "terlambat",
              header: "Hari Terlambat",
              align: "right",
              sort: (row) => row.daysLate,
              cell: (row) =>
                row.daysLate > 0 ? (
                  <span className="text-danger">{row.daysLate} hari</span>
                ) : (
                  <span className="text-muted">{DASH}</span>
                ),
            },
            {
              key: "status",
              header: "Status",
              sort: (row) => row.status,
              cell: (row) => (
                <span className={`badge ${DUE_STATUS_BADGE[row.status]}`}>{row.status}</span>
              ),
            },
            {
              key: "actions",
              header: "Aksi",
              align: "right",
              cell: (row) => (
                <div className="row" style={{ gap: 4, justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    className="btn btn-icon btn-sm"
                    title={`Kirim pengingat ke ${row.student.name}`}
                    aria-label={`Kirim pengingat ke ${row.student.name}`}
                    onClick={() => confirmSingleReminder(row)}
                  >
                    <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.5} />
                  </button>
                  <Link
                    href={`/staff/students/${row.student.nis}?tab=finance`}
                    className="btn btn-icon btn-sm"
                    title={`Buka keuangan ${row.student.name}`}
                    aria-label={`Buka keuangan ${row.student.name}`}
                  >
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
                  </Link>
                </div>
              ),
            },
          ]}
        />
      </section>
    </div>
  )
}
