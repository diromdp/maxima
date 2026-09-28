"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { PARTNER_PARAMS } from "@/src/entities/partner/schema"
import { useListParams } from "@/src/lib/use-list-params"

import { ApplicationsTab } from "./ApplicationsTab"
import { InterviewPracticeTab } from "./InterviewPracticeTab"
import { MasterPartnerTab } from "./MasterPartnerTab"
import { TrackingTab } from "./TrackingTab"

const PARTNER_TABS = [
  { value: "master", label: "Master Partner" },
  { value: "applications", label: "Pengajuan" },
  { value: "practice", label: "Latihan Wawancara" },
  { value: "tracking", label: "Tracking" },
] as const

const CLEARED_PARAMS = Object.fromEntries(PARTNER_PARAMS.map((name) => [name, null]))

export function PartnerTabs({ readOnly }: { readOnly: boolean }) {
  const { params, setParams } = useListParams(["tab"])
  const tab = PARTNER_TABS.find((candidate) => candidate.value === params.tab)?.value ?? "master"

  return (
    <Tabs
      value={tab}
      onChange={(value) => value && setParams({ ...CLEARED_PARAMS, tab: value })}
      keepMounted={false}
    >
      <ScrollableTabsList>
        {PARTNER_TABS.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

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
