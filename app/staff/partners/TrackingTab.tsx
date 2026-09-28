"use client"

import { Skeleton } from "@mantine/core"
import { Fragment, useState } from "react"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import { applicationsQuery, trackingQuery } from "@/src/entities/partner/queries"
import {
  APPLICATION_FILTERS,
  applicationFiltersOf,
  type TrackingRow,
} from "@/src/entities/partner/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { STATUS_OPTIONS, StatusBadge } from "./StatusBadge"
import { usePartnerOptions } from "./use-partner-options"

const COLUMN_COUNT = 7
const SKELETON_ROWS = 6

function HistoryPanel({ row }: { row: TrackingRow }) {
  const history = useRead(applicationsQuery({ studentId: row.student.id }))

  return (
    <div className="card-soft stack stack-sm">
      <span className="label">Riwayat pengajuan {row.student.name}</span>
      {history.isError ? (
        <QueryError message={history.error.message} onRetry={() => void history.refetch()} />
      ) : history.isPending ? (
        <div className="stack stack-sm" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: row.applicationCount }, (_, index) => (
            <Skeleton key={index} height={20} radius="xl" aria-hidden />
          ))}
        </div>
      ) : (
        history.data.data.map((application) => (
          <div
            key={application.id}
            className="row row-wrap"
            style={{ gap: 12, alignItems: "flex-start" }}
          >
            <span className="caption text-muted tabular" style={{ minWidth: 90 }}>
              {formatDate(application.appliedOn)}
            </span>
            <span className="body-sm" style={{ minWidth: 140 }}>
              {application.partner.name} · {application.position ?? DASH}
            </span>
            <StatusBadge status={application.status} />
            {application.partnerNote && (
              <span className="caption text-muted">{application.partnerNote}</span>
            )}
          </div>
        ))
      )}
    </div>
  )
}

export function TrackingTab() {
  const { params } = useListParams(APPLICATION_FILTERS)
  const filters = applicationFiltersOf(params)
  const tracking = useRead(trackingQuery(filters))
  const { partners } = usePartnerOptions()
  const [openStudentId, setOpenStudentId] = useState<string | null>(null)
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8, flex: 1 }}>
          <ListSearch label="Cari nama atau NIS" />
          <ListFilter name="status" label="Status" options={STATUS_OPTIONS} />
          <ListFilter name="partnerId" label="Partner" options={partners} />
        </div>
        {tracking.isSuccess && (
          <span className="badge badge-neutral tabular">{tracking.data.data.length} siswa</span>
        )}
      </div>

      <span className="caption text-muted">
        Rekapitulasi progres seluruh siswa kandidat yang diajukan ke partner: satu baris satu siswa,
        status dari pengajuan terbarunya. Seluruhnya turunan tab Pengajuan, tidak ada yang diketik
        di sini.
      </span>

      {tracking.isError ? (
        <QueryError message={tracking.error.message} onRetry={() => void tracking.refetch()} />
      ) : (
        <div className="table-scroll" aria-busy={tracking.isPending}>
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Partner</th>
                <th>Posisi</th>
                <th>Status Progres (11 Status)</th>
                <th>Tanggal Lapor</th>
                <th>PIC Admission</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tracking.isPending ? (
                <SkeletonRows columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
              ) : tracking.data.data.length === 0 ? (
                <tr>
                  <td colSpan={COLUMN_COUNT} className="text-muted">
                    {isFiltered
                      ? "Tidak ada siswa yang cocok dengan saringan."
                      : "Belum ada siswa yang diajukan ke partner."}
                  </td>
                </tr>
              ) : (
                tracking.data.data.map((row) => {
                  const isOpen = openStudentId === row.student.id
                  return (
                    <Fragment key={row.student.id}>
                      <tr>
                        <td style={{ fontWeight: 600 }}>{row.student.name}</td>
                        <td>{row.partner.name}</td>
                        <td>{row.position ?? DASH}</td>
                        <td>
                          <StatusBadge status={row.status} />
                        </td>
                        <td>{formatDate(row.reportedAt)}</td>
                        <td>{row.pic?.name ?? DASH}</td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            aria-expanded={isOpen}
                            onClick={() => setOpenStudentId(isOpen ? null : row.student.id)}
                          >
                            {isOpen ? "Tutup" : `Lihat (${row.applicationCount})`}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={COLUMN_COUNT} className="wrap" style={{ paddingTop: 0 }}>
                            <HistoryPanel row={row} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
