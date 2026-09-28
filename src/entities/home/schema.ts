export type HomeLayout =
  | "admission"
  | "marketing"
  | "marketing-lead"
  | "teacher"
  | "teacher-lead"
  | "finance"
  | "finance-lead"

export type FunnelStage = "Prospek" | "Belajar" | "Pemberkasan" | "Cari Mitra" | "Visa" | "Alumni"

export type StudentStatus = "Aktif" | "Cuti" | "Alumni" | "Mengundurkan Diri" | "Selesai Kursus"

export type QueueItem = {
  readonly key: string
  readonly label: string
  readonly count: number | null
  readonly href: string
  readonly linkLabel: string
}

export type Tally = { readonly name: string; readonly count: number }

export type Funnel = {
  readonly total: number
  readonly stages: readonly { readonly stage: FunnelStage; readonly count: number }[]
}

export type StudentCounts = { readonly total: number } & Readonly<Record<StudentStatus, number>>

export type AcademicStats = {
  readonly classes: number
  readonly students: number
  readonly activeTeachers: number | null
  readonly averageAttendance: number | null
  readonly averageScore: number | null
}

export type FinanceStaffStats = {
  readonly receivedThisMonthIdr: number
  readonly receivedThisMonthEurCents: number
  readonly overdueIdr: number
}

export type FinanceLeadStats = {
  readonly billedIdr: number
  readonly receivedIdr: number
  readonly remainingIdr: number
  readonly billedEurCents: number
  readonly receivedEurCents: number
  readonly remainingEurCents: number
  readonly paidOff: number
  readonly dueCount: number
}

export type HomeView = {
  readonly layout: HomeLayout
  readonly queue: readonly QueueItem[]
  readonly funnel: Funnel | null
  readonly students: StudentCounts | null
  readonly spread: {
    readonly branches: readonly Tally[]
    readonly programs: readonly Tally[]
  } | null
  readonly academic: AcademicStats | null
  readonly finance: FinanceStaffStats | FinanceLeadStats | null
}

export type ConsultantRow = {
  readonly pic: { readonly id: string; readonly name: string }
  readonly handled: number
  readonly contracts: number
  readonly downPayments: number
  readonly active: number
  readonly leftOrOnLeave: number
}

export type MarketingPerformance = {
  readonly picCoverage: number | null
  readonly consultants: readonly ConsultantRow[]
  readonly leadSources: readonly (Tally & { readonly percent: number })[]
  readonly programs: readonly Tally[]
  readonly branches: readonly Tally[]
  readonly education: readonly Tally[]
}
