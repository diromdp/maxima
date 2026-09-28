"use client"

import { Notice } from "@/src/components/ui/Notice"

export function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div role="alert">
      <Notice
        tone="danger"
        actions={
          <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
            Coba lagi
          </button>
        }
      >
        {message}
      </Notice>
    </div>
  )
}
