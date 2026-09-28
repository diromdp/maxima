"use client"

import { Select, TextInput } from "@mantine/core"

import {
  CHAPTER_COMPLETIONS,
  CHAPTERS,
  LEARNING_STATUSES,
  type SessionProgress,
} from "@/src/entities/session/schema"

type ProgressDraft = SessionProgress

export function ProgressFields({
  progress,
  errors,
  readOnly,
  onChange,
}: {
  progress: ProgressDraft
  errors: Readonly<Record<string, string>>
  readOnly: boolean
  onChange: (patch: Partial<ProgressDraft>) => void
}) {
  return (
    <section className="card stack">
      <h2 className="h5">2. Progres Materi & Belajar</h2>

      <Select
        label="Kapitel yang Diselesaikan"
        placeholder="Pilih Kapitel"
        data={CHAPTERS}
        value={progress.chapter}
        onChange={(value) => onChange({ chapter: value })}
        error={errors.chapter}
        readOnly={readOnly}
        clearable={!readOnly}
      />
      <Select
        label="Ketuntasan Kapitel"
        placeholder="Pilih ketuntasan"
        data={[...CHAPTER_COMPLETIONS]}
        value={progress.completion}
        onChange={(value) => onChange({ completion: value as ProgressDraft["completion"] })}
        error={errors.completion}
        readOnly={readOnly}
        disabled={!readOnly && progress.chapter === null}
        description={!readOnly && progress.chapter === null ? "Pilih Kapitel dulu." : undefined}
        clearable={!readOnly}
      />

      <Select
        label="Status Belajar Kelas"
        placeholder="Pilih status"
        data={[...LEARNING_STATUSES]}
        value={progress.learningStatus}
        onChange={(value) => onChange({ learningStatus: value as ProgressDraft["learningStatus"] })}
        error={errors.learningStatus}
        readOnly={readOnly}
        clearable={!readOnly}
      />

      <TextInput
        label="Status Bab Berikutnya"
        placeholder="Siap untuk Bab 5 (Besok)"
        value={progress.nextChapter ?? ""}
        onChange={(event) => onChange({ nextChapter: event.currentTarget.value })}
        error={errors.nextChapter}
        maxLength={120}
        readOnly={readOnly}
      />
    </section>
  )
}
