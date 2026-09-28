"use client"

import { DateInput } from "@mantine/dates"

import { useListParams } from "@/src/lib/use-list-params"

export function ListDateFilter({ name, label }: { name: string; label: string }) {
  const { params, setParams } = useListParams([name])
  const value = (params as Record<string, string | undefined>)[name] ?? null

  return (
    <DateInput
      aria-label={label}
      placeholder={label}
      size="sm"
      w={150}
      valueFormat="DD/MM/YYYY"
      clearable
      value={value}
      onChange={(next) => setParams({ [name]: next })}
    />
  )
}
