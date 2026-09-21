"use client"

import { Modal, Radio, Textarea } from "@mantine/core"
import { useState } from "react"

import { formatDate } from "@/src/lib/format"

import {
  type InterviewPractice,
  partnerById,
  PRACTICE_RESULTS,
  type PracticeResult,
  type PracticeStatus,
} from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export type PracticeOutcome = {
  readonly status: Extract<PracticeStatus, "Selesai" | "Dibatalkan">
  readonly result: PracticeResult | null
  readonly evaluation: string
}

export function PracticeResultModal({
  practice,
  onClose,
  onSave,
}: {
  practice: InterviewPractice | null
  onClose: () => void
  onSave: (id: string, outcome: PracticeOutcome) => void
}) {
  const [status, setStatus] = useState<PracticeOutcome["status"]>(
    practice?.status === "Dibatalkan" ? "Dibatalkan" : "Selesai",
  )
  const [result, setResult] = useState<PracticeResult | null>(practice?.result ?? null)
  const [evaluation, setEvaluation] = useState(practice?.evaluation ?? "")
  const needsResult = status === "Selesai" && result === null
  const canSave = !needsResult

  return (
    <Modal
      opened={practice !== null}
      onClose={onClose}
      title={practice ? `Catat Hasil Simulasi ${practice.session}` : "Catat Hasil"}
      size="md"
      styles={TITLE_STYLE}
    >
      {practice && (
        <form
          className="stack stack-lg"
          onSubmit={(event) => {
            event.preventDefault()
            if (!canSave) return
            onSave(practice.id, {
              status,
              result: status === "Selesai" ? result : null,
              evaluation: evaluation.trim(),
            })
            onClose()
          }}
        >
          <dl className="row row-wrap" style={{ gap: 20, margin: 0 }}>
            {[
              { label: "Siswa", value: practice.studentName },
              { label: "Partner", value: partnerById(practice.partnerId).shortName },
              { label: "Tanggal", value: formatDate(practice.date) },
              { label: "Pelatih", value: practice.trainer },
            ].map(({ label, value }) => (
              <div key={label} className="stack" style={{ gap: 2 }}>
                <dt className="caption text-muted">{label}</dt>
                <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
                  {value}
                </dd>
              </div>
            ))}
          </dl>

          <Radio.Group
            label="Status latihan"
            value={status}
            onChange={(value) => setStatus(value as PracticeOutcome["status"])}
          >
            <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
              <Radio value="Selesai" label="Selesai" />
              <Radio value="Dibatalkan" label="Dibatalkan" />
            </div>
          </Radio.Group>

          {status === "Selesai" && (
            <Radio.Group
              label="Hasil / Evaluasi"
              description="Siap berarti boleh lanjut ke interview partner; Latihan Lagi menjadwalkan simulasi berikutnya."
              value={result}
              onChange={(value) => setResult(value as PracticeResult)}
            >
              <div className="row row-wrap" style={{ gap: 16, marginTop: 8 }}>
                {PRACTICE_RESULTS.map((option) => (
                  <Radio key={option} value={option} label={option} />
                ))}
              </div>
            </Radio.Group>
          )}

          <Textarea
            label={status === "Selesai" ? "Catatan pelatih" : "Alasan pembatalan"}
            placeholder={
              status === "Selesai"
                ? "Contoh: Jawaban runtut, perlu latihan pertanyaan gaji dan motivasi."
                : "Contoh: Siswa sakit, dijadwalkan ulang minggu depan."
            }
            autosize
            minRows={3}
            value={evaluation}
            onChange={(event) => setEvaluation(event.currentTarget.value)}
          />

          <div className="row" style={{ justifyContent: "flex-end", gap: 8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!canSave}
              title={needsResult ? "Pilih Siap atau Latihan Lagi" : undefined}
            >
              Simpan Hasil
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
