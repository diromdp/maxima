"use client"

import { notify } from "@/src/lib/notify"

export function ExportButton() {
  return (
    <button
      type="button"
      className="btn btn-primary btn-sm"
      onClick={() => notify.success("Laporan tab ini diekspor ke CSV.")}
    >
      Ekspor Laporan (.CSV)
    </button>
  )
}
