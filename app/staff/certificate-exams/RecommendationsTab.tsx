"use client"

import { Select } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { RecommendModal } from "./RecommendModal"
import {
  type ExamRecommendation,
  LEVELS,
  READY_THRESHOLD,
  RECOMMENDATION_BADGE,
  RECOMMENDATION_STATUSES,
  RECOMMENDATIONS,
  type RecommendationStatus,
} from "./sample"

type Row = ExamRecommendation & { readonly isDirty: boolean; readonly isOverride: boolean }

const computedFor = (row: ExamRecommendation): RecommendationStatus =>
  row.averageScore >= READY_THRESHOLD ? "Siap Ujian" : "Belum Siap"

const columnsFor = (
  readOnly: boolean,
  onChange: (nis: string, value: RecommendationStatus) => void,
): readonly DataColumn<Row>[] => [
  {
    key: "nis",
    header: "NIS",
    sort: (row) => row.nis,
    cell: (row) => <span className="tabular text-muted">{row.nis}</span>,
  },
  {
    key: "studentName",
    header: "Nama Siswa",
    sort: (row) => row.studentName,
    cell: (row) => <span style={{ fontWeight: 600 }}>{row.studentName}</span>,
  },
  { key: "level", header: "Level Saat Ini", sort: (row) => row.level, cell: (row) => row.level },
  {
    key: "averageScore",
    header: "Rata-rata Nilai",
    sort: (row) => row.averageScore,
    align: "right",
    cell: (row) => (
      <span className="tabular" style={{ fontWeight: 600 }}>
        {row.averageScore.toFixed(1)} / 100
      </span>
    ),
  },
  {
    key: "recommendation",
    header: "Rekomendasi",
    sort: (row) => row.recommendation,
    cell: (row) =>
      readOnly ? (
        <span className={`badge ${RECOMMENDATION_BADGE[row.recommendation]}`}>
          {row.recommendation}
        </span>
      ) : (
        <span className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
          <span className="relative inline-block">
            <Select
              aria-label={`Rekomendasi ${row.studentName}`}
              size="xs"
              w={140}
              allowDeselect={false}
              data={[...RECOMMENDATION_STATUSES]}
              value={row.recommendation}
              onChange={(value) => value && onChange(row.nis, value as RecommendationStatus)}
              comboboxProps={{ withinPortal: true }}
              className={row.recommendation === "Belum Siap" ? "text-danger" : "text-success"}
            />
            {row.isDirty && (
              <span
                aria-hidden
                className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
              />
            )}
          </span>
          {row.isOverride && (
            <span className="caption text-warning">
              Menimpa hitungan sistem ({computedFor(row)})
            </span>
          )}
        </span>
      ),
  },
  {
    key: "recommendedAt",
    header: "Tanggal Rekomendasi",
    sort: (row) => row.recommendedAt,
    cell: (row) => formatDate(row.recommendedAt),
  },
  {
    key: "recommendedBy",
    header: "Direkomendasikan Oleh",
    sort: (row) => row.recommendedBy,
    cell: (row) => row.recommendedBy,
  },
]

export function RecommendationsTab({
  readOnly,
  recommenderName,
}: {
  readOnly: boolean
  recommenderName: string
}) {
  const [level, setLevel] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [saved, setSaved] = useState<readonly ExamRecommendation[]>(RECOMMENDATIONS)
  const [draft, setDraft] = useState<readonly ExamRecommendation[]>(RECOMMENDATIONS)

  const savedOf = (nis: string) => saved.find((row) => row.nis === nis)
  const rows: readonly Row[] = draft
    .map((row) => ({
      ...row,
      isDirty: row.recommendation !== savedOf(row.nis)?.recommendation,
      isOverride: row.recommendation !== computedFor(row),
    }))
    .filter((row) => (!level || row.level === level) && (!status || row.recommendation === status))
  const dirtyCount = draft.filter(
    (row) => row.recommendation !== savedOf(row.nis)?.recommendation,
  ).length

  const setRecommendation = (nis: string, recommendation: RecommendationStatus) =>
    setDraft((current) =>
      current.map((row) =>
        row.nis !== nis
          ? row
          : recommendation === savedOf(nis)?.recommendation
            ? (savedOf(nis) ?? row)
            : {
                ...row,
                recommendation,
                recommendedAt: new Date().toISOString().slice(0, 10),
                recommendedBy: recommenderName,
              },
      ),
    )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Select
            aria-label="Saring level"
            placeholder="Level: Semua"
            size="sm"
            w={180}
            data={[...LEVELS]}
            value={level}
            onChange={setLevel}
            clearable
          />
          <Select
            aria-label="Saring status"
            placeholder="Status: Semua"
            size="sm"
            w={190}
            data={[...RECOMMENDATION_STATUSES]}
            value={status}
            onChange={setStatus}
            clearable
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
            Rekomendasikan Siswa
          </button>
        )}
      </div>

      <DataTable
        rows={rows}
        columns={columnsFor(readOnly, setRecommendation)}
        rowKey={(row) => row.nis}
        defaultSort={{ key: "recommendedAt", dir: "desc" }}
        emptyText="Tidak ada siswa yang cocok dengan saringan."
      />

      {!readOnly && (
        <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
          <span className={`caption ${dirtyCount > 0 ? "text-warning" : "text-muted"}`}>
            {dirtyCount > 0
              ? `${dirtyCount} rekomendasi berubah, belum disimpan. Tanggal dan nama perekomendasi ikut diperbarui.`
              : "Ubah rekomendasi langsung di kolomnya; hitungan sistem memakai ambang " +
                READY_THRESHOLD}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={dirtyCount === 0}
            title={dirtyCount === 0 ? "Belum ada yang berubah" : undefined}
            onClick={() => {
              setSaved(draft)
              notify.success(`${dirtyCount} rekomendasi tersimpan atas nama ${recommenderName}.`)
            }}
          >
            Simpan Rekomendasi
          </button>
        </div>
      )}

      <RecommendModal
        key={String(isModalOpen)}
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommenderName={recommenderName}
      />
    </section>
  )
}
