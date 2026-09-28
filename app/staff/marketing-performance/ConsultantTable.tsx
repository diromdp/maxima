"use client"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import type { ConsultantRow } from "@/src/entities/home/schema"
import { formatPercent } from "@/src/lib/format"

function Count({ value, tone }: { value: number; tone?: "success" | "danger" }) {
  return <span className={`tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
}

const COLUMNS: readonly DataColumn<ConsultantRow>[] = [
  {
    key: "name",
    header: "Nama PIC",
    sort: (row) => row.pic.name,
    cell: (row) => (
      <span className="text-ink" style={{ fontWeight: 600 }}>
        {row.pic.name}
      </span>
    ),
  },
  {
    key: "handled",
    header: "Siswa Dihandle",
    align: "right",
    sort: (row) => row.handled,
    cell: (row) => <Count value={row.handled} />,
  },
  {
    key: "contracts",
    header: "Kontrak Berhasil",
    align: "right",
    sort: (row) => row.contracts,
    cell: (row) => (
      <div className="stack" style={{ gap: 0, alignItems: "flex-end" }}>
        <Count value={row.contracts} />
        <span className="caption text-muted tabular">
          {formatPercent(row.handled === 0 ? 0 : row.contracts / row.handled)} dihandle
        </span>
      </div>
    ),
  },
  {
    key: "downPayments",
    header: "DP Masuk",
    align: "right",
    sort: (row) => row.downPayments,
    cell: (row) => <Count value={row.downPayments} />,
  },
  {
    key: "active",
    header: "Siswa Aktif",
    align: "right",
    sort: (row) => row.active,
    cell: (row) => <Count value={row.active} tone="success" />,
  },
  {
    key: "left",
    header: "Keluar / Cuti",
    align: "right",
    sort: (row) => row.leftOrOnLeave,
    cell: (row) => <Count value={row.leftOrOnLeave} tone="danger" />,
  },
]

export function ConsultantTable({ consultants }: { consultants: readonly ConsultantRow[] }) {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5">Produktivitas Konsultan PIC</h2>
          <span className="caption text-muted">
            Keluar / Cuti satu-satunya angka di tabel ini yang makin kecil makin baik.
          </span>
        </div>
        <span className="pill tabular">{consultants.length} PIC</span>
      </div>

      <DataTable
        rows={consultants}
        columns={COLUMNS}
        rowKey={(row) => row.pic.id}
        defaultSort={{ key: "handled", dir: "desc" }}
        emptyText="Belum ada PIC yang memegang siswa."
      />
    </section>
  )
}
