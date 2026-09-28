"use client"

import Link from "next/link"

import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { QueryError } from "@/src/components/data/QueryError"
import { ServerDataTable } from "@/src/components/data/ServerDataTable"
import type { DataColumn } from "@/src/components/data/TableFrame"
import { masterItemsQuery } from "@/src/entities/master-data/queries"
import { useMasterOptions } from "@/src/entities/master-data/use-master-options"
import { serviceBoardQuery, serviceOptionsQuery } from "@/src/entities/service/queries"
import {
  type BoardRow,
  SERVICE_FILTERS,
  SERVICE_STATES,
  STATE_BADGE,
  STATE_HINT,
} from "@/src/entities/service/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

export function ServiceBoard() {
  const { params } = useListParams(SERVICE_FILTERS)
  const board = useRead(serviceBoardQuery(params))
  const options = useRead(serviceOptionsQuery())
  const masters = useRead(masterItemsQuery())
  const { branches } = useMasterOptions()

  const services = (masters.data?.data ?? [])
    .filter((item) => item.type === "service" && item.status === "Aktif")
    .sort((left, right) => left.sortOrder - right.sortOrder)

  const columns: readonly DataColumn<BoardRow>[] = [
    {
      key: "name",
      header: "Nama Siswa",
      cell: (student) => (
        <Link
          href={`/staff/services/${encodeURIComponent(student.nis)}`}
          className="stack"
          style={{ gap: 0, alignItems: "flex-start", textDecoration: "none", color: "inherit" }}
        >
          <span className="link" style={{ fontSize: 14 }}>
            {student.name}
          </span>
          <span className="caption text-muted">
            {student.package.name} · {student.branch.name}
          </span>
        </Link>
      ),
    },
    ...services.map((service): DataColumn<BoardRow> => ({
      key: service.code,
      header: service.name,
      cell: (student) => {
        const cell = student.cells.find((candidate) => candidate.code === service.code)
        if (!cell) {
          return (
            <span
              className="text-muted"
              role="img"
              aria-label={`Tidak termasuk paket ${student.package.name}`}
            >
              {DASH}
            </span>
          )
        }
        return (
          <span
            className={`badge whitespace-nowrap px-1.5 text-[11px] ${STATE_BADGE[cell.status]}`}
          >
            {cell.status}
          </span>
        )
      },
    })),
  ]

  return (
    <div className="stack stack-lg">
      <section className="card stack">
        <div className="row row-between row-wrap" style={{ alignItems: "flex-end" }}>
          <ListSearch label="Cari nama atau NIS" />
          <div className="row row-wrap" style={{ gap: 8 }}>
            <ListFilter
              name="branch"
              label="cabang"
              placeholder="Cabang: Semua"
              options={branches}
            />
            <ListFilter
              name="package"
              label="paket"
              placeholder="Paket: Semua"
              options={(options.data?.packages ?? []).map((option) => ({
                value: option.id,
                label: option.name,
              }))}
            />
          </div>
        </div>
      </section>

      <section className="card stack">
        <div className="row row-between row-wrap" style={{ gap: 12 }}>
          <div className="row row-wrap" style={{ gap: 12 }}>
            <span className="label text-muted">Legenda status gerbang</span>
            {SERVICE_STATES.map((state) => (
              <span key={state} className="row" style={{ gap: 6 }}>
                <span className={`badge ${STATE_BADGE[state]}`}>{state}</span>
                <span className="caption text-muted">{STATE_HINT[state]}</span>
              </span>
            ))}
          </div>
          <span className="caption text-muted wrap">
            Klik nama siswa untuk membuka detail layanannya. Layanan di luar paket ditulis tanda
            hubung.
          </span>
        </div>

        {board.isError || masters.isError ? (
          <QueryError
            message={(board.error ?? masters.error)?.message ?? ""}
            onRetry={() => {
              void board.refetch()
              void masters.refetch()
            }}
          />
        ) : (
          <ServerDataTable
            rows={board.data?.data ?? []}
            total={board.data?.meta.total ?? 0}
            isPending={board.isPending || masters.isPending}
            columns={columns}
            rowKey={(student) => student.studentId}
            emptyText="Tidak ada siswa ber-NIS dengan kontrak aktif yang cocok dengan saringan."
          />
        )}
      </section>
    </div>
  )
}
