"use client"

import { Notice } from "@/src/components/ui/Notice"

import { SaveBar } from "./SaveBar"
import { ScoreCell } from "./ScoreCell"
import {
  type AssessmentClass,
  average,
  CHAPTER_KEYS,
  CHAPTER_SCORES,
  formatScore,
  KKM,
  type Student,
  STUDENTS_BY_CLASS,
} from "./sample"
import { useScoreSheet } from "./useScoreSheet"

export function ChapterScoresTab({ room, readOnly }: { room: AssessmentClass; readOnly: boolean }) {
  const students: readonly Student[] = STUDENTS_BY_CLASS[room.id] ?? []
  const { scoreOf, isDirty, setScore, dirtyCount, save } = useScoreSheet(
    CHAPTER_SCORES[room.id] ?? {},
  )

  return (
    <div className="stack">
      <section className="card stack">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Level</th>
                {CHAPTER_KEYS.map((key) => (
                  <th key={key} style={{ textAlign: "right" }}>
                    {key}
                  </th>
                ))}
                <th style={{ textAlign: "right" }}>Rata-rata</th>
                <th style={{ textAlign: "right" }}>KKM</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const rowAverage = average(CHAPTER_KEYS.map((key) => scoreOf(student.nis, key)))
                return (
                  <tr key={student.nis}>
                    <td style={{ fontWeight: 600 }}>{student.name}</td>
                    <td className="text-muted">{room.level}</td>
                    {CHAPTER_KEYS.map((key) => (
                      <td key={key} className="numeric" style={{ padding: "6px 4px" }}>
                        <ScoreCell
                          value={scoreOf(student.nis, key)}
                          isDirty={isDirty(student.nis, key)}
                          readOnly={readOnly}
                          label={`${key} ${student.name}`}
                          onChange={(value) => setScore(student.nis, key, value)}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <Notice tone="warning" title="Aturan Sistem">
          KKM yang ditetapkan adalah <strong>{KKM}</strong>. Semua kolom bab (Kapitel 1-12)
          digabungkan dalam satu tabel berdasar level terpilih. Empat level dalam satu tabel dengan
          kolom level, bukan empat sheet terpisah.
        </Notice>
      </section>

      <SaveBar
        dirtyCount={dirtyCount}
        unit="nilai"
        label="Simpan Nilai Kapitel"
        readOnly={readOnly}
        onSave={save}
      />
    </div>
  )
}
