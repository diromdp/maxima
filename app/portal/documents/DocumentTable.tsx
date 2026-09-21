"use client"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { DASH, formatDate } from "@/src/lib/format"

import {
  canDownload,
  canUpload,
  isLocked,
  type DocumentGroup,
  type FileItem,
  type FileStatus,
} from "./documents"
import { UploadModal } from "./UploadModal"

const BADGE: Readonly<Record<FileStatus, string>> = {
  Terverifikasi: "badge-beres",
  Selesai: "badge-beres",
  Menunggu: "badge-berjalan",
  Diproses: "badge-berjalan",
  "Belum diunggah": "badge-tindakan",
  Ditolak: "badge-tindakan",
}

export function DocumentTable({
  group,
  hasVertrag,
}: {
  group: DocumentGroup
  hasVertrag: boolean
}) {
  const statuses = [...new Set(group.files.map((b) => b.status))]

  const columns: readonly DataColumn<FileItem>[] = [
    {
      key: "dokumen",
      header: "Dokumen",
      wrap: true,
      sort: (b) => b.name,
      cell: (b) => (
        <div className="stack stack-sm">
          <span>{b.name}</span>
          {b.status === "Ditolak" && b.reason && (
            <span className="caption text-danger">{b.reason}</span>
          )}
        </div>
      ),
    },
    {
      key: "tanggal",
      header: "Tanggal",
      sort: (b) => b.date ?? "",
      cell: (b) => (b.date ? formatDate(b.date) : DASH),
    },
    {
      key: "status",
      header: "Status",
      sort: (b) => b.status,
      cell: (b) => <span className={`badge ${BADGE[b.status]}`}>{b.status}</span>,
    },
    {
      key: "aksi",
      header: "Aksi",
      cell: (b) => (
        <div className="row">
          {canDownload(b) && (
            <a className="link" href={`/files/${b.source ?? b.name}`} download>
              Unduh
            </a>
          )}
          {canUpload(group, b, hasVertrag) && (
            <UploadModal
              name={b.name}
              kind={b.kind ?? "pdf"}
              replace={b.status !== "Belum diunggah"}
              verified={b.status === "Terverifikasi"}
              currentFile={b.status !== "Belum diunggah" ? b.name : undefined}
            />
          )}
          {group.role === "download" && b.status === "Diproses" && (
            <span className="caption text-muted wrap">
              Dikerjakan Maxima, lihat Progres Administrasi
            </span>
          )}
          {isLocked(group, hasVertrag) && (
            <span className="caption text-muted">Terbuka setelah Dapat Vertrag</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <DataTable
      rows={group.files}
      columns={columns}
      rowKey={(b) => b.name}
      filter={statuses.length > 1 ? { value: (b) => b.status, options: statuses } : undefined}
    />
  )
}
