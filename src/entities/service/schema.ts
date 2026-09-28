import { z } from "zod"

type Named = { readonly id: string; readonly name: string }

export const SERVICE_STATES = ["Belum Terbuka", "Terbuka", "Dikerjakan", "Selesai"] as const
export type ServiceState = (typeof SERVICE_STATES)[number]
export type StepState = Exclude<ServiceState, "Terbuka">

export const STATE_BADGE: Readonly<Record<ServiceState, string>> = {
  "Belum Terbuka": "badge-terkunci",
  Terbuka: "badge-terbuka",
  Dikerjakan: "badge-berjalan",
  Selesai: "badge-beres",
}

export const STATE_HINT: Readonly<Record<ServiceState, string>> = {
  "Belum Terbuka": "Kurang Bayar",
  Terbuka: "Siap Dikerjakan",
  Dikerjakan: "Proses Berjalan",
  Selesai: "Hasil Terunggah",
}

export const SERVICE_FILTERS = ["branch", "package"] as const

export const PASSPORT = "passport"
export const DOSSIER = "dossier"

export const RESULT_TYPES: Readonly<Record<string, readonly Named[]>> = {
  [PASSPORT]: [{ id: "paspor", name: "Paspor" }],
  [DOSSIER]: [
    { id: "terjemahan-akta-lahir", name: "Terjemahan Akta Lahir" },
    { id: "terjemahan-ijazah-transkrip", name: "Terjemahan Ijazah & Transkrip" },
    { id: "apostille-akta-lahir", name: "Apostille Akta Lahir" },
    { id: "apostille-ijazah", name: "Apostille Ijazah" },
  ],
}

export const serviceOfResult = (documentType: string): string | undefined =>
  Object.entries(RESULT_TYPES).find(([, types]) =>
    types.some((type) => type.id === documentType),
  )?.[0]

export type BoardRow = {
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly onLeave: boolean
  readonly branch: Named
  readonly package: Named
  readonly cells: readonly { readonly code: string; readonly status: ServiceState }[]
}

export type ServiceResult = {
  readonly documentType: string
  readonly name: string
  readonly objectKey: string | null
  readonly originalName: string | null
}

export type DossierStep = {
  readonly step: number
  readonly name: string
  readonly state: StepState
  readonly startedOn: string | null
  readonly finishedOn: string | null
  readonly note: string | null
}

export type ServiceRow = {
  readonly code: string
  readonly name: string
  readonly status: ServiceState
  readonly thresholdIdr: number
  readonly shortfallIdr: number
  readonly pic: Named | null
  readonly progressNote: string | null
  readonly startedOn: string | null
  readonly finishedOn: string | null
  readonly note: string | null
  readonly updatedAt: string | null
  readonly results: readonly ServiceResult[]
  readonly steps: readonly DossierStep[] | null
}

export type ServiceDetail = {
  readonly student: {
    readonly id: string
    readonly nis: string
    readonly name: string
    readonly status: string
    readonly onLeave: boolean
  }
  readonly contract: { readonly id: string; readonly contractNumber: string | null }
  readonly package: Named
  readonly branch: Named
  readonly paidIdr: number
  readonly remainingIdr: number
  readonly services: readonly ServiceRow[]
  readonly courses: readonly CourseReports[]
}

export type CourseReports = {
  readonly level: Named & { readonly code: string }
  readonly reportCards: readonly { readonly id: string; readonly period: string }[]
}

export type ServiceOptions = {
  readonly packages: readonly Named[]
  readonly pics: readonly Named[]
}

const note = z.string().trim().max(2000)

const DATE_ORDER = "Tanggal selesai harus sesudah tanggal mulai. Isi tanggal mulai lebih dulu."

const datesInOrder = (value: { startedOn: string; finishedOn: string }) =>
  value.finishedOn === "" || (value.startedOn !== "" && value.finishedOn >= value.startedOn)

export const workFormSchema = z
  .object({
    picUserId: z.string().min(1, "PIC wajib dipilih dari daftar staf."),
    progressNote: note,
    startedOn: z.string(),
    finishedOn: z.string(),
    note,
  })
  .refine(datesInOrder, { message: DATE_ORDER, path: ["finishedOn"] })

export type WorkForm = z.input<typeof workFormSchema>

export const stepFormSchema = z
  .object({ startedOn: z.string(), finishedOn: z.string(), note })
  .refine(datesInOrder, { message: DATE_ORDER, path: ["finishedOn"] })

export type StepForm = z.input<typeof stepFormSchema>

export const progressLetterFormSchema = z.object({
  stage: z
    .string()
    .trim()
    .min(
      3,
      "Tulis tahap proses siswa saat ini, misalnya menunggu hasil wawancara di partner ketiga.",
    )
    .max(300),
  additionalNote: z.string().trim().max(600),
})

export type ProgressLetterForm = z.input<typeof progressLetterFormSchema>

export const blankToNull = (value: string): string | null => value.trim() || null
