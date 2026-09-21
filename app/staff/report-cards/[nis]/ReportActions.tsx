"use client"

import Link from "next/link"

import { notify } from "@/src/lib/notify"

export function ReportActions({
  fileName,
  readOnly,
  studentName,
}: {
  fileName: string
  readOnly: boolean
  studentName: string
}) {
  return (
    <>
      <Link className="btn btn-secondary btn-sm" href="/staff/assessments?tab=notes">
        Edit Catatan
      </Link>
      <button type="button" className="btn btn-secondary btn-sm" onClick={() => window.print()}>
        Cetak Raport
      </button>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        disabled={readOnly}
        onClick={() =>
          notify.success(`"${fileName}.pdf" dikirim ke halaman Pembelajaran ${studentName}.`)
        }
      >
        Kirim ke Siswa
      </button>
    </>
  )
}
