"use client"

import { Tabs } from "@mantine/core"

import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"
import { useUrlParam } from "@/src/lib/use-url-param"

import { CertificatesTab } from "./CertificatesTab"
import { RecommendationsTab } from "./RecommendationsTab"
import { SchedulesTab } from "./SchedulesTab"

const TABS = [
  { value: "certificates", label: "Sertifikat" },
  { value: "recommendations", label: "Rekomendasi Ujian" },
  { value: "schedules", label: "Jadwal & Pendaftaran" },
] as const

export function ExamTabs({ readOnly, viewerName }: { readOnly: boolean; viewerName: string }) {
  const [tab, setTab] = useUrlParam("tab", TABS[0].value, (value) =>
    TABS.some((candidate) => candidate.value === value),
  )

  return (
    <Tabs value={tab} onChange={(value) => value && setTab(value)}>
      <ScrollableTabsList>
        {TABS.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      <Tabs.Panel value="certificates">
        <CertificatesTab readOnly={readOnly} />
      </Tabs.Panel>
      <Tabs.Panel value="recommendations">
        <RecommendationsTab readOnly={readOnly} viewerName={viewerName} />
      </Tabs.Panel>
      <Tabs.Panel value="schedules">
        <SchedulesTab readOnly={readOnly} />
      </Tabs.Panel>
    </Tabs>
  )
}
