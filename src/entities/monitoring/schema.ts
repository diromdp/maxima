export type Ref = { readonly id: string; readonly name: string }

export type MonitoringPeriod = {
  readonly id: string
  readonly name: string
  readonly startDate: string
  readonly endDate: string
}

export type Listing<T> = { readonly period: MonitoringPeriod; readonly data: readonly T[] }

export type MonitoringTeacherRow = {
  readonly id: string
  readonly name: string
  readonly classes: readonly Ref[]
  readonly studentCount: number
  readonly averageScore: number | null
  readonly passRate: number | null
  readonly attendanceCompleteness: number | null
  readonly scoreCompleteness: number | null
}

export type MonitoringClassRow = {
  readonly id: string
  readonly name: string
  readonly level: Ref
  readonly branch: Ref
  readonly teacher: Ref | null
  readonly studentCount: number
  readonly averageScore: number | null
  readonly averageAttendance: number | null
  readonly atRiskCount: number
  readonly currentChapter: number | null
  readonly totalChapters: number
}

export type RiskIndicator =
  "Kehadiran Rendah" | "Nilai Rendah" | "Progres Tertinggal" | "Gagal Evaluasi"

export type AtRiskRow = {
  readonly studentId: string
  readonly nis: string | null
  readonly name: string
  readonly class: Ref
  readonly level: Ref
  readonly branch: Ref
  readonly attendancePercent: number | null
  readonly averageScore: number | null
  readonly studentChapter: number | null
  readonly classChapter: number | null
  readonly indicators: readonly RiskIndicator[]
}

export type AtRiskReport = Listing<AtRiskRow> & { readonly total: number }

export const AT_RISK_FILTERS = ["branch", "class", "level"] as const
export type AtRiskFilters = Partial<Record<(typeof AT_RISK_FILTERS)[number], string>>

export const atRiskFiltersOf = (params: AtRiskFilters): AtRiskFilters => ({
  branch: params.branch,
  class: params.class,
  level: params.level,
})

export const LOW_ATTENDANCE_PERCENT = 75
export const MAX_CHAPTERS_BEHIND = 2
export const LOW_PASS_RATE_PERCENT = 75
