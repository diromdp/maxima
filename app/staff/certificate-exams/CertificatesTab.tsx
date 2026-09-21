"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import { CertificateFormModal } from "./CertificateFormModal"
import {
  type Certificate,
  CERTIFICATE_KINDS,
  CERTIFICATE_STATUS_BADGE,
  CERTIFICATE_STATUSES,
  CERTIFICATES,
  formatExpiry,
  LEVELS,
  MODULES,
} from "./sample"

const FILTERS = [
  { key: "level", label: "Level", options: LEVELS },
  { key: "kind", label: "Jenis", options: CERTIFICATE_KINDS },
  { key: "status", label: "Status", options: CERTIFICATE_STATUSES },
] as const

type FilterKey = (typeof FILTERS)[number]["key"]
type Filters = Readonly<Partial<Record<FilterKey, string>>>

const matchesFilters = (certificate: Certificate, filters: Filters) =>
  FILTERS.every(({ key }) => !filters[key] || certificate[key] === filters[key])

const COLUMNS: readonly DataColumn<Certificate>[] = [
  {
    key: "studentName",
    header: "Nama Siswa",
    sort: (row) => row.studentName,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.studentName}</span>,
  },
  { key: "kind", header: "Jenis", sort: (row) => row.kind, cell: (row) => row.kind },
  { key: "level", header: "Lvl", sort: (row) => row.level, cell: (row) => row.level },
  ...MODULES.map((module): DataColumn<Certificate> => ({
    key: module.key,
    header: module.label,
    sort: (row) => row.modules[module.key].score,
    cell: (row) => {
      const { score, expiresAt } = row.modules[module.key]
      return (
        <span className="stack" style={{ gap: 0 }}>
          <span className="tabular" style={{ fontWeight: 600 }}>
            {score}
          </span>
          <span
            className={`caption ${row.status === "Kedaluwarsa" ? "text-danger" : "text-muted"}`}
          >
            {formatExpiry(expiresAt)}
          </span>
        </span>
      )
    },
  })),
  {
    key: "status",
    header: "Status",
    sort: (row) => row.status,
    cell: (row) => (
      <span className={`badge ${CERTIFICATE_STATUS_BADGE[row.status]}`}>{row.status}</span>
    ),
  },
  {
    key: "actions",
    header: "Aksi",
    align: "right",
    cell: (row) => (
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        onClick={() => notify.info(`Berkas sertifikat ${row.studentName} disiapkan.`)}
      >
        <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.5} />
        Download
      </button>
    ),
  },
]

export function CertificatesTab({ readOnly }: { readOnly: boolean }) {
  const [filters, setFilters] = useState<Filters>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const rows = CERTIFICATES.filter((certificate) => matchesFilters(certificate, filters))
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap" style={{ alignItems: "flex-start" }}>
        <Notice tone="info" title="Informasi" className="flex-1">
          Pemilik nilai sertifikat adalah halaman ini, bukan siswa. Pengisian nilai harus divalidasi
          terhadap berkas aslinya.
        </Notice>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            + Tambah Data
          </button>
        )}
      </div>

      <div className="row row-wrap" style={{ gap: 8 }}>
        {FILTERS.map(({ key, label, options }) => (
          <Select
            key={key}
            aria-label={`Saring ${label}`}
            placeholder={`${label}: Semua`}
            size="sm"
            w={160}
            comboboxProps={{ width: 200, position: "bottom-start" }}
            data={[...options]}
            value={filters[key] ?? null}
            onChange={(value) =>
              setFilters((current) => ({ ...current, [key]: value ?? undefined }))
            }
            clearable
          />
        ))}
        <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
          <span className="caption text-muted tabular">
            {isFiltered
              ? `${rows.length} dari ${CERTIFICATES.length} sertifikat`
              : `${CERTIFICATES.length} sertifikat`}
          </span>
          {isFiltered && (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFilters({})}>
              Hapus saringan
            </button>
          )}
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={COLUMNS}
        rowKey={(row) => row.id}
        emptyText="Tidak ada sertifikat yang cocok dengan saringan."
      />

      <CertificateFormModal
        key={String(isFormOpen)}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  )
}
