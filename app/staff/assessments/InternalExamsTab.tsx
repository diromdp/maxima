"use client"

import { SaveBar } from "./SaveBar"
import { ScoreCell } from "./ScoreCell"
import {
  type AssessmentClass,
  average,
  EXAM_SCORES,
  examColumnsFor,
  formatScore,
  KKM,
  PASS_RULES,
  type Student,
  STUDENTS_BY_CLASS,
} from "./sample"
import { useScoreSheet } from "./useScoreSheet"

type ExamStatus = "Lulus" | "Tidak Lulus" | "Belum Lengkap"

const STATUS_BADGE: Readonly<Record<ExamStatus, string>> = {
  Lulus: "badge-beres",
  "Tidak Lulus": "badge-tindakan",
  "Belum Lengkap": "badge-terkunci",
}

const statusOf = (rowAverage: number | null, isComplete: boolean): ExamStatus => {
  if (!isComplete || rowAverage === null) return "Belum Lengkap"
  return rowAverage >= KKM ? "Lulus" : "Tidak Lulus"
}

export function InternalExamsTab({ room, readOnly }: { room: AssessmentClass; readOnly: boolean }) {
  const students: readonly Student[] = STUDENTS_BY_CLASS[room.id] ?? []
  const columns = examColumnsFor(room.level)
  const { scoreOf, isDirty, setScore, dirtyCount, save } = useScoreSheet(EXAM_SCORES[room.id] ?? {})

  const rows = students.map((student) => {
    const scores = columns.map((column) => scoreOf(student.nis, column.key))
    const rowAverage = average(scores)
    const isComplete = scores.every((score) => score !== null)
    return { student, rowAverage, status: statusOf(rowAverage, isComplete) }
  })
  const graded = rows.filter((row) => row.status !== "Belum Lengkap")
  const passed = graded.filter((row) => row.status === "Lulus").length
  const classAverage = average(graded.map((row) => row.rowAverage))
  const passRate = students.length === 0 ? null : passed / students.length

  return (
    <div className="stack">
      <section className="card">
        <div className="grid-3">
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Rata-rata nilai kelas</span>
            <span className="h3">{formatScore(classAverage)}</span>
          </div>
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Tingkat kelulusan (KKM {KKM})</span>
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
              {PASS_RULES.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama Siswa</th>
                {columns.map((column) => (
                  <th key={column.key} style={{ textAlign: "right" }} title={column.label}>
                    {column.short}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Rata-rata</th>
                <th style={{ textAlign: "right" }}>KKM</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ student, rowAverage, status }) => (
                <tr key={student.nis}>
                  <td className="tabular text-muted">{student.nis}</td>
                  <td style={{ fontWeight: 600 }}>{student.name}</td>
                  {columns.map((column) => (
                    <td key={column.key} className="numeric" style={{ padding: "6px 4px" }}>
                      <ScoreCell
                        value={scoreOf(student.nis, column.key)}
                        isDirty={isDirty(student.nis, column.key)}
                        readOnly={readOnly}
                        label={`${column.label} ${student.name}`}
                        onChange={(value) => setScore(student.nis, column.key, value)}
                      />
                    </td>
                  ))}
                  <td
                    className={`numeric ${rowAverage !== null && rowAverage < KKM ? "text-danger" : ""}`}
                    style={{ fontWeight: 700 }}
                  >
                    {formatScore(rowAverage)}
                  </td>
                  <td className="numeric text-muted">{KKM}</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[status]}`}>{status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <SaveBar
        dirtyCount={dirtyCount}
        unit="nilai"
        label="Simpan Nilai Ujian"
        readOnly={readOnly}
        onSave={save}
      />
    </div>
  )
}
