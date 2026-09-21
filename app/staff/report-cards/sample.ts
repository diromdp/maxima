import {
  ATTENDANCE_BY_STUDENT,
  ATTITUDE_ASPECTS,
  ATTITUDE_SCORES,
  type AttitudeGrade,
  average,
  BASE_EXAMS,
  CHAPTER_KEYS,
  CHAPTER_SCORES,
  CLASSES,
  EMPTY_NOTE,
  EXAM_SCORES,
  examColumnsFor,
  KKM,
  type Level,
  NOTES,
  PERIODS,
  type Recommendation,
  type Score,
  STUDENTS_BY_CLASS,
  type TeacherNote,
} from "../assessments/sample"

export const PERIOD = {
  label: PERIODS[0],
  range: "Januari - Juni 2026",
  endMonth: "Juni",
  year: 2026,
} as const

export const PROGRAM = "Ausbildung"

export const SESSIONS_TOTAL = 24

export const BRANCH_BY_CLASS: Readonly<Record<string, string>> = {
  berlin: "Jakarta",
  muenchen: "Bandung",
}

export const TEACHER_BY_CLASS: Readonly<Record<string, string>> = {
  berlin: "Frau Müller",
  muenchen: "Herr Schmidt",
}

export const SESSIONS_RECORDED: Readonly<Record<string, number>> = {
  "2026001": 24,
  "2026002": 20,
  "2026003": 24,
  "2026004": 24,
  "2026005": 24,
  "2026006": 18,
  "2026007": 24,
  "2026008": 21,
  "2026021": 12,
  "2026022": 12,
}

export const LEVELS: readonly Level[] = ["A1", "A2", "B1", "B2"]

export const NEXT_LEVEL: Readonly<Record<Level, Level | null>> = {
  A1: "A2",
  A2: "B1",
  B1: "B2",
  B2: null,
}

export type QueueRow = {
  readonly nis: string
  readonly name: string
  readonly classId: string
  readonly className: string
  readonly branch: string
  readonly level: Level
  readonly period: string
  readonly attendanceFilled: number
  readonly scoresFilled: number
}

const filledRatio = (values: readonly (Score | AttitudeGrade | null)[]): number =>
  values.length === 0 ? 0 : values.filter((value) => value !== null).length / values.length

const chapterValues = (classId: string, nis: string): readonly Score[] =>
  CHAPTER_KEYS.map((key) => CHAPTER_SCORES[classId]?.[nis]?.[key] ?? null)

const examValues = (classId: string, nis: string, level: Level): readonly Score[] =>
  examColumnsFor(level).map((exam) => EXAM_SCORES[classId]?.[nis]?.[exam.key] ?? null)

const attitudeValues = (classId: string, nis: string): readonly (AttitudeGrade | null)[] =>
  ATTITUDE_ASPECTS.map((aspect) => ATTITUDE_SCORES[classId]?.[nis]?.[aspect.key] ?? null)

export const scoresFilled = (classId: string, nis: string, level: Level): number =>
  filledRatio([
    ...chapterValues(classId, nis),
    ...examValues(classId, nis, level),
    ...attitudeValues(classId, nis),
  ])

export const attendanceFilled = (nis: string): number =>
  (SESSIONS_RECORDED[nis] ?? 0) / SESSIONS_TOTAL

export const isReady = (row: Pick<QueueRow, "attendanceFilled" | "scoresFilled">): boolean =>
  row.attendanceFilled >= 1 && row.scoresFilled >= 1

export const QUEUE: readonly QueueRow[] = CLASSES.flatMap((room) =>
  (STUDENTS_BY_CLASS[room.id] ?? []).map((student) => ({
    nis: student.nis,
    name: student.name,
    classId: room.id,
    className: room.name,
    branch: BRANCH_BY_CLASS[room.id] ?? "-",
    level: room.level,
    period: PERIOD.label,
    attendanceFilled: attendanceFilled(student.nis),
    scoresFilled: scoresFilled(room.id, student.nis, room.level),
  })),
)

export type ScoredItem = { readonly label: string; readonly score: Score }

export type ReportCard = {
  readonly nis: string
  readonly name: string
  readonly className: string
  readonly branch: string
  readonly teacher: string
  readonly level: Level
  readonly chapters: readonly ScoredItem[]
  readonly chapterAverage: number | null
  readonly exams: readonly ScoredItem[]
  readonly simulations: readonly ScoredItem[]
  readonly examAverage: number | null
  readonly attitude: readonly { readonly label: string; readonly grade: AttitudeGrade | null }[]
  readonly attendanceRate: number
  readonly present: number
  readonly recorded: number
  readonly note: TeacherNote
}

export const levelsOf = (nis: string): readonly Level[] =>
  CLASSES.filter((room) => (STUDENTS_BY_CLASS[room.id] ?? []).some((s) => s.nis === nis)).map(
    (room) => room.level,
  )

export function reportOf(nis: string, level: Level): ReportCard | null {
  const room = CLASSES.find(
    (candidate) =>
      candidate.level === level &&
      (STUDENTS_BY_CLASS[candidate.id] ?? []).some((student) => student.nis === nis),
  )
  if (!room) return null
  const student = (STUDENTS_BY_CLASS[room.id] ?? []).find((s) => s.nis === nis)
  if (!student) return null

  const chapters = CHAPTER_KEYS.map((key, index) => ({
    label: `Kapitel ${index + 1}`,
    score: CHAPTER_SCORES[room.id]?.[nis]?.[key] ?? null,
  }))
  const exams = examColumnsFor(level).map((exam) => ({
    label: exam.label,
    score: EXAM_SCORES[room.id]?.[nis]?.[exam.key] ?? null,
  }))
  const baseCount = BASE_EXAMS.length
  const recorded = SESSIONS_RECORDED[nis] ?? 0
  const attendanceRate = ATTENDANCE_BY_STUDENT[nis] ?? 0

  return {
    nis,
    name: student.name,
    className: room.name,
    branch: BRANCH_BY_CLASS[room.id] ?? "-",
    teacher: TEACHER_BY_CLASS[room.id] ?? "-",
    level,
    chapters,
    chapterAverage: average(chapters.map((c) => c.score)),
    exams: exams.slice(0, baseCount),
    simulations: exams.slice(baseCount),
    examAverage: average(exams.slice(0, baseCount).map((e) => e.score)),
    attitude: ATTITUDE_ASPECTS.map((aspect) => ({
      label: aspect.label,
      grade: ATTITUDE_SCORES[room.id]?.[nis]?.[aspect.key] ?? null,
    })),
    attendanceRate,
    present: Math.round(attendanceRate * recorded),
    recorded,
    note: NOTES[room.id]?.[nis] ?? EMPTY_NOTE,
  }
}

export const isPassing = (report: ReportCard): boolean =>
  report.examAverage !== null && report.examAverage >= KKM

export const chaptersAboveKkm = (report: ReportCard): number =>
  report.chapters.filter((c) => c.score !== null && c.score >= KKM).length

export const finalRecommendation = (report: ReportCard): string => {
  const decision: Recommendation | null = report.note.recommendation
  if (decision === null) return "Belum diputuskan"
  if (decision !== "Naik Level") return decision
  const next = NEXT_LEVEL[report.level]
  return next ? `Naik Level ${report.level} ke ${next}` : `Lulus Level ${report.level}`
}

export const RECOMMENDATION_TONE: Readonly<Record<Recommendation, string>> = {
  "Naik Level": "badge-success",
  "Perlu Remedial": "badge-warning",
  "Tidak Naik": "badge-danger",
}

export const ATTITUDE_TONE: Readonly<Record<AttitudeGrade, string>> = {
  BS: "badge-success",
  B: "badge-info",
  C: "badge-warning",
  PB: "badge-danger",
}

export const fileName = (report: ReportCard): string =>
  `${PERIOD.endMonth} - ${PERIOD.year} - Raport - ${report.name}`

const PERCENT = new Intl.NumberFormat("id-ID", { style: "percent", maximumFractionDigits: 2 })

export const formatAttendance = (ratio: number): string => PERCENT.format(ratio)
