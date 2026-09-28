"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useListParams } from "@/src/lib/use-list-params"

import { LevelDecisions } from "./LevelDecisions"
import { ReportQueue } from "./ReportQueue"

const REPORT_CARD_TABS = [
  { value: "queue", label: "Antrian Penerbitan" },
  { value: "decisions", label: "Kenaikan Level" },
] as const

export function ReportCardTabs({ canEdit }: { canEdit: boolean }) {
  const { params, setParams } = useListParams(["tab"])
  const tab = REPORT_CARD_TABS.find((candidate) => candidate.value === params.tab)?.value ?? "queue"

  return (
    <Tabs
      value={tab}
      onChange={(value) => value && setParams({ tab: value, status: null, decision: null })}
      keepMounted={false}
    >
      <ScrollableTabsList>
        {REPORT_CARD_TABS.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      <Tabs.Panel value="queue">
        <ReportQueue canEdit={canEdit} />
      </Tabs.Panel>
      <Tabs.Panel value="decisions">
        <LevelDecisions canEdit={canEdit} />
      </Tabs.Panel>
    </Tabs>
  )
}
