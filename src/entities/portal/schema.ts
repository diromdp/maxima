import type { ApplicationStatus } from "@/src/entities/partner/schema"
import type { PlacementDetail, VisaStatus } from "@/src/entities/placement/schema"
import type { PaymentKind, PaymentMethod, PaymentStatus } from "@/src/entities/payment/schema"
import { z } from "zod"

import {
  IDENTITY_PANELS,
  type IdentityField,
  type IdentityFieldSpec,
  textRuleOf,
} from "@/src/entities/student/schema"
import type { PortalStatus, StudentStatus } from "@/src/lib/auth/session"
import type { Currency } from "@/src/lib/money"

export type { PortalStatus, StudentStatus }

export type NextPayment =
  | { kind: "dp"; number: null; amountIdr: number }
  | { kind: "installment"; number: number; amountIdr: number | null }

type Reference = { id: string; name: string }

export type PortalHead = {
  student: {
    id: string
    nis: string | null
    name: string
    status: PortalStatus
    email: string | null
  }
  contract: {
    id: string
    contractNumber: string | null
    enrolledAt: string
    package: Reference
  } | null
  branch: Reference | null
  pic: string | null
}

export type PortalPaymentRow = {
  id: string
  paidOn: string
  kind: PaymentKind
  method: PaymentMethod
  amount: number
  currency: Currency
  status: PaymentStatus
  sequence: number | null
  isDownPayment: boolean
  hasReceipt: boolean
  branch: string | null
  ratifiedBy: string | null
  rejectReason: string | null
}

export type LevelState = "Lulus" | "Berjalan" | "Sudah diikuti" | "Terkunci" | "Belum mulai"

export type PortalLevelCard = {
  level: Reference & { code: string }
  state: LevelState
  finalScore: number | null
  chapter: number | null
  shortfallIdr: number | null
  chapters: LevelChapters | null
}

export type ChapterStatus = "Tuntas" | "Remedial" | "Berjalan"

export type LevelChapters = {
  kkm: number | null
  rows: { chapter: number; score: number | null; status: ChapterStatus | null }[]
}

export type MonthlyAttendance = {
  month: string
  present: number
  excused: number
  sick: number
  absent: number
  percent: number | null
}

export type OwnReportCard = {
  id: string
  level: string
  period: string
  issuedAt: string
  sentAt: string
}

export type PortalLearning = {
  class: { name: string; schedule: string; teacher: string | null } | null
  currentLevel: (Reference & { code: string; chapter: number | null }) | null
  levels: PortalLevelCard[]
  attendance: MonthlyAttendance[]
  reportCards: OwnReportCard[]
}

export type ServiceStatus = "Belum Terbuka" | "Terbuka" | "Dikerjakan" | "Selesai"

export type NextStep =
  | { kind: "activate"; reason: string }
  | { kind: "leave"; startsOn: string; returnsOn: string }
  | { kind: "alumni"; company: string | null; school: string | null; city: string | null }
  | {
      kind: "pay"
      installment: NextPayment
      dueOn: string | null
      opensService: string | null
    }
  | { kind: "none" }

export type PortalDashboard = {
  head: PortalHead
  nextStep: NextStep
  numbers: {
    remainingIdr: number
    finalPriceIdr: number
    level: { name: string; chapter: number | null } | null
    attendancePercent: number | null
    attendanceThisMonthPercent: number | null
    openServices: number
    totalServices: number
  } | null
  learning: Pick<PortalLearning, "class" | "levels"> | null
  lastPayments: PortalPaymentRow[]
  services: { code: string; name: string; status: ServiceStatus; shortfallIdr: number }[]
  documents: { group: string; complete: number; total: number }[] | null
}

export type UnlockProjection = {
  openNow: number
  openAfterNext: number
  openAfterFollowing: number
  total: number
  totalAfterNextIdr: number
  nextGate: { code: string; name: string; thresholdIdr: number } | null
}

export type PortalPayments = {
  package: { name: string; installments: number; billingDay: number | null }
  totals: {
    finalPriceIdr: number
    paidIdr: number
    remainingIdr: number
    overpaidIdr: number
    monthlyIdr: number | null
  }
  nextInstallment: NextPayment | null
  nextDueOn: string | null
  rupiah: PortalPaymentRow[]
  euro: {
    serviceFeeEurCents: number | null
    paidEurCents: number
    remainingEurCents: number | null
    pendingEurCents: number
    rows: PortalPaymentRow[]
  }
  unlocks: UnlockProjection
}

export type JourneyState = "Selesai" | "Dikerjakan" | "Menunggu"

export type ServiceResult = {
  documentType: string
  name: string
  objectKey: string | null
  originalName: string | null
}

export type PortalServiceRow = {
  code: string
  name: string
  status: ServiceStatus
  thresholdIdr: number
  shortfallIdr: number
  pic: string | null
  progressNote: string | null
  startedOn: string | null
  finishedOn: string | null
  note: string | null
  results: ServiceResult[]
  steps:
    | {
        step: number
        name: string
        state: string
        startedOn: string | null
        finishedOn: string | null
        note: string | null
      }[]
    | null
}

export type PortalProgress = {
  journey: { code: string; name: string; state: JourneyState }[]
  services: PortalServiceRow[]
  nextService: { code: string; name: string; thresholdIdr: number; shortfallIdr: number } | null
  showsPartnerSections: boolean
  visa: {
    hasVertrag: boolean
    gate: { status: ServiceStatus; thresholdIdr: number; shortfallIdr: number } | null
  }
}

export type PortalPartners = {
  applications: {
    id: string
    partner: Reference
    position: string | null
    status: ApplicationStatus
    appliedOn: string
  }[]
  practices: {
    id: string
    partner: Reference | null
    position: string | null
    date: string
    startsAt: string | null
    round: number
    status: "Dijadwalkan" | "Selesai" | "Dibatalkan"
    result: "Siap" | "Latihan Lagi" | null
    evaluation: string | null
  }[]
}

export type { VisaStatus }

export type OwnPlacement = Omit<PlacementDetail, "visaGate" | "checklist"> & {
  readonly email: string | null
}

export type DepartureChecklist = {
  items: { code: string; name: string; isChecked: boolean }[]
  checked: number
  total: number
}

export type Checkout = {
  orderId: string
  snapToken: string
  redirectUrl: string
  amountIdr: number
  feeIdr: number
  totalIdr: number
  expiresAt: string
}

export type BadgeTone = "beres" | "berjalan" | "tindakan" | "terbuka" | "terkunci"

export const RUPIAH_STATUS: Readonly<Record<PaymentStatus, { label: string; tone: BadgeTone }>> = {
  Otomatis: { label: "Lunas", tone: "beres" },
  Disahkan: { label: "Lunas", tone: "beres" },
  Menunggu: { label: "Menunggu", tone: "berjalan" },
  Ditolak: { label: "Ditolak", tone: "tindakan" },
}

export const EURO_STATUS: Readonly<Record<PaymentStatus, { label: string; tone: BadgeTone }>> = {
  ...RUPIAH_STATUS,
  Disahkan: { label: "Disahkan", tone: "beres" },
  Menunggu: { label: "Menunggu pengesahan", tone: "berjalan" },
}

export function paymentLabelOf(
  row: Pick<PortalPaymentRow, "kind" | "sequence" | "isDownPayment">,
): string {
  if (row.kind === "Dana Talang") return "Dana Talang"
  if (row.isDownPayment) return "DP"
  return row.sequence ? `Angsuran ke-${row.sequence}` : "Pembayaran"
}

export const nextPaymentLabelOf = (next: NextPayment): string =>
  next.kind === "dp" ? "DP" : `Angsuran ke-${next.number}`

export const PORTAL_STATUS_TONE: Readonly<Record<PortalStatus, BadgeTone>> = {
  Aktif: "beres",
  Cuti: "berjalan",
  Alumni: "terkunci",
  "Mengundurkan Diri": "tindakan",
  "Selesai Kursus": "terkunci",
  "Calon Siswa": "terkunci",
}

export const PROFILE_FIELDS = [
  "fullName",
  "anrede",
  "nik",
  "birthPlace",
  "birthDate",
  "gender",
  "phonePersonal",
  "whatsapp",
  "email",
  "address",
  "village",
  "district",
  "city",
  "province",
  "postalCode",
  "lastEducationLevel",
  "schoolName",
  "schoolMajor",
  "graduationYear",
] as const satisfies readonly IdentityField[]

export type ProfileField = (typeof PROFILE_FIELDS)[number]

export type ChangeRequestStatus = "Menunggu" | "Disetujui" | "Ditolak"

export type OwnChangeRequest = {
  id: string
  field: IdentityField
  currentValue: string | null
  proposedValue: string
  reason: string | null
  decisionReason: string | null
  status: ChangeRequestStatus
  hasEvidence: boolean
  createdAt: string
  decidedAt: string | null
}

export type PortalProfile = {
  nis: string | null
  contractNumber: string | null
  identity: Record<ProfileField, string | null> & { interestMajor: string | null }
  companions: { pic: string | null; branch: string | null; teacher: string | null }
  changeRequests: OwnChangeRequest[]
}

export const CHANGE_REQUEST_TONE: Readonly<Record<ChangeRequestStatus, BadgeTone>> = {
  Menunggu: "berjalan",
  Disetujui: "beres",
  Ditolak: "tindakan",
}

const IDENTITY_SPECS = new Map<IdentityField, IdentityFieldSpec>(
  IDENTITY_PANELS.flatMap((panel) => panel.fields.map((field) => [field.key, field] as const)),
)

export const identitySpecOf = (field: IdentityField): IdentityFieldSpec =>
  IDENTITY_SPECS.get(field) ?? { key: field, label: field, input: "text" }

export const changeRequestFormSchema = z
  .object({
    field: z.enum(PROFILE_FIELDS, "Pilih data yang ingin diubah."),
    proposedValue: z.string({ error: "Isi nilai barunya." }).trim().min(1, "Isi nilai barunya."),
    reason: z.string().trim().min(1, "Tulis alasan perubahannya.").max(1000),
  })
  .superRefine((form, context) => {
    const result = textRuleOf(identitySpecOf(form.field)).safeParse(form.proposedValue)
    if (!result.success) {
      context.addIssue({
        code: "custom",
        path: ["proposedValue"],
        message: result.error.issues[0]?.message ?? "Format nilai baru tidak sesuai.",
      })
    }
  })

export type ChangeRequestForm = z.infer<typeof changeRequestFormSchema>
