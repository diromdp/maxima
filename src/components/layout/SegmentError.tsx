"use client"

import { Notice } from "@/src/components/ui/Notice"

const RENDER_FAILED =
  "Halaman ini gagal dimuat. Coba lagi sebentar; kalau masih sama, hubungi staf Maxima."

export function SegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div role="alert" className="stack">
      <Notice
        tone="danger"
        title="Ada yang tidak beres"
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={reset}>
            Coba lagi
          </button>
        }
      >
        {error.digest || !error.message ? RENDER_FAILED : error.message}
      </Notice>
    </div>
  )
}
