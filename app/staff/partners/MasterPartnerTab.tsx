"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"

import { PartnerFormModal } from "./PartnerFormModal"
import {
  CITIES,
  INDUSTRIES,
  type Partner,
  PARTNERS,
  PARTNERSHIP_BADGE,
  PARTNERSHIP_STATUSES,
  placedCount,
} from "./sample"

const COLUMNS: readonly DataColumn<Partner>[] = [
  {
    key: "name",
    header: "Nama Perusahaan",
    sort: (partner) => partner.name,
    cell: (partner) => <span style={{ fontWeight: 600 }}>{partner.name}</span>,
  },
  { key: "city", header: "Kota", sort: (partner) => partner.city, cell: (partner) => partner.city },
  {
    key: "industry",
    header: "Industri",
    sort: (partner) => partner.industry,
    cell: (partner) => partner.industry,
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
    sort: (partner) => placedCount(partner.id),
    cell: (partner) => <span className="tabular">{placedCount(partner.id)} Siswa</span>,
  },
  {
    key: "status",
    header: "Status Kerjasama",
    sort: (partner) => partner.status,
    cell: (partner) => (
      <span className={`badge ${PARTNERSHIP_BADGE[partner.status]}`}>{partner.status}</span>
    ),
  },
  { key: "contact", header: "Kontak PIC", cell: (partner) => partner.contact },
]

export function MasterPartnerTab({ readOnly }: { readOnly: boolean }) {
  const [query, setQuery] = useState("")
  const [city, setCity] = useState<string | null>(null)
  const [industry, setIndustry] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const rows = PARTNERS.filter(
    (partner) =>
      (!city || partner.city === city) &&
      (!industry || partner.industry === industry) &&
      (!status || partner.status === status) &&
      (query === "" ||
        `${partner.name} ${partner.city}`.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <TextInput
            aria-label="Cari partner"
            placeholder="Cari nama partner atau kota"
            size="sm"
            w={240}
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            aria-label="Saring kota"
            placeholder="Kota: Semua"
            size="sm"
            w={150}
            data={CITIES}
            value={city}
            onChange={setCity}
            clearable
          />
          <Select
            aria-label="Saring industri"
            placeholder="Industri: Semua"
            size="sm"
            w={200}
            data={[...INDUSTRIES]}
            value={industry}
            onChange={setIndustry}
            clearable
          />
          <Select
            aria-label="Saring status"
            placeholder="Status: Semua"
            size="sm"
            w={150}
            data={[...PARTNERSHIP_STATUSES]}
            value={status}
            onChange={setStatus}
            clearable
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            + Tambah Partner
          </button>
        )}
      </div>

      <span className="caption text-muted">
        Siswa Ditempatkan dihitung dari pengajuan berstatus Dapat Vertrag, bukan diketik.
      </span>

      <DataTable
        rows={rows}
        columns={COLUMNS}
        rowKey={(partner) => partner.id}
        emptyText="Tidak ada partner yang cocok dengan saringan."
      />

      <PartnerFormModal
        key={String(isFormOpen)}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
    </section>
  )
}
