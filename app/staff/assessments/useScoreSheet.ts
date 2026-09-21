"use client"

import { useState } from "react"

import type { Score } from "./sample"

type Sheet<Value> = Readonly<Record<string, Readonly<Record<string, Value | null>>>>

export function useScoreSheet<Value = Score>(initial: Sheet<Value>) {
  const [saved, setSaved] = useState(initial)
  const [sheet, setSheet] = useState(initial)

  const scoreOf = (nis: string, key: string): Value | null => sheet[nis]?.[key] ?? null

  const isDirty = (nis: string, key: string) => scoreOf(nis, key) !== (saved[nis]?.[key] ?? null)

  const setScore = (nis: string, key: string, value: Value | null) =>
    setSheet((current) => ({ ...current, [nis]: { ...current[nis], [key]: value } }))

  const dirtyCount = Object.entries(sheet).reduce(
    (count, [nis, row]) => count + Object.keys(row).filter((key) => isDirty(nis, key)).length,
    0,
  )

  const save = () => setSaved(sheet)

  return { scoreOf, isDirty, setScore, dirtyCount, save }
}
