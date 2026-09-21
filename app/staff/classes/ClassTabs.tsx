"use client"

import { Tabs } from "@mantine/core"

import { AcademicCalendar } from "./AcademicCalendar"
import { ClassMembers } from "./ClassMembers"
import { KkmStandardsTab } from "./KkmStandardsTab"
import { MasterClassTable } from "./MasterClassTable"

const tabsFor = (canEditKkm: boolean) =>
  [
    { value: "master", label: "Master Kelas", panel: <MasterClassTable /> },
    { value: "members", label: "Anggota Kelas", panel: <ClassMembers /> },
    { value: "calendar", label: "Kalender Akademik", panel: <AcademicCalendar /> },
    { value: "kkm", label: "Standar KKM", panel: <KkmStandardsTab readOnly={!canEditKkm} /> },
  ] as const

export function ClassTabs({
  initialTab,
  canEditKkm,
}: {
  initialTab?: string
  canEditKkm: boolean
}) {
  const TABS = tabsFor(canEditKkm)
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
