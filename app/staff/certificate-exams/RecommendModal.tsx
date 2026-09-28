"use client"

import { Modal, Radio, Select, Skeleton, Textarea } from "@mantine/core"
import { useForm } from "@mantine/form"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { saveExamRecommendations } from "@/src/entities/certificate/actions"
import {
  RECOMMENDATION_KEYS,
  recommendationCandidatesQuery,
} from "@/src/entities/certificate/queries"
import {
  formatAverage,
  type Readiness,
  READINESS,
  type ReadinessCandidate,
} from "@/src/entities/certificate/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }
const NOTE_REQUIRED = "Tulis alasan menimpa hitungan sistem."

type RecommendForm = { studentId: string; recommendation: Readiness | null; note: string }

export function RecommendModal({
  viewerName,
  onClose,
}: {
  viewerName: string
  onClose: () => void
}) {
  const candidates = useRead(recommendationCandidatesQuery())

  return (
    <Modal opened onClose={onClose} title="Rekomendasikan Siswa" size="md" styles={TITLE_STYLE}>
      {candidates.isError ? (
        <QueryError message={candidates.error.message} onRetry={() => void candidates.refetch()} />
      ) : candidates.isPending ? (
        <div className="stack" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          <Skeleton height={60} radius="sm" aria-hidden />
          <Skeleton height={80} radius="sm" aria-hidden />
        </div>
      ) : (
        <RecommendFormBody
          candidates={candidates.data.data}
          viewerName={viewerName}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}

function RecommendFormBody({
  candidates,
  viewerName,
  onClose,
}: {
  candidates: readonly ReadinessCandidate[]
  viewerName: string
  onClose: () => void
}) {
  const form = useForm<RecommendForm>({
    initialValues: { studentId: "", recommendation: null, note: "" },
    validate: {
      studentId: (value) => (value ? null : "Pilih siswa."),
      note: (value, values) => {
        const student = candidates.find((row) => row.studentId === values.studentId)
        return student &&
          values.recommendation !== student.systemRecommendation &&
          value.trim() === ""
          ? NOTE_REQUIRED
          : null
      },
    },
  })
  const student = candidates.find((row) => row.studentId === form.values.studentId)
  const chosen = form.values.recommendation ?? student?.systemRecommendation ?? null
  const isOverridden = student !== undefined && chosen !== student.systemRecommendation

  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) =>
      saveExamRecommendations([
        {
          studentId: values.studentId,
          recommendation: chosen ?? "Belum Siap",
          note: values.note.trim() || null,
        },
      ]),
    successMessage: `${student?.name ?? "Siswa"} dicatat ${chosen ?? ""} atas nama ${viewerName}.`,
    invalidates: RECOMMENDATION_KEYS,
    onSuccess: onClose,
  })

  if (candidates.length === 0) {
    return (
      <div className="stack stack-lg">
        <p className="body-sm text-muted">
          Semua siswa dengan kelas aktif sudah punya baris rekomendasi. Ubah rekomendasinya langsung
          di tabel.
        </p>
        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    )
  }

  return (
    <form className="stack stack-lg" onSubmit={submit} noValidate>
      {formError && <Notice tone="danger">{formError}</Notice>}

      <Select
        label="Siswa"
        description="Hanya siswa dengan kelas aktif yang belum punya baris rekomendasi."
        placeholder="Pilih siswa"
        searchable
        withAsterisk
        data={candidates.map((row) => ({
          value: row.studentId,
          label: `${row.name} · ${row.nis} · ${row.level.name}`,
        }))}
        value={form.values.studentId || null}
        error={form.errors.studentId}
        onChange={(value) => {
          form.setFieldValue("studentId", value ?? "")
          form.setFieldValue("recommendation", null)
        }}
      />

      {student && chosen && (
        <>
          <dl className="grid-2" style={{ margin: 0 }}>
            <div className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">Rata-rata ujian internal</dt>
              <dd className="body" style={{ fontWeight: 600, margin: 0 }}>
                {formatAverage(student.average)}
              </dd>
            </div>
            <div className="stack" style={{ gap: 2 }}>
              <dt className="caption text-muted">
                Hitungan sistem (KKM {student.kkm ?? "belum diisi"})
              </dt>
              <dd className="body" style={{ fontWeight: 600, margin: 0 }}>
                {student.systemRecommendation}
              </dd>
            </div>
          </dl>

          <Radio.Group
            label="Rekomendasi"
            description="Boleh berbeda dari hitungan sistem; nama Anda tercatat sebagai yang merekomendasikan."
            value={chosen}
            onChange={(value) => form.setFieldValue("recommendation", value as Readiness)}
          >
            <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
              {READINESS.map((status) => (
                <Radio key={status} value={status} label={status} />
              ))}
            </div>
          </Radio.Group>

          {isOverridden && (
            <Notice tone="warning">
              Rekomendasi ini menimpa hitungan sistem ({student.systemRecommendation}). Perubahan
              masuk log atas nama {viewerName}.
            </Notice>
          )}

          <Textarea
            label="Catatan"
            placeholder="Alasan singkat, dibaca pengajar dan siswa."
            autosize
            minRows={2}
            maxLength={500}
            withAsterisk={isOverridden}
            {...form.getInputProps("note")}
          />
        </>
      )}

      <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Batal
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!student || isPending}
          title={student ? undefined : "Pilih siswa dulu"}
        >
          {isPending ? "Menyimpan..." : "Simpan Rekomendasi"}
        </button>
      </div>
    </form>
  )
}
