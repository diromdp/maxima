"use client"

import { DataTable } from "@/src/components/data/DataTable"
import { DASH, formatDate } from "@/src/lib/format"

import { SERVICES, type ServiceStatus } from "./data"

const SERVICE_BADGE: Readonly<Record<ServiceStatus, string>> = {
  Selesai: "badge-beres",
  Dikerjakan: "badge-berjalan",
  Terbuka: "badge-terbuka",
  Belum: "badge-tindakan",
}

/** 3.2 Detail Layanan — tujuh kolom lampiran PRD, urutan layanan dipertahankan. */
export function ServiceTable() {
  return (
    <DataTable
      rows={SERVICES}
      rowKey={(r) => r.service}
      filter={{ value: (r) => r.status, options: ["Selesai", "Dikerjakan", "Terbuka", "Belum"] }}
      columns={[
        { key: "layanan", header: "Layanan", cell: (r) => r.service },
        {
          key: "status",
          header: "Status",
          sort: (r) => r.status,
          cell: (r) => <span className={`badge ${SERVICE_BADGE[r.status]}`}>{r.status}</span>,
        },
        { key: "progres", header: "Progres", wrap: true, cell: (r) => r.progress ?? DASH },
        { key: "pic", header: "PIC", cell: (r) => r.pic ?? DASH },
        {
          key: "selesai",
          header: "Tgl Selesai",
          sort: (r) => r.doneAt ?? "",
          cell: (r) => (r.doneAt ? formatDate(r.doneAt) : DASH),
        },
        { key: "catatan", header: "Catatan", wrap: true, cell: (r) => r.note ?? DASH },
        {
          key: "hasil",
          header: "Hasil",
          cell: (r) =>
            r.result ? (
              <a className="link" href={r.result.href}>
                {r.result.label}
              </a>
            ) : (
              DASH
            ),
        },
      ]}
    />
  )
}
