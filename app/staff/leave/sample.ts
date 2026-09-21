import dayjs from "dayjs"

import { idr } from "../../../src/lib/money.ts"
import {
  currentStage,
  type LeaveApplication,
  type LeaveState,
  STAGES,
} from "../../portal/leave/leave.ts"

export type LeaveStudent = {
  readonly nis: string
  readonly name: string
  readonly packageName: string
  readonly level: string
  readonly className: string
  readonly branch: string
  readonly phone: string
  readonly emergencyContact: string
}

export type StaffLeave = LeaveApplication & {
  readonly student: LeaveStudent
  readonly stageTimes: Readonly<Partial<Record<number, string>>>
  readonly financeNote?: string
  readonly financeVerifier?: string
  readonly returnStatus?: "Belum dikonfirmasi" | "Siap kembali"
  readonly previousLeaves: readonly {
    readonly reason: string
    readonly period: string
    readonly status: string
  }[]
}

const student = (
  nis: string,
  name: string,
  packageName: string,
  level: string,
  className: string,
  branch: string,
): LeaveStudent => ({
  nis,
  name,
  packageName,
  level,
  className,
  branch,
  phone: "0812xxxxxxx",
  emergencyContact: "0813xxxxxxx (orang tua)",
})

export const LEAVES: readonly StaffLeave[] = [
  {
    id: "CUTI-2026-0719-0233",
    student: student("20250233", "Andi Nugroho", "Ausbildung 45", "B1", "Kelas Berlin", "Bandung"),
    submittedAt: "2026-07-15T09:42:00+07:00",
    start: "2026-10-01",
    end: "2027-02-01",
    reason: "Mendampingi orang tua yang sedang dirawat di luar kota",
    document: { name: "Surat Dokter.pdf", href: "#" },
    position: "B1 - Kapitel 7",
    state: { kind: "awaiting-finance" },
    finance: {
      totalPaid: idr(22_000_000),
      minimumBeforeLeave: idr(25_000_000),
      deadline: "2026-07-22T23:59:00+07:00",
    },
    financeNote: "Pembayaran siswa belum mencapai cicilan minimum sebelum cuti.",
    stageTimes: { 1: "2026-07-15T09:42:00+07:00", 2: "2026-07-15T09:43:00+07:00" },
    previousLeaves: [
      { reason: "Izin Pulang Kampung", period: "10 Jan - 15 Jan 2026 (5 hari)", status: "Selesai" },
    ],
  },
  {
    id: "CUTI-2026-0801-0254",
    student: student("20250254", "Dewi Lestari", "Ausbildung 45", "A2", "Kelas Hamburg", "Medan"),
    submittedAt: "2026-09-08T10:12:00+07:00",
    start: "2026-10-05",
    end: "2027-01-05",
    reason: "Cuti demi mengikuti latihan intensif",
    document: { name: "Surat Keterangan.pdf", href: "#" },
    position: "A2 - Kapitel 9",
    state: { kind: "awaiting-finance" },
    stageTimes: { 1: "2026-09-08T10:12:00+07:00", 2: "2026-09-08T10:13:00+07:00" },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0812-0261",
    student: student("20250261", "Yusuf Hamdan", "Ausbildung 44", "A1", "Kelas Köln", "Jakarta"),
    submittedAt: "2026-09-12T14:30:00+07:00",
    start: "2026-11-01",
    end: "2027-03-01",
    reason: "Persiapan pernikahan dan menjaga keluarga",
    document: { name: "Surat Pernyataan.pdf", href: "#" },
    position: "A1 - Kapitel 11",
    state: { kind: "awaiting-finance" },
    stageTimes: { 1: "2026-09-12T14:30:00+07:00", 2: "2026-09-12T14:31:00+07:00" },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0720-0241",
    student: student("20250241", "Rina Agustina", "Ausbildung 45", "A1", "Kelas Berlin", "Bandung"),
    submittedAt: "2026-08-20T08:05:00+07:00",
    start: "2026-11-15",
    end: "2027-02-15",
    reason: "Mengurus administrasi keluarga di luar negeri",
    document: { name: "Surat Undangan.pdf", href: "#" },
    position: "A1 - Kapitel 8",
    state: { kind: "awaiting-payment-check" },
    finance: {
      totalPaid: idr(23_000_000),
      minimumBeforeLeave: idr(25_890_000),
      deadline: "2026-09-25T23:59:00+07:00",
    },
    proof: { name: "Bukti Pembayaran.pdf", amount: idr(2_890_000), trxId: "TRX-260918-7712" },
    financeNote: "Kewajiban ditetapkan Staf Finance, menunggu bukti diverifikasi.",
    stageTimes: {
      1: "2026-08-20T08:05:00+07:00",
      2: "2026-08-20T08:06:00+07:00",
      3: "2026-08-22T11:20:00+07:00",
      4: "2026-09-18T16:40:00+07:00",
    },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0808-0247",
    student: student(
      "20250247",
      "Hendra Wijaya",
      "Ausbildung 45",
      "B1",
      "Kelas Hamburg",
      "Jakarta",
    ),
    submittedAt: "2026-08-08T13:30:00+07:00",
    start: "2026-11-01",
    end: "2027-03-01",
    reason: "Mendampingi istri melahirkan dan masa pemulihannya",
    document: { name: "Surat Keterangan.pdf", href: "#" },
    position: "B1 - Kapitel 3",
    state: { kind: "payment-set" },
    finance: {
      totalPaid: idr(21_500_000),
      minimumBeforeLeave: idr(25_000_000),
      deadline: "2026-09-30T23:59:00+07:00",
    },
    financeNote: "Kewajiban sudah dikirim ke siswa, bukti belum masuk.",
    stageTimes: {
      1: "2026-08-08T13:30:00+07:00",
      2: "2026-08-08T13:31:00+07:00",
      3: "2026-08-10T09:15:00+07:00",
    },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0705-0258",
    student: student("20250258", "Bayu Saputra", "Ausbildung 44", "A2", "Kelas Köln", "Jakarta"),
    submittedAt: "2026-08-01T09:00:00+07:00",
    start: "2026-10-10",
    end: "2027-01-10",
    reason: "Pemulihan pasca operasi",
    document: { name: "Surat Dokter.pdf", href: "#" },
    position: "A2 - Kapitel 5",
    state: { kind: "processing" },
    finance: {
      totalPaid: idr(26_000_000),
      minimumBeforeLeave: idr(25_000_000),
      deadline: "2026-08-08T23:59:00+07:00",
    },
    verifiedAt: "2026-08-03T10:15:00+07:00",
    financeVerifier: "Manajer Finance Dwi",
    returnDate: "2027-01-11",
    stageTimes: {
      1: "2026-08-01T09:00:00+07:00",
      2: "2026-08-01T09:01:00+07:00",
      5: "2026-08-03T10:15:00+07:00",
    },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0501-0190",
    student: student("20250190", "Siti Rohmah", "Ausbildung 43", "B1", "Kelas Wien", "Surabaya"),
    submittedAt: "2026-05-02T10:00:00+07:00",
    start: "2026-07-01",
    end: "2026-12-01",
    reason: "Merawat anggota keluarga",
    document: { name: "Surat Dokter.pdf", href: "#" },
    position: "B1 - Kapitel 4",
    state: { kind: "on-leave" },
    finance: {
      totalPaid: idr(20_000_000),
      minimumBeforeLeave: idr(20_000_000),
      deadline: "2026-05-10T23:59:00+07:00",
    },
    verifiedAt: "2026-05-06T09:30:00+07:00",
    financeVerifier: "Manajer Finance Dwi",
    returnDate: "2026-12-02",
    returnStatus: "Belum dikonfirmasi",
    stageTimes: {
      1: "2026-05-02T10:00:00+07:00",
      2: "2026-05-02T10:01:00+07:00",
      3: "2026-05-04T14:00:00+07:00",
      4: "2026-05-05T09:00:00+07:00",
      5: "2026-05-06T09:30:00+07:00",
      6: "2026-05-07T11:00:00+07:00",
      7: "2026-05-07T11:05:00+07:00",
    },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0601-0187",
    student: student(
      "20240187",
      "Rizky Ramadhan",
      "Ausbildung 45",
      "A2",
      "Kelas Berlin",
      "Bandung",
    ),
    submittedAt: "2026-06-01T09:00:00+07:00",
    start: "2026-08-01",
    end: "2026-09-23",
    reason: "Mengikuti program magang singkat",
    document: { name: "Surat Magang.pdf", href: "#" },
    position: "A2 - Kapitel 7",
    state: { kind: "on-leave" },
    finance: {
      totalPaid: idr(25_000_000),
      minimumBeforeLeave: idr(25_000_000),
      deadline: "2026-06-08T23:59:00+07:00",
    },
    verifiedAt: "2026-06-03T10:00:00+07:00",
    financeVerifier: "Manajer Finance Dwi",
    returnDate: "2026-09-24",
    returnStatus: "Siap kembali",
    stageTimes: {
      1: "2026-06-01T09:00:00+07:00",
      2: "2026-06-01T09:01:00+07:00",
      5: "2026-06-03T10:00:00+07:00",
      6: "2026-06-04T09:00:00+07:00",
      7: "2026-06-04T09:05:00+07:00",
    },
    previousLeaves: [],
  },
  {
    id: "CUTI-2026-0115-0188",
    student: student("20240188", "Yoga Pratama", "Ausbildung 40", "B1", "Kelas Wien", "Jakarta"),
    submittedAt: "2026-01-15T09:00:00+07:00",
    start: "2026-03-01",
    end: "2026-09-01",
    reason: "Bekerja sementara untuk membantu keluarga",
    document: { name: "Surat Pernyataan.pdf", href: "#" },
    position: "B1 - Kapitel 2",
    state: { kind: "on-leave" },
    finance: {
      totalPaid: idr(18_000_000),
      minimumBeforeLeave: idr(18_000_000),
      deadline: "2026-01-22T23:59:00+07:00",
    },
    verifiedAt: "2026-01-18T10:00:00+07:00",
    financeVerifier: "Manajer Finance Dwi",
    returnDate: "2026-09-02",
    returnStatus: "Belum dikonfirmasi",
    stageTimes: {
      1: "2026-01-15T09:00:00+07:00",
      2: "2026-01-15T09:01:00+07:00",
      5: "2026-01-18T10:00:00+07:00",
      6: "2026-01-19T09:00:00+07:00",
      7: "2026-01-19T09:05:00+07:00",
    },
    previousLeaves: [],
  },
]

export const findLeave = (id: string): StaffLeave | undefined => LEAVES.find((l) => l.id === id)

export const leavesInState = (kinds: readonly LeaveState["kind"][]): readonly StaffLeave[] =>
  LEAVES.filter((l) => kinds.includes(l.state.kind))

export function remainingDays(l: StaffLeave, today: Date = new Date()): number {
  return dayjs(l.end).startOf("day").diff(dayjs(today).startOf("day"), "day")
}

export const isOverdue = (l: StaffLeave, today: Date = new Date()): boolean =>
  l.state.kind === "on-leave" && remainingDays(l, today) < 0

export const DECISION_STATES = [
  "awaiting-finance",
  "payment-set",
  "awaiting-payment-check",
  "processing",
] as const satisfies readonly LeaveState["kind"][]

export function decisionLabel(l: StaffLeave): string {
  switch (l.state.kind) {
    case "awaiting-finance":
      return "Verifikasi Keuangan"
    case "payment-set":
    case "awaiting-payment-check":
      return "Verifikasi Pembayaran"
    case "processing":
      return "Persetujuan Akhir"
    default:
      return "Detail"
  }
}

export const returnLabel = (l: StaffLeave, today: Date = new Date()): string =>
  isOverdue(l, today) ? "Lewat Batas" : (l.returnStatus ?? "Belum dikonfirmasi")

export const returnTone = (l: StaffLeave, today: Date = new Date()): string =>
  isOverdue(l, today) ? "tindakan" : l.returnStatus === "Siap kembali" ? "beres" : "berjalan"

export const remainingLabel = (l: StaffLeave, today: Date = new Date()): string => {
  const days = remainingDays(l, today)
  return days < 0 ? `Lewat ${Math.abs(days)} hari` : `${days} hari`
}

export const RETURN_STATUSES = ["Lewat Batas", "Belum dikonfirmasi", "Siap kembali"] as const

export const REMINDER_DAYS = 14

export function monitoringCounts(leaves: readonly StaffLeave[], today: Date = new Date()) {
  return {
    active: leaves.filter((l) => l.state.kind === "on-leave" && !isOverdue(l, today)).length,
    awaitingFinance: leaves.filter((l) => l.state.kind === "awaiting-finance").length,
    awaitingPayment: leaves.filter(
      (l) => l.state.kind === "payment-set" || l.state.kind === "awaiting-payment-check",
    ).length,
    paymentVerified: leaves.filter((l) => l.state.kind === "processing").length,
  }
}

export type TimelineEntry = {
  readonly stage: number
  readonly label: string
  readonly at: string | null
  readonly done: boolean
  readonly current: boolean
}

export function timeline(l: StaffLeave): readonly TimelineEntry[] {
  const current = currentStage(l.state)
  return STAGES.map((label, index) => {
    const stage = index + 1
    return {
      stage,
      label,
      at: l.stageTimes[stage] ?? null,
      done: stage < current || ["approved", "on-leave", "completed"].includes(l.state.kind),
      current: stage === current && !["approved", "on-leave", "completed"].includes(l.state.kind),
    }
  })
}
