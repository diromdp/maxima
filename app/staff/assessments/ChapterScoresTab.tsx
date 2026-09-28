"use client"

import { Notice } from "@/src/components/ui/Notice"
import { saveScoreSheet } from "@/src/entities/assessment/actions"
import {
  type AssessmentSheet,
  averageOf,
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

export function ChapterScoresTab({
  sheet,
  sheetKey,
  readOnly,
}: {
  sheet: AssessmentSheet
  sheetKey: SheetKey
  readOnly: boolean
}) {
  const { kkm, chapterKeys, students } = sheet
  const draft = useSheetDraft<number>({
    sheetKey,
    serverValueOf: (studentId, key) =>
      students.find((student) => student.studentId === studentId)?.chapters[key] ?? null,
    save: (changes) =>
      saveScoreSheet("chapters", {
        ...sheetKey,
        version: sheet.versions.chapters,
        rows: Object.entries(changes).map(([studentId, values]) => ({ studentId, values })),
      }),
    successMessage: "Nilai Kapitel tersimpan.",
  })

  return (
    <div className="stack">
      <section className="card stack">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Level</th>
                {chapterKeys.map((key) => (
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
                const rowAverage = draft.isRowDirty(student.studentId)
                  ? averageOf(chapterKeys.map((key) => draft.valueOf(student.studentId, key)))
                  : student.chapterAverage
                return (
                  <tr key={student.studentId}>
                    <td style={{ fontWeight: 600 }}>
                      <SheetStudentName student={student} />
                    </td>
                    <td className="text-muted">{sheet.class.level.name}</td>
                    {chapterKeys.map((key) => (
                      <td key={key} className="numeric" style={{ padding: "6px 4px" }}>
                        <ScoreCell
                          value={draft.valueOf(student.studentId, key)}
                          kkm={kkm}
                          isDirty={draft.isDirty(student.studentId, key)}
                          readOnly={readOnly || isFormerMember(student)}
                          label={`${key} ${student.name}`}
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
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {kkm === null ? (
          <KkmMissingNotice />
        ) : (
          <Notice tone="warning" title="Aturan Sistem">
            KKM yang ditetapkan adalah <strong>{kkm}</strong>. Semua kolom bab (Kapitel 1-12)
            digabungkan dalam satu tabel berdasar level terpilih. Empat level dalam satu tabel
            dengan kolom level, bukan empat sheet terpisah.
          </Notice>
        )}
      </section>

      <SaveBar
        dirtyCount={draft.dirtyCount}
        unit="nilai"
        label="Simpan Nilai Kapitel"
        readOnly={readOnly}
        isPending={draft.isPending}
        onSave={() => void draft.submit()}
      />
    </div>
  )
}
