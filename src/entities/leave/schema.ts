import dayjs from "dayjs"
import { z } from "zod"

type Reference = { id: string; name: string }

export type LeaveState =
  | "draft"
  | "awaiting-finance"
  | "payment-set"
  | "awaiting-payment-check"
  | "processing"
  | "approved"
  | "on-leave"
  | "completed"
  | "rejected"
  | "expired"

export type ReturnStatus = "Lewat Batas" | "Belum dikonfirmasi" | "Siap kembali"

export type Position = { className: string | null; level: string | null; chapter: string | null }

export type RunningLeaveRow = {
  id: string
  nis: string | null
  name: string
  branch: string | null
  startsOn: string
  returnsOn: string
  remainingDays: number
  returnStatus: ReturnStatus | null
  state: LeaveState
}

export type PendingLeaveRow = {
  id: string
  nis: string | null
  name: string
  program: string | null
  level: string | null
  branch: string | null
  number: string
  submittedAt: string
  startsOn: string
  reason: string
  state: LeaveState
  stage: number
}

export type LeaveOverview = {
  summary: {
    activeLeaves: number
    awaitingFinance: number
    awaitingPayment: number
    paymentVerified: number
  }
  running: RunningLeaveRow[]
  pending: PendingLeaveRow[]
}

export type LeaveEvent = {
  kind: LeaveState
  stage: number
  at: string
  actor: string | null
  note: string | null
}

export type LeaveDetail = {
  id: string
  state: LeaveState
  stage: number
  returnStatus: ReturnStatus | null
  student: {
    id: string
    nis: string | null
    name: string
    branch: string | null
    phone: string | null
    emergencyContact: string | null
    emergencyContactPhone: string | null
  }
  program: string | null
  position: Position
  frozenPosition: { level: string | null; chapter: string | null } | null
  number: string
  submittedAt: string
  approvedAt: string | null
  startsOn: string
  returnsOn: string
  returnedOn: string | null
  remainingDays: number
  reason: string
  hasEvidence: boolean
  hasProof: boolean
  finance: {
    paidIdr: number
    minimumIdr: number
    shortfallIdr: number
    amountIdr: number | null
    deadline: string | null
    note: string | null
    assessedBy: string | null
    assessedByUserId: string | null
    verifiedBy: string | null
    verifiedAt: string | null
  }
  rejectReason: string | null
  reapplyFrom: string | null
  needsDifferenceBilling: boolean
  returnClass: Reference | null
  timeline: LeaveEvent[]
  previous: { id: string; state: LeaveState; startsOn: string; returnsOn: string }[]
}

export type ReturnClass = {
  id: string
  name: string
  level: Reference
  branch: Reference
  capacity: number
  memberCount: number
}

export type OwnLeaveRow = {
  id: string
  state: LeaveState
  stage: number
  number: string
  submittedAt: string
  startsOn: string
  returnsOn: string
  returnedOn: string | null
  amountIdr: number | null
  deadline: string | null
  hasProof: boolean
  rejectReason: string | null
  reapplyFrom: string | null
}

export type OwnLeaves = {
  form: { name: string; position: Position }
  summary: { total: number; approved: number; inProgress: number; rejected: number }
  data: OwnLeaveRow[]
}

export type Tone = "beres" | "berjalan" | "tindakan" | "terbuka" | "terkunci"

export const STATE_BADGE: Readonly<Record<LeaveState, { label: string; tone: Tone }>> = {
  draft: { label: "Belum Dikirim", tone: "terkunci" },
  "awaiting-finance": { label: "Menunggu Verifikasi Finance", tone: "berjalan" },
  "payment-set": { label: "Menunggu Pembayaran", tone: "berjalan" },
  "awaiting-payment-check": { label: "Menunggu Verifikasi Pembayaran", tone: "terbuka" },
  processing: { label: "Cuti Diproses", tone: "terbuka" },
  approved: { label: "Cuti Disetujui", tone: "beres" },
  "on-leave": { label: "Cuti Dijalani", tone: "terbuka" },
  completed: { label: "Cuti Selesai", tone: "beres" },
  rejected: { label: "Ditolak", tone: "tindakan" },
  expired: { label: "Gugur", tone: "tindakan" },
}

export const DECISION_LABEL: Readonly<Partial<Record<LeaveState, string>>> = {
  "awaiting-finance": "Verifikasi Keuangan",
  "payment-set": "Verifikasi Pembayaran",
  "awaiting-payment-check": "Verifikasi Pembayaran",
  processing: "Persetujuan Akhir",
}

export const RETURN_STATUSES: readonly ReturnStatus[] = [
  "Lewat Batas",
  "Belum dikonfirmasi",
  "Siap kembali",
]

export const RETURN_TONE: Readonly<Record<ReturnStatus, Tone>> = {
  "Lewat Batas": "tindakan",
  "Belum dikonfirmasi": "berjalan",
  "Siap kembali": "beres",
}

export const STAGES = [
  "Pengajuan Terkirim",
  "Menunggu Verifikasi Finance",
  "Pembayaran Ditetapkan",
  "Menunggu Pembayaran",
  "Pembayaran Diverifikasi",
  "Cuti Disetujui",
  "Cuti Dijalani",
] as const

export type StageStatus = "Selesai" | "Saat ini" | "Menunggu" | "Ditolak" | "Gugur"

export const STAGE_TONE: Readonly<Record<StageStatus, Tone>> = {
  Selesai: "beres",
  "Saat ini": "berjalan",
  Menunggu: "terkunci",
  Ditolak: "tindakan",
  Gugur: "tindakan",
}

const REACHED_STATES: readonly LeaveState[] = ["approved", "on-leave", "completed"]

export function stageStatusOf(
  leave: { state: LeaveState; stage: number },
  stage: number,
): StageStatus {
  if (stage < leave.stage) return "Selesai"
  if (stage > leave.stage) return "Menunggu"
  if (leave.state === "rejected") return "Ditolak"
  if (leave.state === "expired") return "Gugur"
  return REACHED_STATES.includes(leave.state) ? "Selesai" : "Saat ini"
}

export const MAX_LEAVE_MONTHS = 6

export const remainingLabel = (days: number): string =>
  days < 0 ? `Lewat ${Math.abs(days)} hari` : `${days} hari`

export const latestReturnDate = (startsOn: string): string =>
  dayjs(startsOn).add(MAX_LEAVE_MONTHS, "month").format("YYYY-MM-DD")

export const leaveMonths = (startsOn: string, returnsOn: string): number =>
  dayjs(returnsOn).diff(dayjs(startsOn), "month")

export const positionLabel = (position: { level: string | null; chapter: string | null }) =>
  [position.level, position.chapter].filter(Boolean).join(" · ") || "Belum tercatat"

const noteRule = z.string().trim().max(1000)

const reasonRule = z
  .string()
  .trim()
  .min(10, "Tulis alasannya dalam satu kalimat utuh supaya siswa tahu apa yang terjadi.")
  .max(1000)

export const obligationFormSchema = z.object({
  amountIdr: z
    .number("Isi nominal kewajiban.")
    .int()
    .positive("Nominal kewajiban harus lebih dari nol."),
  deadline: z.iso.date("Tetapkan batas pembayaran."),
  note: noteRule.min(1, "Catatan Finance wajib diisi."),
})

export const rejectionFormSchema = z.object({
  reason: reasonRule,
  reapplyFrom: z.iso.date("Isi tanggal paling awal siswa dapat mengajukan ulang."),
})

export const proofRejectionFormSchema = z.object({ reason: reasonRule })

export const withdrawFormSchema = z.object({ reason: reasonRule })

export const returnFormSchema = z.object({
  classId: z.uuid("Pilih kelas tujuan."),
  isOverCapacityConfirmed: z.boolean(),
})

export const leaveRequestFormSchema = z
  .object({
    startsOn: z.iso.date("Pilih tanggal mulai cuti."),
    returnsOn: z.iso.date("Pilih tanggal rencana masuk kembali."),
    reason: z.string().trim().min(10, "Tulis alasan cuti dalam satu kalimat utuh.").max(2000),
  })
  .refine((values) => values.returnsOn > values.startsOn, {
    path: ["returnsOn"],
    message: "Tanggal masuk kembali harus sesudah tanggal mulai cuti.",
  })
  .refine((values) => values.returnsOn <= latestReturnDate(values.startsOn), {
    path: ["returnsOn"],
    message: `Durasi cuti maksimal ${MAX_LEAVE_MONTHS} bulan dari tanggal mulai.`,
  })

export type ObligationForm = z.infer<typeof obligationFormSchema>
export type RejectionForm = z.infer<typeof rejectionFormSchema>
export type ReturnForm = z.infer<typeof returnFormSchema>
export type LeaveRequestForm = z.infer<typeof leaveRequestFormSchema>
