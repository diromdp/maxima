import { z } from "zod"

import { PHONE_PATTERN, PHONE_RULE } from "@/src/components/ui/PhoneInput"

type Reference = { id: string; name: string }

export type StudentStatus = "Aktif" | "Cuti" | "Alumni" | "Mengundurkan Diri" | "Selesai Kursus"

export const STUDENT_STATUSES: readonly StudentStatus[] = [
  "Aktif",
  "Cuti",
  "Alumni",
  "Selesai Kursus",
  "Mengundurkan Diri",
]

// Calon yang sudah mengirim pendaftaran tetapi DP-nya belum berlaku, jadi belum ber-NIS.
export const CANDIDATE_STATUS = "Tidak Aktif"

export type StudentListStatus = StudentStatus | typeof CANDIDATE_STATUS

export const STATUS_BADGE: Readonly<Record<StudentListStatus, string>> = {
  [CANDIDATE_STATUS]: "badge-terkunci",
  Aktif: "badge-beres",
  Cuti: "badge-terbuka",
  Alumni: "badge-terkunci",
  "Selesai Kursus": "badge-terkunci",
  "Mengundurkan Diri": "badge-tindakan",
}

export const FUNNEL_STAGES = ["Prospek", "Belajar", "Pemberkasan", "Cari Mitra", "Visa", "Alumni"]

export const stageLabel = (stage: string) => `Fase ${FUNNEL_STAGES.indexOf(stage) + 1} ${stage}`

export type StudentListRow = {
  id: string
  nis: string | null
  name: string
  contractNumber: string | null
  branch: Reference
  program: Reference | null
  package: Reference | null
  status: StudentListStatus
  level: Reference | null
  pic: Reference | null
  completeness: "Lengkap" | "Kurang"
}

export type StudentTab = "identity" | "finance" | "academic" | "documents" | "admission" | "history"

export type IdentityValues = Record<IdentityField, string | number | null>

export type StudentDetail = StudentListRow & {
  nis: string
  status: StudentStatus
  stage: string | null
  enrolledAt: string
  tabs: StudentTab[]
  missingFields: string[]
  identity: IdentityValues
}

export type StudentFilterOptions = {
  branches: Reference[]
  programs: Reference[]
  majors: Reference[]
  levels: Reference[]
  packages: Reference[]
  pics: Reference[]
  leadSources: Reference[]
}

export const STUDENT_FILTERS = [
  "branch",
  "program",
  "major",
  "status",
  "level",
  "package",
  "pic",
  "leadSource",
  "stage",
  "hasNis",
] as const

export type PaymentRow = {
  id: string
  paidOn: string
  kind: "Pembayaran" | "Dana Talang"
  method: string
  amount: number
  currency: "IDR" | "EUR"
  status: "Otomatis" | "Menunggu" | "Disahkan" | "Ditolak"
  sequence: number | null
  isDownPayment: boolean
}

export type GateStatus = "Belum Terbuka" | "Terbuka" | "Dikerjakan" | "Selesai"

export type StudentFinance = {
  totals: {
    finalPriceIdr: number
    paidIdr: number
    remainingIdr: number
    overpaidIdr: number
    monthlyIdr: number | null
  }
  rupiah: PaymentRow[]
  euro: {
    serviceFeeEurCents: number | null
    paidEurCents: number
    remainingEurCents: number | null
    pendingEurCents: number
    rows: PaymentRow[]
  }
  gates: {
    code: string
    name: string
    status: GateStatus
    thresholdIdr: number
    shortfallIdr: number
  }[]
}

export type LevelState = "Lulus" | "Berjalan" | "Sudah diikuti" | "Terkunci" | "Belum mulai"

export type StudentAcademic = {
  class: { name: string; schedule: string; teacher: string | null } | null
  currentLevel: { id: string; name: string; code: string; chapter: number | null } | null
  levels: {
    level: { id: string; name: string; code: string }
    state: LevelState
    finalScore: number | null
    chapter: number | null
    shortfallIdr: number | null
    chapters: {
      kkm: number | null
      rows: { chapter: number; score: number | null; status: string | null }[]
    } | null
  }[]
  attendance: { present: number; recorded: number; percent: number | null }
  certificates: {
    id: string
    kind: Reference
    level: Reference
    status: "Berlaku" | "Kedaluwarsa"
    verification: string
    hasFile: boolean
  }[]
  reportCards: {
    id: string
    level: string
    period: string
    issuedAt: string
    sentAt: string | null
  }[]
}

export type DocumentState =
  "Perlu Verifikasi" | "Lengkap" | "Ditolak" | "Diproses" | "Belum Diunggah"

export type StudentDocuments = {
  groups: {
    group: "Pribadi" | "Hasil Layanan" | "Bewerbung" | "Dari Betrieb"
    complete: number
    total: number
    items: {
      code: string | null
      name: string
      state: DocumentState
      isOptional: boolean
      objectKey: string | null
      originalName: string | null
      uploadedAt: string | null
    }[]
  }[]
}

export type StudentAdmission = {
  applications: {
    id: string
    partner: Reference
    position: string | null
    status: string
    appliedOn: string
    partnerNote: string | null
    admissionNote: string | null
  }[]
  activeApplications: number
  practices: {
    id: string
    position: string | null
    date: string
    trainer: Reference | null
    status: "Dijadwalkan" | "Selesai" | "Dibatalkan"
    result: "Siap" | "Latihan Lagi" | null
  }[]
  services: {
    code: string
    name: string
    status: GateStatus
    steps: { step: number; name: string; state: Exclude<GateStatus, "Terbuka"> }[] | null
  }[]
  placement: {
    status: string
    visaStatus: string
    values: Record<string, string | null>
  } | null
  admissionEmail: string | null
}

export type StudentHistory = {
  statusChanges: {
    id: string
    fromStatus: StudentStatus | null
    toStatus: StudentStatus
    effectiveAt: string
    reason: string | null
    hasEvidence: boolean
    changedBy: string | null
    at: string
  }[]
  activities: { action: string; at: string; actor: string | null }[]
}

export type ChangeRequest = {
  id: string
  fieldLabel: string
  currentValue: string | null
  proposedValue: string
  status: "Menunggu" | "Disetujui" | "Ditolak"
  reason: string | null
  decisionReason: string | null
  hasEvidence: boolean
  decidedBy: string | null
  decidedAt: string | null
  createdAt: string
}

type InputKind = "text" | "textarea" | "date" | "number" | "anrede" | "gender" | "phone"

type FieldRule = {
  max?: number
  pattern?: [RegExp, string]
  isEmail?: boolean
  range?: [number, number]
}

export type IdentityFieldSpec = { key: IdentityField; label: string; input: InputKind } & FieldRule

export type IdentityField =
  | "fullName"
  | "anrede"
  | "nik"
  | "gender"
  | "birthPlace"
  | "birthDate"
  | "heightCm"
  | "weightKg"
  | "phonePersonal"
  | "whatsapp"
  | "email"
  | "phoneMother"
  | "phoneFather"
  | "address"
  | "village"
  | "district"
  | "city"
  | "province"
  | "postalCode"
  | "emergencyContact"
  | "emergencyContactPhone"
  | "lastEducationLevel"
  | "schoolName"
  | "schoolMajor"
  | "graduationYear"
  | "averageGrade"
  | "germanLevel"
  | "workExperience"

const PHONE: FieldRule = { pattern: [PHONE_PATTERN, PHONE_RULE] }

export const IDENTITY_PANELS: readonly {
  id: string
  title: string
  fields: IdentityFieldSpec[]
}[] = [
  {
    id: "personal",
    title: "Data Diri",
    fields: [
      { key: "fullName", label: "Nama Lengkap", input: "text", max: 120 },
      { key: "anrede", label: "Panggilan", input: "anrede" },
      {
        key: "nik",
        label: "NIK",
        input: "text",
        pattern: [/^\d{16}$/, "NIK harus 16 digit angka."],
      },
      { key: "gender", label: "Jenis Kelamin", input: "gender" },
      { key: "birthPlace", label: "Tempat Lahir", input: "text", max: 80 },
      { key: "birthDate", label: "Tanggal Lahir", input: "date" },
      { key: "heightCm", label: "Tinggi Badan (cm)", input: "number", range: [50, 250] },
      { key: "weightKg", label: "Berat Badan (kg)", input: "number", range: [20, 250] },
    ],
  },
  {
    id: "education",
    title: "Pendidikan",
    fields: [
      { key: "lastEducationLevel", label: "Jenjang", input: "text", max: 40 },
      { key: "schoolName", label: "Asal Sekolah", input: "text", max: 120 },
      { key: "schoolMajor", label: "Jurusan", input: "text", max: 120 },
      {
        key: "graduationYear",
        label: "Tahun Lulus",
        input: "text",
        pattern: [/^\d{4}$/, "Tahun lulus harus empat digit."],
      },
      { key: "averageGrade", label: "Nilai Rata-rata", input: "text", max: 10 },
      { key: "germanLevel", label: "Kemampuan Bahasa Jerman", input: "text", max: 20 },
      { key: "workExperience", label: "Pengalaman Kerja", input: "textarea", max: 1000 },
    ],
  },
  {
    id: "contact",
    title: "Kontak",
    fields: [
      { key: "phonePersonal", label: "No HP Pribadi", input: "phone", ...PHONE },
      { key: "whatsapp", label: "No WhatsApp", input: "phone", ...PHONE },
      { key: "email", label: "Email", input: "text", isEmail: true },
      { key: "phoneMother", label: "No HP Ibu", input: "phone", ...PHONE },
      { key: "phoneFather", label: "No HP Ayah", input: "phone", ...PHONE },
      { key: "emergencyContact", label: "Kontak Darurat", input: "text", max: 120 },
      { key: "emergencyContactPhone", label: "No HP Kontak Darurat", input: "phone", ...PHONE },
    ],
  },
  {
    id: "address",
    title: "Alamat",
    fields: [
      { key: "address", label: "Alamat Lengkap", input: "textarea", max: 300 },
      { key: "village", label: "Kelurahan", input: "text", max: 80 },
      { key: "district", label: "Kecamatan", input: "text", max: 80 },
      { key: "city", label: "Kota", input: "text", max: 80 },
      { key: "province", label: "Provinsi", input: "text", max: 80 },
      { key: "postalCode", label: "Kode Pos", input: "text", max: 10 },
    ],
  },
]

function ruleOf(field: IdentityFieldSpec): z.ZodType<string | null> {
  if (field.key === "fullName") return z.string().trim().min(1, "Isi nama lengkap.").max(120)
  return textRuleOf(field).nullable()
}

export function textRuleOf(field: IdentityFieldSpec): z.ZodType<string> {
  const text = z.string().trim()
  if (field.isEmail)
    return z.union([z.literal(""), text.pipe(z.email("Format email tidak valid."))])
  if (field.pattern) return z.union([z.literal(""), text.regex(...field.pattern)])
  if (field.range) {
    const [min, max] = field.range
    return text.refine(
      (value) =>
        value === "" ||
        (Number.isInteger(Number(value)) && Number(value) >= min && Number(value) <= max),
      `Isi angka bulat ${min} sampai ${max}.`,
    )
  }
  return text.max(field.max ?? 120, `Paling banyak ${field.max ?? 120} karakter.`)
}

export const identityFormSchema = (fields: readonly IdentityFieldSpec[]) =>
  z.object(Object.fromEntries(fields.map((field) => [field.key, ruleOf(field)])))

export type IdentityForm = Record<string, string | null>

export const changeStatusFormSchema = z.object({
  status: z.enum(["Aktif", "Cuti", "Mengundurkan Diri", "Selesai Kursus"], "Pilih status baru."),
  effectiveAt: z.iso.date("Pilih tanggal berlaku."),
  reason: z.string().trim().min(1, "Alasan wajib diisi.").max(1000),
})

export type ChangeStatusForm = z.infer<typeof changeStatusFormSchema>

export const rejectFormSchema = z.object({
  reason: z.string().trim().min(1, "Tulis alasan penolakannya.").max(1000),
})

export type RejectForm = z.infer<typeof rejectFormSchema>

export const activeLetterFormSchema = z.object({
  subject: z.string().trim().min(1, "Perihal wajib diisi.").max(160),
  purpose: z
    .string()
    .trim()
    .min(
      3,
      "Tulis untuk keperluan apa surat ini diterbitkan, misalnya persyaratan administrasi KP4.",
    )
    .max(200),
})

export type ActiveLetterForm = z.infer<typeof activeLetterFormSchema>
