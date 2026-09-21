"use client"

import { Download04Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, Textarea } from "@mantine/core"
import { Fragment, useState } from "react"

import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { SaveBar } from "./SaveBar"
import {
  type AssessmentClass,
  EMPTY_NOTE,
  NOTES,
  type Recommendation,
  RECOMMENDATION_BADGE,
  RECOMMENDATIONS,
  type Student,
  STUDENTS_BY_CLASS,
  type TeacherNote,
} from "./sample"

type NoteMap = Readonly<Record<string, TeacherNote>>
type NoteDraft = Pick<TeacherNote, "description" | "text">

const Preview = ({ value, empty }: { value: string; empty: string }) =>
  value ? (
    <span className="block truncate">{value}</span>
  ) : (
    <span className="text-faint">{empty}</span>
  )

export function NotesTab({
  room,
  period,
  readOnly,
}: {
  room: AssessmentClass
  period: string
  readOnly: boolean
}) {
  const students: readonly Student[] = STUDENTS_BY_CLASS[room.id] ?? []
  const initial: NoteMap = NOTES[room.id] ?? {}
  const [saved, setSaved] = useState(initial)
  const [notes, setNotes] = useState(initial)
  const [openNis, setOpenNis] = useState<string | null>(null)
  const [editDraft, setEditDraft] = useState<NoteDraft | null>(null)

  const noteOf = (nis: string) => notes[nis] ?? EMPTY_NOTE
  const dirtyCount = students.filter(
    (student) =>
      noteOf(student.nis).recommendation !== (saved[student.nis] ?? EMPTY_NOTE).recommendation,
  ).length

  const setRecommendation = (nis: string, recommendation: Recommendation | null) =>
    setNotes((current) => ({ ...current, [nis]: { ...noteOf(nis), recommendation } }))

  const saveNote = (nis: string) => {
    if (!editDraft) return
    const patch = {
      description: editDraft.description.trim(),
      text: editDraft.text.trim(),
      updatedAt: new Date().toISOString(),
    }
    setNotes((current) => ({ ...current, [nis]: { ...noteOf(nis), ...patch } }))
    setSaved((current) => ({ ...current, [nis]: { ...(current[nis] ?? EMPTY_NOTE), ...patch } }))
    setEditDraft(null)
    notify.success("Deskripsi dan catatan tersimpan.")
  }

  return (
    <div className="stack">
      <section className="card">
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th>NIS</th>
                <th>Nama Siswa</th>
                <th>Deskripsi Belajar</th>
                <th>Catatan Pengajar</th>
                <th>Rekomendasi</th>
                <th>Tanggal Update</th>
                <th style={{ textAlign: "right" }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const note = noteOf(student.nis)
                const isOpen = openNis === student.nis
                return (
                  <Fragment key={student.nis}>
                    <tr>
                      <td className="tabular text-muted">{student.nis}</td>
                      <td style={{ fontWeight: 600 }}>{student.name}</td>
                      <td className="wrap" style={{ maxWidth: 180 }}>
                        <Preview value={note.description} empty="Belum ada deskripsi" />
                      </td>
                      <td className="wrap" style={{ maxWidth: 180 }}>
                        <Preview value={note.text} empty="Belum ada catatan" />
                      </td>
                      <td>
                        {readOnly ? (
                          note.recommendation ? (
                            <span className={`badge ${RECOMMENDATION_BADGE[note.recommendation]}`}>
                              {note.recommendation}
                            </span>
                          ) : (
                            <span className="text-faint">Belum dipilih</span>
                          )
                        ) : (
                          <Select
                            aria-label={`Rekomendasi ${student.name}`}
                            size="xs"
                            w={148}
                            placeholder="Belum dipilih"
                            data={[...RECOMMENDATIONS]}
                            value={note.recommendation}
                            onChange={(value) =>
                              setRecommendation(student.nis, value as Recommendation | null)
                            }
                            comboboxProps={{ withinPortal: true }}
                          />
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
                              setOpenNis(isOpen ? null : student.nis)
                              setEditDraft(null)
                            }}
                          >
                            {isOpen ? "Tutup" : "Lihat Detail"}
                          </button>
                          <button
                            type="button"
                            className="btn btn-icon btn-sm"
                            title={`Unduh rapor ${student.name}`}
                            aria-label={`Unduh rapor ${student.name}`}
                            onClick={() =>
                              notify.info(
                                `Rapor ${student.name} (${room.name}, ${period}) disiapkan sebagai PDF.`,
                              )
                            }
                          >
                            <HugeiconsIcon icon={Download04Icon} size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr>
                        <td colSpan={7} className="wrap" style={{ paddingTop: 0 }}>
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
                                    value={editDraft.description}
                                    onChange={(event) =>
                                      setEditDraft({
                                        ...editDraft,
                                        description: event.currentTarget.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <p className="body" style={{ margin: 0 }}>
                                    {note.description || "Belum ada deskripsi untuk siswa ini."}
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
                                    value={editDraft.text}
                                    onChange={(event) =>
                                      setEditDraft({
                                        ...editDraft,
                                        text: event.currentTarget.value,
                                      })
                                    }
                                  />
                                ) : (
                                  <p className="body" style={{ margin: 0 }}>
                                    {note.text || "Belum ada catatan untuk siswa ini."}
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
                                    onClick={() => saveNote(student.nis)}
                                  >
                                    Simpan Catatan
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setEditDraft(null)}
                                  >
                                    Batal
                                  </button>
                                </>
                              ) : (
                                <>
                                  {!readOnly && (
                                    <button
                                      type="button"
                                      className="btn btn-primary btn-sm"
                                      onClick={() =>
                                        setEditDraft({
                                          description: note.description,
                                          text: note.text,
                                        })
                                      }
                                    >
                                      Edit Catatan
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setOpenNis(null)}
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
        dirtyCount={dirtyCount}
        unit="rekomendasi"
        label="Simpan Rekomendasi"
        readOnly={readOnly}
        onSave={() => setSaved(notes)}
      />
    </div>
  )
}
