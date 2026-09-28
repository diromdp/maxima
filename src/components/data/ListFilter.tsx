"use client"

import { Select } from "@mantine/core"

import { useListParams } from "@/src/lib/use-list-params"

export function ListFilter({
  name,
  label,
  options,
  placeholder = `Semua ${label}`,
}: {
  name: string
  label: string
  options: readonly { value: string; label: string }[]
  placeholder?: string
}) {
  const { params, setParams } = useListParams([name])
  const value = (params as Record<string, string | undefined>)[name] ?? null

  return (
    <Select
      aria-label={`Saring ${label}`}
      placeholder={placeholder}
      size="sm"
      w={160}
      comboboxProps={{ width: 200, position: "bottom-start" }}
      data={[...options]}
      value={value}
      onChange={(next) => setParams({ [name]: next })}
      clearable
    />
  )
}
