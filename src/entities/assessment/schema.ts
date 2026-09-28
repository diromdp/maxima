import type { MemberStatus } from "@/src/entities/class/schema"

export type Named = { readonly id: string; readonly name: string }

export type AssessmentLevel = Named & { readonly code: string }

export type AssessmentFilters = {
  readonly classes: readonly (Named & {
    readonly level: AssessmentLevel
    readonly status: string
  })[]
  readonly periods: readonly (Named & { readonly startDate: string; readonly endDate: string })[]
  readonly defaultPeriodId: string | null
}

export const ATTITUDE_GRADES = ["BS", "B", "C", "PB"] as const
export type AttitudeGrade = (typeof ATTITUDE_GRADES)[number]

export const ATTITUDE_GRADE_LABEL: Readonly<Record<AttitudeGrade, string>> = {
  BS: "Baik Sekali",
  B: "Baik",
  C: "Cukup",
  PB: "Perlu Bimbingan",
}

export const LOW_ATTITUDE_GRADES: readonly AttitudeGrade[] = ["C", "PB"]

export const RECOMMENDATIONS = ["Naik Level", "Perlu Remedial", "Tidak Naik"] as const
export type Recommendation = (typeof RECOMMENDATIONS)[number]

export const RECOMMENDATION_BADGE: Readonly<Record<Recommendation, string>> = {
  "Naik Level": "badge-beres",
  "Perlu Remedial": "badge-berjalan",
  "Tidak Naik": "badge-tindakan",
}

export type ExamStatus = "Lulus" | "Tidak Lulus" | "Belum Lengkap"

export const EXAM_STATUS_BADGE: Readonly<Record<ExamStatus, string>> = {
  Lulus: "badge-beres",
  "Tidak Lulus": "badge-tindakan",
  "Belum Lengkap": "badge-terkunci",
}

export const EXAM_COLUMNS: Readonly<Record<string, { label: string; short: string }>> = {
  grosstest: { label: "Großtest", short: "Großtest" },
  "endtest-lesen": { label: "Endtest Lesen", short: "E. Lesen" },
  "endtest-hoeren": { label: "Endtest Hören", short: "E. Hören" },
  "endtest-schreiben": { label: "Endtest Schreiben", short: "E. Schreiben" },
  "endtest-sprechen": { label: "Endtest Sprechen", short: "E. Sprechen" },
  "sim-1": { label: "Simulasi 1", short: "Sim. 1" },
  "sim-2": { label: "Simulasi 2", short: "Sim. 2" },
  "sim-3": { label: "Simulasi 3", short: "Sim. 3" },
}

export type TeacherNote = {
  readonly learningDescription: string | null
  readonly teacherNote: string | null
  readonly recommendation: Recommendation | null
  readonly updatedAt: string | null
}

export type SheetStudent = {
  readonly studentId: string
  readonly nis: string | null
  readonly name: string
  readonly chapters: Readonly<Record<string, number>>
  readonly chapterAverage: number | null
  readonly exams: Readonly<Record<string, number>>
  readonly examAverage: number | null
  readonly examStatus: ExamStatus | null
  readonly attitudes: Readonly<Record<string, AttitudeGrade>>
  readonly attendancePercent: number | null
  readonly note: TeacherNote
  readonly reportCardId: string | null
  readonly membership: { readonly status: MemberStatus; readonly leftOn: string | null }
}

export const isFormerMember = (student: SheetStudent): boolean =>
  student.membership.status !== "Aktif"

export type SheetTab = "chapters" | "exams" | "attitudes"

export type AssessmentSheet = {
  readonly class: Named & { readonly level: AssessmentLevel }
  readonly period: Named
  readonly kkm: number | null
  readonly chapterKeys: readonly string[]
  readonly examKeys: readonly string[]
  readonly aspects: readonly { readonly code: string; readonly label: string }[]
  readonly versions: Readonly<Record<SheetTab, string>>
  readonly students: readonly SheetStudent[]
}

export type SheetKey = { classId: string; periodId: string }

export type ScoreSheetInput = SheetKey & {
  version: string
  rows: { studentId: string; values: Record<string, number | null> }[]
}

export type AttitudeSheetInput = SheetKey & {
  version: string
  rows: { studentId: string; grades: Record<string, AttitudeGrade | null> }[]
}

export type TeacherNoteInput = SheetKey & {
  lastUpdatedAt: string | null
  learningDescription?: string | null
  teacherNote?: string | null
  recommendation?: Recommendation | null
}

export const LOW_ATTENDANCE_PERCENT = 75

export function averageOf(values: readonly (number | null)[]): number | null {
  const filled = values.filter((value): value is number => value !== null)
  if (filled.length === 0) return null
  return Math.round((filled.reduce((total, value) => total + value, 0) / filled.length) * 100) / 100
}

export function examStatusOf(
  values: readonly (number | null)[],
  kkm: number | null,
): ExamStatus | null {
  if (values.some((value) => value === null)) return "Belum Lengkap"
  const average = averageOf(values)
  if (kkm === null || average === null) return null
  return average >= kkm ? "Lulus" : "Tidak Lulus"
}

export const formatScore = (value: number | null) =>
  value === null ? "-" : Number.isInteger(value) ? String(value) : value.toFixed(1)

export const isBelowKkm = (value: number | null, kkm: number | null) =>
  value !== null && kkm !== null && value < kkm
