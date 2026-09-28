"use client"

import { Tabs } from "@mantine/core"
import type { ReactNode } from "react"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useUrlParam } from "@/src/lib/use-url-param"

import { AtRiskTable } from "./AtRiskTable"
import { ClassTable } from "./ClassTable"
import { TeacherTable } from "./TeacherTable"

const MONITORING_TABS = ["teachers", "classes", "at-risk"] as const
type MonitoringTab = (typeof MONITORING_TABS)[number]

const PANELS: Readonly<Record<MonitoringTab, { label: string; panel: ReactNode }>> = {
  teachers: { label: "Pengajar", panel: <TeacherTable /> },
  classes: { label: "Kelas", panel: <ClassTable /> },
  "at-risk": { label: "Siswa Berisiko", panel: <AtRiskTable /> },
}

export function MonitoringTabs() {
  const [tab, setTab] = useUrlParam("tab", MONITORING_TABS[0], (value) =>
    MONITORING_TABS.some((candidate) => candidate === value),
  )

  return (
    <Tabs value={tab} onChange={(value) => value && setTab(value)} keepMounted={false}>
      <ScrollableTabsList>
        {MONITORING_TABS.map((value) => (
          <Tabs.Tab key={value} value={value}>
            {PANELS[value].label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      {MONITORING_TABS.map((value) => (
        <Tabs.Panel key={value} value={value}>
          {PANELS[value].panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
