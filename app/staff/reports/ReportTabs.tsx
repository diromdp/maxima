"use client"

import { Skeleton, Tabs } from "@mantine/core"
import type { ReactNode } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { ScrollableTabsList } from "@/src/components/ui/ScrollableTabsList"

import { GroupReportTab } from "./GroupReportTab"
import { MonthlyTab } from "./MonthlyTab"
import { PeriodSkeleton } from "./PeriodReport"
import { type ReportTab, useReportPeriods, useReportTab } from "./use-report-param"
import { YearlyTab } from "./YearlyTab"

const TABS: readonly { value: ReportTab; label: string }[] = [
  { value: "monthly", label: "Laporan Bulanan" },
  { value: "yearly", label: "Laporan Tahunan" },
  { value: "packages", label: "Per Paket" },
  { value: "branches", label: "Per Cabang" },
  { value: "pics", label: "Per PIC Marketing" },
]

export function ReportTabs() {
  const [tab, setTab] = useReportTab()
  const periods = useReportPeriods()

  const periodPanel = (render: (data: NonNullable<typeof periods.data>) => ReactNode) =>
    periods.isError ? (
      <QueryError message={periods.error.message} onRetry={() => void periods.refetch()} />
    ) : periods.isPending ? (
      <div className="stack stack-lg">
        <Skeleton height={36} width={260} radius="xl" aria-hidden />
        <PeriodSkeleton />
      </div>
    ) : (
      render(periods.data)
    )

  return (
    <Tabs value={tab} onChange={(value) => value && setTab(value)} keepMounted={false}>
      <ScrollableTabsList>
        {TABS.map(({ value, label }) => (
          <Tabs.Tab key={value} value={value}>
            {label}
          </Tabs.Tab>
        ))}
      </ScrollableTabsList>

      <Tabs.Panel value="monthly">
        {periodPanel((data) => (
          <MonthlyTab periods={data} />
        ))}
      </Tabs.Panel>
      <Tabs.Panel value="yearly">
        {periodPanel((data) => (
          <YearlyTab periods={data} />
        ))}
      </Tabs.Panel>
      <Tabs.Panel value="packages">
        <GroupReportTab by="package" />
      </Tabs.Panel>
      <Tabs.Panel value="branches">
        <GroupReportTab by="branch" />
      </Tabs.Panel>
      <Tabs.Panel value="pics">
        <GroupReportTab by="pic" />
      </Tabs.Panel>
    </Tabs>
  )
}
