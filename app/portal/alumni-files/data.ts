// ─── Pemberkasan Alumni (layar 7) ────────────────────────────────────────────
// Seluruh isian di halaman ini usulan siswa sampai Admission memverifikasi.
// Yang menyalakan status Alumni adalah tanggal versi Admission.

/** 7.1 — terisi otomatis dari data siswa; hanya Jurusan Program yang diketik. */
export const PROFILE = {
  email: "andi.nugroho@email.com",
  salutation: "Herr",
  fullName: "Andi Nugroho",
  branch: "Bandung",
  program: "Ausbildung",
} as const

export type ContractVisa = {
  major: string
  departureDate: string | null
  contractStart: string | null
  contractEnd: string | null
  cityState: string
  company: string
  visaApplied: string | null
  visaInterview: string | null
  visaIssued: string | null
  visaValidity: string
  school: string
}

export const EMPTY_FORM: ContractVisa = {
  major: "",
  departureDate: null,
  contractStart: null,
  contractEnd: null,
  cityState: "",
  company: "",
  visaApplied: null,
  visaInterview: null,
  visaIssued: null,
  visaValidity: "",
  school: "",
}

/** Draf tersimpan di peramban sampai backend ada — satu kunci per siswa. */
export const DRAFT_KEY = "maxima.alumni-files.draft"

/** 7.4 — PDF/JPG/PNG, maksimal 10 MB per berkas (PRD). */
export const UPLOAD_MAX_BYTES = 10 * 1024 * 1024
export const UPLOAD_MIME = ["application/pdf", "image/jpeg", "image/png"] as const

/** Keadaan pengajuan halaman ini. Belum ada backend: draf lokal atau terkirim. */
export type SubmissionState = "draft" | "submitted"
