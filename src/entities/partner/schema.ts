import { z } from "zod"

export type Ref = { readonly id: string; readonly name: string }
export type StudentRef = { readonly id: string; readonly nis: string | null; readonly name: string }
export type StudentOption = { readonly id: string; readonly nis: string; readonly name: string }

export const PARTNERSHIP_STATUSES = ["Aktif", "Non-aktif"] as const
export type PartnershipStatus = (typeof PARTNERSHIP_STATUSES)[number]

export const PARTNERSHIP_BADGE: Readonly<Record<PartnershipStatus, string>> = {
  Aktif: "badge-beres",
  "Non-aktif": "badge-tindakan",
}

export type PartnerRow = {
  readonly id: string
  readonly name: string
  readonly city: string | null
  readonly category: Ref | null
  readonly openPositions: number
  readonly placedStudents: number
  readonly status: PartnershipStatus
  readonly contactName: string | null
  readonly contactEmail: string | null
  readonly contactPhone: string | null
}

export const APPLICATION_STATUSES = [
  "Masih Dicarikan Betrieb",
  "Proses Bewerbung",
  "Unterlagen Masuk",
  "Unterlagen Pernah Masuk",
  "Interview Partner",
  "Menunggu Hasil Interview",
  "Gagal Interview - Partner",
  "Interview Betrieb",
  "Gagal Interview - Betrieb",
  "Dapat Vertrag",
  "Tidak Lanjut Proses",
] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const VERTRAG: ApplicationStatus = "Dapat Vertrag"
export const WITHDRAWN: ApplicationStatus = "Tidak Lanjut Proses"

export const FAILED_STATUSES: readonly ApplicationStatus[] = [
  "Gagal Interview - Partner",
  "Gagal Interview - Betrieb",
  WITHDRAWN,
]

export const isFailed = (status: ApplicationStatus) => FAILED_STATUSES.includes(status)

export const applicationBadge = (status: ApplicationStatus) =>
  status === VERTRAG
    ? "badge-beres"
    : isFailed(status)
      ? "badge-tindakan"
      : status === "Masih Dicarikan Betrieb"
        ? "badge-terkunci"
        : "badge-berjalan"

export const statusNumber = (status: ApplicationStatus) => APPLICATION_STATUSES.indexOf(status) + 1

export const statusesAfter = (current: ApplicationStatus): readonly ApplicationStatus[] =>
  current === VERTRAG ? [VERTRAG, WITHDRAWN] : APPLICATION_STATUSES

export type ApplicationRow = {
  readonly id: string
  readonly student: StudentRef
  readonly partner: Ref
  readonly position: string | null
  readonly status: ApplicationStatus
  readonly appliedOn: string
  readonly partnerNote: string | null
  readonly admissionNote: string | null
  readonly pic: Ref | null
  readonly reportedAt: string
}

export type TrackingRow = ApplicationRow & { readonly applicationCount: number }

export const PRACTICE_STATUSES = ["Dijadwalkan", "Selesai", "Dibatalkan"] as const
export type PracticeStatus = (typeof PRACTICE_STATUSES)[number]

export const PRACTICE_BADGE: Readonly<Record<PracticeStatus, string>> = {
  Dijadwalkan: "badge-info",
  Selesai: "badge-beres",
  Dibatalkan: "badge-tindakan",
}

export const PRACTICE_RESULTS = ["Siap", "Latihan Lagi"] as const
export type PracticeResult = (typeof PRACTICE_RESULTS)[number]

export type PracticeRow = {
  readonly id: string
  readonly student: StudentRef
  readonly partner: Ref | null
  readonly position: string | null
  readonly date: string
  readonly startsAt: string | null
  readonly round: number
  readonly trainer: Ref | null
  readonly status: PracticeStatus
  readonly result: PracticeResult | null
  readonly evaluation: string | null
}

type Params = {
  search?: string
  city?: string
  categoryId?: string
  status?: string
  partnerId?: string
}

export const PARTNER_FILTERS = ["city", "categoryId", "status"] as const
export const APPLICATION_FILTERS = ["status", "partnerId"] as const
export const PRACTICE_FILTERS = ["status"] as const
export const PARTNER_PARAMS = ["search", ...PARTNER_FILTERS, ...APPLICATION_FILTERS] as const

export type PartnerFilters = {
  readonly search?: string
  readonly city?: string
  readonly categoryId?: string
  readonly status?: PartnershipStatus
}

export type ApplicationFilters = {
  readonly search?: string
  readonly status?: ApplicationStatus
  readonly partnerId?: string
  readonly studentId?: string
}

export type PracticeFilters = { readonly search?: string; readonly status?: PracticeStatus }

const oneOf = <Value extends string>(values: readonly Value[], raw: string | undefined) =>
  values.find((value) => value === raw)

export const partnerFiltersOf = (params: Params): PartnerFilters => ({
  search: params.search,
  city: params.city,
  categoryId: params.categoryId,
  status: oneOf(PARTNERSHIP_STATUSES, params.status),
})

export const applicationFiltersOf = (params: Params): ApplicationFilters => ({
  search: params.search,
  status: oneOf(APPLICATION_STATUSES, params.status),
  partnerId: params.partnerId,
})

export const practiceFiltersOf = (params: Params): PracticeFilters => ({
  search: params.search,
  status: oneOf(PRACTICE_STATUSES, params.status),
})

const optionalText = (max: number) => z.string().trim().max(max)

export const partnerFormSchema = z.object({
  name: z.string().trim().min(2, "Isi nama perusahaan.").max(120),
  city: optionalText(80),
  categoryId: z.string().nullable(),
  openPositions: z
    .number("Isi jumlah posisi tersedia.")
    .int("Posisi tersedia harus angka bulat.")
    .min(0, "Posisi tersedia tidak boleh negatif.")
    .max(10_000),
  status: z.enum(PARTNERSHIP_STATUSES),
  contactName: optionalText(200),
  contactEmail: z.union([z.literal(""), z.email("Surel kontak tidak valid.")]),
  contactPhone: optionalText(40),
})

export type PartnerForm = {
  name: string
  city: string
  categoryId: string | null
  openPositions: number | ""
  status: PartnershipStatus
  contactName: string
  contactEmail: string
  contactPhone: string
}

const noteFields = {
  position: optionalText(120),
  partnerNote: optionalText(1000),
  admissionNote: optionalText(1000),
}

export const applicationFormSchema = z.object({
  studentId: z.string().min(1, "Pilih siswa."),
  partnerId: z.string().min(1, "Pilih partner."),
  status: z.enum(APPLICATION_STATUSES),
  ...noteFields,
})

export type ApplicationForm = z.infer<typeof applicationFormSchema>

export const applicationUpdateFormSchema = (current: ApplicationStatus) =>
  z
    .object({ status: z.enum(APPLICATION_STATUSES), reason: optionalText(500), ...noteFields })
    .refine(
      (form) => !(current === VERTRAG && form.status === WITHDRAWN) || form.reason.length > 0,
      { path: ["reason"], message: "Tulis alasan kenapa Vertrag ini tidak dilanjutkan." },
    )

export type ApplicationUpdateForm = z.infer<ReturnType<typeof applicationUpdateFormSchema>>

export const practiceFormSchema = z.object({
  studentId: z.string().min(1, "Pilih siswa."),
  partnerId: z.string().nullable(),
  position: optionalText(120),
  date: z.iso.date("Isi tanggal latihan."),
  startsAt: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Isi jam latihan, misalnya 09:30."),
  round: z.number("Isi wawancara ke berapa.").int().min(1, "Wawancara ke paling kecil 1.").max(50),
  trainerUserId: z.string().min(1, "Pilih PIC pelatih."),
})

export type PracticeForm = {
  studentId: string
  partnerId: string | null
  position: string
  date: string
  startsAt: string
  round: number | ""
  trainerUserId: string
}

export const practiceResultFormSchema = z
  .object({
    status: z.enum(["Selesai", "Dibatalkan"]),
    result: z.enum(PRACTICE_RESULTS).nullable(),
    evaluation: optionalText(1000),
  })
  .refine((form) => form.status === "Dibatalkan" || form.result !== null, {
    path: ["result"],
    message: "Pilih hasil latihan: Siap atau Latihan Lagi.",
  })
  .refine((form) => form.status === "Selesai" || form.evaluation.length > 0, {
    path: ["evaluation"],
    message: "Tulis alasan pembatalan latihan.",
  })

export type PracticeResultForm = z.infer<typeof practiceResultFormSchema>

export const nullIfBlank = (value: string) => (value.trim() === "" ? null : value.trim())
