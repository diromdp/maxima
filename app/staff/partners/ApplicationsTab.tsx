"use client"

import { useState } from "react"

import type { DataColumn } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { applicationsQuery } from "@/src/entities/partner/queries"
import {
  APPLICATION_FILTERS,
  APPLICATION_STATUSES,
  applicationFiltersOf,
  FAILED_STATUSES,
  isFailed,
  type ApplicationRow,
} from "@/src/entities/partner/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { ApplicationEditModal } from "./ApplicationEditModal"
import { ApplicationFormModal } from "./ApplicationFormModal"
import { ReadTable } from "./ReadTable"
import { STATUS_OPTIONS, StatusBadge } from "./StatusBadge"
import { usePartnerOptions } from "./use-partner-options"

function columnsFor(
  readOnly: boolean,
  onEdit: (application: ApplicationRow) => void,
): readonly DataColumn<ApplicationRow>[] {
  return [
    {
      key: "student",
      header: "Nama Siswa",
      sort: (row) => row.student.name,
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.student.name}</span>,
    },
    {
      key: "partner",
      header: "Partner",
      sort: (row) => row.partner.name,
      cell: (row) => row.partner.name,
    },
    {
      key: "position",
      header: "Posisi",
      sort: (row) => row.position ?? "",
      cell: (row) => row.position ?? DASH,
    },
    {
      key: "status",
      header: "Status Progres (11 Status)",
      sort: (row) => APPLICATION_STATUSES.indexOf(row.status),
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "date",
      header: "Tanggal",
      sort: (row) => row.appliedOn,
      cell: (row) => formatDate(row.appliedOn),
    },
    {
      key: "partnerNote",
      header: "Catatan Partner",
      wrap: true,
      cell: (row) => <span className="text-muted">{row.partnerNote ?? DASH}</span>,
    },
    {
      key: "admissionNote",
      header: "Catatan Admission",
      wrap: true,
      cell: (row) => row.admissionNote ?? DASH,
    },
    ...(readOnly
      ? []
      : [
          {
            key: "actions",
            header: "Aksi",
            align: "right",
            cell: (row) => (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={isFailed(row.status)}
                title={
                  isFailed(row.status)
                    ? "Kegagalan disimpan apa adanya. Buat pengajuan baru bila siswa diajukan lagi."
                    : undefined
                }
                onClick={() => onEdit(row)}
              >
                Ubah
              </button>
            ),
          } satisfies DataColumn<ApplicationRow>,
        ]),
  ]
}

export function ApplicationsTab({ readOnly }: { readOnly: boolean }) {
  const { params } = useListParams(APPLICATION_FILTERS)
  const filters = applicationFiltersOf(params)
  const applications = useRead(applicationsQuery(filters))
  const { partners } = usePartnerOptions()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<ApplicationRow | null>(null)
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <div className="stack">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="row row-wrap" style={{ gap: 8, flex: 1 }}>
            <ListSearch label="Cari nama, NIS, atau partner" />
            <ListFilter name="status" label="Status" options={STATUS_OPTIONS} />
            <ListFilter name="partnerId" label="Partner" options={partners} />
          </div>
          {!readOnly && (
            <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
              + Tambah Pengajuan
            </button>
          )}
        </div>

        <span className="caption text-muted">
          Riwayat pengajuan siswa ke beberapa partner. Riwayat kegagalan disimpan, tidak ditimpa.
          Kedua kolom catatan internal, tidak tampil di portal siswa.
        </span>

        <ReadTable
          read={applications}
          columns={columnsFor(readOnly, setEditing)}
          defaultSort={{ key: "date", dir: "desc" }}
          emptyText={
            isFiltered
              ? "Tidak ada pengajuan yang cocok dengan saringan."
              : "Belum ada pengajuan ke partner. Tambahkan lewat tombol Tambah Pengajuan."
          }
        />
      </section>

      <section className="card stack stack-sm">
        <span className="label">Panduan 11 Status Progres (untuk referensi Admission)</span>
        <div className="row row-wrap" style={{ gap: 8 }}>
          {APPLICATION_STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
        </div>
        <span className="caption text-muted">
          Merah adalah kegagalan ({FAILED_STATUSES.length} status) dan tetap tersimpan sebagai
          riwayat. Dapat Vertrag membuka rumpun Dari Betrieb di Dokumen dan portal siswa; visa dan
          keberangkatan dilanjutkan di Visa & Penempatan.
        </span>
      </section>

      {isFormOpen && <ApplicationFormModal onClose={() => setIsFormOpen(false)} />}
      {editing && <ApplicationEditModal application={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}
