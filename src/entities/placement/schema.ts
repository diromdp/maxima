import { z } from "zod"

type Named = { readonly id: string; readonly name: string }

export const PLACEMENT_STATUSES = ["Dapat Vertrag", "Proses Visa", "Alumni"] as const
export type PlacementStatus = (typeof PLACEMENT_STATUSES)[number]

export const PLACEMENT_STATUS_BADGE: Readonly<Record<PlacementStatus, string>> = {
  "Dapat Vertrag": "badge-berjalan",
  "Proses Visa": "badge-berjalan",
  Alumni: "badge-beres",
}

export type VisaStatus = "Belum Diajukan" | "Diajukan" | "Visa Terbit"

export const VISA_STATUS_BADGE: Readonly<Record<VisaStatus, string>> = {
  "Belum Diajukan": "badge-terkunci",
  Diajukan: "badge-berjalan",
  "Visa Terbit": "badge-beres",
}

export const VISA_KINDS = [
  "Visa D (Nationales Visa - Ausbildung)",
  "Visa D (Nationales Visa - FSJ)",
  "Visa D (Nationales Visa - Studium)",
] as const

export const PLACEMENT_FILTERS = ["branch", "program", "status"] as const

export const VISA_FIELDS = [
  "visaAppliedOn",
  "visaInterviewOn",
  "visaIssuedOn",
  "visaKind",
  "visaValidity",
] as const
export type VisaField = (typeof VISA_FIELDS)[number]

export const PLACEMENT_FIELDS = [
  "company",
  "school",
  "fieldOfStudy",
  "city",
  "state",
  "contractStartsOn",
  "contractEndsOn",
  "departureOn",
] as const
export type PlacementField = (typeof PLACEMENT_FIELDS)[number]

export type PlacementValues = Readonly<Record<VisaField | PlacementField, string | null>>

export type ChecklistItem = { readonly code: string; readonly name: string }

export type PlacementRow = {
  readonly studentId: string
  readonly contractId: string
  readonly nis: string
  readonly contractNumber: string | null
  readonly anrede: string | null
  readonly name: string
  readonly cohort: string
  readonly branch: Named | null
  readonly program: Named | null
  readonly status: PlacementStatus
  readonly visaStatus: VisaStatus
  readonly company: string | null
  readonly city: string | null
  readonly fieldOfStudy: string | null
  readonly checkedCodes: readonly string[]
}

export type PlacementPage = {
  readonly data: readonly PlacementRow[]
  readonly meta: { readonly page: number; readonly perPage: number; readonly total: number }
  readonly checklistItems: readonly ChecklistItem[]
}

export type DepartureDocument = {
  readonly code: string
  readonly name: string
  readonly status: string
  readonly objectKey: string | null
  readonly originalName: string | null
}

export type DepartureFile = {
  readonly label: string
  readonly isUploadable: boolean
  readonly documents: readonly DepartureDocument[]
}

export type PlacementDetail = {
  readonly student: {
    readonly id: string
    readonly nis: string
    readonly anrede: string | null
    readonly name: string
    readonly status: string
  }
  readonly contract: {
    readonly id: string
    readonly contractNumber: string | null
    readonly cohort: string
  }
  readonly branch: Named | null
  readonly program: Named | null
  readonly status: PlacementStatus
  readonly visaStatus: VisaStatus
  readonly visaGate: {
    readonly status: "Belum Terbuka" | "Terbuka" | "Dikerjakan" | "Selesai"
    readonly shortfallIdr: number
  } | null
  readonly values: PlacementValues
  readonly proposals: Partial<
    Readonly<
      Record<VisaField | PlacementField, { readonly value: string; readonly proposedAt: string }>
    >
  >
  readonly pendingProposals: number
  readonly files: readonly DepartureFile[]
  readonly checklist: {
    readonly items: readonly (ChecklistItem & { readonly isChecked: boolean })[]
    readonly checked: number
    readonly total: number
  }
}

const CHECKLIST_SHORT: Readonly<Record<string, string>> = {
  "Paspor masih berlaku": "Paspor",
  "Visa terbit": "Visa",
  "Kontrak kerja ditandatangani": "Vertrag",
  Krankenversicherung: "KV",
  Rahmenplan: "Rahmen",
  "Tiket pesawat": "Tiket",
  Schulvertrag: "Schule",
  "Mietvertrag / Wohnungsbestätigung": "Wohnung",
  "Akta Kelahiran (terjemah + apostille)": "Akta",
  "Ijazah terakhir (terjemah + apostille)": "Ijazah",
  "Transkrip nilai": "Transkrip",
  "Kartu Keluarga": "KK",
  "Paket Roaming Data": "Roaming",
  "Uang Tunai Euro": "Euro",
  "Obat Pribadi": "Obat",
}

export const checklistShortOf = (name: string): string =>
  CHECKLIST_SHORT[name] ?? name.split(" ")[0] ?? name

export const cityStateOf = (values: Pick<PlacementValues, "city" | "state">): string | null =>
  [values.city, values.state].filter(Boolean).join(", ") || null

const DATE_ORDER = "Tanggal ini tidak boleh mendahului Tanggal Pengajuan Visa."

export const visaFormSchema = z
  .object({
    visaAppliedOn: z.string(),
    visaInterviewOn: z.string(),
    visaIssuedOn: z.string(),
    visaKind: z.string().trim().max(200),
    visaValidity: z.string().trim().max(80),
  })
  .superRefine((value, context) => {
    for (const field of ["visaInterviewOn", "visaIssuedOn"] as const) {
      if (value[field] === "") continue
      if (value.visaAppliedOn === "" || value[field] < value.visaAppliedOn) {
        context.addIssue({ code: "custom", path: [field], message: DATE_ORDER })
      }
    }
  })

export type VisaForm = z.input<typeof visaFormSchema>

export const placementFormSchema = z
  .object({
    company: z.string().trim().max(200),
    school: z.string().trim().max(200),
    fieldOfStudy: z.string().trim().max(200),
    city: z.string().trim().max(120),
    state: z.string().trim().max(120),
    contractStartsOn: z.string(),
    contractEndsOn: z.string(),
    departureOn: z.string(),
  })
  .refine(
    (value) =>
      value.contractEndsOn === "" ||
      value.contractStartsOn === "" ||
      value.contractEndsOn >= value.contractStartsOn,
    {
      path: ["contractEndsOn"],
      message: "Tanggal Selesai Kontrak tidak boleh mendahului Tanggal Mulai Kontrak.",
    },
  )

export type PlacementForm = z.input<typeof placementFormSchema>

export const PROPOSAL_FIELDS = [
  "fieldOfStudy",
  "departureOn",
  "contractStartsOn",
  "contractEndsOn",
  "city",
  "state",
  "company",
  "visaAppliedOn",
  "visaInterviewOn",
  "visaIssuedOn",
  "visaValidity",
  "school",
] as const satisfies readonly (VisaField | PlacementField)[]
export type ProposalField = (typeof PROPOSAL_FIELDS)[number]

export const proposalFormSchema = z
  .object({
    fieldOfStudy: z.string().trim().max(200),
    departureOn: z.string(),
    contractStartsOn: z.string(),
    contractEndsOn: z.string(),
    city: z.string().trim().max(120),
    state: z.string().trim().max(120),
    company: z.string().trim().max(200),
    visaAppliedOn: z.string(),
    visaInterviewOn: z.string(),
    visaIssuedOn: z.string(),
    visaValidity: z.string().trim().max(80),
    school: z.string().trim().max(200),
  })
  .superRefine((value, context) => {
    if (
      value.contractStartsOn &&
      value.contractEndsOn &&
      value.contractEndsOn < value.contractStartsOn
    ) {
      context.addIssue({
        code: "custom",
        path: ["contractEndsOn"],
        message: "Tanggal Selesai Kontrak tidak boleh mendahului Tanggal Mulai Kontrak.",
      })
    }
    for (const field of ["visaInterviewOn", "visaIssuedOn"] as const) {
      if (value.visaAppliedOn && value[field] && value[field] < value.visaAppliedOn) {
        context.addIssue({ code: "custom", path: [field], message: DATE_ORDER })
      }
    }
  }) satisfies z.ZodType<Record<ProposalField, string>>

export type ProposalForm = z.input<typeof proposalFormSchema>

export function formOf<Field extends VisaField | PlacementField>(
  values: PlacementValues,
  fields: readonly Field[],
): Record<Field, string> {
  return Object.fromEntries(fields.map((field) => [field, values[field] ?? ""])) as Record<
    Field,
    string
  >
}

export function inputOf<Field extends string>(
  form: Record<Field, string>,
): Record<Field, string | null> {
  return Object.fromEntries(
    Object.entries<string>(form).map(([field, value]) => [field, value.trim() || null]),
  ) as Record<Field, string | null>
}
