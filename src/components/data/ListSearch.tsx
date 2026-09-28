"use client"

import { Search01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextInput } from "@mantine/core"
import { useDebouncedCallback } from "@mantine/hooks"
import { useState } from "react"

import { SEARCH_DELAY_MS } from "@/src/lib/list-query"
import { useListParams } from "@/src/lib/use-list-params"

export function ListSearch({ label }: { label: string }) {
  const { params, setParams } = useListParams()
  const [value, setValue] = useState(params.search ?? "")
  const write = useDebouncedCallback(
    (search: string) => setParams({ search: search.trim() }),
    SEARCH_DELAY_MS,
  )

  return (
    <TextInput
      aria-label={label}
      placeholder={label}
      size="sm"
      leftSection={<HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={1.5} />}
      value={value}
      onChange={(event) => {
        setValue(event.currentTarget.value)
        write(event.currentTarget.value)
      }}
      style={{ flex: "1 1 240px", maxWidth: 320 }}
    />
  )
}
