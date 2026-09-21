"use client"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { type Consultant, CONSULTANTS, ratio } from "./sample"

function Number({ value, tone }: { value: number; tone?: "success" | "danger" }) {
  return <span className={`tabular${tone ? ` text-${tone}` : ""}`}>{value}</span>
}

const COLUMNS: readonly DataColumn<Consultant>[] = [
  {
    key: "name",
    header: "Nama PIC",
    sort: (c) => c.name,
    cell: (c) => (
      <div className="stack" style={{ gap: 0 }}>
        <span className="text-ink" style={{ fontWeight: 600 }}>
          {c.name}
        </span>
        <span className="caption text-muted">Cabang {c.branch}</span>
      </div>
    ),
  },
  {
    key: "handled",
    header: "Siswa Dihandle",
    align: "right",
    sort: (c) => c.handled,
    cell: (c) => <Number value={c.handled} />,
  },
  {
    key: "signed",
    header: "Kontrak Berhasil",
    align: "right",
    sort: (c) => c.signed,
    cell: (c) => (
      <div className="stack" style={{ gap: 0, alignItems: "flex-end" }}>
        <Number value={c.signed} />
        <span className="caption text-muted tabular">{ratio(c.signed, c.handled)}% dihandle</span>
      </div>
    ),
  },
  {
    key: "downPayment",
    header: "DP Masuk",
    align: "right",
    sort: (c) => c.downPayment,
    cell: (c) => <Number value={c.downPayment} />,
  },
  {
    key: "active",
    header: "Siswa Aktif",
    align: "right",
    sort: (c) => c.active,
    cell: (c) => <Number value={c.active} tone="success" />,
  },
  {
    key: "left",
    header: "Keluar / Cuti",
    align: "right",
    sort: (c) => c.leftOrOnLeave,
    cell: (c) => <Number value={c.leftOrOnLeave} tone="danger" />,
  },
]

export function ConsultantTable() {
  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack" style={{ gap: 2 }}>
          <h2 className="h5">Produktivitas Konsultan PIC</h2>
          <span className="caption text-muted">
            Keluar / Cuti satu-satunya angka di tabel ini yang makin kecil makin baik.
          </span>
        </div>
        <span className="pill tabular">{CONSULTANTS.length} PIC</span>
      </div>

      <DataTable
        rows={CONSULTANTS}
        columns={COLUMNS}
        rowKey={(c) => c.name}
        defaultSort={{ key: "handled", dir: "desc" }}
        emptyText="Belum ada PIC yang memegang siswa."
      />
    </section>
  )
}
