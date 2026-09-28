"use client"

import { useState } from "react"

import type { DataColumn } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { partnersQuery } from "@/src/entities/partner/queries"
import {
  PARTNER_FILTERS,
  partnerFiltersOf,
  PARTNERSHIP_BADGE,
  PARTNERSHIP_STATUSES,
  type PartnerRow,
} from "@/src/entities/partner/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { PartnerFormModal } from "./PartnerFormModal"
import { ReadTable } from "./ReadTable"
import { usePartnerOptions } from "./use-partner-options"

function ContactCell({ partner }: { partner: PartnerRow }) {
  const channel = partner.contactPhone ?? partner.contactEmail
  if (!partner.contactName && !channel) return <span className="text-muted">{DASH}</span>
  return (
    <span className="stack" style={{ gap: 0 }}>
      <span>{partner.contactName ?? DASH}</span>
      {channel && <span className="caption text-muted">{channel}</span>}
    </span>
  )
}

function columnsFor(
  readOnly: boolean,
  onEdit: (partner: PartnerRow) => void,
): readonly DataColumn<PartnerRow>[] {
  return [
    {
      key: "name",
      header: "Nama Perusahaan",
      sort: (partner) => partner.name,
      cell: (partner) => <span style={{ fontWeight: 600 }}>{partner.name}</span>,
    },
    {
      key: "city",
      header: "Kota",
      sort: (partner) => partner.city ?? "",
      cell: (partner) => partner.city ?? DASH,
    },
    {
      key: "industry",
      header: "Industri",
      sort: (partner) => partner.category?.name ?? "",
      cell: (partner) => partner.category?.name ?? DASH,
    },
    {
      key: "openPositions",
      header: "Posisi Tersedia",
      align: "right",
      sort: (partner) => partner.openPositions,
      cell: (partner) => (
        <span className={`tabular ${partner.openPositions === 0 ? "text-muted" : ""}`}>
          {partner.openPositions} Posisi
        </span>
      ),
    },
    {
      key: "placed",
      header: "Siswa Ditempatkan",
      align: "right",
      sort: (partner) => partner.placedStudents,
      cell: (partner) => <span className="tabular">{partner.placedStudents} Siswa</span>,
    },
    {
      key: "status",
      header: "Status Kerjasama",
      sort: (partner) => partner.status,
      cell: (partner) => (
        <span className={`badge ${PARTNERSHIP_BADGE[partner.status]}`}>{partner.status}</span>
      ),
    },
    { key: "contact", header: "Kontak PIC", cell: (partner) => <ContactCell partner={partner} /> },
    ...(readOnly
      ? []
      : [
          {
            key: "actions",
            header: "Aksi",
            align: "right",
            cell: (partner) => (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onEdit(partner)}
              >
                Ubah
              </button>
            ),
          } satisfies DataColumn<PartnerRow>,
        ]),
  ]
}

export function MasterPartnerTab({ readOnly }: { readOnly: boolean }) {
  const { params } = useListParams(PARTNER_FILTERS)
  const filters = partnerFiltersOf(params)
  const partners = useRead(partnersQuery(filters))
  const { partnerCategories } = useMasterOptions()
  const { cities } = usePartnerOptions()
  const [editing, setEditing] = useState<PartnerRow | "new" | null>(null)
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8, flex: 1 }}>
          <ListSearch label="Cari nama partner atau kota" />
          <ListFilter name="city" label="Kota" options={cities} />
          <ListFilter name="categoryId" label="Industri" options={partnerCategories} />
          <ListFilter
            name="status"
            label="Status"
            options={PARTNERSHIP_STATUSES.map((status) => ({ value: status, label: status }))}
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing("new")}>
            + Tambah Partner
          </button>
        )}
      </div>

      <span className="caption text-muted">
        Siswa Ditempatkan dihitung dari pengajuan berstatus Dapat Vertrag, bukan diketik.
      </span>

      <ReadTable
        read={partners}
        columns={columnsFor(readOnly, setEditing)}
        emptyText={
          isFiltered
            ? "Tidak ada partner yang cocok dengan saringan."
            : "Belum ada partner. Tambahkan lewat tombol Tambah Partner."
        }
      />

      {editing && (
        <PartnerFormModal
          initial={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </section>
  )
}
