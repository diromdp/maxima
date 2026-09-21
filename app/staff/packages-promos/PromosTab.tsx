"use client"

import { PencilEdit02Icon, Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable } from "@/src/components/data/DataTable"
import { formatDateRange } from "@/src/lib/format"

import { PromoFormModal } from "./PromoFormModal"
import {
  appliesToLabel,
  formatDiscount,
  type Promo,
  PROMO_STATUS_BADGE,
  PROMO_STATUSES,
  PROMOS,
  usedLabel,
} from "./sample"

const ALL = "Semua"

export function PromosTab({ readOnly }: { readOnly: boolean }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState(ALL)
  const [editing, setEditing] = useState<Promo | null>(null)
  const [adding, setAdding] = useState(false)

  const needle = query.trim().toLowerCase()
  const rows = PROMOS.filter(
    (promo) =>
      (status === ALL || promo.status === status) &&
      (needle === "" ||
        promo.code.toLowerCase().includes(needle) ||
        promo.name.toLowerCase().includes(needle)),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <TextInput
            aria-label="Cari kode voucher"
            placeholder="Cari kode voucher atau nama promo"
            size="sm"
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            style={{ flex: "1 1 240px", maxWidth: 320 }}
          />
          <Select
            aria-label="Status"
            size="sm"
            w={160}
            allowDeselect={false}
            data={[ALL, ...PROMO_STATUSES]}
            value={status}
            onChange={(value) => value && setStatus(value)}
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setAdding(true)}>
            Tambah Promo
          </button>
        )}
      </div>

      <DataTable<Promo>
        rows={rows}
        rowKey={(promo) => promo.id}
        defaultSort={{ key: "periode", dir: "desc" }}
        emptyText="Tidak ada promo yang cocok."
        columns={[
          {
            key: "nama",
            header: "Nama Promo",
            sort: (promo) => promo.name,
            cell: (promo) => (
              <div className="stack" style={{ gap: 0 }}>
                <span style={{ fontWeight: 600 }}>{promo.name}</span>
                <span className="caption text-muted">{promo.code}</span>
              </div>
            ),
          },
          {
            key: "jenis",
            header: "Jenis Diskon",
            sort: (promo) => promo.discountType,
            cell: (promo) => promo.discountType,
          },
          {
            key: "nilai",
            header: "Nilai Diskon",
            align: "right",
            cell: (promo) => formatDiscount(promo),
          },
          { key: "berlaku", header: "Berlaku Untuk", cell: (promo) => appliesToLabel(promo) },
          {
            key: "periode",
            header: "Periode Promo",
            sort: (promo) => promo.start,
            cell: (promo) => formatDateRange(promo.start, promo.end),
          },
          {
            key: "status",
            header: "Status",
            sort: (promo) => promo.status,
            cell: (promo) => (
              <span className={`badge ${PROMO_STATUS_BADGE[promo.status]}`}>{promo.status}</span>
            ),
          },
          {
            key: "digunakan",
            header: "Digunakan",
            align: "right",
            sort: (promo) => promo.used,
            cell: (promo) => usedLabel(promo),
          },
          {
            key: "aksi",
            header: "Aksi",
            cell: (promo) =>
              readOnly ? null : (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditing(promo)}
                >
                  <HugeiconsIcon icon={PencilEdit02Icon} size={16} strokeWidth={1.5} />
                  Edit
                </button>
              ),
          },
        ]}
      />

      <PromoFormModal opened={adding} onClose={() => setAdding(false)} />
      {editing && (
        <PromoFormModal
          key={editing.id}
          opened
          onClose={() => setEditing(null)}
          initial={editing}
        />
      )}
    </section>
  )
}
