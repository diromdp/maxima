"use client"

import { Tabs } from "@mantine/core"

import { CertificatesTab } from "./CertificatesTab"
import { RecommendationsTab } from "./RecommendationsTab"
import { SchedulesTab } from "./SchedulesTab"

const TAB_VALUES = ["certificates", "recommendations", "schedules"] as const
type TabValue = (typeof TAB_VALUES)[number]

const TAB_LABELS: Readonly<Record<TabValue, string>> = {
  certificates: "Sertifikat",
  recommendations: "Rekomendasi Ujian",
  schedules: "Jadwal & Pendaftaran",
}

export function ExamTabs({
  initialTab,
  readOnly,
  viewerName,
}: {
  initialTab?: string
  readOnly: boolean
  viewerName: string
}) {
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

      <Tabs.Panel value="certificates">
        <CertificatesTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="recommendations">
        <RecommendationsTab readOnly={readOnly} recommenderName={viewerName} />
      </Tabs.Panel>
      <Tabs.Panel value="schedules">
        <SchedulesTab readOnly={readOnly} />
      </Tabs.Panel>
    </Tabs>
  )
}
