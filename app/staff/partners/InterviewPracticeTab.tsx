"use client"

import { useState } from "react"

import type { DataColumn } from "@/src/components/data/DataTable"
import { ListFilter } from "@/src/components/data/ListFilter"
import { ListSearch } from "@/src/components/data/ListSearch"
import { practicesQuery } from "@/src/entities/partner/queries"
import {
  PRACTICE_BADGE,
  PRACTICE_FILTERS,
  PRACTICE_STATUSES,
  practiceFiltersOf,
  type PracticeRow,
} from "@/src/entities/partner/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH, formatDate } from "@/src/lib/format"
import { useListParams } from "@/src/lib/use-list-params"

import { PracticeFormModal } from "./PracticeFormModal"
import { PracticeResultModal } from "./PracticeResultModal"
import { ReadTable } from "./ReadTable"

function ResultCell({ practice }: { practice: PracticeRow }) {
  const label =
    practice.status === "Dijadwalkan" ? (
      <span style={{ fontWeight: 600 }}>Menunggu</span>
    ) : !practice.result ? (
      <span className="text-muted">{DASH}</span>
    ) : (
      <span
        className={practice.result === "Siap" ? "text-success" : "text-danger"}
        style={{ fontWeight: 600 }}
      >
        {practice.result}
      </span>
    )
  return (
    <span className="stack" style={{ gap: 0 }}>
      {label}
      {practice.evaluation && (
        <span className="caption text-muted wrap">{practice.evaluation}</span>
      )}
    </span>
  )
}

function columnsFor(
  readOnly: boolean,
  onRecord: (practice: PracticeRow) => void,
): readonly DataColumn<PracticeRow>[] {
  return [
    {
      key: "date",
      header: "Tanggal",
      sort: (row) => `${row.date} ${row.startsAt ?? ""}`,
      cell: (row) => (
        <span className="stack" style={{ gap: 0 }}>
          <span>{formatDate(row.date)}</span>
          {row.startsAt && <span className="caption text-muted tabular">{row.startsAt}</span>}
        </span>
      ),
    },
    {
      key: "student",
      header: "Siswa (NIS + Nama)",
      sort: (row) => row.student.name,
      cell: (row) => (
        <span style={{ fontWeight: 600 }}>
          <span className="tabular text-muted">({row.student.nis ?? DASH})</span> {row.student.name}
        </span>
      ),
    },
    { key: "position", header: "Posisi Dilamar", cell: (row) => row.position ?? DASH },
    {
      key: "partner",
      header: "Partner",
      sort: (row) => row.partner?.name ?? "",
      cell: (row) => row.partner?.name ?? DASH,
    },
    {
      key: "round",
      header: "Wawancara Ke",
      sort: (row) => row.round,
      cell: (row) => <span style={{ fontWeight: 600 }}>Simulasi {row.round}</span>,
    },
    {
      key: "trainer",
      header: "PIC Pelatih",
      sort: (row) => row.trainer?.name ?? "",
      cell: (row) => row.trainer?.name ?? DASH,
    },
    {
      key: "status",
      header: "Status",
      sort: (row) => row.status,
      cell: (row) => <span className={`badge ${PRACTICE_BADGE[row.status]}`}>{row.status}</span>,
    },
    {
      key: "result",
      header: "Hasil / Evaluasi",
      wrap: true,
      cell: (row) => <ResultCell practice={row} />,
    },
    ...(readOnly
      ? []
      : [
          {
            key: "actions",
            header: "Aksi",
            align: "right",
            cell: (row) => (
              <button
                type="button"
                className={`btn btn-sm ${row.status === "Dijadwalkan" ? "btn-primary" : "btn-secondary"}`}
                onClick={() => onRecord(row)}
              >
                {row.status === "Dijadwalkan" ? "Catat Hasil" : "Ubah Hasil"}
              </button>
            ),
          } satisfies DataColumn<PracticeRow>,
        ]),
  ]
}

export function InterviewPracticeTab({ readOnly }: { readOnly: boolean }) {
  const { params } = useListParams(PRACTICE_FILTERS)
  const filters = practiceFiltersOf(params)
  const practices = useRead(practicesQuery(filters))
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [recording, setRecording] = useState<PracticeRow | null>(null)
  const isFiltered = Object.values(filters).some(Boolean)

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8, flex: 1 }}>
          <ListSearch label="Cari siswa, NIS, atau PIC" />
          <ListFilter
            name="status"
            label="Status"
            options={PRACTICE_STATUSES.map((status) => ({ value: status, label: status }))}
          />
        </div>
        {!readOnly && (
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            + Jadwalkan Latihan
          </button>
        )}
      </div>

      <span className="caption text-muted">
        Latihan dijadwalkan Admission, bukan diminta siswa; siswa hanya melihat jadwalnya di portal.
      </span>

      <ReadTable
        read={practices}
        columns={columnsFor(readOnly, setRecording)}
        defaultSort={{ key: "date", dir: "desc" }}
        emptyText={
          isFiltered
            ? "Tidak ada latihan yang cocok dengan saringan."
            : "Belum ada latihan wawancara. Jadwalkan lewat tombol Jadwalkan Latihan."
        }
      />

      {isFormOpen && <PracticeFormModal onClose={() => setIsFormOpen(false)} />}
      {recording && <PracticeResultModal practice={recording} onClose={() => setRecording(null)} />}
    </section>
  )
}
