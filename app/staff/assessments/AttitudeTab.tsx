"use client"

import { Select } from "@mantine/core"

import { formatPercent } from "@/src/lib/format"

import { SaveBar } from "./SaveBar"
import {
  type AssessmentClass,
  ATTENDANCE_BY_STUDENT,
  ATTITUDE_ASPECTS,
  ATTITUDE_GRADE_LABEL,
  ATTITUDE_GRADES,
  ATTITUDE_SCORES,
  type AttitudeGrade,
  LOW_ATTENDANCE,
  type Student,
  STUDENTS_BY_CLASS,
} from "./sample"
import { useScoreSheet } from "./useScoreSheet"

const LOW_GRADES: readonly AttitudeGrade[] = ["C", "PB"]

export function AttitudeTab({ room, readOnly }: { room: AssessmentClass; readOnly: boolean }) {
  const students: readonly Student[] = STUDENTS_BY_CLASS[room.id] ?? []
  const { scoreOf, isDirty, setScore, dirtyCount, save } = useScoreSheet<AttitudeGrade>(
    ATTITUDE_SCORES[room.id] ?? {},
  )
  const incomplete = students.filter((student) =>
    ATTITUDE_ASPECTS.some((aspect) => scoreOf(student.nis, aspect.key) === null),
  ).length

  return (
    <div className="stack">
      <section className="card stack">
        <div className="row row-between row-wrap">
          <div className="stack" style={{ gap: 2 }}>
            <h2 className="h5">Perkembangan Sikap dan Karakter Siswa</h2>
            <span className={`caption ${incomplete > 0 ? "text-warning" : "text-muted"}`}>
              {incomplete > 0
                ? `${incomplete} dari ${students.length} siswa belum lengkap sepuluh aspeknya`
                : `${students.length} siswa, sepuluh aspek terisi`}
            </span>
          </div>
          <dl className="row row-wrap" style={{ gap: 16, margin: 0 }}>
            {ATTITUDE_GRADES.map((grade) => (
              <div key={grade} className="row" style={{ gap: 6 }}>
                <dt className="badge">{grade}</dt>
                <dd className="caption text-muted" style={{ margin: 0 }}>
                  {ATTITUDE_GRADE_LABEL[grade]}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama Siswa</th>
                {ATTITUDE_ASPECTS.map((aspect) => (
                  <th key={aspect.key} style={{ textAlign: "center" }}>
                    {aspect.label}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const attendance = ATTENDANCE_BY_STUDENT[student.nis]
                return (
                  <tr key={student.nis}>
                    <td className="tabular text-muted">{student.nis}</td>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    {ATTITUDE_ASPECTS.map((aspect) => {
                      const grade = scoreOf(student.nis, aspect.key)
                      const isLow = grade !== null && LOW_GRADES.includes(grade)
                      return (
                        <td key={aspect.key} style={{ textAlign: "center", padding: "6px 4px" }}>
                          {readOnly ? (
                            <span className={isLow ? "text-danger" : undefined}>
                              {grade ?? "-"}
                            </span>
                          ) : (
                            <span className="relative inline-block">
                              <Select
                                aria-label={`${aspect.label} ${student.name}`}
                                size="xs"
                                w={64}
                                placeholder="-"
                                data={[...ATTITUDE_GRADES]}
                                value={grade}
                                onChange={(value) =>
                                  setScore(student.nis, aspect.key, value as AttitudeGrade | null)
                                }
                                comboboxProps={{ withinPortal: true }}
                                className={isLow ? "text-danger" : undefined}
                              />
                              {isDirty(student.nis, aspect.key) && (
                                <span
                                  aria-hidden
                                  className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                                />
                              )}
                            </span>
                          )}
                        </td>
                      )
                    })}
                    <td
                      className={`numeric ${attendance !== undefined && attendance < LOW_ATTENDANCE ? "text-danger" : ""}`}
                      style={{ fontWeight: 600 }}
                    >
                      {attendance === undefined ? "-" : formatPercent(attendance)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <span className="caption text-muted">
          Kehadiran dihitung dari absensi Sesi Kelas dan ikut tercetak di raport; tidak diisi di
          sini.
        </span>
      </section>

      <SaveBar
        dirtyCount={dirtyCount}
        unit="nilai sikap"
        label="Simpan Nilai Sikap"
        readOnly={readOnly}
        onSave={save}
      />
    </div>
  )
}
