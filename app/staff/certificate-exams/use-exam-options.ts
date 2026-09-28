"use client"

import { masterItemsQuery } from "@/src/entities/master-data/queries"
import type { MasterType } from "@/src/entities/master-data/schema"
import { useRead } from "@/src/lib/api/use-read"

export type ExamOption = { readonly value: string; readonly label: string; readonly code: string }

export function useExamOptions() {
  const masters = useRead(masterItemsQuery())
  const optionsOf = (type: MasterType): readonly ExamOption[] =>
    (masters.data?.data ?? [])
      .filter((item) => item.type === type && item.status === "Aktif")
      .map((item) => ({ value: item.id, label: item.name, code: item.code }))

  return { levels: optionsOf("level"), kinds: optionsOf("certificate_type") }
}
