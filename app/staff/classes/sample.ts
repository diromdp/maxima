export const LEVELS = ["A1", "A2", "B1", "Persiapan B1", "B2"] as const
export const BRANCHES = ["Bandung", "Jakarta", "Surabaya", "Medan"] as const
export const CLASS_STATUSES = ["Aktif", "Draft"] as const
export const DAYS = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"] as const

export type Level = (typeof LEVELS)[number]
export type Branch = (typeof BRANCHES)[number]
export type ClassStatus = (typeof CLASS_STATUSES)[number]
export type Day = (typeof DAYS)[number]

export type ClassRoom = {
  readonly id: string
  readonly name: string
  readonly level: Level
  readonly branch: Branch
  readonly teacher: string
  readonly enrolled: number
  readonly capacity: number
  readonly days: readonly Day[]
  readonly startTime: string
  readonly endTime: string
  readonly start: string
  readonly end: string
  readonly status: ClassStatus
}

export const CLASSES: readonly ClassRoom[] = [
  {
    id: "berlin",
    name: "Kelas Berlin",
    level: "A2",
    branch: "Bandung",
    teacher: "Mulyadi, S.Pd",
    enrolled: 18,
    capacity: 20,
    days: ["Sen", "Rab"],
    startTime: "08:00",
    endTime: "12:00",
    start: "2026-01-05",
    end: "2026-03-12",
    status: "Aktif",
  },
  {
    id: "muenchen",
    name: "Kelas München",
    level: "B1",
    branch: "Jakarta",
    teacher: "Taufik Hidayat",
    enrolled: 15,
    capacity: 20,
    days: ["Sel", "Kam"],
    startTime: "13:00",
    endTime: "17:00",
    start: "2026-01-06",
    end: "2026-03-20",
    status: "Aktif",
  },
  {
    id: "hamburg",
    name: "Kelas Hamburg",
    level: "A1",
    branch: "Surabaya",
    teacher: "Rina Kumala",
    enrolled: 20,
    capacity: 20,
    days: ["Sen", "Rab"],
    startTime: "13:00",
    endTime: "17:00",
    start: "2026-02-02",
    end: "2026-04-10",
    status: "Aktif",
  },
  {
    id: "koeln",
    name: "Kelas Köln",
    level: "B2",
    branch: "Bandung",
    teacher: "Mulyadi, S.Pd",
    enrolled: 12,
    capacity: 15,
    days: ["Jum", "Sab"],
    startTime: "08:00",
    endTime: "12:00",
    start: "2025-11-10",
    end: "2026-02-15",
    status: "Aktif",
  },
  {
    id: "frankfurt",
    name: "Kelas Frankfurt",
    level: "Persiapan B1",
    branch: "Medan",
    teacher: "Andi Wijaya",
    enrolled: 8,
    capacity: 15,
    days: ["Sel", "Kam"],
    startTime: "08:00",
    endTime: "12:00",
    start: "2026-02-16",
    end: "2026-04-20",
    status: "Draft",
  },
]

export const CLASS_STATUS_BADGE: Readonly<Record<ClassStatus, string>> = {
  Aktif: "badge-beres",
  Draft: "badge-terkunci",
}

export const TEACHERS = ["Mulyadi, S.Pd", "Taufik Hidayat", "Rina Kumala", "Andi Wijaya"] as const

export const classLabel = (room: ClassRoom) => `${room.name} (${room.level})`

export type Schedule = Pick<ClassRoom, "days" | "startTime" | "endTime">

export const sortDays = (days: readonly Day[]) =>
  [...days].sort((left, right) => DAYS.indexOf(left) - DAYS.indexOf(right))

export const scheduleLabel = ({ days, startTime, endTime }: Schedule) =>
  `${sortDays(days).join(" ")} ${startTime}-${endTime}`

export const capacityLabel = (room: ClassRoom) => `${room.enrolled}/${room.capacity}`

export const isFull = (room: ClassRoom) => room.enrolled >= room.capacity

export type MemberStatus = "Aktif" | "Cuti" | "Keluar"

export type ClassMember = {
  readonly nis: string
  readonly name: string
  readonly attendance: number
  readonly averageScore: number
  readonly lastChapter: string
  readonly status: MemberStatus
}

const member = (
  nis: string,
  name: string,
  attendance: number,
  averageScore: number,
  lastChapter: number,
  status: MemberStatus,
): ClassMember => ({
  nis,
  name,
  attendance,
  averageScore,
  lastChapter: `Kapitel ${lastChapter}`,
  status,
})

export const MEMBERS_BY_CLASS: Readonly<Record<string, readonly ClassMember[]>> = {
  berlin: [
    member("2026001", "Andi Nugroho", 0.98, 85, 4, "Aktif"),
    member("2026002", "Rina Agustina", 0.85, 78, 4, "Aktif"),
    member("2026003", "Bayu Saputra", 0.92, 84, 3, "Aktif"),
    member("2026004", "Siti Rohmah", 0.6, 68, 2, "Cuti"),
    member("2026005", "Nadia Putri", 1, 92, 4, "Aktif"),
    member("2026006", "Fajar Nugraha", 0.94, 80, 3, "Aktif"),
    member("2026007", "Dewi Lestari", 1, 95, 4, "Aktif"),
    member("2026008", "Budi Utomo", 0.55, 62, 1, "Keluar"),
  ],
}

export const MEMBER_STATUS_BADGE: Readonly<Record<MemberStatus, string>> = {
  Aktif: "badge-beres",
  Cuti: "badge-berjalan",
  Keluar: "badge-tindakan",
}

export const LOW_ATTENDANCE = 0.75

export type EventKind = "session" | "exam"

export const EVENT_KINDS: readonly {
  readonly kind: EventKind
  readonly label: string
  readonly badge: string
}[] = [
  { kind: "session", label: "Kelas Aktif", badge: "badge-info" },
  { kind: "exam", label: "Ujian", badge: "badge-neutral-solid" },
]

export type CalendarEvent = {
  readonly date: string
  readonly title: string
  readonly kind: EventKind
  readonly classId?: string
}

export const EVENTS: readonly CalendarEvent[] = [
  { date: "2026-09-01", title: "Sesi Kelas Berlin (A2)", kind: "session", classId: "berlin" },
  { date: "2026-09-03", title: "Sesi Kelas München (B1)", kind: "session", classId: "muenchen" },
  { date: "2026-09-08", title: "Sesi Kelas Berlin (A2)", kind: "session", classId: "berlin" },
  { date: "2026-09-09", title: "Ujian Akhir A2", kind: "exam", classId: "berlin" },
]

export const CALENDAR_CLASS_IDS: readonly string[] = ["berlin", "muenchen", "hamburg"]

export const CALENDAR_START = "2026-09-01"

export type CandidateStudent = {
  readonly nis: string
  readonly name: string
  readonly level: Level
  readonly branch: Branch
}

export const CANDIDATE_STUDENTS: readonly CandidateStudent[] = [
  { nis: "20240187", name: "Rizky Ramadhan", level: "A2", branch: "Bandung" },
  { nis: "20240199", name: "Lia Handayani", level: "A1", branch: "Bandung" },
]

export const seatsLeft = (room: ClassRoom) => room.capacity - room.enrolled

export const DEFAULT_KKM = 80

export const KKM_BY_LEVEL: Readonly<Record<Level, number>> = {
  A1: DEFAULT_KKM,
  A2: DEFAULT_KKM,
  B1: DEFAULT_KKM,
  "Persiapan B1": DEFAULT_KKM,
  B2: DEFAULT_KKM,
}

export const activeClassCount = (level: Level) =>
  CLASSES.filter((room) => room.level === level && room.status === "Aktif").length
