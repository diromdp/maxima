import dayjs from "dayjs"

import { formatDateLong } from "@/src/lib/format"
import { idr, type Money } from "@/src/lib/money"

export const STAGES = [
  "Pengajuan Terkirim",
  "Menunggu Verifikasi Finance",
  "Pembayaran Ditetapkan",
  "Menunggu Pembayaran",
  "Pembayaran Diverifikasi",
  "Cuti Diproses",
  "Cuti Disetujui",
] as const

export type LeaveStateKind =
  | "draft"
  | "awaiting-finance"
  | "payment-set"
  | "awaiting-payment-check"
  | "processing"
  | "approved"
  | "on-leave"
  | "completed"
  | "rejected"

export type LeaveState =
  | { readonly kind: Exclude<LeaveStateKind, "rejected"> }
  | { readonly kind: "rejected"; readonly atStage: number }

export type FinanceCalc = {
  readonly totalPaid: Money
  readonly minimumBeforeLeave: Money
  readonly deadline: string
}

export type PaymentProof = {
  readonly name: string
  readonly amount: Money
  readonly trxId: string
}

export type Rejection = {
  readonly stageLabel: string
  readonly decidedAt: string
  readonly headline: string
  readonly reason: string
}

export type LeaveApplication = {
  readonly id: string
  readonly submittedAt: string
  readonly start: string
  readonly end: string
  readonly reason: string
  readonly document: { readonly name: string; readonly href: string }
  readonly position: string
  readonly state: LeaveState
  readonly finance?: FinanceCalc
  readonly proof?: PaymentProof
  readonly verifiedAt?: string
  readonly rejection?: Rejection
  readonly returnDate?: string
}

export const STUDENT = {
  name: "Andi Nugroho",
  className: "B1",
  position: "B1 - Kapitel 7",
} as const

export const MAX_MONTHS = 6

export const TERMS = [
  "Cuti hanya dapat diambil satu kali selama masa belajar.",
  "Durasi cuti maksimal 6 bulan.",
  "Pengajuan diajukan minimal 1 bulan sebelum tanggal mulai cuti.",
  "Wajib menyelesaikan biaya yang ditetapkan Finance sebelum cuti berjalan.",
  "Saat kembali, siswa ditempatkan di level yang kira-kira sama; bila harus turun level, siswa membayar selisihnya.",
  "Melewati tanggal masuk kembali berarti keluar dari manajemen Maxima dan kembali sebagai siswa baru.",
  "Surat kontrak tetap berlaku selama masa cuti.",
] as const

export const PAGE_SUBTITLE =
  "Cuti hanya dapat diambil sekali dan maksimal 6 bulan - pengajuan siswa akan diverifikasi Finance sebelum nominal pembayaran ditetapkan."

export const TERMS_SUMMARY =
  "Cuti hanya dapat diambil satu kali sepanjang masa belajar dan durasi maksimal 6 bulan."

export const DRAFT = {
  start: "2027-10-01",
  end: "2028-02-01",
  reason: "Mendampingi orang tua yang sedang dirawat di luar kota",
  document: { name: "tanda-tangan-andi.png", size: 86_016 },
} as const

const SUBMITTED: Omit<LeaveApplication, "state"> = {
  id: "CUTI-2026-0719-0233",
  submittedAt: "2026-07-15T09:42:00+07:00",
  start: "2026-10-01",
  end: "2027-02-01",
  reason: "Mendampingi orang tua yang sedang dirawat di luar kota",
  document: { name: "Surat Dokter.pdf", href: "#" },
  position: "B1 - Kapitel 7",
  finance: {
    totalPaid: idr(22_000_000),
    minimumBeforeLeave: idr(25_000_000),
    deadline: "2026-07-22T23:59:00+07:00",
  },
  proof: {
    name: "bukti-transfer-cuti.pdf",
    amount: idr(3_000_000),
    trxId: "TRX-260718-8841",
  },
  verifiedAt: "2026-07-18T14:20:00+07:00",
  rejection: {
    stageLabel: "Persetujuan akhir cuti",
    decidedAt: "2026-07-19T10:15:00+07:00",
    headline: "Periode cuti perlu disesuaikan",
    reason:
      "Tanggal mulai terlalu dekat dengan ujian level. Ajukan kembali dengan tanggal mulai setelah 15 Oktober 2026 atau hubungi Finance untuk klarifikasi.",
  },
  returnDate: "2027-02-02",
}

export function applicationInState(state: LeaveState): LeaveApplication {
  return { ...SUBMITTED, state }
}

export const APPLICATIONS: readonly LeaveApplication[] = [
  {
    ...SUBMITTED,
    id: "CUTI-2026-1201-0233",
    submittedAt: "2026-09-04T10:05:00+07:00",
    start: "2026-12-01",
    end: "2027-03-01",
    finance: { ...SUBMITTED.finance!, deadline: "2026-09-25T23:59:00+07:00" },
    proof: undefined,
    verifiedAt: undefined,
    rejection: undefined,
    returnDate: undefined,
    state: { kind: "payment-set" },
  },
  {
    ...SUBMITTED,
    id: "CUTI-2026-0515-0233",
    submittedAt: "2026-04-08T08:30:00+07:00",
    start: "2026-05-15",
    end: "2026-11-15",
    finance: undefined,
    proof: undefined,
    verifiedAt: undefined,
    returnDate: undefined,
    rejection: {
      stageLabel: "Verifikasi Finance",
      decidedAt: "2026-04-10T15:40:00+07:00",
      headline: "Riwayat pembayaran belum memenuhi syarat",
      reason:
        "Ada tiga angsuran yang belum dibayar. Lunasi dulu, lalu ajukan kembali. Hubungi Finance kalau perlu penjadwalan ulang.",
    },
    state: { kind: "rejected", atStage: 2 },
  },
  {
    ...SUBMITTED,
    id: "CUTI-2025-1001-0233",
    submittedAt: "2025-08-20T11:12:00+07:00",
    start: "2025-10-01",
    end: "2026-02-01",
    finance: {
      ...SUBMITTED.finance!,
      totalPaid: idr(25_000_000),
      deadline: "2025-08-27T23:59:00+07:00",
    },
    verifiedAt: "2025-08-25T09:00:00+07:00",
    rejection: undefined,
    returnDate: "2026-02-02",
    state: { kind: "completed" },
  },
]

export const APPLICATION: LeaveApplication = APPLICATIONS[0]!

export function findApplication(id: string): LeaveApplication | undefined {
  return APPLICATIONS.find((a) => a.id === id)
}

export function monthsBetween(start: string, end: string): number {
  return dayjs(end).diff(dayjs(start), "month")
}

export function periodLabel(a: LeaveApplication): string {
  return `${formatDateLong(a.start)} - ${formatDateLong(a.end)}`
}

export function durationLabel(a: LeaveApplication): string {
  return `${monthsBetween(a.start, a.end)} bulan`
}

export function activeApplication(apps: readonly LeaveApplication[]): LeaveApplication | null {
  return apps.find((a) => !["rejected", "completed"].includes(a.state.kind)) ?? null
}

export function currentStage(state: LeaveState): number {
  switch (state.kind) {
    case "draft":
      return 0
    case "awaiting-finance":
      return 2
    case "payment-set":
      return 4
    case "awaiting-payment-check":
      return 5
    case "processing":
      return 6
    case "approved":
    case "on-leave":
    case "completed":
      return 7
    case "rejected":
      return state.atStage
  }
}

export type StageStatus = "Selesai" | "Saat ini" | "Menunggu" | "Ditolak"

const SETTLED: readonly LeaveStateKind[] = ["approved", "on-leave", "completed"]

export function stageStatus(state: LeaveState, stage: number): StageStatus {
  if (state.kind === "rejected") {
    if (stage < state.atStage) return "Selesai"
    return stage === state.atStage ? "Ditolak" : "Menunggu"
  }
  if (SETTLED.includes(state.kind)) return "Selesai"
  const current = currentStage(state)
  if (stage < current) return "Selesai"
  return stage === current ? "Saat ini" : "Menunggu"
}

export type Tone = "beres" | "berjalan" | "tindakan" | "terbuka"

export const STAGE_BADGE: Readonly<Record<StageStatus, string>> = {
  Selesai: "badge-beres",
  "Saat ini": "badge-berjalan",
  Menunggu: "badge-terkunci",
  Ditolak: "badge-tindakan",
}

export type Heading = {
  readonly title: string
  readonly description: string
  readonly badge: string
  readonly tone: Tone
}

export function stateHeading(state: LeaveState): Heading {
  switch (state.kind) {
    case "draft":
      return {
        title: "Pengajuan Cuti",
        description: PAGE_SUBTITLE,
        badge: "Belum Dikirim",
        tone: "terbuka",
      }
    case "awaiting-finance":
      return {
        title: "Menunggu Verifikasi Finance",
        description:
          "Pengajuan sudah terkirim dan sedang diperiksa Finance. Estimasi maksimal 2 × 24 jam hari kerja.",
        badge: "Menunggu Verifikasi Finance",
        tone: "berjalan",
      }
    case "payment-set":
      return {
        title: "Pembayaran Ditetapkan",
        description: "Finance telah menetapkan kewajiban sebelum proses cuti dapat dilanjutkan.",
        badge: "Menunggu Pembayaran",
        tone: "berjalan",
      }
    case "awaiting-payment-check":
      return {
        title: "Menunggu Verifikasi Pembayaran",
        description: "Bukti pembayaran sudah dikirim dan sedang diverifikasi Finance.",
        badge: "Menunggu Verifikasi Pembayaran",
        tone: "terbuka",
      }
    case "processing":
      return {
        title: "Cuti Diproses",
        description: "Pembayaran telah diverifikasi. Pengajuan kini masuk tahap persetujuan cuti.",
        badge: "Cuti Diproses",
        tone: "terbuka",
      }
    case "approved":
      return {
        title: "Cuti Disetujui",
        description: "Pengajuan cuti selesai dan jadwal kembali telah ditetapkan.",
        badge: "Cuti Disetujui",
        tone: "beres",
      }
    case "on-leave":
      return {
        title: "Cuti Dijalani",
        description: "Anda sedang cuti. Kelas dan level Anda dijaga sampai tanggal kembali.",
        badge: "Cuti Dijalani",
        tone: "terbuka",
      }
    case "completed":
      return {
        title: "Cuti Selesai",
        description: "Anda sudah kembali ke kelas.",
        badge: "Cuti Selesai",
        tone: "beres",
      }
    case "rejected":
      return {
        title: "Cuti Ditolak",
        description: "Pengajuan belum dapat dilanjutkan. Lihat alasan dan langkah berikutnya.",
        badge: "Cuti Ditolak",
        tone: "tindakan",
      }
  }
}

export function shortfall(f: FinanceCalc): Money {
  return idr(Math.max(0, f.minimumBeforeLeave.amount - f.totalPaid.amount))
}

export function historyCounts(apps: readonly LeaveApplication[]) {
  const approved = apps.filter((a) => SETTLED.includes(a.state.kind))
  const rejected = apps.filter((a) => a.state.kind === "rejected")
  return {
    total: apps.length,
    approved: approved.length,
    inProgress: apps.length - approved.length - rejected.length,
    rejected: rejected.length,
  }
}

export function historyBadge(state: LeaveState): { label: string; tone: Tone } {
  const { badge, tone } = stateHeading(state)
  return state.kind === "rejected" ? { label: "Ditolak", tone } : { label: badge, tone }
}

export function paymentSummary(a: LeaveApplication): { amount: Money | null; label: string } {
  if (a.state.kind === "rejected") return { amount: null, label: "Tidak ada kewajiban" }
  if (!a.finance) return { amount: null, label: "Menunggu ketetapan Finance" }
  const due = shortfall(a.finance)
  if (a.state.kind === "payment-set") return { amount: due, label: "Belum dibayar" }
  if (a.state.kind === "awaiting-payment-check")
    return { amount: due, label: "Menunggu verifikasi" }
  return { amount: a.finance.minimumBeforeLeave, label: "Lunas" }
}

export function historyNote(a: LeaveApplication): { text: string; tone?: Tone } {
  switch (a.state.kind) {
    case "rejected":
      return { text: a.rejection?.reason ?? "Ditolak", tone: "tindakan" }
    case "payment-set":
      return a.finance
        ? { text: `Batas bayar ${formatDateLong(a.finance.deadline)}`, tone: "berjalan" }
        : { text: "Menunggu ketetapan Finance" }
    case "awaiting-finance":
      return { text: "Finance memeriksa riwayat pembayaran" }
    case "awaiting-payment-check":
      return { text: "Bukti pembayaran sedang diverifikasi" }
    case "processing":
      return { text: "Menunggu persetujuan akhir" }
    case "approved":
    case "on-leave":
    case "completed":
      return {
        text: a.returnDate
          ? `Kembali ${formatDateLong(a.returnDate)}`
          : "Jadwal kembali belum ditetapkan",
      }
    case "draft":
      return { text: "Belum dikirim" }
  }
}
