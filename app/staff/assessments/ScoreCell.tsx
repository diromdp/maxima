"use client"

import { useState } from "react"

import { formatScore, isBelowKkm } from "@/src/entities/assessment/schema"

type Score = number | null

export function ScoreCell({
  value,
  kkm,
  isDirty,
  readOnly,
  label,
  onChange,
}: {
  value: Score
  kkm: number | null
  isDirty: boolean
  readOnly: boolean
  label: string
  onChange: (value: Score) => void
}) {
  const [draft, setDraft] = useState<string | null>(null)
  const tone = isBelowKkm(value, kkm) ? "bg-danger-bg text-danger" : ""

  const commit = () => {
    if (draft === null) return
    const trimmed = draft.trim()
    const parsed = trimmed === "" ? null : Math.min(100, Math.max(0, Math.round(Number(trimmed))))
    if (parsed === null || Number.isFinite(parsed)) onChange(parsed)
    setDraft(null)
  }

  if (readOnly) {
    return (
      <span className={`tabular inline-block min-w-11 rounded-md px-2 py-1 text-right ${tone}`}>
        {formatScore(value)}
      </span>
    )
  }

  if (draft !== null) {
    return (
      <input
        type="number"
        inputMode="numeric"
        min={0}
        max={100}
        aria-label={label}
        autoFocus
        value={draft}
        onChange={(event) => setDraft(event.currentTarget.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur()
          if (event.key === "Escape") setDraft(null)
        }}
        className="tabular w-16 rounded-md border border-accent bg-canvas px-2 py-1 text-right outline-none"
      />
    )
  }

  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => setDraft(value === null ? "" : String(value))}
      className={`tabular relative min-w-11 rounded-md border border-transparent px-2 py-1 text-right hover:border-hairline focus-visible:border-accent ${tone} ${value === null ? "text-faint" : ""}`}
    >
      {formatScore(value)}
      {isDirty && (
        <span
          aria-hidden
          className="bg-warning-solid absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full"
        />
      )}
    </button>
  )
}
