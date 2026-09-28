export const STUDENT_STATUSES = [
  "Aktif",
  "Cuti",
  "Alumni",
  "Mengundurkan Diri",
  "Selesai Kursus",
] as const
export type StudentStatus = (typeof STUDENT_STATUSES)[number]

export const RECEIVABLE_FILTERS = ["branch", "status"] as const
export const DUE_FILTERS = ["branch"] as const
export const REMINDER_FILTERS = ["status"] as const

export const REMINDER_STATUSES = ["TERKIRIM", "GAGAL"] as const
export type ReminderStatus = (typeof REMINDER_STATUSES)[number]

export type DueStatus = "TERLAMBAT" | "HAMPIR JATUH"

type Ref = { readonly id: string; readonly name: string }

export type ReceivableRow = {
  readonly contractId: string
  readonly studentId: string
  readonly nis: string
  readonly name: string
  readonly studentStatus: StudentStatus
  readonly contractStatus: "active" | "finished" | "cancelled"
  readonly branch: Ref | null
  readonly package: Ref
  readonly pic: { readonly id: string; readonly name: string; readonly email: string } | null
  readonly priceIdr: number
  readonly paidIdr: number
  readonly remainingIdr: number
  readonly priceEurCents: number | null
  readonly paidEurCents: number
  readonly remainingEurCents: number | null
  readonly targetIdr: number
  readonly overdueIdr: number
  readonly lastPaidOn: string | null
  readonly transactionCount: number
  readonly needsDifferenceBilling: boolean
}

export type DueRow = ReceivableRow & {
  readonly status: DueStatus
  readonly dueDate: string
  readonly daysLate: number
  readonly shortfallIdr: number
}

export type DueSummary = {
  readonly overdueTotalIdr: number
  readonly overdueCount: number
  readonly averageDaysLate: number
}

export type ReminderRow = {
  readonly id: string
  readonly sentAt: string
  readonly nis: string | null
  readonly name: string | null
  readonly type: string
  readonly status: ReminderStatus
  readonly failureReason: string | null
  readonly remainingIdr: number | null
  readonly remainingEurCents: number | null
}
