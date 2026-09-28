"use client"

import { DataTable } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { TableSkeleton } from "@/src/components/data/TableSkeleton"
import { Notice } from "@/src/components/ui/Notice"
import { atRiskQuery, monitoringClassesQuery } from "@/src/entities/monitoring/queries"
import {
  AT_RISK_FILTERS,
  atRiskFiltersOf,
  type AtRiskRow,
  LOW_ATTENDANCE_PERCENT,
  MAX_CHAPTERS_BEHIND,
  type Ref,
  type RiskIndicator,
} from "@/src/entities/monitoring/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useListParams } from "@/src/lib/use-list-params"

import { chapterText, percentText, scoreText, SKELETON_ROWS } from "./format"

const COLUMN_COUNT = 7

const RISK_BADGE: Readonly<Record<RiskIndicator, string>> = {
  "Kehadiran Rendah": "badge-danger",
  "Nilai Rendah": "badge-danger",
  "Progres Tertinggal": "badge-warning",
  "Gagal Evaluasi": "badge-danger",
}

const optionsOf = (refs: readonly Ref[]) =>
  [...new Map(refs.map((ref) => [ref.id, ref.name])).entries()].map(([value, label]) => ({
    value,
    label,
  }))

const flagged = (row: AtRiskRow, indicator: RiskIndicator) =>
  row.indicators.includes(indicator) ? "text-danger" : ""

export function AtRiskTable() {
  const { params } = useListParams(AT_RISK_FILTERS)
  const atRisk = useRead(atRiskQuery(atRiskFiltersOf(params)))
  const classes = useRead(monitoringClassesQuery()).data?.data ?? []

  return (
    <div className="stack stack-lg">
      <Notice tone="info" title="Aturan sistem">
        Siswa berstatus Cuti tidak muncul di sini. Seluruhnya dihitung otomatis dari data kelas,
        sesi, dan penilaian: kehadiran di bawah {LOW_ATTENDANCE_PERCENT}%, rata-rata nilai atau
        hasil evaluasi di bawah KKM levelnya, atau tertinggal lebih dari {MAX_CHAPTERS_BEHIND} bab
        dari kelasnya.
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <ListFilter
              name="branch"
              label="Cabang"
              options={optionsOf(classes.map((room) => room.branch))}
            />
            <ListFilter name="class" label="Kelas" options={optionsOf(classes)} />
            <ListFilter
              name="level"
              label="Level"
              options={optionsOf(classes.map((room) => room.level))}
            />
          </div>
          {atRisk.data && (
            <span className="caption text-muted">{atRisk.data.total} siswa berisiko</span>
          )}
        </div>

        {atRisk.isError ? (
          <QueryError message={atRisk.error.message} onRetry={() => void atRisk.refetch()} />
        ) : atRisk.isPending ? (
          <TableSkeleton columns={COLUMN_COUNT} rows={SKELETON_ROWS} />
        ) : (
          <DataTable<AtRiskRow>
            rows={atRisk.data.data}
            rowKey={(row) => row.studentId}
            defaultSort={{ key: "risiko", dir: "desc" }}
            emptyText="Tidak ada siswa berisiko pada saringan ini."
            columns={[
              {
                key: "nama",
                header: "Nama Siswa",
                sort: (row) => row.name,
                cell: (row) => row.name,
              },
              {
                key: "kelas",
                header: "Kelas",
                sort: (row) => row.class.name,
                cell: (row) => row.class.name,
              },
              {
                key: "level",
                header: "Level",
                sort: (row) => row.level.name,
                cell: (row) => row.level.name,
              },
              {
                key: "kehadiran",
                header: "Kehadiran",
                align: "right",
                sort: (row) => row.attendancePercent ?? -1,
                cell: (row) => (
                  <span className={flagged(row, "Kehadiran Rendah")}>
                    {percentText(row.attendancePercent)}
                  </span>
                ),
              },
              {
                key: "nilai",
                header: "Rata-rata Nilai",
                align: "right",
                sort: (row) => row.averageScore ?? -1,
                cell: (row) => (
                  <span className={flagged(row, "Nilai Rendah")}>
                    {scoreText(row.averageScore)}
                  </span>
                ),
              },
              {
                key: "progres",
                header: "Progress Materi",
                sort: (row) => row.studentChapter ?? -1,
                cell: (row) => chapterText(row.studentChapter),
              },
              {
                key: "risiko",
                header: "Indikator Risiko",
                sort: (row) => row.indicators.length,
                cell: (row) => (
                  <div className="row" style={{ gap: 6 }}>
                    {row.indicators.map((indicator) => (
                      <span key={indicator} className={`badge ${RISK_BADGE[indicator]}`}>
                        {indicator}
                      </span>
                    ))}
                  </div>
                ),
              },
            ]}
          />
        )}
      </section>
    </div>
  )
}
