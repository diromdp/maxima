"use client"

import { Skeleton } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import { examRegistrantsQuery, examSchedulesQuery } from "@/src/entities/certificate/queries"
import {
  type ExamRegistrantRow,
  type ExamScheduleRow,
  PAYMENT_BADGE,
  REGISTRATION_BADGE,
} from "@/src/entities/certificate/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate, formatDateLong } from "@/src/lib/format"
import { useUrlParam } from "@/src/lib/use-url-param"

import { RegisterStudentsModal } from "./RegisterStudentsModal"
import { ScheduleFormModal } from "./ScheduleFormModal"

const SCHEDULE_SKELETONS = 4
const SKELETON_ROWS = 5
const COLUMN_COUNT = 5

export const quotaLabel = (schedule: ExamScheduleRow) =>
  `${schedule.registeredCount} / ${schedule.capacity} Terdaftar`

const COLUMNS: readonly DataColumn<ExamRegistrantRow>[] = [
  {
    key: "nis",
    header: "NIS",
    sort: (row) => row.nis,
    cell: (row) => <span className="tabular text-muted">{row.nis}</span>,
  },
  {
    key: "name",
    header: "Nama Siswa",
    sort: (row) => row.name,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
  },
  {
    key: "program",
    header: "Program",
    sort: (row) => row.program ?? "",
    cell: (row) => row.program ?? <span className="text-faint">-</span>,
  },
  {
    key: "registeredAt",
    header: "Tanggal Daftar",
    sort: (row) => row.registeredAt,
    cell: (row) => formatDate(row.registeredAt),
  },
  {
    key: "payment",
    header: "Status Pembayaran",
    sort: (row) => row.paymentStatus ?? "",
    cell: (row) =>
      row.paymentStatus ? (
        <span className={`badge ${PAYMENT_BADGE[row.paymentStatus]}`}>{row.paymentStatus}</span>
      ) : (
        <span className="text-muted">Tidak termasuk paket</span>
      ),
  },
]

export function SchedulesTab({ readOnly }: { readOnly: boolean }) {
  const schedules = useRead(examSchedulesQuery())
  const [isFormOpen, setIsFormOpen] = useState(false)

  return (
    <div className="stack">
      <div className="row row-between row-wrap">
        <h2 className="h5">Jadwal Ujian Terdekat</h2>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            Tambah Jadwal Ujian
          </button>
        )}
      </div>

      {schedules.isError ? (
        <QueryError message={schedules.error.message} onRetry={() => void schedules.refetch()} />
      ) : schedules.isPending ? (
        <div className="grid-4" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: SCHEDULE_SKELETONS }, (_, index) => (
            <Skeleton key={index} height={140} radius="md" aria-hidden />
          ))}
        </div>
      ) : schedules.data.data.length === 0 ? (
        <section className="card">
          <p className="body-sm text-muted">
            Belum ada jadwal ujian.
            {readOnly ? "" : " Tambahkan lewat tombol Tambah Jadwal Ujian."}
          </p>
        </section>
      ) : (
        <ScheduleBoard schedules={schedules.data.data} readOnly={readOnly} />
      )}

      {isFormOpen && <ScheduleFormModal onClose={() => setIsFormOpen(false)} />}
    </div>
  )
}

function ScheduleBoard({
  schedules,
  readOnly,
}: {
  schedules: readonly ExamScheduleRow[]
  readOnly: boolean
}) {
  const [scheduleId, setScheduleId] = useUrlParam("schedule", schedules[0]!.id, (value) =>
    schedules.some((schedule) => schedule.id === value),
  )
  const schedule = schedules.find((candidate) => candidate.id === scheduleId) ?? schedules[0]!
  const registrants = useRead(examRegistrantsQuery(schedule.id))
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const isClosed = schedule.registrationStatus === "Pendaftaran Ditutup"

  return (
    <>
      <div className="grid-4" role="radiogroup" aria-label="Pilih jadwal ujian">
        {schedules.map((candidate) => {
          const isSelected = candidate.id === schedule.id
          const isFull = candidate.remainingSeats === 0
          return (
            <button
              key={candidate.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setScheduleId(candidate.id)}
              className={`card stack text-left ${isSelected ? "ring-2 ring-ink" : "hover:bg-canvas-sunken"}`}
              style={{ gap: 8, cursor: "pointer" }}
            >
              <div className="stack" style={{ gap: 6, alignItems: "flex-start" }}>
                <span className="body" style={{ fontWeight: 700 }}>
                  {candidate.name}
                </span>
                <span className={`badge ${REGISTRATION_BADGE[candidate.registrationStatus]}`}>
                  {candidate.registrationStatus}
                </span>
              </div>
              <dl className="stack" style={{ gap: 2, margin: 0 }}>
                <div className="row" style={{ gap: 4 }}>
                  <dt className="caption text-muted">Tanggal:</dt>
                  <dd className="caption" style={{ margin: 0 }}>
                    {formatDate(candidate.date)}
                  </dd>
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <dt className="caption text-muted">Lokasi:</dt>
                  <dd className="caption" style={{ margin: 0 }}>
                    {candidate.location}
                  </dd>
                </div>
                <div className="row" style={{ gap: 4 }}>
                  <dt className="caption text-muted">Kuota:</dt>
                  <dd
                    className={`caption tabular ${isFull ? "text-danger" : ""}`}
                    style={{ margin: 0, fontWeight: 700 }}
                  >
                    {quotaLabel(candidate)}
                  </dd>
                </div>
              </dl>
            </button>
          )
        })}
      </div>

      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h5">
              Siswa Terdaftar ({schedule.name}, {formatDateLong(schedule.date)})
            </h2>
            <span className="caption text-muted">Total {schedule.registeredCount} siswa</span>
          </div>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <a
              href={`/api/download/exam-schedules/${schedule.id}/registrants/export`}
              className="btn btn-secondary btn-sm"
            >
              Export
            </a>
            {!readOnly && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isClosed}
                title={
                  isClosed
                    ? "Pendaftaran jadwal ini sudah ditutup karena kuotanya penuh"
                    : undefined
                }
                onClick={() => setIsRegisterOpen(true)}
              >
                + Daftarkan Siswa
              </button>
            )}
          </div>
        </div>

        {registrants.isError ? (
          <QueryError
            message={registrants.error.message}
            onRetry={() => void registrants.refetch()}
          />
        ) : registrants.isPending ? (
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
            rows={registrants.data.data}
            columns={COLUMNS}
            rowKey={(row) => row.studentId}
            emptyText={`Belum ada siswa terdaftar di ${schedule.name}.`}
          />
        )}
        <span className="caption text-muted">
          Biaya ujian termasuk harga paket. Lunas berarti gerbang Ujian Bahasa siswa itu sudah
          terbuka; siswa Belum Bayar cukup melunasi cicilan paketnya sampai ambang Ujian Bahasa.
        </span>
      </section>

      {isRegisterOpen && (
        <RegisterStudentsModal schedule={schedule} onClose={() => setIsRegisterOpen(false)} />
      )}
    </>
  )
}
