import { z } from "zod"

import type { Currency } from "@/src/lib/money"

export const PAYMENT_STATUSES = ["Otomatis", "Menunggu", "Disahkan", "Ditolak"] as const
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number]

export const PAYMENT_STATUS_BADGE: Readonly<Record<PaymentStatus, string>> = {
  Otomatis: "badge-success",
  Menunggu: "badge-warning",
  Disahkan: "badge-success",
  Ditolak: "badge-danger",
}

export const LANE_LABEL: Readonly<Record<Currency, string>> = { IDR: "Rupiah", EUR: "Euro" }

export type PaymentKind = "Pembayaran" | "Dana Talang"
export type PaymentMethod = "QRIS" | "Transfer VA" | "Bayar Cash" | "Tunai EUR" | "Dana Talang"

export type PaymentRow = {
  readonly id: string
  readonly paidOn: string
  readonly student: { readonly id: string; readonly name: string; readonly nis: string | null }
  readonly contractId: string
  readonly contractNumber: string | null
  readonly currency: Currency
  readonly kind: PaymentKind
  readonly amount: number
  readonly method: PaymentMethod
  readonly status: PaymentStatus
}

export type PaymentDetail = PaymentRow & {
  readonly branch: { readonly id: string; readonly name: string } | null
  readonly orderId: string | null
  readonly recordedBy: string | null
  readonly recordedByUserId: string | null
  readonly ratifiedBy: string | null
  readonly receivedByName: string | null
  readonly note: string | null
  readonly hasProof: boolean
  readonly rejectReason: string | null
}

export type PaymentStudentOption = {
  readonly id: string
  readonly nis: string | null
  readonly name: string
  readonly contractNumber: string | null
  readonly branch: { readonly id: string; readonly name: string }
  readonly bridgingFundIdr: boolean
  readonly bridgingFundEur: boolean
  readonly hasServiceFeeEur: boolean
}

export type ProofUpload = {
  readonly url: string
  readonly headers: { "Content-Type": string }
  readonly proofId: string
}

export const PAYMENT_FILTERS = ["currency", "status", "from", "to"] as const

export const isValidPayment = (payment: Pick<PaymentRow, "status">): boolean =>
  payment.status === "Otomatis" || payment.status === "Disahkan"

export const CASH_KINDS = ["Rupiah", "Euro", "Dana Talang"] as const
export type CashKind = (typeof CASH_KINDS)[number]

export const cashFormSchema = z.object({
  studentId: z.string().min(1, "Pilih siswanya."),
  paidOn: z.string().min(1, "Isi tanggal pembayaran."),
  cashKind: z.enum(CASH_KINDS, "Pilih jenis pembayaran."),
  bridgingCurrency: z.enum(["IDR", "EUR"]).nullable(),
  amount: z.number("Isi nominalnya.").positive("Nominal harus lebih dari nol."),
  receivedByName: z.string().trim().min(1, "Nama penerima wajib diisi.").max(120),
  branchId: z.string().min(1, "Pilih cabang."),
  note: z.string().trim().max(1000),
})

export type CashForm = Omit<z.input<typeof cashFormSchema>, "cashKind" | "amount"> & {
  cashKind: CashKind | null
  amount: number | string
}

export const rejectFormSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, "Tulis alasan penolakan supaya siswa tahu apa yang harus diperbaiki.")
    .max(500),
})

export function paymentInputOf(values: CashForm): {
  kind: PaymentKind
  currency: Currency
  amount: number
} {
  const currency: Currency =
    values.cashKind === "Dana Talang"
      ? (values.bridgingCurrency ?? "IDR")
      : values.cashKind === "Euro"
        ? "EUR"
        : "IDR"
  const amount = Number(values.amount)
  return {
    kind: values.cashKind === "Dana Talang" ? "Dana Talang" : "Pembayaran",
    currency,
    amount: currency === "EUR" ? Math.round(amount * 100) : Math.round(amount),
  }
}
