"use client"

import { Select } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { QueryError } from "@/src/components/data/QueryError"
import { SkeletonRows } from "@/src/components/data/SkeletonRows"
import { saveExamRecommendations } from "@/src/entities/certificate/actions"
import { examRecommendationsQuery, RECOMMENDATION_KEYS } from "@/src/entities/certificate/queries"
import {
  formatAverage,
  type Readiness,
  READINESS,
  READINESS_BADGE,
  type RecommendationRow,
} from "@/src/entities/certificate/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { RecommendModal } from "./RecommendModal"
import { useExamOptions } from "./use-exam-options"

type Row = RecommendationRow & { readonly isDirty: boolean }

const SKELETON_ROWS = 6
const COLUMN_COUNT = 7

function columnsFor(
  readOnly: boolean,
  viewerName: string,
  onChange: (row: RecommendationRow, value: Readiness) => void,
): readonly DataColumn<Row>[] {
  return [
    {
      key: "nis",
      header: "NIS",
      sort: (row) => row.nis,
      cell: (row) => <span className="tabular text-muted">{row.nis}</span>,
    },
    {
      key: "name",
      header: "Nama Siswa",
      sort: (row) => row.name,
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    {
      key: "level",
      header: "Level Saat Ini",
      sort: (row) => row.level.name,
      cell: (row) => row.level.name,
    },
    {
      key: "average",
      header: "Rata-rata Nilai",
      sort: (row) => row.average ?? -1,
      align: "right",
      cell: (row) => (
        <span className="tabular" style={{ fontWeight: 600 }}>
          {formatAverage(row.average)}
        </span>
      ),
    },
    {
      key: "recommendation",
      header: "Rekomendasi",
      sort: (row) => row.recommendation,
      cell: (row) => {
        const isOverride = row.recommendation !== row.systemRecommendation
        if (readOnly) {
          return (
            <span className={`badge ${READINESS_BADGE[row.recommendation]}`}>
              {row.recommendation}
            </span>
          )
        }
        return (
          <span className="stack" style={{ gap: 2, alignItems: "flex-start" }}>
            <span className="relative inline-block">
              <Select
                aria-label={`Rekomendasi ${row.name}`}
                size="xs"
                w={140}
                allowDeselect={false}
                data={[...READINESS]}
                value={row.recommendation}
                onChange={(value) => value && onChange(row, value as Readiness)}
                comboboxProps={{ withinPortal: true }}
                styles={{
                  input: {
                    color:
                      row.recommendation === "Belum Siap"
                        ? "var(--color-danger)"
                        : "var(--color-success)",
                  },
                }}
              />
              {row.isDirty && (
                <span
                  aria-hidden
                  className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
                />
              )}
            </span>
            {isOverride && (
              <span className="caption text-warning">
                Menimpa hitungan sistem ({row.systemRecommendation})
              </span>
            )}
          </span>
        )
      },
    },
    {
      key: "decidedAt",
      header: "Tanggal Rekomendasi",
      sort: (row) => (row.isDirty ? "9999" : row.decidedAt),
      cell: (row) => formatDate(row.isDirty ? new Date() : row.decidedAt),
    },
    {
      key: "decidedBy",
      header: "Direkomendasikan Oleh",
      sort: (row) => row.decidedBy ?? "",
      cell: (row) => (row.isDirty ? viewerName : (row.decidedBy ?? "Sistem")),
    },
  ]
}

export function RecommendationsTab({
  readOnly,
  viewerName,
}: {
  readOnly: boolean
  viewerName: string
}) {
  const queryClient = useQueryClient()
  const { levels } = useExamOptions()
  const [levelId, setLevelId] = useState<string | null>(null)
  const [status, setStatus] = useState<Readiness | null>(null)
  const [changes, setChanges] = useState<Readonly<Record<string, Readiness>>>({})
  const [isModalOpen, setIsModalOpen] = useState(false)
  const recommendations = useRead(
    examRecommendationsQuery({ levelId: levelId ?? undefined, status: status ?? undefined }),
  )
  const save = useMutation({ mutationFn: saveExamRecommendations })

  const rows: readonly Row[] = (recommendations.data?.data ?? []).map((row) => {
    const changed = changes[row.studentId]
    return changed === undefined
      ? { ...row, isDirty: false }
      : { ...row, recommendation: changed, isDirty: true }
  })
  const dirtyCount = Object.keys(changes).length

  function change(row: RecommendationRow, value: Readiness) {
    setChanges((current) => {
      const next = { ...current }
      if (value === row.recommendation) delete next[row.studentId]
      else next[row.studentId] = value
      return next
    })
  }

  async function submit() {
    const result = await save.mutateAsync(
      Object.entries(changes).map(([studentId, recommendation]) => ({
        studentId,
        recommendation,
        note: null,
      })),
    )
    if (!result.ok) return notify.error(result.message)
    setChanges({})
    notify.success(`${dirtyCount} rekomendasi tersimpan atas nama ${viewerName}.`)
    await Promise.all(
      RECOMMENDATION_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey })),
    )
  }

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <Select
            aria-label="Saring level"
            placeholder="Semua Level"
            size="sm"
            w={180}
            data={[...levels]}
            value={levelId}
            onChange={setLevelId}
            clearable
          />
          <Select
            aria-label="Saring status"
            placeholder="Semua Status"
            size="sm"
            w={190}
            data={[...READINESS]}
            value={status}
            onChange={(value) => setStatus(value as Readiness | null)}
            clearable
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(true)}>
            Rekomendasikan Siswa
          </button>
        )}
      </div>

      {recommendations.isError ? (
        <QueryError
          message={recommendations.error.message}
          onRetry={() => void recommendations.refetch()}
        />
      ) : recommendations.isPending ? (
        <div className="table-scroll" aria-busy="true">
          <span className="sr-only" role="status">
            Memuat
          </span>
          <table className="table">
            <tbody>
              <SkeletonRows columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
            </tbody>
          </table>
        </div>
      ) : (
        <DataTable
          rows={rows}
          columns={columnsFor(readOnly, viewerName, change)}
          rowKey={(row) => row.studentId}
          defaultSort={{ key: "decidedAt", dir: "desc" }}
          emptyText={
            levelId || status
              ? "Tidak ada siswa yang cocok dengan saringan."
              : "Belum ada rekomendasi ujian. Tambahkan lewat tombol Rekomendasikan Siswa."
          }
        />
      )}

      {!readOnly && (
        <div className="row row-wrap" style={{ justifyContent: "flex-end", gap: 12 }}>
          <span className={`caption ${dirtyCount > 0 ? "text-warning" : "text-muted"}`}>
            {dirtyCount > 0
              ? `${dirtyCount} rekomendasi berubah, belum disimpan. Tanggal dan nama perekomendasi ikut diperbarui.`
              : "Ubah rekomendasi langsung di kolomnya. Hitungan sistem memakai KKM level siswa."}
          </span>
          <button
            type="button"
            className="btn btn-primary"
            disabled={dirtyCount === 0 || save.isPending}
            title={dirtyCount === 0 ? "Belum ada yang berubah" : undefined}
            onClick={() => void submit()}
          >
            {save.isPending ? "Menyimpan..." : "Simpan Rekomendasi"}
          </button>
        </div>
      )}

      {isModalOpen && (
        <RecommendModal viewerName={viewerName} onClose={() => setIsModalOpen(false)} />
      )}
    </section>
  )
}
