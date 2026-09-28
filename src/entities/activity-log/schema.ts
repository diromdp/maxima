export const LOG_MODULES = [
  "Partner",
  "Admission",
  "Finance",
  "Akademik",
  "Dokumen",
  "Pengaturan",
] as const

export type LogModule = (typeof LOG_MODULES)[number]

export type LogActor = { readonly id: string; readonly name: string }

export type ActivityLogRow = {
  readonly id: string
  readonly at: string
  readonly actor: {
    readonly kind: "staff" | "student"
    readonly id: string
    readonly name: string
  } | null
  readonly role: string | null
  readonly action: string
  readonly module: LogModule
  readonly ipAddress: string | null
  readonly crossArea: boolean
}
