export const KKM = 80

export const PERIODS = ["Ganjil 2026", "Genap 2026"] as const

export type Level = "A1" | "A2" | "B1" | "B2"

export type AssessmentClass = {
  readonly id: string
  readonly name: string
  readonly level: Level
}

export const CLASSES: readonly AssessmentClass[] = [
  { id: "berlin", name: "Kelas Berlin", level: "A2" },
  { id: "muenchen", name: "Kelas München", level: "B1" },
]

export const classLabel = (room: AssessmentClass) => `${room.name} (${room.level})`

export type Student = {
  readonly nis: string
  readonly name: string
}

export const STUDENTS_BY_CLASS: Readonly<Record<string, readonly Student[]>> = {
  berlin: [
    { nis: "2026001", name: "Andi Nugroho" },
    { nis: "2026002", name: "Rina Agustina" },
    { nis: "2026003", name: "Bayu Saputra" },
    { nis: "2026004", name: "Siti Rohmah" },
    { nis: "2026005", name: "Nadia Putri" },
    { nis: "2026006", name: "Fajar Nugraha" },
    { nis: "2026007", name: "Dewi Lestari" },
    { nis: "2026008", name: "Budi Utomo" },
  ],
  muenchen: [
    { nis: "2026021", name: "Taufik Rahman" },
    { nis: "2026022", name: "Sari Dewi" },
  ],
}

export type Score = number | null

export type ScoreRow = Readonly<Record<string, Score>>

export type ScoreSheet = Readonly<Record<string, ScoreRow>>

export const CHAPTER_KEYS = Array.from({ length: 12 }, (_, index) => `K${index + 1}`)

const chapters = (values: readonly number[]): ScoreRow =>
  Object.fromEntries(CHAPTER_KEYS.map((key, index) => [key, values[index] ?? null]))

export const CHAPTER_SCORES: Readonly<Record<string, ScoreSheet>> = {
  berlin: {
    "2026001": chapters([78, 78, 93, 91, 93, 100, 91, 93, 86, 70, 93, 88]),
    "2026002": chapters([72, 80, 82, 70, 78, 80, 68, 85, 90, 81, 74, 80]),
    "2026003": chapters([90, 95, 92, 88, 87, 91, 94, 90, 89, 92, 95, 91]),
    "2026004": chapters([90, 82, 80, 84, 76, 80, 82, 80, 85, 83, 80, 82]),
    "2026005": chapters([83, 89, 91, 90, 85, 88, 92, 90, 87, 89, 91, 90]),
  },
  muenchen: {},
}

export type ExamColumn = { readonly key: string; readonly label: string; readonly short: string }

export const BASE_EXAMS: readonly ExamColumn[] = [
  { key: "grosstest", label: "Großtest", short: "Großtest" },
  { key: "lesen", label: "Endtest Lesen", short: "E. Lesen" },
  { key: "hoeren", label: "Endtest Hören", short: "E. Hören" },
  { key: "schreiben", label: "Endtest Schreiben", short: "E. Schreiben" },
  { key: "sprechen", label: "Endtest Sprechen", short: "E. Sprechen" },
]

export const SIMULATION_EXAMS: readonly ExamColumn[] = [
  { key: "sim1", label: "Simulasi 1", short: "Sim. 1" },
  { key: "sim2", label: "Simulasi 2", short: "Sim. 2" },
  { key: "sim3", label: "Simulasi 3", short: "Sim. 3" },
]

export const examColumnsFor = (level: Level): readonly ExamColumn[] =>
  level === "B1" || level === "B2" ? [...BASE_EXAMS, ...SIMULATION_EXAMS] : BASE_EXAMS

const exams = (grosstest: number, endtest: number): ScoreRow => ({
  grosstest,
  lesen: endtest,
  hoeren: grosstest,
  schreiben: endtest,
  sprechen: grosstest,
})

export const EXAM_SCORES: Readonly<Record<string, ScoreSheet>> = {
  berlin: {
    "2026001": exams(85, 88),
    "2026002": exams(78, 82),
    "2026003": exams(84, 86),
    "2026004": exams(68, 72),
    "2026005": exams(92, 95),
    "2026006": exams(80, 84),
    "2026007": exams(95, 98),
    "2026008": exams(62, 68),
  },
  muenchen: {},
}

export const PASS_RULES = [
  `Rata-rata Großtest dan empat Endtest minimal ${KKM} (KKM).`,
  "Siswa Tidak Lulus diarahkan ke Perlu Remedial di tab Deskripsi & Catatan.",
] as const

export const RECOMMENDATIONS = ["Naik Level", "Perlu Remedial", "Tidak Naik"] as const
export type Recommendation = (typeof RECOMMENDATIONS)[number]

export const RECOMMENDATION_BADGE: Readonly<Record<Recommendation, string>> = {
  "Naik Level": "badge-beres",
  "Perlu Remedial": "badge-berjalan",
  "Tidak Naik": "badge-tindakan",
}

export type TeacherNote = {
  readonly description: string
  readonly text: string
  readonly recommendation: Recommendation | null
  readonly updatedAt: string | null
}

export const NOTES: Readonly<Record<string, Readonly<Record<string, TeacherNote>>>> = {
  berlin: {
    "2026001": {
      description: "Siswa aktif bertanya, meski sering lupa Grammatik atau kosa kata. Rajin masuk.",
      text: "Tetap rajin dan aktif di kelas. Semangat terus belajarnya.",
      recommendation: "Naik Level",
      updatedAt: "2026-09-14T12:40:00+07:00",
    },
    "2026002": {
      description: "",
      text: "Rina izin pada sesi 14 September karena ujian remedial. Perlu latihan tambahan lisan (Sprechen) di awal sesi berikutnya.",
      recommendation: "Perlu Remedial",
      updatedAt: "2026-09-14T12:40:00+07:00",
    },
    "2026004": {
      description: "",
      text: "Nilai Großtest dan Endtest di bawah KKM. Perlu remedial sebelum naik level.",
      recommendation: "Perlu Remedial",
      updatedAt: "2026-09-14T12:40:00+07:00",
    },
  },
  muenchen: {},
}

export const EMPTY_NOTE: TeacherNote = {
  description: "",
  text: "",
  recommendation: null,
  updatedAt: null,
}

export const average = (values: readonly Score[]): number | null => {
  const filled = values.filter((value): value is number => value !== null)
  if (filled.length === 0) return null
  return filled.reduce((sum, value) => sum + value, 0) / filled.length
}

export const formatScore = (value: number | null) =>
  value === null ? "-" : Number.isInteger(value) ? String(value) : value.toFixed(1)

export const ATTITUDE_GRADES = ["BS", "B", "C", "PB"] as const
export type AttitudeGrade = (typeof ATTITUDE_GRADES)[number]

export const ATTITUDE_GRADE_LABEL: Readonly<Record<AttitudeGrade, string>> = {
  BS: "Baik Sekali",
  B: "Baik",
  C: "Cukup",
  PB: "Perlu Bimbingan",
}

export const ATTITUDE_ASPECTS = [
  { key: "discipline", label: "Disiplin" },
  { key: "responsibility", label: "Tanggung Jawab" },
  { key: "activeness", label: "Keaktifan" },
  { key: "independence", label: "Kemandirian" },
  { key: "teamwork", label: "Kerja Sama" },
  { key: "communication", label: "Komunikasi" },
  { key: "manners", label: "Sopan Santun" },
  { key: "motivation", label: "Motivasi Belajar" },
  { key: "honesty", label: "Kejujuran" },
  { key: "confidence", label: "Percaya Diri" },
] as const

export type AttitudeSheet = Readonly<Record<string, Readonly<Record<string, AttitudeGrade | null>>>>

const attitude = (
  values: readonly (AttitudeGrade | null)[],
): Readonly<Record<string, AttitudeGrade | null>> =>
  Object.fromEntries(ATTITUDE_ASPECTS.map((aspect, index) => [aspect.key, values[index] ?? null]))

export const ATTITUDE_SCORES: Readonly<Record<string, AttitudeSheet>> = {
  berlin: {
    "2026001": attitude(["BS", "BS", "BS", "B", "B", "BS", "B", "B", "B", "B"]),
    "2026002": attitude(["BS", "BS", "B", null, "BS"]),
    "2026003": attitude(["B", "B", "B", null, "B"]),
    "2026004": attitude(["C", "C", "C", null, "B"]),
    "2026005": attitude(["BS", "BS", "BS", null, "BS"]),
    "2026006": attitude(["B", "BS", "B", null, "BS"]),
    "2026007": attitude(["BS", "BS", "BS", null, "BS"]),
    "2026008": attitude(["C", "PB", "PB", null, "C"]),
  },
  muenchen: {},
}

export const ATTENDANCE_BY_STUDENT: Readonly<Record<string, number>> = {
  "2026001": 0.8333,
  "2026002": 0.85,
  "2026003": 0.92,
  "2026004": 0.6,
  "2026005": 1,
  "2026006": 0.94,
  "2026007": 1,
  "2026008": 0.55,
}

export const LOW_ATTENDANCE = 0.75
