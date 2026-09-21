"use client"

import { Tabs } from "@mantine/core"

import { BranchesTab } from "./BranchesTab"
import { MonthlyTab } from "./MonthlyTab"
import { PackagesTab } from "./PackagesTab"
import { PicsTab } from "./PicsTab"
import { YearlyTab } from "./YearlyTab"

const TABS = [
  { value: "monthly", label: "Laporan Bulanan", panel: <MonthlyTab /> },
  { value: "yearly", label: "Laporan Tahunan", panel: <YearlyTab /> },
  { value: "packages", label: "Per Paket", panel: <PackagesTab /> },
  { value: "branches", label: "Per Cabang", panel: <BranchesTab /> },
  { value: "pics", label: "Per PIC Marketing", panel: <PicsTab /> },
] as const

export function ReportTabs({ initialTab }: { initialTab?: string }) {
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
