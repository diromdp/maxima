"use client"

import { useState } from "react"

import { RECEIVABLES } from "../invoices/sample"
import { BY_BRANCH, TOTAL } from "./sample"
import { StudentsModal } from "./StudentsModal"
import { SummaryTable } from "./SummaryTable"

export function BranchesTab() {
  const [detail, setDetail] = useState<string | null>(null)

  return (
    <section className="card stack">
      <div className="stack stack-sm">
        <h2 className="h6">Per Cabang</h2>
        <span className="caption text-muted">
          Performa keuangan tiap cabang, ditutup baris total keseluruhan.
        </span>
      </div>
      <SummaryTable
        head="Cabang"
        rows={BY_BRANCH}
        total={TOTAL}
        extra={(row) =>
          row.students > 0 ? (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setDetail(row.key)}
            >
              Lihat siswa
            </button>
          ) : null
        }
      />
      {detail && (
        <StudentsModal
          title={`Siswa cabang ${detail}`}
          rows={RECEIVABLES.filter((row) => row.student.branch === detail)}
          onClose={() => setDetail(null)}
        />
      )}
    </section>
  )
}
