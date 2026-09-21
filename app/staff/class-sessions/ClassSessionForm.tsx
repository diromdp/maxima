"use client"

import { Calendar03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, Textarea } from "@mantine/core"
import { DateInput, DatesProvider } from "@mantine/dates"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { DASH, formatDateTime } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { AttendanceTable, type AttendanceMap } from "./AttendanceTable"
import { ProgressFields, type ProgressDraft } from "./ProgressFields"
import {
  type AttendanceStatus,
  CLASSES,
  classLabel,
  currentMaterial,
  DEFAULT_DATE,
  SESSION_DATES,
  type SessionClass,
  type SessionRecord,
  sessionsOn,
  STUDENTS_BY_CLASS,
  studyHoursLabel,
} from "./sample"

type Draft = {
  readonly attendance: AttendanceMap
  readonly progress: ProgressDraft
  readonly notes: string
  readonly savedAt?: string
  readonly savedBy?: string
}

const EMPTY_PROGRESS: ProgressDraft = {
  chapter: null,
  completion: null,
  learningStatus: null,
  nextChapter: null,
}

const draftFrom = (record?: SessionRecord): Draft =>
  record
    ? {
        attendance: record.attendance,
        progress: record.progress,
        notes: record.notes,
        savedAt: record.savedAt,
        savedBy: record.savedBy,
      }
    : { attendance: {}, progress: EMPTY_PROGRESS, notes: "" }

const classesFor = (viewer: Viewer): readonly SessionClass[] =>
  CLASSES.filter((room) => {
    if (viewer.role === "Pengajar") return room.teacher === viewer.name
    if (viewer.branches && !viewer.branches.includes(room.branch)) return false
    return true
  })

export type Viewer = {
  readonly name: string
  readonly role: string
  readonly branches: readonly string[] | null
  readonly canEdit: boolean
}

export function ClassSessionForm({ viewer }: { viewer: Viewer }) {
  const [date, setDate] = useState(DEFAULT_DATE)
  const [classId, setClassId] = useState<string | null>(null)
  const [drafts, setDrafts] = useState<Readonly<Record<string, Draft>>>({})

  const visibleClasses = classesFor(viewer)
  const sessions = sessionsOn(date).filter((session) =>
    visibleClasses.some((room) => room.id === session.classId),
  )
  const session = sessions.find((candidate) => candidate.classId === classId) ?? sessions[0]
  const room = session
    ? visibleClasses.find((candidate) => candidate.id === session.classId)
    : undefined
  const students = session ? (STUDENTS_BY_CLASS[session.classId] ?? []) : []
  const draft = session ? (drafts[session.id] ?? draftFrom(session.record)) : undefined
  const readOnly = !viewer.canEdit

  const updateDraft = (patch: Partial<Draft>) => {
    if (!session || !draft) return
    setDrafts((current) => ({ ...current, [session.id]: { ...draft, ...patch } }))
  }

  const setAttendance = (nis: string, status: AttendanceStatus) =>
    updateDraft({ attendance: { ...draft?.attendance, [nis]: status } })

  const markAllPresent = () =>
    updateDraft({
      attendance: Object.fromEntries(students.map((student) => [student.nis, "Hadir" as const])),
    })

  const missing = students.filter((student) => !draft?.attendance[student.nis]).length
  const canSave = missing === 0 && students.length > 0

  const save = () => {
    if (!session) return
    updateDraft({ savedAt: new Date().toISOString(), savedBy: viewer.name })
    notify.success(`Sesi ${room ? classLabel(room) : ""} tersimpan.`)
  }

  const facts = room
    ? [
        { label: "Jam Belajar", value: studyHoursLabel(room) },
        { label: "Level Siswa", value: `Deutsch ${room.level}` },
        { label: "Materi Berjalan", value: currentMaterial(room.id, date) ?? "Belum ada" },
        { label: "Jumlah Siswa", value: `${room.enrolled} Siswa` },
      ]
    : []

  return (
    <div className="stack">
      {readOnly && (
        <Notice tone="neutral">
          Halaman ini terbaca saja untuk {viewer.role}. Pengisian absensi dan progres dilakukan
          pengajar kelas.
        </Notice>
      )}

      <section className="card">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <DatesProvider settings={{ locale: "id" }}>
              <DateInput
                label="Tanggal Sesi"
                size="sm"
                w={180}
                valueFormat="DD MMM YYYY"
                leftSection={<HugeiconsIcon icon={Calendar03Icon} size={16} strokeWidth={1.5} />}
                value={date}
                onChange={(value) => {
                  if (!value) return
                  setDate(value)
                  setClassId(null)
                }}
                excludeDate={(candidate) => !SESSION_DATES.includes(candidate)}
                allowDeselect={false}
                clearable={false}
              />
            </DatesProvider>
            {sessions.length > 0 && (
              <Select
                label="Pilih Kelas Aktif"
                size="sm"
                w={240}
                allowDeselect={false}
                comboboxProps={{ position: "bottom-start" }}
                data={sessions.map((candidate) => {
                  const candidateRoom = visibleClasses.find((item) => item.id === candidate.classId)
                  return {
                    value: candidate.classId,
                    label: candidateRoom ? classLabel(candidateRoom) : candidate.classId,
                  }
                })}
                value={session?.classId ?? null}
                onChange={setClassId}
              />
            )}
          </div>

          {room ? (
            <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
              {facts.map(({ label, value }) => (
                <div key={label} className="stack" style={{ gap: 2 }}>
                  <dt className="caption text-muted">{label}</dt>
                  <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="body-sm text-muted" style={{ margin: 0 }}>
              Tidak ada sesi pada tanggal ini. Pilih tanggal lain yang punya jadwal kelas.
            </p>
          )}
        </div>
      </section>

      {session && draft && (
        <>
          <div className="grid-main-aside" style={{ alignItems: "start" }}>
            <AttendanceTable
              students={students}
              attendance={draft.attendance}
              missing={missing}
              readOnly={readOnly}
              onChange={setAttendance}
              onMarkAllPresent={markAllPresent}
            />

            <div className="stack">
              <ProgressFields
                progress={draft.progress}
                readOnly={readOnly}
                onChange={(patch) => updateDraft({ progress: { ...draft.progress, ...patch } })}
              />

              <section className="card stack">
                <h2 className="h5">3. Catatan Pertemuan (Evaluasi Kelas)</h2>
                <Textarea
                  aria-label="Catatan pertemuan"
                  placeholder="Apa yang dipahami kelas hari ini, siapa yang perlu perhatian, dan apa yang dibawa ke sesi berikutnya."
                  autosize
                  minRows={4}
                  value={draft.notes}
                  onChange={(event) => updateDraft({ notes: event.currentTarget.value })}
                  readOnly={readOnly}
                />
              </section>
            </div>
          </div>

          <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
            <span className="caption text-muted">
              {missing > 0 && !readOnly
                ? `${missing} siswa belum diberi status kehadiran`
                : draft.savedAt
                  ? `Tersimpan ${formatDateTime(draft.savedAt)} oleh ${draft.savedBy ?? DASH}`
                  : readOnly
                    ? "Sesi ini belum diisi pengajar"
                    : "Belum disimpan"}
            </span>
            {!readOnly && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={!canSave}
                title={
                  students.length === 0
                    ? "Kelas ini belum punya anggota aktif"
                    : missing > 0
                      ? `${missing} siswa belum diberi status kehadiran`
                      : undefined
                }
                onClick={save}
              >
                Simpan Sesi Kelas
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
