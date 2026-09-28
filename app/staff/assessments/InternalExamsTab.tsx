"use client"

import { saveScoreSheet } from "@/src/entities/assessment/actions"
import {
  type AssessmentSheet,
  averageOf,
  EXAM_COLUMNS,
  EXAM_STATUS_BADGE,
  examStatusOf,
  formatScore,
  isBelowKkm,
  type SheetKey,
  isFormerMember,
} from "@/src/entities/assessment/schema"

import { KkmMissingNotice } from "./KkmMissingNotice"
import { SaveBar } from "./SaveBar"
import { ScoreCell } from "./ScoreCell"
import { useSheetDraft } from "./useSheetDraft"
import { SheetStudentName } from "./SheetStudentName"

const BASE_EXAM_COUNT = 5

const columnOf = (key: string) => EXAM_COLUMNS[key] ?? { label: key, short: key }

export function InternalExamsTab({
  sheet,
  sheetKey,
  readOnly,
}: {
  sheet: AssessmentSheet
  sheetKey: SheetKey
  readOnly: boolean
}) {
  const { kkm, examKeys, students } = sheet
  const draft = useSheetDraft<number>({
    sheetKey,
    serverValueOf: (studentId, key) =>
      students.find((student) => student.studentId === studentId)?.exams[key] ?? null,
    save: (changes) =>
      saveScoreSheet("exams", {
        ...sheetKey,
        version: sheet.versions.exams,
        rows: Object.entries(changes).map(([studentId, values]) => ({ studentId, values })),
      }),
    successMessage: "Nilai ujian tersimpan.",
  })

  const rows = students.map((student) => {
    if (!draft.isRowDirty(student.studentId)) {
      return { student, rowAverage: student.examAverage, status: student.examStatus }
    }
    const values = examKeys.map((key) => draft.valueOf(student.studentId, key))
    return { student, rowAverage: averageOf(values), status: examStatusOf(values, kkm) }
  })
  const graded = rows.filter((row) => row.status === "Lulus" || row.status === "Tidak Lulus")
  const passed = graded.filter((row) => row.status === "Lulus").length
  const classAverage = averageOf(graded.map((row) => row.rowAverage))
  const passRate = students.length === 0 ? null : passed / students.length
  const examsRule =
    examKeys.length > BASE_EXAM_COUNT
      ? "Rata-rata Großtest, empat Endtest, dan tiga Simulasi"
      : "Rata-rata Großtest dan empat Endtest"

  return (
    <div className="stack">
      <section className="card">
        <div className="grid-3">
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Rata-rata nilai kelas</span>
            <span className="h3">{formatScore(classAverage)}</span>
          </div>
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Tingkat kelulusan (KKM {kkm ?? "-"})</span>
            <span className="row" style={{ gap: 8, alignItems: "baseline" }}>
              <span className="h3 text-success">
                {passRate === null ? "-" : `${Math.round(passRate * 100)}%`}
              </span>
              <span className="caption text-muted">
                ({passed} dari {students.length} Siswa)
              </span>
            </span>
          </div>
          <div className="stack" style={{ gap: 4 }}>
            <span className="caption text-muted">Aturan kelulusan</span>
            <ol className="body-sm" style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                {examsRule} minimal {kkm ?? "sesuai KKM level"} (KKM).
              </li>
              <li>Siswa Tidak Lulus diarahkan ke Perlu Remedial di tab Deskripsi &amp; Catatan.</li>
            </ol>
          </div>
        </div>
      </section>

      {kkm === null && <KkmMissingNotice />}

      <section className="card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                {examKeys.map((key) => (
                  <th key={key} style={{ textAlign: "right" }} title={columnOf(key).label}>
                    {columnOf(key).short}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Rata-rata</th>
                <th style={{ textAlign: "right" }}>KKM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ student, rowAverage, status }) => (
                <tr key={student.studentId}>
                  <td style={{ fontWeight: 600 }}>
                    <SheetStudentName student={student} />
                  </td>
                  {examKeys.map((key) => (
                    <td key={key} className="numeric" style={{ padding: "6px 4px" }}>
                      <ScoreCell
                        value={draft.valueOf(student.studentId, key)}
                        kkm={kkm}
                        isDirty={draft.isDirty(student.studentId, key)}
                        readOnly={readOnly || isFormerMember(student)}
                        label={`${columnOf(key).label} ${student.name}`}
                        onChange={(value) => draft.setValue(student.studentId, key, value)}
                      />
                    </td>
                  ))}
                  <td
                    className={`numeric ${isBelowKkm(rowAverage, kkm) ? "text-danger" : ""}`}
                    style={{ fontWeight: 700 }}
                  >
                    {formatScore(rowAverage)}
                  </td>
                  <td className="numeric text-muted">{kkm ?? "-"}</td>
                  <td>
                    {status ? (
                      <span className={`badge ${EXAM_STATUS_BADGE[status]}`}>{status}</span>
                    ) : (
                      <span className="text-faint">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SaveBar
        dirtyCount={draft.dirtyCount}
        unit="nilai"
        label="Simpan Nilai Ujian"
        readOnly={readOnly}
        isPending={draft.isPending}
        onSave={() => void draft.submit()}
      />
    </div>
  )
}
