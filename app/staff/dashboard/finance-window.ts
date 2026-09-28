import type { YearlyReport } from "@/src/entities/report/schema"

export type FinanceMonth = {
  readonly year: number
  readonly month: number
  readonly incomeIdr: number
  readonly incomeEurCents: number
  readonly overdueIdr: number | null
}

export const WINDOW_MONTHS = 12

export function currentMonthOf(now: Date): { year: number; month: number } {
  const [year, month] = now.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).split("-")
  return { year: Number(year), month: Number(month) }
}

export function windowYears(now: Date): number[] {
  const { year, month } = currentMonthOf(now)
  return month === WINDOW_MONTHS ? [year] : [year - 1, year]
}

export function lastTwelveMonths(reports: readonly YearlyReport[], now: Date): FinanceMonth[] {
  const { year, month } = currentMonthOf(now)
  const months = reports.flatMap((report) =>
    report.months.map((row) => ({
      year: report.year,
      month: row.month,
      incomeIdr: row.totalIdr,
      incomeEurCents: row.totalEurCents,
      overdueIdr: row.overdueIdr,
    })),
  )
  const endIndex = months.findIndex((row) => row.year === year && row.month === month)
  return months.slice(endIndex + 1 - WINDOW_MONTHS, endIndex + 1)
}
