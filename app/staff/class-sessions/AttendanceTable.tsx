"use client"

import { Chip } from "@mantine/core"

import {
  ATTENDANCE_BADGE,
  ATTENDANCE_STATUSES,
  type AttendanceStatus,
  type SessionStudent,
} from "./sample"

export type AttendanceMap = Readonly<Record<string, AttendanceStatus | undefined>>

export function AttendanceTable({
  students,
  attendance,
  missing,
  readOnly,
  onChange,
  onMarkAllPresent,
}: {
  students: readonly SessionStudent[]
  attendance: AttendanceMap
  missing: number
  readOnly: boolean
  onChange: (nis: string, status: AttendanceStatus) => void
  onMarkAllPresent: () => void
}) {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5">1. Absensi Siswa Sesi Ini</h2>
          {students.length > 0 && (
            <span className={`caption ${missing > 0 ? "text-danger" : "text-muted"}`}>
              {missing > 0
                ? `${missing} dari ${students.length} siswa belum diberi status`
                : `${students.length} siswa, semua sudah diberi status`}
            </span>
          )}
        </div>
        {!readOnly && students.length > 0 && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={onMarkAllPresent}>
            Tandai semua Hadir
          </button>
        )}
      </div>

      {students.length === 0 ? (
        <p className="body-sm text-muted" style={{ margin: 0 }}>
          Belum ada anggota aktif di kelas ini. Tambahkan siswa lewat Kelas & Jadwal.
        </p>
      ) : (
        <div className="table-scroll">
          <table className="table table-fixed md:table-auto">
            <thead>
              <tr>
                <th className="w-2/5 md:w-auto">Nama Siswa</th>
                <th>Status Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const status = attendance[student.nis]
                return (
                  <tr key={student.nis}>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td className="wrap">
                      {readOnly ? (
                        status ? (
                          <span className={`badge ${ATTENDANCE_BADGE[status]}`}>{status}</span>
                        ) : (
                          <span className="badge badge-terkunci">Belum diisi</span>
                        )
                      ) : (
                        <Chip.Group
                          value={status ?? null}
                          onChange={(value) =>
                            typeof value === "string" &&
                            onChange(student.nis, value as AttendanceStatus)
                          }
                        >
                          <div
                            className="flex flex-wrap gap-1.5"
                            role="radiogroup"
                            aria-label={`Status kehadiran ${student.name}`}
                          >
                            {ATTENDANCE_STATUSES.map((option) => (
                              <Chip key={option} value={option} size="xs">
                                {option}
                              </Chip>
                            ))}
                          </div>
                        </Chip.Group>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
