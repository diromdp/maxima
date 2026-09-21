"use client"

import { Tabs } from "@mantine/core"

import { ApplicationsTab } from "./ApplicationsTab"
import { InterviewPracticeTab } from "./InterviewPracticeTab"
import { MasterPartnerTab } from "./MasterPartnerTab"
import { TrackingTab } from "./TrackingTab"

const TAB_VALUES = ["master", "applications", "practice", "tracking"] as const
type TabValue = (typeof TAB_VALUES)[number]

const TAB_LABELS: Readonly<Record<TabValue, string>> = {
  master: "Master Partner",
  applications: "Pengajuan",
  practice: "Latihan Wawancara",
  tracking: "Tracking",
}

export function PartnerTabs({ initialTab, readOnly }: { initialTab?: string; readOnly: boolean }) {
  const initial = TAB_VALUES.find((value) => value === initialTab) ?? TAB_VALUES[0]

  return (
    <Tabs defaultValue={initial} keepMounted={false}>
      <Tabs.List mb="lg">
        {TAB_VALUES.map((value) => (
          <Tabs.Tab key={value} value={value}>
            {TAB_LABELS[value]}
          </Tabs.Tab>
        ))}
      </Tabs.List>

      <Tabs.Panel value="master">
        <MasterPartnerTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="applications">
        <ApplicationsTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="practice">
        <InterviewPracticeTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="tracking">
        <TrackingTab />
      </Tabs.Panel>
    </Tabs>
  )
}
