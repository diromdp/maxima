"use client"

import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatDate, formatDateLong } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { RegisterStudentsModal } from "./RegisterStudentsModal"
import { ScheduleFormModal } from "./ScheduleFormModal"
import {
  type ExamRecommendation,
  isFull,
  PAYMENT_BADGE,
  quotaLabel,
  type Registrant,
  REGISTRANTS_BY_SCHEDULE,
  REGISTRATION_BADGE,
  SCHEDULES,
} from "./sample"

const COLUMNS: readonly DataColumn<Registrant>[] = [
  {
    key: "nis",
    header: "NIS",
    sort: (row) => row.nis,
    cell: (row) => <span className="tabular text-muted">{row.nis}</span>,
  },
  {
    key: "studentName",
    header: "Nama Siswa",
    sort: (row) => row.studentName,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.studentName}</span>,
  },
  { key: "program", header: "Program", sort: (row) => row.program, cell: (row) => row.program },
  {
    key: "registeredAt",
    header: "Tanggal Daftar",
    sort: (row) => row.registeredAt,
    cell: (row) => formatDate(row.registeredAt),
  },
  {
    key: "payment",
    header: "Status Pembayaran",
    sort: (row) => row.payment,
    cell: (row) => <span className={`badge ${PAYMENT_BADGE[row.payment]}`}>{row.payment}</span>,
  },
]

export function SchedulesTab({ readOnly }: { readOnly: boolean }) {
  const [scheduleId, setScheduleId] = useState(SCHEDULES[0].id)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [added, setAdded] = useState<Readonly<Record<string, readonly Registrant[]>>>({})
  const baseSchedule = SCHEDULES.find((candidate) => candidate.id === scheduleId) ?? SCHEDULES[0]
  const addedCount = (id: string) => (added[id] ?? []).length
  const schedule = {
    ...baseSchedule,
    registered: baseSchedule.registered + addedCount(baseSchedule.id),
  }
  const registrants = [
    ...(REGISTRANTS_BY_SCHEDULE[schedule.id] ?? []),
    ...(added[schedule.id] ?? []),
  ]
  const isClosed = schedule.status === "Pendaftaran Ditutup"

  const registerStudents = (students: readonly ExamRecommendation[]) =>
    setAdded((current) => ({
      ...current,
      [schedule.id]: [
        ...(current[schedule.id] ?? []),
        ...students.map((student): Registrant => ({
          nis: student.nis,
          studentName: student.studentName,
          program: "Ausbildung",
          registeredAt: new Date().toISOString().slice(0, 10),
          payment: "Belum Bayar",
        })),
      ],
    }))

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

      <div className="grid-4" role="radiogroup" aria-label="Pilih jadwal ujian">
        {SCHEDULES.map((base) => {
          const candidate = { ...base, registered: base.registered + addedCount(base.id) }
          const isSelected = candidate.id === schedule.id
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
                <span className={`badge ${REGISTRATION_BADGE[candidate.status]}`}>
                  {candidate.status}
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
                    className={`caption tabular ${isFull(candidate) ? "text-danger" : ""}`}
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
            <span className="caption text-muted">
              Total {schedule.registered} siswa
              {registrants.length < schedule.registered
                ? `, ${registrants.length} ditampilkan di data contoh`
                : ""}
            </span>
          </div>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => notify.info(`Daftar peserta ${schedule.name} diekspor.`)}
            >
              Export
            </button>
            {!readOnly && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={isClosed}
                title={isClosed ? "Pendaftaran jadwal ini sudah ditutup" : undefined}
                onClick={() => setIsRegisterOpen(true)}
              >
                + Daftarkan Siswa
              </button>
            )}
          </div>
        </div>

        <DataTable
          rows={registrants}
          columns={COLUMNS}
          rowKey={(row) => row.nis}
          emptyText={`Belum ada siswa terdaftar di ${schedule.name}.`}
        />
        <span className="caption text-muted">
          Status pembayaran dibaca dari Pembayaran, tidak diubah di sini.
        </span>
      </section>

      <RegisterStudentsModal
        key={`${schedule.id}-${isRegisterOpen}`}
        opened={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        schedule={schedule}
        registered={registrants}
        onRegister={registerStudents}
      />
      <ScheduleFormModal
        key={String(isFormOpen)}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
