"use client"

import { Group, Modal, Select } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { Notice } from "@/src/components/ui/Notice"
import { academicPeriodsQuery } from "@/src/entities/class/queries"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { decideReportCard } from "@/src/entities/report-card/actions"
import { decisionsQuery } from "@/src/entities/report-card/queries"
import {
  DECISION_FILTERS,
  formatDecimal,
  RECOMMENDATIONS,
  type DecisionRow,
  type Recommendation,
} from "@/src/entities/report-card/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

const TITLE_STYLE = { title: { fontFamily: "var(--font-heading)", fontWeight: 650, fontSize: 20 } }

export const DECISION_BADGE: Readonly<Record<Recommendation, string>> = {
  "Naik Level": "badge-success",
  "Perlu Remedial": "badge-warning",
  "Tidak Naik": "badge-danger",
}

const SUMMARY_CARDS: readonly { decision: Recommendation; label: string; tone: string }[] = [
  { decision: "Naik Level", label: "Total Naik Level", tone: "text-success" },
  { decision: "Perlu Remedial", label: "Total Remedial", tone: "text-warning" },
  { decision: "Tidak Naik", label: "Total Tidak Naik", tone: "text-danger" },
]

function DecisionStatus({ row }: { row: DecisionRow }) {
  if (row.decision) {
    return <span className={`badge ${DECISION_BADGE[row.decision]}`}>{row.decision}</span>
  }
  return (
    <span className="caption text-muted">
      {row.recommendation ? `Rekomendasi: ${row.recommendation}` : "Belum ada rekomendasi"}
    </span>
  )
}

function columnsFor(
  canEdit: boolean,
  onProcess: (row: DecisionRow) => void,
): readonly DataColumn<DecisionRow>[] {
  return [
    { key: "nis", header: "NIS", cell: (row) => <span className="tabular">{row.nis}</span> },
    {
      key: "name",
      header: "Nama Siswa",
      cell: (row) => <span style={{ fontWeight: 600 }}>{row.name}</span>,
    },
    { key: "level", header: "Lvl Sekarang", cell: (row) => row.level },
    {
      key: "finalScore",
      header: "Nilai Akhir",
      align: "right",
      cell: (row) => <span className="tabular">{formatDecimal(row.finalScore)}</span>,
    },
    {
      key: "attendance",
      header: "Kehadiran",
      align: "right",
      cell: (row) => (
        <span className="tabular">
          {row.attendancePercent === null ? "-" : `${formatDecimal(row.attendancePercent)}%`}
        </span>
      ),
    },
    { key: "status", header: "Status Keputusan", cell: (row) => <DecisionStatus row={row} /> },
    {
      key: "decidedAt",
      header: "Tanggal Keputusan",
      cell: (row) => (
        <span className="tabular">{row.decidedAt ? formatDate(row.decidedAt) : "-"}</span>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => {
        const blockedReason = row.decision
          ? "Keputusan sudah ditetapkan dan tidak dapat diubah."
          : !canEdit
            ? "Peran Anda hanya dapat melihat keputusan."
            : undefined
        return (
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={blockedReason !== undefined}
            title={blockedReason}
            onClick={() => onProcess(row)}
          >
            Proses
          </button>
        )
      },
    },
  ]
}

function DecisionModal({ row, onClose }: { row: DecisionRow; onClose: () => void }) {
  const queryClient = useQueryClient()
  const [decision, setDecision] = useState<Recommendation | null>(row.recommendation)
  const decide = useMutation({
    mutationFn: (chosen: Recommendation) => decideReportCard(row.reportCardId, chosen),
  })
  const [formError, setFormError] = useState<string | null>(null)

  async function submit() {
    if (!decision) return
    setFormError(null)
    const result = await decide.mutateAsync(decision)
    if (!result.ok) return setFormError(result.message)
    notify.success(`${decision} ditetapkan untuk ${row.name}.`)
    await Promise.all(
      [["report-card-decisions"], ["report-card"], ["class-candidates"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
    onClose()
  }

  return (
    <Modal opened onClose={onClose} title={`Proses ${row.name}`} styles={TITLE_STYLE}>
      <div className="stack stack-lg">
        {formError && <Notice tone="danger">{formError}</Notice>}
        <p className="body-sm">
          Level sekarang {row.level}, nilai akhir {formatDecimal(row.finalScore)}, kehadiran{" "}
          {row.attendancePercent === null ? "-" : `${formatDecimal(row.attendancePercent)}%`}.
          Rekomendasi dari halaman Penilaian: {row.recommendation ?? "belum ada"}.
        </p>
        <Select
          label="Keputusan"
          data={[...RECOMMENDATIONS]}
          value={decision}
          onChange={(value) => setDecision(value as Recommendation | null)}
          allowDeselect={false}
          withAsterisk
        />
        <Notice tone="warning">
          Keputusan dieksekusi sekali dan tidak dapat diganti. Naik Level membuat siswa menunggu
          kelas level berikutnya di halaman Kelas & Jadwal.
        </Notice>
        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!decision || decide.isPending}
            title={decision ? undefined : "Pilih keputusan dulu"}
            onClick={() => void submit()}
          >
            {decide.isPending ? "Menyimpan..." : "Tetapkan Keputusan"}
          </button>
        </Group>
      </div>
    </Modal>
  )
}

export function LevelDecisions({ canEdit }: { canEdit: boolean }) {
  const { params } = useListParams(DECISION_FILTERS)
  const decisions = useRead(decisionsQuery(params))
  const periods = useRead(academicPeriodsQuery())
  const { branches } = useMasterOptions()
  const [processing, setProcessing] = useState<DecisionRow | null>(null)

  return (
    <div className="stack stack-lg">
      <div className="grid-3">
        {SUMMARY_CARDS.map(({ decision, label, tone }) => (
          <section key={decision} className="card stack stack-sm">
            <span className="label text-muted">{label}</span>
            <span className={`h4 tabular ${tone}`}>
              {decisions.data ? decisions.data.summary[decision] : "-"}
            </span>
            <span className="caption text-muted">siswa</span>
          </section>
        ))}
      </div>

      <section className="card stack">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <ListFilter name="branch" label="Cabang" options={branches} />
          <ListFilter
            name="period"
            label="Periode"
            placeholder="Periode berjalan"
            options={(periods.data?.data ?? []).map((period) => ({
              value: period.id,
              label: period.name,
            }))}
          />
          <ListFilter
            name="decision"
            label="Keputusan"
            options={RECOMMENDATIONS.map((decision) => ({ value: decision, label: decision }))}
          />
        </div>

        {decisions.isError ? (
          <QueryError message={decisions.error.message} onRetry={() => void decisions.refetch()} />
        ) : (
          <ServerDataTable
            rows={decisions.data?.data ?? []}
            total={decisions.data?.meta.total ?? 0}
            isPending={decisions.isPending}
            columns={columnsFor(canEdit, setProcessing)}
            rowKey={(row) => row.reportCardId}
            stickyLast
            emptyText="Belum ada raport terbit pada periode dan saringan ini."
          />
        )}
      </section>

      {processing && <DecisionModal row={processing} onClose={() => setProcessing(null)} />}
    </div>
  )
}
