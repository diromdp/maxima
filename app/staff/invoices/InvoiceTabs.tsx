"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useListParams } from "@/src/lib/use-list-params"

import { DueTab } from "./DueTab"
import { ReceivablesTab } from "./ReceivablesTab"
import { RemindersTab } from "./RemindersTab"

const INVOICE_TABS = [
  { value: "receivables", label: "Laporan Piutang Siswa", panel: <ReceivablesTab /> },
  { value: "due", label: "Tagihan Jatuh Tempo", panel: <DueTab /> },
  { value: "reminders", label: "Riwayat Reminder (Email)", panel: <RemindersTab /> },
] as const

export function InvoiceTabs() {
  const { params, setParams } = useListParams(["tab"])
  const tab =
    INVOICE_TABS.find((candidate) => candidate.value === params.tab)?.value ?? "receivables"

  return (
    <Tabs
      value={tab}
      onChange={(value) =>
        value && setParams({ tab: value, branch: null, status: null, search: null })
      }
      keepMounted={false}
    >
      <ScrollableTabsList>
        {INVOICE_TABS.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      {INVOICE_TABS.map(({ value, panel }) => (
        <Tabs.Panel key={value} value={value}>
          {panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
