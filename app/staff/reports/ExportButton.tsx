"use client"

import { queryString } from "@/src/lib/api/errors"

import {
  EXPORT_TAB,
  useReportMonth,
  useReportSearch,
  useReportTab,
  useReportYear,
} from "./use-report-param"

export function ExportButton() {
  const [tab] = useReportTab()
  const [month] = useReportMonth()
  const [year] = useReportYear()
  const [search] = useReportSearch()
  const query = queryString({
    tab: EXPORT_TAB[tab],
    month: tab === "monthly" ? month : undefined,
    year: tab === "yearly" ? year : undefined,
    search: tab === "pics" ? search.trim() : undefined,
  })

  return (
    <a href={`/api/download/reports/export${query}`} className="btn btn-primary btn-sm">
      Ekspor Laporan (.xlsx)
    </a>
  )
}
