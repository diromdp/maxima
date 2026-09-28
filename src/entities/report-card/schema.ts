export type Ref = { readonly id: string; readonly name: string }
export type LevelRef = Ref & { readonly code: string }

export const QUEUE_STATUSES = ["Siap Terbit", "Belum Lengkap", "Terbit"] as const
export type QueueStatus = (typeof QUEUE_STATUSES)[number]

export const REPORT_CARD_FILTERS = ["branch", "level", "period", "status"] as const

export const DECISION_FILTERS = ["branch", "period", "decision"] as const

export type QueueRow = {
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly class: Ref
  readonly level: LevelRef
  readonly period: Ref
  readonly attendancePercent: number
  readonly scoresPercent: number
  readonly status: QueueStatus
  readonly reportCardId: string | null
}

export const RECOMMENDATIONS = ["Naik Level", "Perlu Remedial", "Tidak Naik"] as const
export type Recommendation = (typeof RECOMMENDATIONS)[number]

export type DecisionRow = {
  readonly reportCardId: string
  readonly nis: string
  readonly name: string
  readonly level: string
  readonly finalScore: number | null
  readonly attendancePercent: number | null
  readonly recommendation: Recommendation | null
  readonly decision: Recommendation | null
  readonly decidedAt: string | null
}
export type AttitudeGrade = "BS" | "B" | "C" | "PB"
export type ExamStatus = "Lulus" | "Tidak Lulus" | "Belum Lengkap"

export type ScoreLine = {
  readonly key: string
  readonly label: string
  readonly score: number | null
  readonly kkm: number | null
}

export type ReportContent = {
  readonly chapters: readonly ScoreLine[]
  readonly chapterAverage: number | null
  readonly exams: readonly ScoreLine[]
  readonly examAverage: number | null
  readonly simulations: readonly ScoreLine[]
  readonly learningDescription: string | null
  readonly attendance: {
    readonly present: number
    readonly recorded: number
    readonly percent: number | null
  }
  readonly attitudes: readonly {
    readonly aspect: string
    readonly label: string
    readonly grade: AttitudeGrade | null
  }[]
  readonly learningStatus: ExamStatus | null
  readonly chaptersAboveKkm: number
  readonly examRecommendation: "Direkomendasikan" | "Remedial dulu" | null
  readonly finalRecommendation: Recommendation | null
  readonly nextLevel: string | null
  readonly teacherName: string | null
  readonly teacherNote: string | null
}

export type ReportCardDetail = {
  readonly header: {
    readonly studentId: string
    readonly nis: string
    readonly name: string
    readonly program: string | null
    readonly className: string | null
    readonly branch: string | null
    readonly level: LevelRef
    readonly period: Ref & { readonly startDate: string; readonly endDate: string }
  }
  readonly content: ReportContent
  readonly levels: readonly (LevelRef & { readonly isAvailable: boolean })[]
  readonly readiness: {
    readonly attendancePercent: number
    readonly scoresPercent: number
    readonly isReady: boolean
  } | null
  readonly issued: {
    readonly id: string
    readonly issuedAt: string
    readonly sentAt: string | null
    readonly decision: Recommendation | null
    readonly decidedAt: string | null
  } | null
}

export const ATTITUDE_GRADE_LABEL: Readonly<Record<AttitudeGrade, string>> = {
  BS: "Baik Sekali",
  B: "Baik",
  C: "Cukup",
  PB: "Perlu Bimbingan",
}

export const formatDecimal = (value: number | null, digits = 2) =>
  value === null
    ? "-"
    : value.toLocaleString("id-ID", {
        minimumFractionDigits: 0,
        maximumFractionDigits: digits,
      })
