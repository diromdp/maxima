"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useUrlParam } from "@/src/lib/use-url-param"

import { AcademicCalendar } from "./AcademicCalendar"
import { ClassMembers } from "./ClassMembers"
import { KkmStandardsTab } from "./KkmStandardsTab"
import { MasterClassTable } from "./MasterClassTable"
import { PeriodsTab } from "./PeriodsTab"

const tabsFor = (canEdit: boolean) =>
  [
    { value: "master", label: "Master Kelas", panel: <MasterClassTable canEdit={canEdit} /> },
    { value: "members", label: "Anggota Kelas", panel: <ClassMembers canEdit={canEdit} /> },
    { value: "calendar", label: "Kalender Akademik", panel: <AcademicCalendar /> },
    { value: "kkm", label: "Standar KKM", panel: <KkmStandardsTab readOnly={!canEdit} /> },
    { value: "periods", label: "Periode Akademik", panel: <PeriodsTab canEdit={canEdit} /> },
  ] as const

export function ClassTabs({ canEdit }: { canEdit: boolean }) {
  const tabs = tabsFor(canEdit)
  const [tab, setTab] = useUrlParam("tab", tabs[0].value, (value) =>
    tabs.some((candidate) => candidate.value === value),
  )

  return (
    <Tabs value={tab} onChange={(value) => value && setTab(value)} keepMounted={false}>
      <ScrollableTabsList>
        {tabs.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      {tabs.map(({ value, panel }) => (
        <Tabs.Panel key={value} value={value}>
          {panel}
        </Tabs.Panel>
      ))}
    </Tabs>
  )
}
