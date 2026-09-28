"use client"

import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import type { DocumentItem, DocumentState } from "@/src/entities/document/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { DASH, formatDate } from "@/src/lib/format"

import { UploadModal } from "./UploadModal"

export type PortalFileStatus =
  "Terverifikasi" | "Selesai" | "Menunggu" | "Diproses" | "Belum diunggah" | "Ditolak"

export const STATUS_BADGE: Readonly<Record<PortalFileStatus, string>> = {
  Terverifikasi: "badge-beres",
  Selesai: "badge-beres",
  Menunggu: "badge-berjalan",
  Diproses: "badge-berjalan",
  "Belum diunggah": "badge-tindakan",
  Ditolak: "badge-tindakan",
}

const STATUS_OF: Readonly<Record<DocumentState, PortalFileStatus>> = {
  Lengkap: "Terverifikasi",
  "Perlu Verifikasi": "Menunggu",
  Diproses: "Diproses",
  Ditolak: "Ditolak",
  "Belum Diunggah": "Belum diunggah",
}

const LEAVE_REASON = "Unggahan dibuka lagi setelah masa cuti Anda selesai."

export const isUploadedByStudent = (item: DocumentItem) => item.producer === "student"

export const portalStatusOf = (item: DocumentItem): PortalFileStatus =>
  item.state === "Lengkap" && !isUploadedByStudent(item) ? "Selesai" : STATUS_OF[item.state]

export function DocumentTable({
  items,
  isOnLeave,
}: {
  items: readonly DocumentItem[]
  isOnLeave: boolean
}) {
  const [uploading, setUploading] = useState<DocumentItem | null>(null)
  const statuses = [...new Set(items.map(portalStatusOf))]

  const columns: readonly DataColumn<DocumentItem>[] = [
    {
      key: "document",
      header: "Dokumen",
      wrap: true,
      sort: (item) => item.name,
      cell: (item) => (
        <div className="stack stack-sm">
          <span>
            {item.name}
            {item.isOptional && <span className="caption text-muted"> (opsional)</span>}
          </span>
          {item.state === "Ditolak" && item.rejectReason && (
            <span className="caption text-danger">{item.rejectReason}</span>
          )}
        </div>
      ),
    },
    {
      key: "date",
      header: "Tanggal",
      sort: (item) => item.uploadedAt ?? "",
      cell: (item) => (item.uploadedAt ? formatDate(item.uploadedAt) : DASH),
    },
    {
      key: "status",
      header: "Status",
      sort: portalStatusOf,
      cell: (item) => {
        const status = portalStatusOf(item)
        const badge =
          !isUploadedByStudent(item) && status === "Belum diunggah"
            ? "badge-terkunci"
            : STATUS_BADGE[status]
        return <span className={`badge ${badge}`}>{status}</span>
      },
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (item) => (
        <div className="row row-wrap">
          {item.objectKey && (
            <button
              type="button"
              className="link"
              onClick={() => void previewPresigned("/downloads/presign", { key: item.objectKey })}
            >
              Unduh
            </button>
          )}
          {isUploadedByStudent(item) && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={isOnLeave}
              title={isOnLeave ? LEAVE_REASON : undefined}
              onClick={() => setUploading(item)}
            >
              {item.state === "Belum Diunggah" ? "Unggah" : "Ganti"}
            </button>
          )}
          {!isUploadedByStudent(item) && item.state === "Diproses" && (
            <span className="caption text-muted wrap">
              Dikerjakan Maxima, lihat Progres Administrasi
            </span>
          )}
          {!isUploadedByStudent(item) && item.state === "Belum Diunggah" && (
            <span className="caption text-muted wrap">
              {item.producer === "admission"
                ? "Diunggah Admission setelah partner mengirimkannya"
                : "Tersedia setelah layanannya selesai dikerjakan Maxima"}
            </span>
          )}
        </div>
      ),
    },
  ]

  return (
    <>
      <DataTable
        rows={items}
        columns={columns}
        rowKey={(item) => item.code ?? item.name}
        filter={statuses.length > 1 ? { value: portalStatusOf, options: statuses } : undefined}
        emptyText="Belum ada berkas di kelompok ini."
      />
      {uploading && <UploadModal item={uploading} onClose={() => setUploading(null)} />}
    </>
  )
}
