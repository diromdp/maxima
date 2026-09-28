"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, Textarea } from "@mantine/core"
import { useQueryClient } from "@tanstack/react-query"
import { Fragment, useState } from "react"

import { saveTeacherNote } from "@/src/entities/assessment/actions"
import { assessmentSheetQuery } from "@/src/entities/assessment/queries"
import {
  type AssessmentSheet,
  type Recommendation,
  RECOMMENDATION_BADGE,
  RECOMMENDATIONS,
  type SheetKey,
  type SheetStudent,
  type TeacherNote,
  isFormerMember,
} from "@/src/entities/assessment/schema"
import { openRenderedFile } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { SaveBar } from "./SaveBar"
import { SheetStudentName } from "./SheetStudentName"

type NoteDraft = { learningDescription: string; teacherNote: string }

const NOT_ISSUED = "Raport belum terbit. Terbitkan dulu di halaman Raport."

const Preview = ({ value, empty }: { value: string | null; empty: string }) =>
  value ? (
    <span className="block truncate">{value}</span>
  ) : (
    <span className="text-faint">{empty}</span>
  )

const textOrNull = (value: string) => (value.trim() === "" ? null : value.trim())

async function downloadReport(student: SheetStudent) {
  if (!student.reportCardId) return
  try {
    await openRenderedFile(`/report-cards/${student.reportCardId}/pdf`)
  } catch (error) {
    if (!(error instanceof ApiError)) throw error
    notify.error(error.message)
  }
}

export function NotesTab({
  sheet,
  sheetKey,
  readOnly,
  canDownloadReport,
}: {
  sheet: AssessmentSheet
  sheetKey: SheetKey
  readOnly: boolean
  canDownloadReport: boolean
}) {
  const queryClient = useQueryClient()
  const [recommendations, setRecommendations] = useState<
    Readonly<Record<string, Recommendation | null>>
  >({})
  const [openId, setOpenId] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<NoteDraft | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const recommendationOf = (student: SheetStudent) =>
    student.studentId in recommendations
      ? (recommendations[student.studentId] ?? null)
      : student.note.recommendation
  const changed = sheet.students.filter((student) => student.studentId in recommendations)

  function setRecommendation(student: SheetStudent, value: Recommendation | null) {
    setRecommendations((current) => {
      const next = { ...current }
      if (value === student.note.recommendation) delete next[student.studentId]
      else next[student.studentId] = value
      return next
    })
  }

  const patchNote = (studentId: string, note: TeacherNote) =>
    queryClient.setQueryData<AssessmentSheet>(
      assessmentSheetQuery(sheetKey).queryKey,
      (current) =>
        current && {
          ...current,
          students: current.students.map((student) =>
            student.studentId === studentId ? { ...student, note } : student,
          ),
        },
    )

  async function saveRecommendations() {
    setIsSaving(true)
    let saved = 0
    try {
      for (const student of changed) {
        const result = await saveTeacherNote(student.studentId, {
          ...sheetKey,
          lastUpdatedAt: student.note.updatedAt,
          recommendation: recommendations[student.studentId] ?? null,
        })
        if (!result.ok) {
          notify.error(`${student.name}: ${result.message}`)
          break
        }
        patchNote(student.studentId, result.data)
        setRecommendations((current) => {
          const next = { ...current }
          delete next[student.studentId]
          return next
        })
        saved += 1
      }
    } finally {
      setIsSaving(false)
    }
    if (saved > 0) notify.success(`${saved} rekomendasi tersimpan.`)
  }

  async function saveNote(student: SheetStudent) {
    if (!editDraft) return
    setIsSaving(true)
    const result = await saveTeacherNote(student.studentId, {
      ...sheetKey,
      lastUpdatedAt: student.note.updatedAt,
      learningDescription: textOrNull(editDraft.learningDescription),
      teacherNote: textOrNull(editDraft.teacherNote),
    }).finally(() => setIsSaving(false))
    if (!result.ok) return notify.error(result.message)
    patchNote(student.studentId, result.data)
    setEditDraft(null)
    notify.success(`Deskripsi dan catatan ${student.name} tersimpan.`)
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>Nama Siswa</th>
                <th>Deskripsi Belajar</th>
                <th>Catatan Pengajar</th>
                <th>Rekomendasi</th>
                <th>Tanggal Update</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sheet.students.map((student) => {
                const { note } = student
                const recommendation = recommendationOf(student)
                const isOpen = openId === student.studentId
                return (
                  <Fragment key={student.studentId}>
                    <tr>
                      <td style={{ fontWeight: 600 }}>
                        <SheetStudentName student={student} />
                      </td>
                      <td className="wrap" style={{ maxWidth: 180 }}>
                        <Preview value={note.learningDescription} empty="Belum ada deskripsi" />
                      </td>
                      <td className="wrap" style={{ maxWidth: 180 }}>
                        <Preview value={note.teacherNote} empty="Belum ada catatan" />
                      </td>
                      <td>
                        {readOnly || isFormerMember(student) ? (
                          recommendation ? (
                            <span className={`badge ${RECOMMENDATION_BADGE[recommendation]}`}>
                              {recommendation}
                            </span>
                          ) : (
                            <span className="text-faint">Belum dipilih</span>
                          )
                        ) : (
                          <span className="relative inline-block">
                            <Select
                              aria-label={`Rekomendasi ${student.name}`}
                              size="xs"
                              w={148}
                              placeholder="Belum dipilih"
                              data={[...RECOMMENDATIONS]}
                              value={recommendation}
                              onChange={(value) =>
                                setRecommendation(student, value as Recommendation | null)
                              }
                              comboboxProps={{ withinPortal: true }}
                            />
                            {student.studentId in recommendations && (
                              <span
                                aria-hidden
                                className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                              />
                            )}
                          </span>
                        )}
                      </td>
                      <td className="text-muted">
                        {note.updatedAt ? formatDate(note.updatedAt) : DASH}
                      </td>
                      <td>
                        <div className="row" style={{ gap: 8, justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            aria-expanded={isOpen}
                            onClick={() => {
                              setOpenId(isOpen ? null : student.studentId)
                              setEditDraft(null)
                            }}
                          >
                            {isOpen ? "Tutup" : "Lihat Detail"}
                          </button>
                          {canDownloadReport && (
                            <button
                              type="button"
                              className="btn btn-icon btn-sm"
                              title={
                                student.reportCardId ? `Unduh rapor ${student.name}` : NOT_ISSUED
                              }
                              aria-label={`Unduh rapor ${student.name}`}
                              disabled={!student.reportCardId}
                              onClick={() => void downloadReport(student)}
                            >
                              <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.5} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={6} className="wrap" style={{ paddingTop: 0 }}>
                          <div className="card-soft stack">
                            <div className="grid-2">
                              <div className="stack" style={{ gap: 6 }}>
                                <span className="label">
                                  Deskripsi Belajar Siswa Selama Pembelajaran
                                </span>
                                {editDraft ? (
                                  <Textarea
                                    aria-label={`Deskripsi belajar ${student.name}`}
                                    autosize
                                    minRows={3}
                                    maxLength={5000}
                                    value={editDraft.learningDescription}
                                    onChange={(event) =>
                                      setEditDraft({
                                        ...editDraft,
                                        learningDescription: event.currentTarget.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <p className="body" style={{ margin: 0 }}>
                                    {note.learningDescription ||
                                      "Belum ada deskripsi untuk siswa ini."}
                                  </p>
                                )}
                              </div>
                              <div className="stack" style={{ gap: 6 }}>
                                <span className="label">Catatan dari Pengajar</span>
                                {editDraft ? (
                                  <Textarea
                                    aria-label={`Catatan ${student.name}`}
                                    autosize
                                    minRows={3}
                                    maxLength={5000}
                                    value={editDraft.teacherNote}
                                    onChange={(event) =>
                                      setEditDraft({
                                        ...editDraft,
                                        teacherNote: event.currentTarget.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <p className="body" style={{ margin: 0 }}>
                                    {note.teacherNote || "Belum ada catatan untuk siswa ini."}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="row row-wrap" style={{ gap: 8 }}>
                              {editDraft ? (
                                <>
                                  <button
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    disabled={isSaving}
                                    onClick={() => void saveNote(student)}
                                  >
                                    {isSaving ? "Menyimpan..." : "Simpan Catatan"}
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    disabled={isSaving}
                                    onClick={() => setEditDraft(null)}
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!readOnly && !isFormerMember(student) && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() =>
                                        setEditDraft({
                                          learningDescription: note.learningDescription ?? "",
                                          teacherNote: note.teacherNote ?? "",
                                        })
                                      }
                                    >
                                      Edit Catatan
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setOpenId(null)}
                                  >
                                    Tutup
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <SaveBar
        dirtyCount={changed.length}
        unit="rekomendasi"
        label="Simpan Rekomendasi"
        readOnly={readOnly}
        isPending={isSaving}
        onSave={() => void saveRecommendations()}
      />
    </div>
  )
}
