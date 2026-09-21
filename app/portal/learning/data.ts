import { idr, type Money } from "@/src/lib/money"

export const CLASS_INFO = {
  name: "Kelas Berlin",
  schedule: "Senin dan Rabu 08.00 sampai 12.00",
  teacher: "Mulyadi, S.Pd",
} as const

export const KKM = 80

export type LevelState =
  | { readonly kind: "lulus"; readonly finalScore: number }
  | { readonly kind: "berjalan"; readonly chapter: number; readonly totalChapters: number }
  | { readonly kind: "terkunci"; readonly needed: Money }
  | { readonly kind: "belum" }

export type LevelCard = {
  readonly level: string
  readonly state: LevelState
}

export const LEVELS: readonly LevelCard[] = [
  { level: "A1", state: { kind: "lulus", finalScore: 82 } },
  { level: "A2", state: { kind: "berjalan", chapter: 7, totalChapters: 12 } },
  { level: "B1", state: { kind: "terkunci", needed: idr(22_000_000) } },
  { level: "B2", state: { kind: "terkunci", needed: idr(28_000_000) } },
]

export type ChapterStatus = "Tuntas" | "Remedial" | "Berjalan"

export type ChapterRow = {
  readonly chapter: string
  readonly material: string
  readonly score: number | null
  readonly status: ChapterStatus
}

export const ATTENDANCE = {
  period: "Agustus 2025",
  hadir: 18,
  izin: 1,
  sakit: 1,
  alpha: 0,
} as const

// ─── Rapor per level ─────────────────────────────────────────────────────────
// Satu rapor per level, susunannya mengikuti berkas rapor Bandung (Laporan
// Hasil Belajar Siswa): nilai per bab, ujian, deskripsi belajar, sepuluh aspek
// sikap, presensi, catatan pengajar, dua penanda tangan. Kop surat tidak ikut.
// Level terkunci tidak punya rapor — `null`, dan pilihannya mati di dropdown.

export const RUNNING_LEVEL = "A2"

/** Skala sikap rapor. Huruf tanpa katanya bukan nilai. */
export type AttitudeGrade = "BS" | "B" | "C" | "PB"

export const ATTITUDE_GRADE: Readonly<Record<AttitudeGrade, { label: string; tone: string }>> = {
  BS: { label: "Baik Sekali", tone: "beres" },
  B: { label: "Baik", tone: "terbuka" },
  C: { label: "Cukup", tone: "berjalan" },
  PB: { label: "Perlu Bimbingan", tone: "tindakan" },
}

export type ExamRow = {
  readonly exam: string
  /** `null` = belum diujikan pada periode ini. */
  readonly score: number | null
}

export type AttitudeRow = {
  readonly aspect: string
  readonly grade: AttitudeGrade
}

export type Report = {
  readonly level: string
  readonly period: string
  readonly teacher: string
  readonly place: string
  readonly downloadHref: string
  readonly chapters: readonly ChapterRow[]
  readonly exams: readonly ExamRow[]
  readonly description: string
  readonly attitudes: readonly AttitudeRow[]
  /** Presensi periode rapor, 0-1. Beda dari `ATTENDANCE` yang bulan berjalan. */
  readonly attendanceRate: number
  readonly teacherNote: string
  readonly signatures: readonly { readonly role: string; readonly name: string }[]
}

const EXAMS = [
  "Großtest",
  "Endtest Lesen",
  "Endtest Hören",
  "Endtest Schreiben",
  "Endtest Sprechen",
]
const ASPECTS = [
  "Disiplin",
  "Tanggung Jawab",
  "Keaktifan",
  "Kemandirian",
  "Kerja Sama",
  "Komunikasi",
  "Sopan Santun",
  "Motivasi Belajar",
  "Kejujuran",
  "Percaya Diri",
]
const SIGNATURES = [
  { role: "Pengajar", name: "Mulyadi, S.Pd" },
  { role: "Kepala Pengajaran", name: "Yoshi Tiara Novianne, S.Pd" },
] as const

const A1_MATERIALS = [
  "Guten Tag",
  "Freunde, Kollegen und ich",
  "In der Stadt",
  "Guten Appetit",
  "Tag für Tag",
  "Zeit mit Freunden",
  "Kontakte",
  "Meine Wohnung",
  "Alles Arbeit",
  "Kleidung und Wetter",
  "Gesundheit",
  "Reisen und Verkehr",
]
const A1_SCORES = [78, 78, 93, 91, 93, 100, 91, 93, 86, 70, 93, 88]

/** Rapor per level. Urutan kunci = urutan level di `LEVELS`. */
export const REPORTS: Readonly<Record<string, Report | null>> = {
  A1: {
    level: "A1",
    period: "Juli 2026",
    teacher: "Mulyadi, S.Pd",
    place: "Maxima Bandung",
    downloadHref: "#",
    chapters: A1_MATERIALS.map((material, i) => ({
      chapter: `Bab ${i + 1}`,
      material,
      score: A1_SCORES[i],
      status: A1_SCORES[i] >= KKM ? "Tuntas" : "Remedial",
    })),
    exams: [82, 80, 85, 78, 84].map((score, i) => ({ exam: EXAMS[i], score })),
    description: "Siswa aktif bertanya, meski sering lupa Grammatik atau kosa kata. Rajin masuk.",
    attitudes: (["BS", "BS", "BS", "B", "B", "BS", "B", "BS", "B", "B"] as const).map(
      (grade, i) => ({ aspect: ASPECTS[i], grade }),
    ),
    attendanceRate: 0.8333,
    teacherNote: "Tetap rajin dan aktif di kelas. Semangat terus belajarnya.",
    signatures: SIGNATURES,
  },
  A2: {
    level: "A2",
    period: "Agustus 2026",
    teacher: "Mulyadi, S.Pd",
    place: "Maxima Bandung",
    downloadHref: "#",
    chapters: [
      { chapter: "Bab 1", material: "Kennenlernen", score: 84, status: "Tuntas" },
      { chapter: "Bab 2", material: "Familie und Freunde", score: 78, status: "Tuntas" },
      { chapter: "Bab 3", material: "Essen und Trinken", score: 66, status: "Remedial" },
      { chapter: "Bab 4", material: "Wohnen", score: 81, status: "Tuntas" },
      { chapter: "Bab 5", material: "Arbeit und Beruf", score: 75, status: "Tuntas" },
      { chapter: "Bab 6", material: "Gesundheit", score: 72, status: "Tuntas" },
      { chapter: "Bab 7", material: "Reisen", score: null, status: "Berjalan" },
    ],
    exams: [78, null, null, null, null].map((score, i) => ({ exam: EXAMS[i], score })),
    description: "Mulai lancar bercakap, masih perlu latihan Schreiben.",
    attitudes: (["BS", "B", "BS", "B", "B", "BS", "B", "BS", "B", "C"] as const).map(
      (grade, i) => ({ aspect: ASPECTS[i], grade }),
    ),
    attendanceRate: 0.9,
    teacherNote: "Pertahankan kehadiran. Perbanyak latihan menulis di rumah.",
    signatures: SIGNATURES,
  },
  B1: null,
  B2: null,
}
