"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import dayjs from "dayjs"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import { Notice } from "@/src/components/ui/Notice"
import { certificatesQuery } from "@/src/entities/certificate/queries"
import {
  CERTIFICATE_FILTERS,
  CERTIFICATE_STATUS_BADGE,
  CERTIFICATE_STATUSES,
  certificateFiltersOf,
  type CertificateRow,
  MODULE_KEYS,
  MODULE_LABEL,
  VERIFICATION_BADGE,
  VERIFICATION_STATUSES,
} from "@/src/entities/certificate/schema"
import { previewPresigned } from "@/src/lib/api/download"
import { useRead } from "@/src/lib/api/use-read"
import { useListParams } from "@/src/lib/use-list-params"

import { CertificateFormModal } from "./CertificateFormModal"
import { useExamOptions } from "./use-exam-options"
import { VerifyModal } from "./VerifyModal"

const SKELETON_ROWS = 6
const COLUMN_COUNT = 10

const formatExpiry = (date: string | null) => (date ? `Exp: ${dayjs(date).format("MM/YYYY")}` : "-")

function columnsFor(
  readOnly: boolean,
  onVerify: (certificate: CertificateRow) => void,
): readonly DataColumn<CertificateRow>[] {
  return [
    {
      key: "student",
      header: "Nama Siswa",
      sort: (row) => row.student.name,
      cell: (row) => (
        <span className="stack" style={{ gap: 0 }}>
          <span style={{ fontWeight: 600 }}>{row.student.name}</span>
          <span className="caption text-muted tabular">{row.student.nis ?? "-"}</span>
        </span>
      ),
    },
    { key: "kind", header: "Jenis", sort: (row) => row.kind.name, cell: (row) => row.kind.name },
    { key: "level", header: "Lvl", sort: (row) => row.level.name, cell: (row) => row.level.name },
    ...MODULE_KEYS.map((key): DataColumn<CertificateRow> => {
      const moduleOf = (row: CertificateRow) =>
        row.modules.find((module) => module.module === MODULE_LABEL[key])
      return {
        key,
        header: MODULE_LABEL[key],
        sort: (row) => moduleOf(row)?.score ?? -1,
        cell: (row) => {
          const entry = moduleOf(row)
          if (!entry || entry.score === null) return <span className="text-faint">-</span>
          return (
            <span className="stack" style={{ gap: 0 }}>
              <span className="tabular" style={{ fontWeight: 600 }}>
                {entry.score}
              </span>
              <span className={`caption ${entry.expired ? "text-danger" : "text-muted"}`}>
                {formatExpiry(entry.validUntil)}
              </span>
            </span>
          )
        },
      }
    }),
    {
      key: "status",
      header: "Status",
      sort: (row) => row.status,
      cell: (row) => (
        <span className={`badge ${CERTIFICATE_STATUS_BADGE[row.status]}`}>{row.status}</span>
      ),
    },
    {
      key: "verification",
      header: "Verifikasi",
      sort: (row) => row.verification,
      cell: (row) => (
        <span className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
          <span className={`badge ${VERIFICATION_BADGE[row.verification]}`}>
            {row.verification}
          </span>
          {row.verification === "Ditolak" && row.rejectReason && (
            <span className="caption text-danger wrap" style={{ maxWidth: 200 }}>
              {row.rejectReason}
            </span>
          )}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      cell: (row) => (
        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
          {!readOnly && row.verification === "Usulan" && (
            <button type="button" className="btn btn-primary btn-sm" onClick={() => onVerify(row)}>
              Periksa
            </button>
          )}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            disabled={!row.hasFile}
            title={row.hasFile ? undefined : "Sertifikat ini tidak punya berkas"}
            onClick={() => void previewPresigned(`/certificates/${row.id}/file`)}
          >
            <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.5} />
            Download
          </button>
        </div>
      ),
    },
  ]
}

export function CertificatesTab({ readOnly }: { readOnly: boolean }) {
  const { params, setParams } = useListParams(CERTIFICATE_FILTERS)
  const filters = certificateFiltersOf(params)
  const certificates = useRead(certificatesQuery(filters))
  const { levels, kinds } = useExamOptions()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [verifying, setVerifying] = useState<CertificateRow | null>(null)
  const isFiltered = Object.values(filters).some(Boolean)
  const proposals = certificates.data?.data.filter((row) => row.verification === "Usulan").length

  return (
    <section className="card stack">
      <div className="row row-between row-wrap" style={{ alignItems: "flex-start" }}>
        <Notice tone="info" title="Informasi" className="flex-1">
          Pemilik nilai sertifikat adalah admin dan pengajar. Pengisian nilai harus divalidasi
          terhadap berkas aslinya.
        </Notice>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            + Tambah Data
          </button>
        )}
      </div>

      <div className="row row-wrap" style={{ gap: 8 }}>
        <ListFilter name="levelId" label="Level" options={levels} />
        <ListFilter name="kindId" label="Jenis" options={kinds} />
        <ListFilter
          name="status"
          label="Status"
          options={CERTIFICATE_STATUSES.map((status) => ({ value: status, label: status }))}
        />
        <ListFilter
          name="verification"
          label="Verifikasi"
          options={VERIFICATION_STATUSES.map((status) => ({ value: status, label: status }))}
        />
        <div className="row" style={{ gap: 8, marginInlineStart: "auto" }}>
          {certificates.isSuccess && (
            <span className="caption text-muted tabular">
              {certificates.data.data.length} sertifikat
              {proposals ? `, ${proposals} usulan menunggu` : ""}
            </span>
          )}
          {isFiltered && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() =>
                setParams({ levelId: null, kindId: null, status: null, verification: null })
              }
            >
              Hapus saringan
            </button>
          )}
        </div>
      </div>

      {certificates.isError ? (
        <QueryError
          message={certificates.error.message}
          onRetry={() => void certificates.refetch()}
        />
      ) : certificates.isPending ? (
        <div className="table-scroll" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          <table className="table">
            <tbody>
              <SkeletonRows columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
            </tbody>
          </table>
        </div>
      ) : (
        <DataTable
          rows={certificates.data.data}
          columns={columnsFor(readOnly, setVerifying)}
          rowKey={(row) => row.id}
          emptyText={
            isFiltered
              ? "Tidak ada sertifikat yang cocok dengan saringan."
              : "Belum ada data sertifikat. Tambahkan lewat tombol Tambah Data, atau tunggu usulan siswa dari portal."
          }
        />
      )}

      {isFormOpen && <CertificateFormModal onClose={() => setIsFormOpen(false)} />}
      {verifying && <VerifyModal certificate={verifying} onClose={() => setVerifying(null)} />}
    </section>
  )
}
