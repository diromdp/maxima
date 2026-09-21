"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextInput } from "@mantine/core"
import { useState } from "react"

import { RECEIVABLES } from "../invoices/sample"
import { StudentsModal } from "./StudentsModal"
import { BY_PIC, summarize } from "./sample"
import { SummaryTable } from "./SummaryTable"

export function PicsTab() {
  const [query, setQuery] = useState("")
  const [detail, setDetail] = useState<string | null>(null)
  const needle = query.trim().toLowerCase()
  const rows = BY_PIC.filter((row) => needle === "" || row.label.toLowerCase().includes(needle))
  const total = summarize(
    "total",
    "TOTAL KESELURUHAN",
    RECEIVABLES.filter((row) => rows.some((summary) => summary.key === row.student.pic)),
  )

  return (
    <section className="card stack">
      <div className="row row-between row-wrap">
        <div className="stack stack-sm">
          <h2 className="h6">Per PIC Marketing</h2>
          <span className="caption text-muted">
            Uang yang masuk dari siswa di bawah tiap PIC. Jumlah siswa dan kontraknya ada di
            Performa Marketing.
          </span>
        </div>
        <TextInput
          aria-label="Cari nama PIC"
          placeholder="Cari nama PIC"
          size="sm"
          leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          style={{ flex: "1 1 200px", maxWidth: 280 }}
        />
      </div>
      <SummaryTable
        head="Nama PIC Marketing"
        rows={rows}
        total={total}
        extra={(row) => (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setDetail(row.key)}>
            Lihat siswa
          </button>
        )}
      />
      {detail && (
        <StudentsModal
          title={`Siswa di bawah ${detail}`}
          rows={RECEIVABLES.filter((row) => row.student.pic === detail)}
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  )
}
