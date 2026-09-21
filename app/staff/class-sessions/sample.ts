export const ATTENDANCE_STATUSES = ["Hadir", "Izin", "Sakit", "Alpha", "Terlambat"] as const
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number]

export const ATTENDANCE_BADGE: Readonly<Record<AttendanceStatus, string>> = {
  Hadir: "badge-beres",
  Izin: "badge-berjalan",
  Sakit: "badge-berjalan",
  Alpha: "badge-tindakan",
  Terlambat: "badge-tindakan",
}

export const CHAPTER_COMPLETIONS = ["Selesai Sempurna", "Selesai Sebagian"] as const
export type ChapterCompletion = (typeof CHAPTER_COMPLETIONS)[number]

export const LEARNING_STATUSES = [
  "Lebih Cepat dari Target",
  "Berjalan Sesuai Target",
  "Tertinggal dari Target",
] as const
export type LearningStatus = (typeof LEARNING_STATUSES)[number]

export const CHAPTERS = Array.from({ length: 10 }, (_, index) => `Kapitel ${index + 1}`)

export type SessionClass = {
  readonly id: string
  readonly name: string
  readonly level: string
  readonly branch: string
  readonly teacher: string
  readonly startTime: string
  readonly endTime: string
  readonly enrolled: number
}

export const CLASSES: readonly SessionClass[] = [
  {
    id: "berlin",
    name: "Kelas Berlin",
    level: "A2",
    branch: "Bandung",
    teacher: "Mulyadi, S.Pd",
    startTime: "08:00",
    endTime: "12:00",
    enrolled: 20,
  },
  {
    id: "muenchen",
    name: "Kelas München",
    level: "B1",
    branch: "Jakarta",
    teacher: "Taufik Hidayat",
    startTime: "13:00",
    endTime: "17:00",
    enrolled: 15,
  },
  {
    id: "hamburg",
    name: "Kelas Hamburg",
    level: "A1",
    branch: "Surabaya",
    teacher: "Rina Kumala",
    startTime: "13:00",
    endTime: "17:00",
    enrolled: 20,
  },
]

export const classLabel = (room: SessionClass) => `${room.name} (${room.level})`

export const studyHoursLabel = (room: SessionClass) => `${room.startTime}-${room.endTime}`

export type SessionStudent = {
  readonly nis: string
  readonly name: string
}

export const STUDENTS_BY_CLASS: Readonly<Record<string, readonly SessionStudent[]>> = {
  berlin: [
    { nis: "2026001", name: "Andi Nugroho" },
    { nis: "2026002", name: "Rina Agustina" },
    { nis: "2026003", name: "Bayu Saputra" },
    { nis: "2026004", name: "Siti Rohmah" },
    { nis: "2026005", name: "Nadia Putri" },
    { nis: "2026006", name: "Fajar Nugraha" },
    { nis: "2026007", name: "Dewi Lestari" },
    { nis: "2026008", name: "Rizky Ramadhan" },
    { nis: "2026009", name: "Lia Handayani" },
    { nis: "2026010", name: "Yoga Pratama" },
    { nis: "2026011", name: "Ratna Sari" },
    { nis: "2026012", name: "Hendra Wijaya" },
    { nis: "2026013", name: "Siti Rahma" },
    { nis: "2026014", name: "Ika Pasti" },
    { nis: "2026015", name: "Dimas Prasetyo" },
    { nis: "2026016", name: "Putri Ayu" },
    { nis: "2026017", name: "Agus Santoso" },
    { nis: "2026018", name: "Maya Kartika" },
    { nis: "2026019", name: "Reza Firmansyah" },
    { nis: "2026020", name: "Wulan Safitri" },
  ],
  muenchen: [
    { nis: "2026021", name: "Taufik Rahman" },
    { nis: "2026022", name: "Sari Dewi" },
  ],
  hamburg: [],
}

export type SessionProgress = {
  readonly chapter: string
  readonly completion: ChapterCompletion
  readonly learningStatus: LearningStatus
  readonly nextChapter: string
}

export type SessionRecord = {
  readonly attendance: Readonly<Record<string, AttendanceStatus>>
  readonly progress: SessionProgress
  readonly notes: string
  readonly savedAt: string
  readonly savedBy: string
}

export type ClassSession = {
  readonly id: string
  readonly date: string
  readonly classId: string
  readonly record?: SessionRecord
}

export const SESSIONS: readonly ClassSession[] = [
  { id: "berlin-2026-09-09", date: "2026-09-09", classId: "berlin" },
  { id: "muenchen-2026-09-10", date: "2026-09-10", classId: "muenchen" },
  {
    id: "berlin-2026-09-14",
    date: "2026-09-14",
    classId: "berlin",
    record: {
      attendance: {
        "2026001": "Hadir",
        "2026002": "Izin",
        "2026003": "Hadir",
        "2026004": "Sakit",
        "2026005": "Hadir",
        "2026006": "Hadir",
        "2026007": "Hadir",
        "2026008": "Hadir",
        "2026009": "Hadir",
        "2026010": "Hadir",
        "2026011": "Hadir",
        "2026012": "Hadir",
        "2026013": "Hadir",
        "2026014": "Hadir",
        "2026015": "Hadir",
        "2026016": "Hadir",
        "2026017": "Hadir",
        "2026018": "Hadir",
        "2026019": "Hadir",
        "2026020": "Hadir",
      },
      progress: {
        chapter: "Kapitel 4",
        completion: "Selesai Sempurna",
        learningStatus: "Berjalan Sesuai Target",
        nextChapter: "Siap untuk Bab 5 (Besok)",
      },
      notes:
        "Siswa secara keseluruhan memahami materi Akkusativ & Dativ pada Bab 4. Rina Agustina izin karena ujian remedial. Perlu latihan tambahan lisan (Sprechen) di awal sesi berikutnya.",
      savedAt: "2026-09-14T12:40:00+07:00",
      savedBy: "Mulyadi, S.Pd",
    },
  },
  { id: "hamburg-2026-09-14", date: "2026-09-14", classId: "hamburg" },
]

export const SESSION_DATES = [...new Set(SESSIONS.map((session) => session.date))].sort()

export const DEFAULT_DATE = SESSION_DATES[SESSION_DATES.length - 1]

export const sessionsOn = (date: string) => SESSIONS.filter((session) => session.date === date)

export const currentMaterial = (classId: string, date: string) =>
  SESSIONS.filter(
    (session) => session.classId === classId && session.date <= date && session.record,
  )
    .map((session) => session.record?.progress.chapter)
    .at(-1)
