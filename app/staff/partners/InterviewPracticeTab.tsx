"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Select, TextInput } from "@mantine/core"
import { useState } from "react"

import { DataTable, type DataColumn } from "@/src/components/data/DataTable"
import { DASH, formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"

import { PracticeFormModal } from "./PracticeFormModal"
import { type PracticeOutcome, PracticeResultModal } from "./PracticeResultModal"
import {
  type InterviewPractice,
  partnerById,
  PRACTICE_BADGE,
  PRACTICE_STATUSES,
  PRACTICES,
} from "./sample"

const resultCell = (row: InterviewPractice) => {
  const label =
    row.status === "Dijadwalkan" ? (
      <span style={{ fontWeight: 600 }}>Menunggu</span>
    ) : !row.result ? (
      <span className="text-muted">{DASH}</span>
    ) : (
      <span
        className={row.result === "Siap" ? "text-success" : "text-danger"}
        style={{ fontWeight: 600 }}
      >
        {row.result}
      </span>
    )
  return (
    <span className="stack" style={{ gap: 0 }}>
      {label}
      {row.evaluation && <span className="caption text-muted wrap">{row.evaluation}</span>}
    </span>
  )
}

const columnsFor = (
  readOnly: boolean,
  onRecord: (row: InterviewPractice) => void,
): readonly DataColumn<InterviewPractice>[] => [
  { key: "date", header: "Tanggal", sort: (row) => row.date, cell: (row) => formatDate(row.date) },
  {
    key: "student",
    header: "Siswa (NIS + Nama)",
    sort: (row) => row.studentName,
    cell: (row) => (
      <span style={{ fontWeight: 600 }}>
        <span className="tabular text-muted">({row.nis})</span> {row.studentName}
      </span>
    ),
  },
  { key: "position", header: "Posisi Dilamar", cell: (row) => row.position },
  {
    key: "partner",
    header: "Partner",
    sort: (row) => partnerById(row.partnerId).shortName,
    cell: (row) => partnerById(row.partnerId).shortName,
  },
  {
    key: "session",
    header: "Wawancara Ke",
    sort: (row) => row.session,
    cell: (row) => <span style={{ fontWeight: 600 }}>Simulasi {row.session}</span>,
  },
  { key: "trainer", header: "PIC Pelatih", sort: (row) => row.trainer, cell: (row) => row.trainer },
  {
    key: "status",
    header: "Status",
    sort: (row) => row.status,
    cell: (row) => <span className={`badge ${PRACTICE_BADGE[row.status]}`}>{row.status}</span>,
  },
  { key: "result", header: "Hasil / Evaluasi", wrap: true, cell: resultCell },
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
        } satisfies DataColumn<InterviewPractice>,
      ]),
]

export function InterviewPracticeTab({ readOnly }: { readOnly: boolean }) {
  const [query, setQuery] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [practices, setPractices] = useState<readonly InterviewPractice[]>(PRACTICES)
  const [recording, setRecording] = useState<InterviewPractice | null>(null)

  const saveOutcome = (id: string, outcome: PracticeOutcome) => {
    setPractices((current) => current.map((row) => (row.id === id ? { ...row, ...outcome } : row)))
    notify.success(
      outcome.status === "Selesai"
        ? `Hasil latihan dicatat: ${outcome.result}. Siswa melihatnya di portal.`
        : "Latihan ditandai dibatalkan.",
    )
  }

  const rows = practices.filter(
    (row) =>
      (!status || row.status === status) &&
      (query === "" ||
        `${row.studentName} ${row.nis} ${row.trainer}`.toLowerCase().includes(query.toLowerCase())),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="row row-wrap" style={{ gap: 8 }}>
          <TextInput
            aria-label="Cari siswa atau PIC"
            placeholder="Cari siswa, PIC..."
            size="sm"
            w={220}
            leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Select
            aria-label="Saring status"
            placeholder="Status: Semua"
            size="sm"
            w={170}
            data={[...PRACTICE_STATUSES]}
            value={status}
            onChange={setStatus}
            clearable
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

      <DataTable
        rows={rows}
        columns={columnsFor(readOnly, setRecording)}
        rowKey={(row) => row.id}
        defaultSort={{ key: "date", dir: "desc" }}
        emptyText="Tidak ada latihan yang cocok dengan saringan."
      />

      <PracticeFormModal
        key={String(isFormOpen)}
        opened={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />
      <PracticeResultModal
        key={recording?.id ?? "closed"}
        practice={recording}
        onClose={() => setRecording(null)}
        onSave={saveOutcome}
      />
    </section>
  )
}
