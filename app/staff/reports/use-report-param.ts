"use client"

import { reportPeriodsQuery } from "@/src/entities/report/queries"
import { useRead } from "@/src/lib/api/use-read"
import { useUrlParam } from "@/src/lib/use-url-param"

export const EXPORT_TAB = {
  monthly: "monthly",
  yearly: "yearly",
  packages: "package",
  branches: "branch",
  pics: "pic",
} as const

export type ReportTab = keyof typeof EXPORT_TAB

const MONTH_PATTERN = /^\d{4}-\d{2}$/

const isReportTab = (value: string): value is ReportTab => value in EXPORT_TAB

export const useReportPeriods = () => useRead(reportPeriodsQuery())

export function useReportTab() {
  const [tab, setTab] = useUrlParam("tab", "monthly", isReportTab)
  return [tab as ReportTab, setTab] as const
}

export function useReportMonth() {
  const periods = useReportPeriods().data
  const current = periods?.currentMonth ?? ""
  const first = periods?.firstMonth ?? current
  return useUrlParam(
    "month",
    current,
    (value) => MONTH_PATTERN.test(value) && value >= first && value <= current,
  )
}

export function useReportYear() {
  const periods = useReportPeriods().data
  const years = (periods?.years ?? []).map(String)
  const fallback = years.at(-1) ?? periods?.currentMonth.slice(0, 4) ?? ""
  return useUrlParam("year", fallback, (value) => years.includes(value))
}

export function useReportSearch() {
  return useUrlParam("search", "")
}
