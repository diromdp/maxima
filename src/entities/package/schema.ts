import { z } from "zod"

import type { MasterStatus } from "@/src/entities/master-data/schema"

export type MasterRef = { id: string; code: string; name: string }

export type GateThreshold = MasterRef & { thresholdIdr: number | null }

export type PackageView = {
  id: string
  code: string
  name: string
  program: MasterRef
  priceIdr: number
  serviceFeeEurCents: number | null
  dpIdr: number
  installments: number
  durationMonths: number | null
  monthlyIdr: number | null
  monthlyEstimateIdr: number | null
  billingDay: number | null
  bridgingFundIdr: boolean
  bridgingFundEur: boolean
  status: MasterStatus
  levels: MasterRef[]
  gates: GateThreshold[]
  contractCount: number
}

export type GatePreview = {
  affectedContracts: number
  changes: (MasterRef & { fromIdr: number | null; toIdr: number | null })[]
}

export const DOWN_PAYMENT_GATE = "dp"

export const CENTS_PER_EURO = 100

export const DISCOUNT_TYPES = ["Persentase", "Nominal"] as const
export type DiscountType = (typeof DISCOUNT_TYPES)[number]

export const PROMO_STATUSES = ["AKTIF", "DRAFT", "KEDALUWARSA"] as const
export type PromoStatus = (typeof PROMO_STATUSES)[number]

export const EDITABLE_PROMO_STATUSES = ["AKTIF", "DRAFT"] as const

export type PromoView = {
  id: string
  code: string
  name: string
  discountType: DiscountType
  percent: number | null
  amountIdr: number | null
  startsOn: string
  endsOn: string
  status: PromoStatus
  packages: MasterRef[]
  usedCount: number
}

const PACKAGE_CODE = /^[a-z0-9]+(-[a-z0-9]+)*$/
const PROMO_CODE = /^[A-Za-z0-9-]+$/

const blank = z.literal("")
const rupiah = (message: string) => z.number(message).int("Nominal Rupiah harus angka bulat.")
const optionalRupiah = z.union([blank, rupiah("Isi nominal.").min(0)])

export const packageFormSchema = z
  .object({
    code: z.union([
      blank,
      z
        .string()
        .trim()
        .max(60)
        .regex(
          PACKAGE_CODE,
          "Kode paket hanya huruf kecil, angka, dan tanda hubung, misalnya ausbildung-45.",
        ),
    ]),
    name: z.string().trim().min(1, "Isi nama paket.").max(120),
    programId: z.string().min(1, "Pilih program."),
    priceIdr: z
      .union([blank, rupiah("Isi harga layanan.").positive("Harga layanan harus lebih dari 0.")])
      .refine((value) => value !== "", "Isi harga layanan."),
    serviceFeeEur: z.union([blank, z.number().min(0)]),
    durationMonths: z.union([
      blank,
      z
        .number()
        .int()
        .positive("Durasi harus lebih dari 0.")
        .max(120, "Durasi paling lama 120 bulan."),
    ]),
    monthlyIdr: z.union([blank, rupiah("Isi nominal.").positive("Nominal harus lebih dari 0.")]),
    billingDay: z.union([blank, z.number().int().min(1).max(31, "Tanggal tagih 1 sampai 31.")]),
    bridgingFundIdr: z.boolean(),
    bridgingFundEur: z.boolean(),
    status: z.enum(["Aktif", "Nonaktif"]),
    levelIds: z.array(z.string()).max(20),
    gates: z.record(z.string(), optionalRupiah),
  })
  .refine((form) => (form.monthlyIdr === "") === (form.billingDay === ""), {
    path: ["billingDay"],
    message: "Nominal Bulanan dan Tanggal Tagih diisi berdua atau dikosongkan berdua.",
  })

export type PackageForm = z.input<typeof packageFormSchema>

export const promoFormSchema = z
  .object({
    name: z.string().trim().min(1, "Isi nama promo.").max(120),
    code: z
      .string()
      .trim()
      .min(1, "Isi kode voucher.")
      .max(40)
      .regex(PROMO_CODE, "Kode promo hanya huruf, angka, dan tanda hubung."),
    discountType: z.enum(DISCOUNT_TYPES),
    value: z.union([blank, z.number().int("Nilai diskon harus angka bulat.").positive()]),
    packageIds: z.array(z.string()),
    startsOn: z.iso.date("Pilih tanggal mulai."),
    endsOn: z.iso.date("Pilih tanggal selesai."),
    status: z.enum(EDITABLE_PROMO_STATUSES),
  })
  .refine((form) => form.value !== "", { path: ["value"], message: "Isi nilai diskon." })
  .refine((form) => form.discountType !== "Persentase" || Number(form.value) <= 100, {
    path: ["value"],
    message: "Persentase paling besar 100.",
  })
  .refine((form) => form.endsOn >= form.startsOn, {
    path: ["endsOn"],
    message: "Tanggal akhir promo tidak boleh sebelum tanggal mulai.",
  })

export type PromoForm = z.infer<typeof promoFormSchema>
