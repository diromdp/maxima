"use client"

import { Select } from "@mantine/core"

import { saveAttitudeSheet } from "@/src/entities/assessment/actions"
import {
  type AssessmentSheet,
  ATTITUDE_GRADE_LABEL,
  ATTITUDE_GRADES,
  type AttitudeGrade,
  LOW_ATTENDANCE_PERCENT,
  LOW_ATTITUDE_GRADES,
  type SheetKey,
  isFormerMember,
} from "@/src/entities/assessment/schema"

import { SaveBar } from "./SaveBar"
import { useSheetDraft } from "./useSheetDraft"
import { SheetStudentName } from "./SheetStudentName"

export function AttitudeTab({
  sheet,
  sheetKey,
  readOnly,
}: {
  sheet: AssessmentSheet
  sheetKey: SheetKey
  readOnly: boolean
}) {
  const { aspects, students } = sheet
  const draft = useSheetDraft<AttitudeGrade>({
    sheetKey,
    serverValueOf: (studentId, aspect) =>
      students.find((student) => student.studentId === studentId)?.attitudes[aspect] ?? null,
    save: (changes) =>
      saveAttitudeSheet({
        ...sheetKey,
        version: sheet.versions.attitudes,
        rows: Object.entries(changes).map(([studentId, grades]) => ({ studentId, grades })),
      }),
    successMessage: "Nilai sikap tersimpan.",
  })
  const incomplete = students.filter((student) =>
    aspects.some((aspect) => draft.valueOf(student.studentId, aspect.code) === null),
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
                <th>Nama Siswa</th>
                {aspects.map((aspect) => (
                  <th key={aspect.code} style={{ textAlign: "center" }}>
                    {aspect.label}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Kehadiran</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const attendance = student.attendancePercent
                return (
                  <tr key={student.studentId}>
                    <td style={{ fontWeight: 600 }}>
                      <SheetStudentName student={student} />
                    </td>
                    {aspects.map((aspect) => {
                      const grade = draft.valueOf(student.studentId, aspect.code)
                      const isLow = grade !== null && LOW_ATTITUDE_GRADES.includes(grade)
                      return (
                        <td key={aspect.code} style={{ textAlign: "center", padding: "6px 4px" }}>
                          {readOnly || isFormerMember(student) ? (
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
                                  draft.setValue(
                                    student.studentId,
                                    aspect.code,
                                    value as AttitudeGrade | null,
                                  )
                                }
                                comboboxProps={{ withinPortal: true }}
                                styles={
                                  isLow ? { input: { color: "var(--color-danger)" } } : undefined
                                }
                              />
                              {draft.isDirty(student.studentId, aspect.code) && (
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
                      className={`numeric ${attendance !== null && attendance < LOW_ATTENDANCE_PERCENT ? "text-danger" : ""}`}
                      style={{ fontWeight: 600 }}
                    >
                      {attendance === null ? "-" : `${Math.round(attendance)}%`}
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
        dirtyCount={draft.dirtyCount}
        unit="nilai sikap"
        label="Simpan Nilai Sikap"
        readOnly={readOnly}
        isPending={draft.isPending}
        onSave={() => void draft.submit()}
      />
    </div>
  )
}
