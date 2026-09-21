"use client"

import { Tabs } from "@mantine/core"

import { AtRiskTable } from "./AtRiskTable"
import { ClassTable } from "./ClassTable"
import { TeacherTable } from "./TeacherTable"

const TABS = [
  { value: "teachers", label: "Pengajar", panel: <TeacherTable /> },
  { value: "classes", label: "Kelas", panel: <ClassTable /> },
  { value: "at-risk", label: "Siswa Berisiko", panel: <AtRiskTable /> },
] as const

export function MonitoringTabs({ initialTab }: { initialTab?: string }) {
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
