import { z } from "zod"

export type Ref = { readonly id: string; readonly name: string }

export const CERTIFICATE_STATUSES = ["Berlaku", "Kedaluwarsa"] as const
export type CertificateStatus = (typeof CERTIFICATE_STATUSES)[number]

export const CERTIFICATE_STATUS_BADGE: Readonly<Record<CertificateStatus, string>> = {
  Berlaku: "badge-beres",
  Kedaluwarsa: "badge-tindakan",
}

export const VERIFICATION_STATUSES = ["Usulan", "Terverifikasi", "Ditolak"] as const
export type VerificationStatus = (typeof VERIFICATION_STATUSES)[number]

export const VERIFICATION_BADGE: Readonly<Record<VerificationStatus, string>> = {
  Usulan: "badge-berjalan",
  Terverifikasi: "badge-beres",
  Ditolak: "badge-tindakan",
}

export const MODULE_KEYS = ["lesen", "hoeren", "schreiben", "sprechen"] as const
export type ModuleKey = (typeof MODULE_KEYS)[number]

export const MODULE_LABEL: Readonly<Record<ModuleKey, string>> = {
  lesen: "Lesen",
  hoeren: "Hören",
  schreiben: "Schreiben",
  sprechen: "Sprechen",
}

export type CertificateModule = {
  readonly module: string
  readonly score: number | null
  readonly validUntil: string | null
  readonly expired: boolean
}

export type CertificateRow = {
  readonly id: string
  readonly student: { readonly id: string; readonly nis: string | null; readonly name: string }
  readonly kind: Ref
  readonly level: Ref
  readonly modules: readonly CertificateModule[]
  readonly status: CertificateStatus
  readonly verification: VerificationStatus
  readonly rejectReason: string | null
  readonly hasFile: boolean
  readonly proposedByStudent: boolean
  readonly verifiedBy: string | null
  readonly verifiedAt: string | null
}

export type CertificateFilters = {
  readonly levelId?: string
  readonly kindId?: string
  readonly status?: CertificateStatus
  readonly verification?: VerificationStatus
}

export const CERTIFICATE_FILTERS = ["levelId", "kindId", "status", "verification"] as const

export function certificateFiltersOf(params: {
  levelId?: string
  kindId?: string
  status?: string
  verification?: string
}): CertificateFilters {
  return {
    levelId: params.levelId,
    kindId: params.kindId,
    status: CERTIFICATE_STATUSES.find((value) => value === params.status),
    verification: VERIFICATION_STATUSES.find((value) => value === params.verification),
  }
}

export type StudentOption = { readonly id: string; readonly nis: string; readonly name: string }

export type CertificateOption = {
  readonly id: string
  readonly name: string
  readonly code: string
}

export type OwnCertificateOptions = {
  readonly kinds: readonly CertificateOption[]
  readonly levels: readonly CertificateOption[]
}

export const READINESS = ["Siap Ujian", "Belum Siap"] as const
export type Readiness = (typeof READINESS)[number]

export const READINESS_BADGE: Readonly<Record<Readiness, string>> = {
  "Siap Ujian": "badge-beres",
  "Belum Siap": "badge-tindakan",
}

export type ReadinessCandidate = {
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly level: Ref
  readonly average: number | null
  readonly kkm: number | null
  readonly systemRecommendation: Readiness
}

export type RecommendationRow = ReadinessCandidate & {
  readonly recommendation: Readiness
  readonly overridesSystem: boolean
  readonly overrideNote: string | null
  readonly decidedAt: string
  readonly decidedBy: string | null
}

export type RecommendationFilters = { readonly levelId?: string; readonly status?: Readiness }

export type RecommendationItem = {
  studentId: string
  recommendation: Readiness
  note: string | null
}

export type RegistrationStatus = "Pendaftaran Dibuka" | "Pendaftaran Ditutup"

export const REGISTRATION_BADGE: Readonly<Record<RegistrationStatus, string>> = {
  "Pendaftaran Dibuka": "badge-beres",
  "Pendaftaran Ditutup": "badge-tindakan",
}

export type ExamScheduleRow = {
  readonly id: string
  readonly name: string
  readonly kind: Ref | null
  readonly level: Ref
  readonly date: string
  readonly location: string
  readonly capacity: number
  readonly registeredCount: number
  readonly remainingSeats: number
  readonly registrationStatus: RegistrationStatus
}

export type ExamPaymentStatus = "Lunas" | "Belum Bayar"

export const PAYMENT_BADGE: Readonly<Record<ExamPaymentStatus, string>> = {
  Lunas: "badge-beres",
  "Belum Bayar": "badge-tindakan",
}

export type ExamRegistrantRow = {
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly program: string | null
  readonly registeredAt: string
  readonly paymentStatus: ExamPaymentStatus | null
}

export type ExamCandidateRow = {
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly recommendation: Readiness | null
}

const score = z
  .number("Isi nilai modul ini.")
  .int("Nilai harus bilangan bulat, persis seperti di berkas sertifikat.")
  .min(0, "Nilai paling kecil 0.")
  .max(100, "Nilai paling besar 100.")

export type ModuleForm = { score: number | ""; validUntil: string }

export type CertificateModulesForm = Record<ModuleKey, ModuleForm>

export type ModulesInput = Record<ModuleKey, { score: number; validUntil: string } | null>

const moduleFormSchema = z
  .object({ score: z.union([score, z.literal("")]), validUntil: z.string() })
  .refine((entry) => (entry.score === "") === (entry.validUntil === ""), {
    message: "Isi nilai dan bulan berlakunya bersamaan, atau kosongkan keduanya.",
    path: ["validUntil"],
  })

export const modulesFormSchema = z
  .object({
    lesen: moduleFormSchema,
    hoeren: moduleFormSchema,
    schreiben: moduleFormSchema,
    sprechen: moduleFormSchema,
  })
  .refine((modules) => Object.values(modules).some((entry) => entry.score !== ""), {
    message: "Isi minimal satu modul: Lesen, Hören, Schreiben, atau Sprechen.",
    path: ["lesen", "score"],
  })

export const verifyFormSchema = z.object({ modules: modulesFormSchema })

export const certificateFormSchema = z.object({
  studentId: z.string().min(1, "Pilih siswa."),
  kindId: z.string().min(1, "Pilih jenis sertifikat."),
  levelId: z.string().min(1, "Pilih level."),
  modules: modulesFormSchema,
})

export type CertificateForm = {
  studentId: string
  kindId: string
  levelId: string
  modules: CertificateModulesForm
}

export const ownCertificateFormSchema = certificateFormSchema.omit({ studentId: true })

export type OwnCertificateForm = Omit<CertificateForm, "studentId">

export type OwnCertificateStatus = "Terverifikasi" | "Menunggu" | "Expired" | "Ditolak"

export const ownStatusOf = (row: CertificateRow): OwnCertificateStatus =>
  row.verification === "Usulan"
    ? "Menunggu"
    : row.verification === "Ditolak"
      ? "Ditolak"
      : row.status === "Kedaluwarsa"
        ? "Expired"
        : "Terverifikasi"

export const isOwnEditable = (row: CertificateRow) => row.verification !== "Terverifikasi"

export const EMPTY_MODULES: CertificateModulesForm = {
  lesen: { score: "", validUntil: "" },
  hoeren: { score: "", validUntil: "" },
  schreiben: { score: "", validUntil: "" },
  sprechen: { score: "", validUntil: "" },
}

export const modulesInputOf = (modules: CertificateModulesForm): ModulesInput =>
  Object.fromEntries(
    MODULE_KEYS.map((key) => {
      const { score: value, validUntil } = modules[key]
      return [key, value === "" ? null : { score: value, validUntil }]
    }),
  ) as ModulesInput

export const modulesFormOf = (modules: readonly CertificateModule[]): CertificateModulesForm =>
  Object.fromEntries(
    MODULE_KEYS.map((key) => {
      const entry = modules.find((module) => module.module === MODULE_LABEL[key])
      return [key, { score: entry?.score ?? "", validUntil: entry?.validUntil ?? "" }]
    }),
  ) as CertificateModulesForm

export const rejectFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Tulis alasan penolakan supaya siswa tahu apa yang harus diperbaiki.")
    .max(500),
})

export const scheduleFormSchema = z.object({
  kindId: z.string().min(1, "Pilih penyelenggara."),
  levelId: z.string().min(1, "Pilih level."),
  date: z.iso.date("Isi tanggal ujian."),
  location: z.string().trim().min(2, "Isi lokasi ujian.").max(120),
  capacity: z.number("Isi kuota.").int().positive("Kuota minimal 1 peserta.").max(500),
})

export type ScheduleForm = {
  kindId: string
  levelId: string
  date: string
  location: string
  capacity: number | ""
}

export const formatAverage = (value: number | null) =>
  value === null ? "-" : `${Number.isInteger(value) ? value : value.toFixed(1)} / 100`
