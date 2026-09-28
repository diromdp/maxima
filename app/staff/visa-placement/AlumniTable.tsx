"use client"

import { Cancel01Icon, Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { placementsQuery } from "@/src/entities/placement/queries"
import {
  checklistShortOf,
  PLACEMENT_FILTERS,
  PLACEMENT_STATUS_BADGE,
  PLACEMENT_STATUSES,
  type PlacementRow,
  VISA_STATUS_BADGE,
} from "@/src/entities/placement/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

const IDENTITY_COLUMNS = 7
const STATUS_OPTIONS = PLACEMENT_STATUSES.map((value) => ({ value, label: value }))

export function AlumniTable() {
  const { params } = useListParams(PLACEMENT_FILTERS)
  const placements = useRead(placementsQuery(params))
  const { branches, programs } = useMasterOptions()
  const checklistItems = placements.data?.checklistItems ?? []

  const columns: readonly DataColumn<PlacementRow>[] = [
    {
      key: "visa",
      header: "Visa",
      cell: (row) => (
        <span className={`badge whitespace-nowrap ${VISA_STATUS_BADGE[row.visaStatus]}`}>
          {row.visaStatus}
        </span>
      ),
    },
    {
      key: "name",
      header: "Nama Siswa",
      cell: (row) => (
        <Link
          href={`/staff/visa-placement/${encodeURIComponent(row.nis)}`}
          className="stack"
          style={{ gap: 0, alignItems: "flex-start", textDecoration: "none", color: "inherit" }}
        >
          <span className="link" style={{ fontSize: 14 }}>
            {row.name}
          </span>
          <span className="caption text-muted">
            {[row.anrede, `${row.program?.name ?? DASH} ${row.cohort}`, row.branch?.name]
              .filter(Boolean)
              .join(" · ")}
          </span>
        </Link>
      ),
    },
    {
      key: "nis",
      header: "NIS / No Kontrak",
      cell: (row) => (
        <span className="stack tabular" style={{ gap: 0 }}>
          <span>{row.nis}</span>
          <span className="caption text-muted">{row.contractNumber ?? "Belum terbit"}</span>
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <span className={`badge whitespace-nowrap ${PLACEMENT_STATUS_BADGE[row.status]}`}>
          {row.status}
        </span>
      ),
    },
    { key: "company", header: "Perusahaan", cell: (row) => row.company ?? DASH },
    { key: "city", header: "Kota", cell: (row) => row.city ?? DASH },
    { key: "field", header: "Jurusan", cell: (row) => row.fieldOfStudy ?? DASH },
    ...checklistItems.map((item): DataColumn<PlacementRow> => ({
      key: `checklist-${item.code}`,
      header: checklistShortOf(item.name),
      title: item.name,
      align: "center",
      cell: (row) => {
        const isChecked = row.checkedCodes.includes(item.code)
        return (
          <span
            className={isChecked ? "text-success" : "text-faint"}
            role="img"
            aria-label={`${item.name}: ${isChecked ? "sudah" : "belum"}`}
          >
            <HugeiconsIcon icon={isChecked ? Tick02Icon : Cancel01Icon} size={14} strokeWidth={2} />
          </span>
        )
      },
    })),
  ]

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <ListSearch label="Cari nama, NIS, atau No Kontrak" />
        <div className="row row-wrap" style={{ gap: 8 }}>
          <ListFilter name="branch" label="cabang" placeholder="Cabang: Semua" options={branches} />
          <ListFilter
            name="program"
            label="program"
            placeholder="Program: Semua"
            options={programs}
          />
          <ListFilter
            name="status"
            label="status"
            placeholder="Status: Semua"
            options={STATUS_OPTIONS}
          />
        </div>
      </div>

      {placements.isError ? (
        <QueryError message={placements.error.message} onRetry={() => void placements.refetch()} />
      ) : (
        <ServerDataTable
          rows={placements.data?.data ?? []}
          total={placements.data?.meta.total ?? 0}
          isPending={placements.isPending}
          columns={columns}
          rowKey={(row) => row.contractId}
          headerGroups={
            checklistItems.length > 0
              ? [
                  { label: "Identitas dan penempatan", span: IDENTITY_COLUMNS },
                  { label: "Checklist keberangkatan (diisi siswa)", span: checklistItems.length },
                ]
              : undefined
          }
          emptyText="Tidak ada alumni yang cocok dengan saringan."
        />
      )}

      <span className="caption text-muted">
        Gulir ke kanan untuk seluruh butir checklist. Klik nama untuk membuka detail.
      </span>
    </section>
  )
}
