"use client"

import { Checkbox, Modal, Skeleton } from "@mantine/core"
import { useForm } from "@mantine/form"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { registerExamStudents } from "@/src/entities/certificate/actions"
import { examCandidatesQuery, SCHEDULE_KEYS } from "@/src/entities/certificate/queries"
import {
  type ExamCandidateRow,
  type ExamScheduleRow,
  READINESS_BADGE,
} from "@/src/entities/certificate/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const CANDIDATE_SKELETONS = 4

type RegisterForm = { studentIds: string[]; isOverCapacityConfirmed: boolean }

export function RegisterStudentsModal({
  schedule,
  onClose,
}: {
  schedule: ExamScheduleRow
  onClose: () => void
}) {
  const candidates = useRead(examCandidatesQuery(schedule.id))

  return (
    <Modal
      opened
      onClose={onClose}
      title={`Daftarkan Siswa ke ${schedule.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      {candidates.isError ? (
        <QueryError message={candidates.error.message} onRetry={() => void candidates.refetch()} />
      ) : candidates.isPending ? (
        <div className="stack" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          {Array.from({ length: CANDIDATE_SKELETONS }, (_, index) => (
            <Skeleton key={index} height={44} radius="sm" aria-hidden />
          ))}
        </div>
      ) : (
        <RegisterFormBody schedule={schedule} candidates={candidates.data.data} onClose={onClose} />
      )}
    </Modal>
  )
}

function RegisterFormBody({
  schedule,
  candidates,
  onClose,
}: {
  schedule: ExamScheduleRow
  candidates: readonly ExamCandidateRow[]
  onClose: () => void
}) {
  const form = useForm<RegisterForm>({
    initialValues: { studentIds: [], isOverCapacityConfirmed: false },
  })
  const selected = form.values.studentIds
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) =>
      registerExamStudents(schedule.id, values.studentIds, values.isOverCapacityConfirmed),
    successMessage: `${selected.length} siswa terdaftar ke ${schedule.name}.`,
    invalidates: SCHEDULE_KEYS,
    onSuccess: onClose,
  })

  const isOverQuota = selected.length > schedule.remainingSeats
  const notReady = candidates.filter(
    (row) => selected.includes(row.studentId) && row.recommendation !== "Siap Ujian",
  ).length
  const blockedReason =
    selected.length === 0
      ? "Pilih minimal satu siswa"
      : isOverQuota && !form.values.isOverCapacityConfirmed
        ? "Centang konfirmasi kuota dulu"
        : undefined

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      {formError && <Notice tone="danger">{formError}</Notice>}

      <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
        {[
          ["Kuota", `${schedule.registeredCount} / ${schedule.capacity} Terdaftar`],
          ["Sisa kursi", String(schedule.remainingSeats)],
          ["Dipilih", String(selected.length)],
        ].map(([label, value]) => (
          <div key={label} className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">{label}</dt>
            <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {candidates.length === 0 ? (
        <Notice tone="neutral">
          Tidak ada siswa Aktif level {schedule.level.name} yang belum terdaftar di jadwal ini.
          Siswa baru muncul di sini bila kelas aktifnya selevel dengan jadwal ujian.
        </Notice>
      ) : (
        <Checkbox.Group
          label={`Siswa level ${schedule.level.name} yang belum terdaftar`}
          description="Siswa Belum Siap atau yang belum direkomendasikan tetap bisa didaftarkan, dengan peringatan."
          value={selected}
          onChange={(value) => {
            form.setFieldValue("studentIds", value)
            form.setFieldValue("isOverCapacityConfirmed", false)
          }}
        >
          <div className="list-rows" style={{ marginTop: 8 }}>
            {candidates.map((row) => (
              <Checkbox
                key={row.studentId}
                value={row.studentId}
                className="py-2"
                label={
                  <span className="row row-wrap" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 600 }}>{row.name}</span>
                    <span className="caption text-muted tabular">{row.nis}</span>
                    {row.recommendation ? (
                      <span className={`badge ${READINESS_BADGE[row.recommendation]}`}>
                        {row.recommendation}
                      </span>
                    ) : (
                      <span className="badge badge-terkunci">Belum direkomendasikan</span>
                    )}
                  </span>
                }
              />
            ))}
          </div>
        </Checkbox.Group>
      )}

      {notReady > 0 && (
        <Notice tone="warning">
          {notReady} siswa yang dipilih belum berstatus Siap Ujian. Pendaftarannya tetap masuk log
          atas nama Anda.
        </Notice>
      )}

      {isOverQuota && (
        <Notice tone="danger" title="Melebihi kuota">
          Anda memilih {selected.length} siswa, sisa kursi hanya {schedule.remainingSeats}.
          Pendaftaran di atas kuota butuh konfirmasi.
          <Checkbox
            mt="sm"
            label="Saya paham kuota terlampaui dan sudah dikonfirmasi ke penyelenggara"
            checked={form.values.isOverCapacityConfirmed}
            onChange={(event) =>
              form.setFieldValue("isOverCapacityConfirmed", event.currentTarget.checked)
            }
          />
        </Notice>
      )}

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Batal
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={blockedReason !== undefined || isPending}
          title={blockedReason}
        >
          {isPending
            ? "Menyimpan..."
            : `Daftarkan ${selected.length > 0 ? `${selected.length} Siswa` : "Siswa"}`}
        </button>
      </div>
    </form>
  )
}
