"use client"

import { SegmentedControl } from "@mantine/core"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"

import { ListFilter } from "@/src/components/data/ListFilter"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { Notice } from "@/src/components/ui/Notice"
import { academicPeriodsQuery } from "@/src/entities/class/queries"
import { issueReportCard } from "@/src/entities/report-card/actions"
import { reportQueueQuery } from "@/src/entities/report-card/queries"
import {
  QUEUE_STATUSES,
  REPORT_CARD_FILTERS,
  type QueueRow,
  type QueueStatus,
} from "@/src/entities/report-card/schema"
import { useRead } from "@/src/lib/api/use-read"
import { notify } from "@/src/lib/notify"
import { useListParams } from "@/src/lib/use-list-params"

import { useMasterOptions } from "@/src/entities/master-data/use-master-options"

const ALL = "all"
const READY = 100
const LOW = 75

const STATUS_BADGE: Readonly<Record<QueueStatus, string>> = {
  "Siap Terbit": "badge-success",
  "Belum Lengkap": "badge-danger",
  Terbit: "badge-info",
}

function Progress({ percent }: { percent: number }) {
  const tone = percent >= READY ? "success" : percent < LOW ? "danger" : "warning"
  const label = `${Math.floor(percent)}%`
  return (
    <div className="row" style={{ minWidth: 110 }}>
      <div className={`progress progress-${tone}`} style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
      <span className={`caption tabular text-${tone}`}>{label}</span>
    </div>
  )
}

export const detailHref = (row: Pick<QueueRow, "nis" | "level" | "period">) =>
  `/staff/report-cards/${encodeURIComponent(row.nis)}?level=${row.level.id}&period=${row.period.id}`

function IssueButton({ row, canEdit }: { row: QueueRow; canEdit: boolean }) {
  const queryClient = useQueryClient()
  const issue = useMutation({ mutationFn: issueReportCard })

  if (row.status === "Terbit") {
    return (
      <Link className="btn btn-secondary btn-sm" href={detailHref(row)}>
        Lihat Raport
      </Link>
    )
  }

  const blockedReason = !canEdit
    ? "Peran Anda hanya dapat melihat antrian ini."
    : row.status !== "Siap Terbit"
      ? "Absensi dan nilai periode ini harus 100% terisi dulu."
      : undefined

  async function submit() {
    const result = await issue.mutateAsync({
      nis: row.nis,
      levelId: row.level.id,
      periodId: row.period.id,
    })
    if (!result.ok) return notify.error(result.message)
    notify.success(`Raport ${row.name} level ${row.level.name} diterbitkan.`)
    await Promise.all(
      [["report-cards"], ["report-card"]].map((queryKey) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
  }

  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      disabled={blockedReason !== undefined || issue.isPending}
      title={blockedReason}
      onClick={() => void submit()}
    >
      {issue.isPending ? "Menerbitkan..." : "Terbitkan Raport"}
    </button>
  )
}

function columnsFor(canEdit: boolean): readonly DataColumn<QueueRow>[] {
  return [
    {
      key: "name",
      header: "Nama Siswa",
      cell: (row) => (
        <Link className="link" href={detailHref(row)}>
          {row.name}
        </Link>
      ),
    },
    { key: "class", header: "Kelas", cell: (row) => row.class.name },
    { key: "level", header: "Level", cell: (row) => row.level.name },
    { key: "period", header: "Periode", cell: (row) => row.period.name },
    {
      key: "attendance",
      header: "Absensi",
      cell: (row) => <Progress percent={row.attendancePercent} />,
    },
    { key: "scores", header: "Nilai", cell: (row) => <Progress percent={row.scoresPercent} /> },
    {
      key: "status",
      header: "Status",
      cell: (row) => <span className={`badge ${STATUS_BADGE[row.status]}`}>{row.status}</span>,
    },
    {
      key: "actions",
      header: "Aksi",
      cell: (row) => <IssueButton row={row} canEdit={canEdit} />,
    },
  ]
}

export function ReportQueue({ canEdit }: { canEdit: boolean }) {
  const { params, setParams } = useListParams(REPORT_CARD_FILTERS)
  const queue = useRead(reportQueueQuery(params))
  const periods = useRead(academicPeriodsQuery())
  const { branches, levels } = useMasterOptions()

  return (
    <div className="stack stack-lg">
      <Notice tone="warning" title="Perhatian">
        Raport tidak dapat terbit bila absensi periode itu belum lengkap (100% terisi).
      </Notice>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <div className="row row-wrap" style={{ gap: 8 }}>
            <ListFilter name="branch" label="Cabang" options={branches} />
            <ListFilter name="level" label="Level" options={levels} />
            <ListFilter
              name="period"
              label="Periode"
              placeholder="Periode berjalan"
              options={(periods.data?.data ?? []).map((period) => ({
                value: period.id,
                label: period.name,
              }))}
            />
          </div>
          {queue.data && (
            <span className="caption text-muted tabular">
              {queue.data.readyCount} dari {queue.data.meta.total} siswa siap terbit
            </span>
          )}
        </div>

        <SegmentedControl
          size="sm"
          aria-label="Saring status raport"
          style={{ alignSelf: "flex-start" }}
          value={params.status ?? ALL}
          onChange={(value) => setParams({ status: value === ALL ? null : value })}
          data={[
            { value: ALL, label: "Semua" },
            ...QUEUE_STATUSES.map((status) => ({ value: status, label: status })),
          ]}
        />

        {queue.isError ? (
          <QueryError message={queue.error.message} onRetry={() => void queue.refetch()} />
        ) : (
          <ServerDataTable
            rows={queue.data?.data ?? []}
            total={queue.data?.meta.total ?? 0}
            isPending={queue.isPending}
            columns={columnsFor(canEdit)}
            rowKey={(row) => `${row.studentId}-${row.level.id}-${row.period.id}`}
            stickyLast
            emptyText="Tidak ada siswa di antrian penerbitan untuk saringan ini."
          />
        )}
      </section>
    </div>
  )
}
