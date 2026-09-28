"use client"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { documentsQuery } from "@/src/entities/document/queries"
import { DOCUMENT_FILTERS, VERIFICATION_OPTIONS } from "@/src/entities/document/schema"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { useRead } from "@/src/lib/api/use-read"
import { useListParams } from "@/src/lib/use-list-params"

import { StudentIndex } from "./StudentIndex"

export function DocumentsWorkspace() {
  const { params } = useListParams(DOCUMENT_FILTERS)
  const documents = useRead(documentsQuery(params))
  const { branches, programs } = useMasterOptions()
  const summary = documents.data?.summary

  return (
    <div className="stack stack-lg">
      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <ListSearch label="Cari nama atau NIS" />
          <div className="row row-wrap" style={{ gap: 8 }}>
            <ListFilter
              name="verification"
              label="verifikasi"
              placeholder="Verifikasi: Semua"
              options={VERIFICATION_OPTIONS}
            />
            <ListFilter
              name="branch"
              label="cabang"
              placeholder="Cabang: Semua"
              options={branches}
            />
            <ListFilter
              name="program"
              label="program"
              placeholder="Program: Semua"
              options={programs}
            />
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h5">Kelengkapan Berkas per Siswa</h2>
            <span className="caption text-muted">
              Satu baris satu siswa, empat rumpun. Tombol Verifikasi membuka berkas yang menunggu di
              halaman siswa itu.
            </span>
          </div>
          {summary && (
            <span
              className={`badge tabular ${summary.pendingDocuments > 0 ? "badge-berjalan" : "badge-beres"}`}
            >
              {summary.pendingDocuments > 0
                ? `${summary.pendingDocuments} berkas menunggu di ${summary.pendingStudents} siswa`
                : "Tidak ada yang menunggu"}
            </span>
          )}
        </div>

        {documents.isError ? (
          <QueryError message={documents.error.message} onRetry={() => void documents.refetch()} />
        ) : (
          <StudentIndex
            rows={documents.data?.data ?? []}
            total={documents.data?.meta.total ?? 0}
            isPending={documents.isPending}
          />
        )}
      </section>
    </div>
  )
}
