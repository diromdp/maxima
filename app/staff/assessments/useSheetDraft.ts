"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { assessmentSheetQuery } from "@/src/entities/assessment/queries"
import type { AssessmentSheet, SheetKey } from "@/src/entities/assessment/schema"
import type { ActionResult } from "@/src/lib/api/client"
import { notify } from "@/src/lib/notify"

type Changes<Value> = Readonly<Record<string, Readonly<Record<string, Value | null>>>>

export function useSheetDraft<Value>({
  sheetKey,
  serverValueOf,
  save,
  successMessage,
}: {
  sheetKey: SheetKey
  serverValueOf: (studentId: string, key: string) => Value | null
  save: (changes: Changes<Value>) => Promise<ActionResult<AssessmentSheet>>
  successMessage: string
}) {
  const queryClient = useQueryClient()
  const [changes, setChanges] = useState<Changes<Value>>({})
  const mutation = useMutation({ mutationFn: save })

  const isDirty = (studentId: string, key: string) =>
    changes[studentId] !== undefined && key in changes[studentId]

  const valueOf = (studentId: string, key: string): Value | null =>
    isDirty(studentId, key) ? (changes[studentId]?.[key] ?? null) : serverValueOf(studentId, key)

  const isRowDirty = (studentId: string) => Object.keys(changes[studentId] ?? {}).length > 0

  function setValue(studentId: string, key: string, value: Value | null) {
    setChanges((current) => {
      const row = { ...current[studentId] }
      if (value === serverValueOf(studentId, key)) delete row[key]
      else row[key] = value
      const next = { ...current, [studentId]: row }
      if (Object.keys(row).length === 0) delete next[studentId]
      return next
    })
  }

  const dirtyCount = Object.values(changes).reduce(
    (count, row) => count + Object.keys(row).length,
    0,
  )

  async function submit() {
    const result = await mutation.mutateAsync(changes)
    if (!result.ok) return notify.error(result.message)
    queryClient.setQueryData(assessmentSheetQuery(sheetKey).queryKey, result.data)
    setChanges({})
    notify.success(successMessage)
  }

  return {
    valueOf,
    isDirty,
    isRowDirty,
    setValue,
    dirtyCount,
    submit,
    isPending: mutation.isPending,
  }
}
