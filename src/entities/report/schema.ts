export type PaymentMethod = string

export type Period = { readonly from: string; readonly to: string }

export type IncomeTotals = {
  readonly transactionCount: number
  readonly topMethod: PaymentMethod | null
  readonly totalIdr: number
  readonly totalEurCents: number
}

export type IncomeBucket = Period & IncomeTotals

export type IncomeSummary = {
  readonly totalIdr: number
  readonly payingStudents: number
  readonly totalEurCents: number
  readonly payingStudentsEur: number
  readonly averageIdr: number
  readonly averageEurCents: number
}

type Reference = { readonly id: string; readonly name: string }

export type OverdueRow = {
  readonly contractId: string
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly package: Reference
  readonly branch: Reference | null
  readonly pic: Reference | null
  readonly targetIdr: number
  readonly paidIdr: number
  readonly overdueIdr: number
}

export type OverdueReport = {
  readonly asOf: string | null
  readonly totalIdr: number
  readonly studentCount: number
  readonly rows: readonly OverdueRow[]
}

export type ReportPeriods = {
  readonly firstMonth: string | null
  readonly currentMonth: string
  readonly years: readonly number[]
}

export type MonthlyReport = {
  readonly month: string
  readonly period: Period
  readonly generatedAt: string
  readonly summary: IncomeSummary
  readonly weeks: readonly (IncomeBucket & { readonly week: number })[]
  readonly total: IncomeTotals
  readonly overdue: OverdueReport
}

export type MonthIncome = IncomeBucket & {
  readonly month: number
  readonly overdueIdr: number | null
}

export type YearlyReport = {
  readonly year: number
  readonly period: Period
  readonly generatedAt: string
  readonly summary: IncomeSummary
  readonly months: readonly MonthIncome[]
  readonly total: IncomeTotals & { readonly overdueIdr: number | null }
  readonly overdue: OverdueReport
}

export type GroupBy = "package" | "branch" | "pic"

export type GroupTotals = {
  readonly studentCount: number
  readonly billedIdr: number
  readonly paidIdr: number
  readonly paidEurCents: number
  readonly remainingIdr: number
  readonly remainingEurCents: number
  readonly collectibilityPercent: number
}

export type GroupReportRow = GroupTotals & {
  readonly id: string | null
  readonly name: string
  readonly packagePriceIdr: number | null
}

export type GroupReport = {
  readonly by: GroupBy
  readonly rows: readonly GroupReportRow[]
  readonly total: GroupTotals
}

export type GroupStudentRow = {
  readonly contractId: string
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly branch: Reference | null
  readonly package: Reference
  readonly studentStatus: string
  readonly paidIdr: number
  readonly remainingIdr: number
  readonly remainingEurCents: number | null
  readonly lastPaidOn: string | null
}

export const UNGROUPED_ID = "none"
