"use client"

import { Select } from "@mantine/core"
import { useDebouncedValue } from "@mantine/hooks"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { partnerStudentsQuery } from "@/src/entities/partner/queries"
import type { StudentOption } from "@/src/entities/partner/schema"
import { readApi } from "@/src/lib/api/read"
import { SEARCH_DELAY_MS } from "@/src/lib/list-query"

const MIN_SEARCH = 2

export function StudentPicker({
  value,
  error,
  onChange,
}: {
  value: string
  error?: React.ReactNode
  onChange: (studentId: string) => void
}) {
  const [search, setSearch] = useState("")
  const [debouncedSearch] = useDebouncedValue(search.trim(), SEARCH_DELAY_MS)
  const [picked, setPicked] = useState<StudentOption | null>(null)
  const read = partnerStudentsQuery(debouncedSearch)
  const students = useQuery({
    queryKey: read.queryKey,
    queryFn: () => readApi(read),
    enabled: debouncedSearch.length >= MIN_SEARCH,
  })
  const options = [
    ...(picked ? [picked] : []),
    ...(students.data?.data ?? []).filter((option) => option.id !== picked?.id),
  ]

  return (
    <Select
      label="Siswa"
      placeholder="Ketik minimal dua huruf nama atau NIS"
      withAsterisk
      searchable
      data-autofocus
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options: all }) => all}
      nothingFoundMessage={
        debouncedSearch.length < MIN_SEARCH
          ? "Ketik minimal dua huruf nama atau NIS."
          : students.isFetching
            ? "Mencari..."
            : students.isError
              ? students.error.message
              : "Tidak ada siswa ber-NIS yang cocok dalam cakupanmu."
      }
      data={options.map((option) => ({
        value: option.id,
        label: `${option.name} · ${option.nis}`,
      }))}
      value={value || null}
      error={error}
      onChange={(next) => {
        setPicked(options.find((option) => option.id === next) ?? null)
        onChange(next ?? "")
      }}
    />
  )
}
