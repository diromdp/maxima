"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"

import { ApplicationFormModal } from "./ApplicationFormModal"
import {
  type Application,
  APPLICATION_STATUSES,
  applicationBadge,
  APPLICATIONS,
  FAILED_STATUSES,
  partnerById,
  PARTNERS,
  statusNumber,
} from "./sample"

export const StatusBadge = ({ status }: { status: Application["status"] }) => (
  <span className={`badge whitespace-nowrap ${applicationBadge(status)}`}>
    {statusNumber(status)}. {status}
  </span>
)

const COLUMNS: readonly DataColumn<Application>[] = [
  {
    key: "studentName",
    header: "Nama Siswa",
    sort: (row) => row.studentName,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.studentName}</span>,
  },
  {
    key: "partner",
    header: "Partner",
    sort: (row) => partnerById(row.partnerId).shortName,
    cell: (row) => partnerById(row.partnerId).shortName,
  },
  { key: "position", header: "Posisi", sort: (row) => row.position, cell: (row) => row.position },
  {
    key: "status",
    header: "Status Progres (11 Status)",
    sort: (row) => statusNumber(row.status),
    cell: (row) => <StatusBadge status={row.status} />,
  },
  { key: "date", header: "Tanggal", sort: (row) => row.date, cell: (row) => formatDate(row.date) },
  {
    key: "partnerNote",
    header: "Catatan Partner",
    wrap: true,
    cell: (row) => <span className="text-muted">{row.partnerNote}</span>,
  },
  {
    key: "admissionNote",
    header: "Catatan Admission",
    wrap: true,
    cell: (row) => row.admissionNote,
  },
]

export function ApplicationsTab({ readOnly }: { readOnly: boolean }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [partnerId, setPartnerId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rows = APPLICATIONS.filter(
    (row) =>
      (!status || row.status === status) &&
      (!partnerId || row.partnerId === partnerId) &&
      (query === "" || `${row.studentName} ${row.nis}`.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <div className="stack">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="row row-wrap" style={{ gap: 8 }}>
            <TextInput
              aria-label="Cari siswa"
              placeholder="Cari nama atau NIS"
              size="sm"
              w={220}
              leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
            <Select
              aria-label="Saring status"
              placeholder="Status: Semua"
              size="sm"
              w={240}
              data={[...APPLICATION_STATUSES]}
              value={status}
              onChange={setStatus}
              clearable
            />
            <Select
              aria-label="Saring partner"
              placeholder="Partner: Semua"
              size="sm"
              w={200}
              data={PARTNERS.map((partner) => ({ value: partner.id, label: partner.shortName }))}
              value={partnerId}
              onChange={setPartnerId}
              clearable
            />
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

        <DataTable
          rows={rows}
          columns={COLUMNS}
          rowKey={(row) => row.id}
          defaultSort={{ key: "date", dir: "desc" }}
          emptyText="Tidak ada pengajuan yang cocok dengan saringan."
        />
      </section>

      <section className="card stack stack-sm">
        <span className="label">Panduan 11 Status Progres (untuk referensi Admission)</span>
        <div className="row row-wrap" style={{ gap: 8 }}>
          {APPLICATION_STATUSES.map((candidate) => (
            <StatusBadge key={candidate} status={candidate} />
          ))}
        </div>
        <span className="caption text-muted">
          Merah adalah kegagalan ({FAILED_STATUSES.length} status) dan tetap tersimpan sebagai
          riwayat. Dapat Vertrag membuka rumpun Dari Betrieb di Dokumen dan portal siswa; visa dan
          keberangkatan dilanjutkan di Visa & Penempatan.
        </span>
      </section>

      <ApplicationFormModal
        key={String(isFormOpen)}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
