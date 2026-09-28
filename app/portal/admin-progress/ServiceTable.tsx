"use client"

import { DataTable } from "@/src/components/data/DataTable"
import type { PortalServiceRow, ServiceStatus } from "@/src/entities/portal/schema"
import { openStoredObject } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

export const SERVICE_LABEL: Readonly<Record<ServiceStatus, string>> = {
  Selesai: "Selesai",
  Dikerjakan: "Dikerjakan",
  Terbuka: "Terbuka",
  "Belum Terbuka": "Belum",
}

const SERVICE_BADGE: Readonly<Record<ServiceStatus, string>> = {
  Selesai: "badge-beres",
  Dikerjakan: "badge-berjalan",
  Terbuka: "badge-terbuka",
  "Belum Terbuka": "badge-tindakan",
}

async function openResult(key: string) {
  try {
    await openStoredObject(key)
  } catch (error) {
    if (error instanceof ApiError) notify.error(error.message)
    else throw error
  }
}

function ProgressCell({ row }: { row: PortalServiceRow }) {
  if (!row.steps) return <>{row.progressNote ?? DASH}</>
  return (
    <span className="stack" style={{ gap: 2 }}>
      {row.progressNote && <span>{row.progressNote}</span>}
      {row.steps.map((step) => (
        <span key={step.step} className="caption text-muted">
          {step.step}. {step.name} · {SERVICE_LABEL[step.state as ServiceStatus] ?? step.state}
        </span>
      ))}
    </span>
  )
}

function ResultCell({ row }: { row: PortalServiceRow }) {
  const files = row.results.filter((result) => result.objectKey)
  if (files.length === 0) return <>{DASH}</>
  return (
    <span className="stack" style={{ gap: 2 }}>
      {files.map((result) => (
        <button
          key={result.documentType}
          type="button"
          className="link"
          style={{ textAlign: "left" }}
          onClick={() => void openResult(result.objectKey ?? "")}
        >
          {result.originalName ?? result.name}
        </button>
      ))}
    </span>
  )
}

export function ServiceTable({ services }: { services: readonly PortalServiceRow[] }) {
  const statuses = [...new Set(services.map((row) => SERVICE_LABEL[row.status]))]

  return (
    <DataTable
      rows={services}
      rowKey={(row) => row.code}
      filter={{ value: (row) => SERVICE_LABEL[row.status], options: statuses }}
      emptyText="Paket Anda belum memuat layanan."
      columns={[
        { key: "service", header: "Layanan", cell: (row) => row.name },
        {
          key: "status",
          header: "Status",
          sort: (row) => SERVICE_LABEL[row.status],
          cell: (row) => (
            <span className={`badge ${SERVICE_BADGE[row.status]}`}>
              {SERVICE_LABEL[row.status]}
            </span>
          ),
        },
        {
          key: "progress",
          header: "Progres",
          wrap: true,
          cell: (row) => <ProgressCell row={row} />,
        },
        { key: "pic", header: "PIC", cell: (row) => row.pic ?? DASH },
        {
          key: "finishedOn",
          header: "Tgl Selesai",
          sort: (row) => row.finishedOn ?? "",
          cell: (row) => (row.finishedOn ? formatDate(row.finishedOn) : DASH),
        },
        { key: "note", header: "Catatan", wrap: true, cell: (row) => row.note ?? DASH },
        { key: "result", header: "Hasil", cell: (row) => <ResultCell row={row} /> },
      ]}
    />
  )
}
