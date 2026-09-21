import {
  type Branch,
  CLASSES,
  type ClassRoom,
  DEFAULT_KKM,
  type Level,
  LOW_ATTENDANCE,
  MEMBERS_BY_CLASS,
  type MemberStatus,
  TEACHERS,
} from "../classes/sample"

export const CHAPTER_COUNT = 12

export type MonitoredStudent = {
  readonly nis: string
  readonly name: string
  readonly classId: string
  readonly attendance: number
  readonly averageScore: number
  readonly chapter: number
  readonly examAverage: number | null
  readonly status: MemberStatus
}

const student = (
  nis: string,
  name: string,
  classId: string,
  attendance: number,
  averageScore: number,
  chapter: number,
  examAverage: number | null,
  status: MemberStatus = "Aktif",
): MonitoredStudent => ({
  nis,
  name,
  classId,
  attendance,
  averageScore,
  chapter,
  examAverage,
  status,
})

const EXAM_BY_NIS: Readonly<Record<string, number | null>> = {
  "2026001": 86,
  "2026002": 80,
  "2026003": 85,
  "2026004": 70,
  "2026005": 94,
  "2026006": null,
  "2026007": 97,
  "2026008": 65,
}

const fromMembers = (classId: string): readonly MonitoredStudent[] =>
  (MEMBERS_BY_CLASS[classId] ?? []).map((member) =>
    student(
      member.nis,
      member.name,
      classId,
      member.attendance,
      member.averageScore,
      Number(member.lastChapter.replace(/\D/g, "")),
      EXAM_BY_NIS[member.nis] ?? null,
      member.status,
    ),
  )

export const STUDENTS: readonly MonitoredStudent[] = [
  ...fromMembers("berlin"),
  student("2026021", "Taufik Rahman", "muenchen", 0.9, 82, 10, 84),
  student("2026022", "Sari Dewi", "muenchen", 0.88, 79, 10, 81),
  student("2026023", "Rina Aprilia", "muenchen", 0.72, 66.4, 4, 70),
  student("2026024", "Michael Tanoso", "muenchen", 0.95, 88, 9, 90),
  student("2026031", "Lukman Hakim", "hamburg", 0.96, 84, 3, null),
  student("2026032", "Putri Ayu", "hamburg", 0.91, 81, 3, null),
  student("2026033", "Dewi Lestari", "hamburg", 0.6, 45.2, 1, 52),
  student("2026034", "Hendra Wijaya", "hamburg", 0.8, 58, 2, 61),
  student("2026041", "Yoga Pratama", "koeln", 0.93, 89, 11, 91),
  student("2026042", "Clara Amalia", "koeln", 0.97, 83.1, 11, 85),
  student("2026043", "Arif Budiman", "koeln", 0.85, 77, 10, 79, "Cuti"),
]

export const CLASS_CHAPTER: Readonly<Record<string, number>> = {
  berlin: 6,
  muenchen: 10,
  hamburg: 3,
  koeln: 11,
  frankfurt: 0,
}

export const SESSIONS_BY_TEACHER: Readonly<
  Record<string, { readonly scheduled: number; readonly recorded: number }>
> = {
  "Mulyadi, S.Pd": { scheduled: 40, recorded: 40 },
  "Taufik Hidayat": { scheduled: 24, recorded: 21 },
  "Rina Kumala": { scheduled: 18, recorded: 14 },
  "Andi Wijaya": { scheduled: 0, recorded: 0 },
}

export const LAGGING_CHAPTERS = 2

export const RISKS = [
  "Kehadiran Rendah",
  "Nilai Rendah",
  "Progres Tertinggal",
  "Gagal Evaluasi",
] as const
export type Risk = (typeof RISKS)[number]

export const RISK_BADGE: Readonly<Record<Risk, string>> = {
  "Kehadiran Rendah": "badge-danger",
  "Nilai Rendah": "badge-danger",
  "Progres Tertinggal": "badge-warning",
  "Gagal Evaluasi": "badge-danger",
}

export const classOf = (classId: string): ClassRoom | undefined =>
  CLASSES.find((room) => room.id === classId)

export const risksOf = (row: MonitoredStudent): readonly Risk[] =>
  [
    row.attendance < LOW_ATTENDANCE ? "Kehadiran Rendah" : null,
    row.averageScore < DEFAULT_KKM ? "Nilai Rendah" : null,
    (CLASS_CHAPTER[row.classId] ?? 0) - row.chapter > LAGGING_CHAPTERS
      ? "Progres Tertinggal"
      : null,
    row.examAverage !== null && row.examAverage < DEFAULT_KKM ? "Gagal Evaluasi" : null,
  ].filter((risk): risk is Risk => risk !== null)

export const isMonitored = (row: MonitoredStudent): boolean => row.status === "Aktif"

export const AT_RISK: readonly MonitoredStudent[] = STUDENTS.filter(
  (row) => isMonitored(row) && risksOf(row).length > 0,
)

const mean = (values: readonly number[]): number | null =>
  values.length === 0 ? null : values.reduce((sum, value) => sum + value, 0) / values.length

export type ClassStats = {
  readonly room: ClassRoom
  readonly studentCount: number
  readonly averageScore: number | null
  readonly averageAttendance: number | null
  readonly atRiskCount: number
  readonly chapter: number
}

export const classStats = (room: ClassRoom): ClassStats => {
  const members = STUDENTS.filter((row) => row.classId === room.id && isMonitored(row))
  return {
    room,
    studentCount: members.length,
    averageScore: mean(members.map((row) => row.averageScore)),
    averageAttendance: mean(members.map((row) => row.attendance)),
    atRiskCount: members.filter((row) => risksOf(row).length > 0).length,
    chapter: CLASS_CHAPTER[room.id] ?? 0,
  }
}

export const CLASS_STATS: readonly ClassStats[] = CLASSES.filter(
  (room) => room.status === "Aktif",
).map(classStats)

export type TeacherStats = {
  readonly name: string
  readonly rooms: readonly ClassRoom[]
  readonly studentCount: number
  readonly averageScore: number | null
  readonly passRate: number | null
  readonly attendanceFilled: number | null
  readonly scoresFilled: number | null
}

export const teacherStats = (name: string): TeacherStats => {
  const rooms = CLASSES.filter((room) => room.teacher === name && room.status === "Aktif")
  const ids = new Set(rooms.map((room) => room.id))
  const members = STUDENTS.filter((row) => ids.has(row.classId) && isMonitored(row))
  const sessions = SESSIONS_BY_TEACHER[name]
  return {
    name,
    rooms,
    studentCount: members.length,
    averageScore: mean(members.map((row) => row.averageScore)),
    passRate: mean(members.map((row) => (row.averageScore >= DEFAULT_KKM ? 1 : 0))),
    attendanceFilled:
      sessions && sessions.scheduled > 0 ? sessions.recorded / sessions.scheduled : null,
    scoresFilled: mean(members.map((row) => (row.examAverage !== null ? 1 : 0))),
  }
}

export const TEACHER_STATS: readonly TeacherStats[] = TEACHERS.map(teacherStats)

export const formatAverage = (value: number | null): string =>
  value === null ? "-" : `${Number.isInteger(value) ? value : value.toFixed(1)} / 100`

export const chapterLabel = (chapter: number): string => `Bab ${chapter} / ${CHAPTER_COUNT}`

export const branchOptions = (): readonly Branch[] =>
  Array.from(new Set(CLASSES.map((room) => room.branch)))

export const levelOptions = (): readonly Level[] =>
  Array.from(new Set(CLASSES.map((room) => room.level)))
