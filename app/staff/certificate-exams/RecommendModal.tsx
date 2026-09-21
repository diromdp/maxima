"use client"

import { Modal, Radio, Select, Textarea } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import {
  READY_THRESHOLD,
  RECOMMENDATION_STATUSES,
  RECOMMENDATIONS,
  type RecommendationStatus,
} from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function RecommendModal({
  opened,
  onClose,
  recommenderName,
}: {
  opened: boolean
  onClose: () => void
  recommenderName: string
}) {
  const [nis, setNis] = useState<string | null>(null)
  const [override, setOverride] = useState<RecommendationStatus | null>(null)
  const student = RECOMMENDATIONS.find((row) => row.nis === nis)
  const computed: RecommendationStatus | null = student
    ? student.averageScore >= READY_THRESHOLD
      ? "Siap Ujian"
      : "Belum Siap"
    : null
  const chosen = override ?? computed
  const isOverridden = student !== undefined && chosen !== computed

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Rekomendasikan Siswa"
      size="md"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          if (!student || !chosen) return
          notify.success(`${student.studentName} dicatat ${chosen} oleh ${recommenderName}.`)
          onClose()
        }}
      >
        <Select
          label="Siswa"
          placeholder="Pilih siswa"
          searchable
          data={RECOMMENDATIONS.map((row) => ({
            value: row.nis,
            label: `${row.studentName} · ${row.level}`,
          }))}
          value={nis}
          onChange={(value) => {
            setNis(value)
            setOverride(null)
          }}
          required
        />

        {student && computed && (
          <>
            <dl className="grid-2" style={{ margin: 0 }}>
              <div className="stack" style={{ gap: 2 }}>
                <dt className="caption text-muted">Rata-rata nilai</dt>
                <dd className="body" style={{ fontWeight: 600, margin: 0 }}>
                  {student.averageScore} / 100
                </dd>
              </div>
              <div className="stack" style={{ gap: 2 }}>
                <dt className="caption text-muted">Hitungan sistem (ambang {READY_THRESHOLD})</dt>
                <dd className="body" style={{ fontWeight: 600, margin: 0 }}>
                  {computed}
                </dd>
              </div>
            </dl>

            <Radio.Group
              label="Rekomendasi"
              description="Boleh berbeda dari hitungan sistem; nama Anda tercatat sebagai yang merekomendasikan."
              value={chosen}
              onChange={(value) => setOverride(value as RecommendationStatus)}
            >
              <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
                {RECOMMENDATION_STATUSES.map((status) => (
                  <Radio key={status} value={status} label={status} />
                ))}
              </div>
            </Radio.Group>

            {isOverridden && (
              <Notice tone="warning">
                Rekomendasi ini menimpa hitungan sistem ({computed}). Perubahan masuk log atas nama{" "}
                {recommenderName}.
              </Notice>
            )}

            <Textarea
              label="Catatan"
              placeholder="Alasan singkat, dibaca pengajar dan siswa."
              autosize
              minRows={2}
              required={isOverridden}
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
            disabled={!student}
            title={student ? undefined : "Pilih siswa dulu"}
          >
            Simpan Rekomendasi
          </button>
        </div>
      </form>
    </Modal>
  )
}
