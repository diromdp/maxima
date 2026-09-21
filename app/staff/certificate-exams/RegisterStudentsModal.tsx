"use client"

import { Checkbox, Modal } from "@mantine/core"
import { useState } from "react"

import { Notice } from "@/src/components/ui/Notice"
import { notify } from "@/src/lib/notify"

import {
  type ExamRecommendation,
  type ExamSchedule,
  quotaLabel,
  RECOMMENDATION_BADGE,
  RECOMMENDATIONS,
  type Registrant,
} from "./sample"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export function RegisterStudentsModal({
  opened,
  onClose,
  schedule,
  registered,
  onRegister,
}: {
  opened: boolean
  onClose: () => void
  schedule: ExamSchedule
  registered: readonly Registrant[]
  onRegister: (students: readonly ExamRecommendation[]) => void
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [isOverQuotaConfirmed, setIsOverQuotaConfirmed] = useState(false)

  const level = schedule.level
  const registeredNis = new Set(registered.map((row) => row.nis))
  const candidates = RECOMMENDATIONS.filter(
    (row) => row.level === level && !registeredNis.has(row.nis),
  )
  const remaining = Math.max(0, schedule.capacity - schedule.registered)
  const isOverQuota = selected.length > remaining
  const notReady = selected.filter(
    (nis) => candidates.find((row) => row.nis === nis)?.recommendation === "Belum Siap",
  ).length
  const canSubmit = selected.length > 0 && (!isOverQuota || isOverQuotaConfirmed)

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Daftarkan Siswa ke ${schedule.name}`}
      size="lg"
      styles={TITLE_STYLE}
    >
      <form
        className="stack stack-lg"
        onSubmit={(event) => {
          event.preventDefault()
          if (!canSubmit) return
          const students = candidates.filter((row) => selected.includes(row.nis))
          onRegister(students)
          notify.success(
            `${students.length} siswa terdaftar ke ${schedule.name}. Tagihan ujian terbit di Pembayaran.`,
          )
          onClose()
        }}
      >
        <div className="row row-wrap" style={{ gap: 24 }}>
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Kuota</span>
            <span className="body-sm" style={{ fontWeight: 600 }}>
              {quotaLabel(schedule)}
            </span>
          </div>
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Sisa kursi</span>
            <span
              className={`body-sm ${remaining === 0 ? "text-danger" : ""}`}
              style={{ fontWeight: 600 }}
            >
              {remaining}
            </span>
          </div>
          <div className="stack" style={{ gap: 2 }}>
            <span className="caption text-muted">Dipilih</span>
            <span className="body-sm" style={{ fontWeight: 600 }}>
              {selected.length}
            </span>
          </div>
        </div>

        {candidates.length === 0 ? (
          <Notice tone="neutral">
            Semua siswa level {level} dengan rekomendasi sudah terdaftar di jadwal ini. Siswa lain
            perlu direkomendasikan dulu di tab Rekomendasi Ujian.
          </Notice>
        ) : (
          <Checkbox.Group
            label={`Siswa level ${level} yang belum terdaftar`}
            description="Daftar diambil dari tab Rekomendasi Ujian. Siswa Belum Siap tetap bisa didaftarkan, tapi tercatat."
            value={selected}
            onChange={(value) => {
              setSelected(value)
              setIsOverQuotaConfirmed(false)
            }}
          >
            <div className="list-rows" style={{ marginTop: 8 }}>
              {candidates.map((row) => (
                <Checkbox
                  key={row.nis}
                  value={row.nis}
                  label={
                    <span className="row row-wrap" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 600 }}>{row.studentName}</span>
                      <span className="caption text-muted tabular">{row.nis}</span>
                      <span className={`badge ${RECOMMENDATION_BADGE[row.recommendation]}`}>
                        {row.recommendation}
                      </span>
                    </span>
                  }
                  className="py-2"
                />
              ))}
            </div>
          </Checkbox.Group>
        )}

        {notReady > 0 && (
          <Notice tone="warning">
            {notReady} siswa yang dipilih masih berstatus Belum Siap. Pendaftarannya tetap masuk log
            atas nama Anda.
          </Notice>
        )}

        {isOverQuota && (
          <Notice tone="danger" title="Melebihi kuota">
            Anda memilih {selected.length} siswa, sisa kursi hanya {remaining}. Pendaftaran di atas
            kuota butuh konfirmasi.
            <Checkbox
              mt="sm"
              label="Saya paham kuota terlampaui dan sudah dikonfirmasi ke penyelenggara"
              checked={isOverQuotaConfirmed}
              onChange={(event) => setIsOverQuotaConfirmed(event.currentTarget.checked)}
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
            disabled={!canSubmit}
            title={
              selected.length === 0
                ? "Pilih minimal satu siswa"
                : isOverQuota && !isOverQuotaConfirmed
                  ? "Centang konfirmasi kuota dulu"
                  : undefined
            }
          >
            Daftarkan {selected.length > 0 ? `${selected.length} Siswa` : "Siswa"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
