"use client"

import { Skeleton, Textarea } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { saveSession } from "@/src/entities/session/actions"
import { sessionDetailQuery } from "@/src/entities/session/queries"
import {
  jakartaToday,
  type AttendanceStatus,
  type SessionDetail,
  type SessionInput,
  type SessionProgress,
} from "@/src/entities/session/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateTime } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { AttendanceTable, type AttendanceMap } from "./AttendanceTable"
import { ProgressFields } from "./ProgressFields"

const SKELETON_STUDENTS = 8
const CONFLICT = 409
const PROGRESS_FIELDS: ReadonlySet<string> = new Set([
  "chapter",
  "completion",
  "learningStatus",
  "nextChapter",
  "note",
])

type Draft = {
  readonly attendance: AttendanceMap
  readonly progress: SessionProgress
  readonly note: string
}

const draftOf = (detail: SessionDetail): Draft => ({
  attendance: Object.fromEntries(
    detail.students.flatMap((student) =>
      student.status ? [[student.studentId, student.status]] : [],
    ),
  ),
  progress: detail.progress,
  note: detail.note ?? "",
})

export function FactsSkeleton() {
  return (
    <div className="row row-wrap" style={{ gap: 24 }} aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton key={index} height={36} width={96} radius="sm" aria-hidden />
      ))}
    </div>
  )
}

export function SessionFacts({ sessionId }: { sessionId: string }) {
  const detail = useRead(sessionDetailQuery(sessionId))
  if (!detail.data) return detail.isPending ? <FactsSkeleton /> : null

  const facts = [
    { label: "Jam Belajar", value: detail.data.studyHours },
    { label: "Level Siswa", value: `Deutsch ${detail.data.level.name}` },
    { label: "Materi Berjalan", value: detail.data.currentChapter ?? "Belum ada" },
    { label: "Jumlah Siswa", value: `${detail.data.studentCount} Siswa` },
  ]
  return (
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
  )
}

export function SessionSheet({ sessionId, roleName }: { sessionId: string; roleName: string }) {
  const detail = useRead(sessionDetailQuery(sessionId))

  if (detail.isError) {
    return <QueryError message={detail.error.message} onRetry={() => void detail.refetch()} />
  }
  if (detail.isPending) return <SheetSkeleton />

  return (
    <SessionEditor
      key={detail.data.savedAt ?? "unsaved"}
      detail={detail.data}
      roleName={roleName}
    />
  )
}

function SessionEditor({ detail, roleName }: { detail: SessionDetail; roleName: string }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft>(() => draftOf(detail))
  const [fieldErrors, setFieldErrors] = useState<Readonly<Record<string, string>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const save = useMutation({ mutationFn: () => saveSession(detail.id, inputOf(detail, draft)) })

  const detailKey = sessionDetailQuery(detail.id).queryKey
  const isConflict = save.data?.ok === false && save.data.status === CONFLICT
  const isUpcoming = detail.date > jakartaToday()
  const readOnly = !detail.canFill || isUpcoming
  const missing = detail.students.filter((student) => !draft.attendance[student.studentId]).length
  const blockedReason =
    detail.students.length === 0
      ? "Kelas ini belum punya anggota aktif pada tanggal sesi"
      : missing > 0
        ? `${missing} siswa belum diberi status kehadiran`
        : undefined

  const update = (patch: Partial<Draft>) => setDraft((current) => ({ ...current, ...patch }))

  const setAttendance = (studentId: string, status: AttendanceStatus) =>
    update({ attendance: { ...draft.attendance, [studentId]: status } })

  const markAllPresent = () =>
    update({
      attendance: Object.fromEntries(
        detail.students.map((student) => [student.studentId, "Hadir" as const]),
      ),
    })

  async function submit() {
    setFieldErrors({})
    setFormError(null)
    const result = await save.mutateAsync()
    if (!result.ok) {
      const progressErrors = Object.entries(result.fieldErrors).filter(([field]) =>
        PROGRESS_FIELDS.has(field),
      )
      setFieldErrors(Object.fromEntries(progressErrors))
      if (progressErrors.length === 0 || result.status === CONFLICT) setFormError(result.message)
      return
    }
    notify.success(`Sesi ${detail.class.name} (${detail.level.name}) tersimpan.`)
    queryClient.setQueryData(detailKey, result.data)
  }

  return (
    <>
      {!detail.canFill && (
        <Notice tone="neutral">
          Halaman ini terbaca saja untuk {roleName}. Pengisian absensi dan progres dilakukan
          pengajar kelas.
        </Notice>
      )}
      {detail.canFill && isUpcoming && (
        <Notice tone="info">
          Sesi ini belum berjalan. Daftar siswanya dapat dilihat, dan absensi diisi pada hari sesi
          atau sesudahnya.
        </Notice>
      )}

      <div className="grid-main-aside" style={{ alignItems: "start" }}>
        <AttendanceTable
          students={detail.students}
          attendance={draft.attendance}
          missing={missing}
          readOnly={readOnly}
          onChange={setAttendance}
          onMarkAllPresent={markAllPresent}
        />

        <div className="stack">
          <ProgressFields
            progress={draft.progress}
            errors={fieldErrors}
            readOnly={readOnly}
            onChange={(patch) =>
              update({
                progress: {
                  ...draft.progress,
                  ...patch,
                  ...(patch.chapter === null ? { completion: null } : {}),
                },
              })
            }
          />

          <section className="card stack">
            <h2 className="h5">3. Catatan Pertemuan (Evaluasi Kelas)</h2>
            <Textarea
              aria-label="Catatan pertemuan"
              placeholder="Apa yang dipahami kelas hari ini, siapa yang perlu perhatian, dan apa yang dibawa ke sesi berikutnya."
              autosize
              minRows={4}
              maxLength={2000}
              value={draft.note}
              onChange={(event) => update({ note: event.currentTarget.value })}
              error={fieldErrors.note}
              readOnly={readOnly}
            />
          </section>
        </div>
      </div>

      {formError && (
        <div role="alert">
          <Notice
            tone="danger"
            actions={
              isConflict ? (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => void queryClient.invalidateQueries({ queryKey: detailKey })}
                >
                  Muat ulang
                </button>
              ) : undefined
            }
          >
            {formError}
          </Notice>
        </div>
      )}

      <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
        <span className="caption text-muted">
          {!readOnly && blockedReason
            ? blockedReason
            : detail.savedAt
              ? `Tersimpan ${formatDateTime(detail.savedAt)} oleh ${detail.savedBy?.name ?? "-"}`
              : readOnly
                ? "Sesi ini belum diisi pengajar"
                : "Belum disimpan"}
        </span>
        {!readOnly && (
          <button
            type="button"
            className="btn btn-primary"
            disabled={blockedReason !== undefined || save.isPending}
            title={blockedReason}
            onClick={() => void submit()}
          >
            {save.isPending ? "Menyimpan..." : "Simpan Sesi Kelas"}
          </button>
        )}
      </div>
    </>
  )
}

function inputOf(detail: SessionDetail, draft: Draft): SessionInput {
  return {
    ...draft.progress,
    lastSavedAt: detail.savedAt,
    nextChapter: draft.progress.nextChapter?.trim() || null,
    note: draft.note.trim() || null,
    attendances: detail.students.flatMap((student) => {
      const status = draft.attendance[student.studentId]
      return status ? [{ studentId: student.studentId, status }] : []
    }),
  }
}

function SheetSkeleton() {
  return (
    <div className="grid-main-aside" style={{ alignItems: "start" }} aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <section className="card stack" aria-hidden>
        <Skeleton height={20} width="50%" radius="xl" />
        {Array.from({ length: SKELETON_STUDENTS }, (_, index) => (
          <Skeleton key={index} height={44} radius="sm" />
        ))}
      </section>
      <div className="stack" aria-hidden>
        <section className="card stack">
          <Skeleton height={20} width="50%" radius="xl" />
          <Skeleton height={42} radius="sm" />
          <Skeleton height={42} radius="sm" />
          <Skeleton height={42} radius="sm" />
        </section>
        <section className="card stack">
          <Skeleton height={20} width="50%" radius="xl" />
          <Skeleton height={112} radius="sm" />
        </section>
      </div>
    </div>
  )
}
