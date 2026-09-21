"use client"

import { Tabs } from "@mantine/core"

import { DueTab } from "./DueTab"
import { ReceivablesTab } from "./ReceivablesTab"
import { RemindersTab } from "./RemindersTab"

const TABS = [
  { value: "receivables", label: "Laporan Piutang Siswa", panel: <ReceivablesTab /> },
  { value: "due", label: "Tagihan Jatuh Tempo", panel: <DueTab /> },
  { value: "reminders", label: "Riwayat Reminder (Email)", panel: <RemindersTab /> },
] as const

export function InvoiceTabs({ initialTab }: { initialTab?: string }) {
  const initial = TABS.find((tab) => tab.value === initialTab) ?? TABS[0]

  return (
    <Tabs defaultValue={initial.value} keepMounted={false}>
      <Tabs.List mb="lg">
        {TABS.map((tab) => (
          <Tabs.Tab key={tab.value} value={tab.value}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      {TABS.map((tab) => (
        <Tabs.Panel key={tab.value} value={tab.value}>
          {tab.panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
