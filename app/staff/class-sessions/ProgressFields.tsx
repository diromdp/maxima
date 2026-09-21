"use client"

import { Select, TextInput } from "@mantine/core"

import { CHAPTER_COMPLETIONS, CHAPTERS, LEARNING_STATUSES, type SessionProgress } from "./sample"

export type ProgressDraft = {
  readonly [Key in keyof SessionProgress]: SessionProgress[Key] | null
}

export function ProgressFields({
  progress,
  readOnly,
  onChange,
}: {
  progress: ProgressDraft
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
        readOnly={readOnly}
        allowDeselect={false}
      />
      <Select
        label="Ketuntasan Kapitel"
        placeholder="Pilih ketuntasan"
        data={[...CHAPTER_COMPLETIONS]}
        value={progress.completion}
        onChange={(value) => onChange({ completion: value as ProgressDraft["completion"] })}
        readOnly={readOnly}
        allowDeselect={false}
      />

      <Select
        label="Status Belajar Kelas"
        placeholder="Pilih status"
        data={[...LEARNING_STATUSES]}
        value={progress.learningStatus}
        onChange={(value) => onChange({ learningStatus: value as ProgressDraft["learningStatus"] })}
        readOnly={readOnly}
        allowDeselect={false}
      />

      <TextInput
        label="Status Bab Berikutnya"
        placeholder="Siap untuk Bab 5 (Besok)"
        value={progress.nextChapter ?? ""}
        onChange={(event) => onChange({ nextChapter: event.currentTarget.value })}
        readOnly={readOnly}
      />
    </section>
  )
}
