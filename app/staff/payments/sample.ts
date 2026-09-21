import { eur, idr, type Money, sum } from "@/src/lib/money"

import { STUDENTS } from "../students/sample"

export const LANES = ["Rupiah", "Euro"] as const
export type Lane = (typeof LANES)[number]

export const STATUSES = ["Otomatis", "Menunggu", "Disahkan", "Ditolak"] as const
export type PaymentStatus = (typeof STATUSES)[number]

export const STATUS_BADGE: Readonly<Record<PaymentStatus, string>> = {
  Otomatis: "badge-success",
  Menunggu: "badge-warning",
  Disahkan: "badge-success",
  Ditolak: "badge-danger",
}

export const CASH_KINDS = ["Rupiah", "Euro", "Dana Talang"] as const
export type CashKind = (typeof CASH_KINDS)[number]

export type Method = "QRIS" | "Transfer VA" | "Bayar Cash" | "Tunai EUR" | "Dana Talang"

export type Payment = {
  readonly id: string
  readonly date: string
  readonly nis: string
  readonly lane: Lane
  readonly amount: Money
  readonly method: Method
  readonly status: PaymentStatus
  readonly branch: string
  readonly recordedBy: string | null
  readonly ratifiedBy: string | null
  readonly note: string
  readonly proof: string | null
  readonly rejectReason: string | null
}

const payment = (
  id: string,
  date: string,
  nis: string,
  amount: Money,
  method: Method,
  status: PaymentStatus,
  extra: Partial<Payment> = {},
): Payment => ({
  id,
  date,
  nis,
  lane: amount.currency === "IDR" ? "Rupiah" : "Euro",
  amount,
  method,
  status,
  branch: STUDENTS.find((student) => student.nis === nis)?.branch ?? "-",
  recordedBy: null,
  ratifiedBy: null,
  note: "",
  proof: null,
  rejectReason: null,
  ...extra,
})

export const PAYMENTS: readonly Payment[] = [
  payment("PAY-2026-0912-001", "2026-09-12", "20250233", idr(3_333_000), "Transfer VA", "Otomatis"),
  payment("PAY-2026-0911-002", "2026-09-11", "20250241", idr(5_000_000), "QRIS", "Otomatis"),
  payment("PAY-2026-0910-003", "2026-09-10", "20250258", eur(80_000), "Tunai EUR", "Menunggu", {
    recordedBy: "Staf Finance Sinta",
    note: "Pelunasan biaya sisi Jerman, dibayar di kasir Jakarta.",
    proof: "bukti-bayu-eur.jpg",
  }),
  payment(
    "PAY-2026-0908-004",
    "2026-09-08",
    "20250190",
    idr(10_000_000),
    "Dana Talang",
    "Disahkan",
    {
      recordedBy: "Staf Finance Sinta",
      ratifiedBy: "Manajer Finance Dwi",
      note: "Dana talang tahap 1.",
      proof: "bukti-siti-talang.pdf",
    },
  ),
  payment("PAY-2026-0905-005", "2026-09-05", "20240172", idr(5_000_000), "Bayar Cash", "Menunggu", {
    note: "Angsuran ke-7, bukti diunggah siswa dari portal.",
    proof: "bukti-nadia-cash.png",
  }),
  payment("PAY-2026-0902-006", "2026-09-02", "20240187", eur(50_000), "Tunai EUR", "Disahkan", {
    recordedBy: "Staf Finance Sinta",
    ratifiedBy: "Manajer Finance Dwi",
    proof: "bukti-rizky-eur.jpg",
  }),
  payment("PAY-2026-0828-007", "2026-08-28", "20250254", idr(3_333_000), "Bayar Cash", "Ditolak", {
    note: "Bukti kabur, nominal tidak terbaca.",
    proof: "bukti-dewi-cash.jpg",
    rejectReason: "Bukti tidak terbaca. Unggah ulang foto yang jelas.",
  }),
  payment("PAY-2026-0820-008", "2026-08-20", "20250233", idr(3_333_000), "Transfer VA", "Otomatis"),
  payment("PAY-2026-0814-009", "2026-08-14", "20250233", eur(10_000), "Tunai EUR", "Menunggu", {
    recordedBy: "Staf Finance Sinta",
    note: "Cicilan Euro kedua.",
    proof: "bukti-andi-eur.jpg",
  }),
  payment("PAY-2026-0720-010", "2026-07-20", "20250241", idr(3_333_000), "QRIS", "Otomatis"),
]

export type PaymentRow = Payment & {
  readonly studentName: string
  readonly contractNumber: string | null
}

export const withStudent = (row: Payment): PaymentRow => {
  const student = STUDENTS.find((candidate) => candidate.nis === row.nis)
  return {
    ...row,
    studentName: student?.name ?? row.nis,
    contractNumber: student?.contractNumber ?? null,
  }
}

export const PAYMENT_ROWS: readonly PaymentRow[] = PAYMENTS.map(withStudent)

export const needsRatification = (row: Payment): boolean => row.status === "Menunggu"

export const isValid = (row: Payment): boolean =>
  row.status === "Otomatis" || row.status === "Disahkan"

export const pendingQueue = (rows: readonly Payment[]): readonly Payment[] =>
  rows.filter(needsRatification)

export const receiptKey = (row: Payment): string => `${row.nis}-${row.date}-${row.amount.amount}`

export const receiptKind = (row: Payment): string =>
  row.method === "Dana Talang" ? "Kwitansi Dana Talang" : "Kwitansi"

export const totalValid = (rows: readonly Payment[], currency: Money["currency"]): Money =>
  sum(
    rows.filter((row) => isValid(row) && row.amount.currency === currency).map((row) => row.amount),
    currency,
  )

export const inRange = (row: Payment, from: string | null, to: string | null): boolean =>
  (from === null || row.date >= from) && (to === null || row.date <= to)
