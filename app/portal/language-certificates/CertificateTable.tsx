"use client"

import { Skeleton } from "@mantine/core"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import dayjs from "dayjs"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { removeOwnCertificate } from "@/src/entities/certificate/own-actions"
import { ownCertificatesQuery } from "@/src/entities/certificate/queries"
import {
  isOwnEditable,
  MODULE_KEYS,
  MODULE_LABEL,
  ownStatusOf,
  type CertificateModule,
  type CertificateRow,
  type OwnCertificateStatus,
} from "@/src/entities/certificate/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatMonthYear } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { CertificateFormModal } from "./CertificateFormModal"

const SOON_EXPIRING_DAYS = 90
const SKELETON_ROWS = 4

const STATUS_BADGE: Readonly<Record<OwnCertificateStatus, string>> = {
  Terverifikasi: "badge-beres",
  Menunggu: "badge-berjalan",
  Expired: "badge-tindakan",
  Ditolak: "badge-tindakan",
}

const STATUS_OPTIONS: readonly OwnCertificateStatus[] = [
  "Terverifikasi",
  "Menunggu",
  "Expired",
  "Ditolak",
]

const EXPIRY_HEADER = {
  lesen: "Lesen Exp",
  hoeren: "Hören Exp",
  schreiben: "Schr. Exp",
  sprechen: "Spr. Exp",
} as const

const LEAVE_REASON = "Sertifikat dapat diubah lagi setelah masa cuti Anda selesai."
const VERIFIED_REASON = "Sudah diverifikasi Admin. Ajukan perubahannya lewat PIC cabang."

const moduleOf = (row: CertificateRow, label: string): CertificateModule | undefined =>
  row.modules.find((entry) => entry.module === label)

function isSoonExpiring(row: CertificateRow) {
  const today = dayjs().startOf("day")
  return row.modules.some((entry) => {
    if (!entry.validUntil || entry.expired) return false
    const days = dayjs(entry.validUntil).diff(today, "day")
    return days >= 0 && days <= SOON_EXPIRING_DAYS
  })
}

const moduleColumns: readonly DataColumn<CertificateRow>[] = MODULE_KEYS.flatMap((key) => {
  const label = MODULE_LABEL[key]
  return [
    {
      key: `${key}-score`,
      header: label,
      align: "right" as const,
      sort: (row: CertificateRow) => moduleOf(row, label)?.score ?? -1,
      cell: (row: CertificateRow) => moduleOf(row, label)?.score ?? DASH,
    },
    {
      key: `${key}-expiry`,
      header: EXPIRY_HEADER[key],
      sort: (row: CertificateRow) => moduleOf(row, label)?.validUntil ?? "",
      cell: (row: CertificateRow) => {
        const entry = moduleOf(row, label)
        if (!entry?.validUntil) return DASH
        return (
          <span className={entry.expired ? "text-danger" : undefined}>
            {formatMonthYear(entry.validUntil)}
          </span>
        )
      },
    },
  ]
})

function confirmRemoval(row: CertificateRow, onRemoved: () => void) {
  modals.openConfirmModal({
    title: `Hapus sertifikat ${row.kind.name} ${row.level.name}?`,
    children:
      "Data nilai dan berkasnya dihapus dari daftar Anda. Tindakan ini tidak dapat dibatalkan.",
    labels: { confirm: "Hapus", cancel: "Batal" },
    confirmProps: { color: "red" },
    onConfirm: async () => {
      const result = await removeOwnCertificate(row.id)
      if (!result.ok) {
        notify.error(result.message)
        return
      }
      notify.success(`Sertifikat ${row.kind.name} ${row.level.name} dihapus.`)
      onRemoved()
    },
  })
}

export function CertificateTable({ isOnLeave }: { isOnLeave: boolean }) {
  const certificates = useRead(ownCertificatesQuery())
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState<CertificateRow | "new" | null>(null)
  const refresh = () => void queryClient.invalidateQueries({ queryKey: ["own-certificates"] })

  const columns: readonly DataColumn<CertificateRow>[] = [
    { key: "kind", header: "Jenis", sort: (row) => row.kind.name, cell: (row) => row.kind.name },
    { key: "level", header: "Level", sort: (row) => row.level.name, cell: (row) => row.level.name },
    ...moduleColumns,
    {
      key: "status",
      header: "Status",
      sort: (row) => ownStatusOf(row),
      cell: (row) => {
        const status = ownStatusOf(row)
        return (
          <div className="stack stack-sm" style={{ alignItems: "flex-start" }}>
            <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
            {status === "Ditolak" && row.rejectReason && (
              <span className="caption text-danger wrap" style={{ maxWidth: 220 }}>
                {row.rejectReason}
              </span>
            )}
            {status !== "Expired" && isSoonExpiring(row) && (
              <span className="caption text-warning">Segera kedaluwarsa</span>
            )}
          </div>
        )
      },
    },
    {
      key: "file",
      header: "File",
      cell: (row) =>
        row.hasFile ? (
          <button
            type="button"
            className="link"
            onClick={() => void previewPresigned(`/certificates/me/${row.id}/file`)}
          >
            Unduh
          </button>
        ) : (
          <span className="text-muted">Belum ada</span>
        ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => {
        const reason = isOnLeave ? LEAVE_REASON : isOwnEditable(row) ? undefined : VERIFIED_REASON
        return (
          <div className="row" title={reason}>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={reason !== undefined}
              aria-label={reason ? `Edit tidak tersedia: ${reason}` : undefined}
              onClick={() => setEditing(row)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-danger-soft btn-sm"
              disabled={reason !== undefined}
              aria-label={reason ? `Hapus tidak tersedia: ${reason}` : undefined}
              onClick={() => confirmRemoval(row, refresh)}
            >
              Hapus
            </button>
          </div>
        )
      },
    },
  ]

  return (
    <section className="card stack">
      <div className="row row-between">
        <h2 className="h5">Sertifikat Saya</h2>
        <button
          type="button"
          className="btn btn-primary"
          disabled={isOnLeave}
          title={isOnLeave ? LEAVE_REASON : undefined}
          onClick={() => setEditing("new")}
        >
          Tambah Sertifikat
        </button>
      </div>

      {isOnLeave && <span className="caption text-muted">{LEAVE_REASON}</span>}

      {certificates.isError ? (
        <QueryError
          message={certificates.error.message}
          onRetry={() => void certificates.refetch()}
        />
      ) : certificates.isPending ? (
        <CertificateRowsSkeleton />
      ) : (
        <DataTable
          rows={certificates.data.data}
          columns={columns}
          rowKey={(row) => row.id}
          defaultSort={{ key: "level", dir: "desc" }}
          stickyLast
          filter={{ value: ownStatusOf, options: STATUS_OPTIONS }}
          emptyText="Belum ada sertifikat. Tambahkan lewat tombol Tambah Sertifikat."
        />
      )}

      {editing && (
        <CertificateFormModal
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}

export function CertificateRowsSkeleton() {
  return (
    <div className="stack stack-sm" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={36} radius="sm" aria-hidden />
      {Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <Skeleton key={index} height={44} radius="sm" aria-hidden />
      ))}
    </div>
  )
}
