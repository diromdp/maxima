"use client"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import {
  ACTIVITY_LOG_FILTERS,
  activityLogsQuery,
  logActorsQuery,
} from "@/src/entities/activity-log/queries"
import {
  type ActivityLogRow,
  LOG_MODULES,
  type LogModule,
} from "@/src/entities/activity-log/schema"
import { useRead } from "@/src/lib/api/use-read"
import { formatDateTime } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

const MODULE_BADGE: Readonly<Record<LogModule, string>> = {
  Partner: "badge-terbuka",
  Admission: "badge-berjalan",
  Finance: "badge-beres",
  Akademik: "badge-terkunci",
  Dokumen: "badge-terbuka",
  Pengaturan: "badge-tindakan",
}

const roleOf = (log: ActivityLogRow): string =>
  log.actor?.kind === "student" ? "Siswa" : (log.role ?? "-")

const COLUMNS: readonly DataColumn<ActivityLogRow>[] = [
  {
    key: "at",
    header: "Timestamp",
    cell: (log) => <span className="tabular text-muted">{formatDateTime(log.at)}</span>,
  },
  {
    key: "user",
    header: "User",
    cell: (log) => (
      <div className="stack" style={{ gap: 0 }}>
        <span className="text-ink">{log.actor?.name ?? "Sistem"}</span>
        <span className="caption text-muted">{roleOf(log)}</span>
      </div>
    ),
  },
  {
    key: "action",
    header: "Aksi Aktivitas",
    wrap: true,
    cell: (log) => (
      <div className="stack" style={{ gap: 4, alignItems: "flex-start" }}>
        <span>{log.action}</span>
        {log.crossArea && (
          <span className="badge badge-berjalan" title="Perubahan di luar wilayah utama peran">
            Lintas wilayah
          </span>
        )}
      </div>
    ),
  },
  {
    key: "module",
    header: "Modul",
    cell: (log) => <span className={`badge ${MODULE_BADGE[log.module]}`}>{log.module}</span>,
  },
  {
    key: "ip",
    header: "IP Address",
    cell: (log) => <span className="tabular text-muted">{log.ipAddress ?? "-"}</span>,
  },
]

const MODULE_OPTIONS = LOG_MODULES.map((module) => ({ value: module, label: module }))

export function LogTable() {
  const { params } = useListParams(ACTIVITY_LOG_FILTERS)
  const logs = useRead(activityLogsQuery(params))
  const actors = useRead(logActorsQuery())

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row">
          <h2 className="h5">Rekaman</h2>
          {logs.data && <span className="pill tabular">{logs.data.meta.total} aktivitas</span>}
        </div>
        <span className="caption text-muted">Log tidak dapat dihapus oleh siapa pun.</span>
      </div>

      <div className="row row-wrap" style={{ gap: 8 }}>
        <ListSearch label="Cari aktivitas atau nama" />
        <ListFilter
          name="user"
          label="pengguna"
          options={(actors.data?.data ?? []).map((actor) => ({
            value: actor.id,
            label: actor.name,
          }))}
        />
        <ListFilter name="module" label="modul" options={MODULE_OPTIONS} />
      </div>

      {logs.isError ? (
        <QueryError message={logs.error.message} onRetry={() => void logs.refetch()} />
      ) : (
        <ServerDataTable
          rows={logs.data?.data ?? []}
          total={logs.data?.meta.total ?? 0}
          isPending={logs.isPending}
          columns={COLUMNS}
          rowKey={(log) => log.id}
          emptyText="Tidak ada aktivitas yang cocok dengan saringan."
        />
      )}
    </section>
  )
}
