"use client"

import { ArrowRight01Icon, Mail01Icon, UserIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { remindAllDue, remindContract } from "@/src/entities/invoice/actions"
import { dueQuery } from "@/src/entities/invoice/queries"
import { DUE_FILTERS, type DueRow, type DueStatus } from "@/src/entities/invoice/schema"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

import { euro, rupiah } from "./format"

const DUE_STATUS_BADGE: Readonly<Record<DueStatus, string>> = {
  TERLAMBAT: "badge-danger",
  "HAMPIR JATUH": "badge-warning",
}

const REMINDER_INVALIDATIONS = [["invoice-reminders"]] as const

function useReminders() {
  const queryClient = useQueryClient()
  const refresh = () =>
    Promise.all(
      REMINDER_INVALIDATIONS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )

  const confirmOne = (row: DueRow) =>
    modals.openConfirmModal({
      title: `Kirim pengingat ke ${row.name}?`,
      children: (
        <p className="body-sm">
          Email tagihan jatuh tempo {formatDate(row.dueDate)} dengan kekurangan{" "}
          {rupiah(row.shortfallIdr)} dikirim ke email siswa. Hasilnya tercatat di Riwayat Reminder.
        </p>
      ),
      labels: { confirm: "Kirim Sekarang", cancel: "Batal" },
      onConfirm: async () => {
        const result = await remindContract(row.contractId)
        if (!result.ok) return notify.error(result.message)
        if (result.data.sent === 0) {
          return notify.error(
            `${row.name} belum punya alamat surel, jadi pengingat tidak terkirim. Lengkapi surelnya di halaman Siswa.`,
          )
        }
        notify.success(`Pengingat dikirim ke ${row.name}.`)
        await refresh()
      },
    })

  const confirmAll = (total: number, filter: { branch?: string; search?: string }) =>
    modals.openConfirmModal({
      title: `Kirim pengingat ke ${total} siswa?`,
      children: (
        <p className="body-sm">
          Email tagihan dikirim ke seluruh baris yang tersaring saat ini ({total} siswa). Siswa yang
          sudah dikirimi pengingat hari ini dilewati. Hasil pengiriman tercatat di Riwayat Reminder.
        </p>
      ),
      labels: { confirm: "Kirim Sekarang", cancel: "Batal" },
      onConfirm: async () => {
        const result = await remindAllDue(filter)
        if (!result.ok) return notify.error(result.message)
        const skipped = total - result.data.sent
        notify.success(
          `Pengingat dikirim ke ${result.data.sent} siswa.${skipped > 0 ? ` ${skipped} siswa dilewati karena belum punya alamat surel.` : ""}`,
        )
        await refresh()
      },
    })

  return { confirmOne, confirmAll }
}

function columnsFor(onRemind: (row: DueRow) => void): readonly DataColumn<DueRow>[] {
  return [
    { key: "nis", header: "NIS", cell: (row) => <span className="tabular">{row.nis}</span> },
    {
      key: "name",
      header: "Nama Siswa",
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      key: "shortfallIdr",
      header: "Kekurangan (IDR)",
      align: "right",
      cell: (row) => (
        <span className={row.shortfallIdr > 0 ? "text-danger" : undefined}>
          {rupiah(row.shortfallIdr)}
        </span>
      ),
    },
    {
      key: "targetIdr",
      header: "Target (IDR)",
      align: "right",
      cell: (row) => rupiah(row.targetIdr),
    },
    {
      key: "remainingEur",
      header: "Kekurangan (EURO)",
      align: "right",
      cell: (row) => (
        <span className={(row.remainingEurCents ?? 0) > 0 ? "text-danger" : undefined}>
          {euro(row.remainingEurCents)}
        </span>
      ),
    },
    {
      key: "priceEur",
      header: "Target (EURO)",
      align: "right",
      cell: (row) => euro(row.priceEurCents),
    },
    { key: "dueDate", header: "Jatuh Tempo", cell: (row) => formatDate(row.dueDate) },
    {
      key: "daysLate",
      header: "Hari Terlambat",
      align: "right",
      cell: (row) =>
        row.daysLate > 0 ? (
          <span className="text-danger tabular">{row.daysLate} hari</span>
        ) : (
          <span className="text-muted">{DASH}</span>
        ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => <span className={`badge ${DUE_STATUS_BADGE[row.status]}`}>{row.status}</span>,
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
            title={`Kirim pengingat ke ${row.name}`}
            aria-label={`Kirim pengingat ke ${row.name}`}
            onClick={() => onRemind(row)}
          >
            <HugeiconsIcon icon={Mail01Icon} size={16} strokeWidth={1.5} />
          </button>
          {row.pic ? (
            <a
              href={`mailto:${row.pic.email}?subject=${encodeURIComponent(`Tunggakan ${row.name}`)}`}
              className="btn btn-icon btn-sm"
              title={`Hubungi PIC ${row.pic.name}`}
              aria-label={`Hubungi PIC ${row.pic.name}`}
            >
              <HugeiconsIcon icon={UserIcon} size={16} strokeWidth={1.5} />
            </a>
          ) : null}
          <Link
            href={`/staff/students/${encodeURIComponent(row.nis)}?tab=finance`}
            className="btn btn-icon btn-sm"
            title={`Buka keuangan ${row.name}`}
            aria-label={`Buka keuangan ${row.name}`}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} size={16} strokeWidth={1.5} />
          </Link>
        </div>
      ),
    },
  ]
}

export function DueTab() {
  const { params } = useListParams(DUE_FILTERS)
  const due = useRead(dueQuery(params))
  const { branches } = useMasterOptions()
  const { confirmOne, confirmAll } = useReminders()

  const total = due.data?.meta.total ?? 0
  const summary = due.data?.summary

  const cards = [
    {
      label: "Total Piutang Jatuh Tempo (Rp)",
      value: summary ? rupiah(summary.overdueTotalIdr) : DASH,
      caption: summary ? `Dari ${summary.overdueCount} siswa tertunggak` : "",
      tone: " text-danger",
    },
    {
      label: "Siswa Tertunggak",
      value: summary ? String(summary.overdueCount) : DASH,
      caption: "Melewati tanggal tagih",
      tone: "",
    },
    {
      label: "Rata-rata Keterlambatan",
      value: summary ? `${summary.averageDaysLate} Hari` : DASH,
      caption: "Hari sejak tanggal tempo",
      tone: "",
    },
  ]

  return (
    <div className="stack stack-lg">
      <div className="row row-between row-wrap" style={{ gap: 12 }}>
        <span className="caption text-muted">
          Reminder otomatis terbit H-9 · hari-H · H+7 terhadap Tanggal Tagih paket, hanya lewat
          email. Siswa Cuti dan paket tanpa cicilan bulanan tidak ditagih.
        </span>
        <div className="row row-wrap" style={{ gap: 8 }}>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={total === 0}
            title={total === 0 ? "Tidak ada tagihan jatuh tempo pada saringan ini." : undefined}
            onClick={() => confirmAll(total, { branch: params.branch, search: params.search })}
          >
            Kirim Pengingat Massal
          </button>
        </div>
      </div>

      <div className="grid-3">
        {cards.map(({ label, value, caption, tone }) => (
          <section key={label} className="card stack stack-sm" aria-busy={due.isPending}>
            <span className="label text-muted">{label}</span>
            <span className={`h4 tabular${tone}`}>{value}</span>
            <span className="caption text-muted">{caption}</span>
          </section>
        ))}
      </div>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <ListFilter name="branch" label="Cabang" options={branches} />
          {due.data && <span className="caption text-muted tabular">{total} tagihan</span>}
        </div>

        {due.isError ? (
          <QueryError message={due.error.message} onRetry={() => void due.refetch()} />
        ) : (
          <ServerDataTable
            rows={due.data?.data ?? []}
            total={total}
            isPending={due.isPending}
            columns={columnsFor(confirmOne)}
            rowKey={(row) => row.contractId}
            stickyLast
            emptyText="Tidak ada tagihan jatuh tempo pada saringan ini."
          />
        )}
      </section>
    </div>
  )
}
