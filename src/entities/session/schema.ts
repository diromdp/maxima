import type { Ref } from "@/src/entities/class/schema"

export const ATTENDANCE_STATUSES = ["Hadir", "Izin", "Sakit", "Alpha", "Terlambat"] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const CHAPTER_COMPLETIONS = ["Selesai Sempurna", "Selesai Sebagian"] as const
export type ChapterCompletion = (typeof CHAPTER_COMPLETIONS)[number]

export const LEARNING_STATUSES = [
  "Lebih Cepat dari Target",
  "Berjalan Sesuai Target",
  "Tertinggal dari Target",
] as const
export type LearningStatus = (typeof LEARNING_STATUSES)[number]

export const CHAPTERS = Array.from({ length: 12 }, (_, index) => `Kapitel ${index + 1}`)

export type SessionOnDate = {
  readonly sessionId: string
  readonly classId: string
  readonly className: string
  readonly level: Ref
}

export type SessionStudent = {
  readonly studentId: string
  readonly nis: string | null
  readonly name: string
  readonly status: AttendanceStatus | null
}

export type SessionProgress = {
  chapter: string | null
  completion: ChapterCompletion | null
  learningStatus: LearningStatus | null
  nextChapter: string | null
}

export type SessionDetail = {
  readonly id: string
  readonly date: string
  readonly class: Ref
  readonly level: Ref
  readonly studyHours: string
  readonly currentChapter: string | null
  readonly studentCount: number
  readonly missingCount: number
  readonly students: readonly SessionStudent[]
  readonly progress: SessionProgress
  readonly note: string | null
  readonly savedBy: Ref | null
  readonly savedAt: string | null
  readonly canFill: boolean
}

export type SessionInput = SessionProgress & {
  lastSavedAt: string | null
  attendances: { studentId: string; status: AttendanceStatus }[]
  note: string | null
}

const JAKARTA_DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Jakarta" })

export const jakartaToday = () => JAKARTA_DATE.format(new Date())

export const monthOf = (date: string) => date.slice(0, 7)
