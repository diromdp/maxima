"use client"

import { masterItemsQuery } from "./queries"
import type { MasterType } from "./schema"
import { useRead } from "@/src/lib/api/use-read"

export type Option = { readonly value: string; readonly label: string }

export function useMasterOptions() {
  const masters = useRead(masterItemsQuery())
  const optionsOf = (type: MasterType): readonly Option[] =>
    (masters.data?.data ?? [])
      .filter((item) => item.type === type && item.status === "Aktif")
      .map((item) => ({ value: item.id, label: item.name }))

  return {
    branches: optionsOf("branch"),
    programs: optionsOf("program"),
    levels: optionsOf("level"),
    partnerCategories: optionsOf("partner_category"),
  }
}
