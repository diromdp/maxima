import { monthlyEstimate, PACKAGES, type RegistrationPackage } from "../../(public)/register/data"
import { formatMoney, idr, type Money } from "@/src/lib/money"

export type PackageRow = RegistrationPackage & {
  readonly bridgingId: boolean
  readonly bridgingDe: boolean
  readonly monthly: Money | null
  readonly billingDay: number | null
}

const BRIDGING: Readonly<Record<string, { readonly id: boolean; readonly de: boolean }>> = {
  "ausbildung-36": { id: true, de: true },
  "ausbildung-37": { id: true, de: true },
  "ausbildung-39-2": { id: true, de: false },
  "ausbildung-45": { id: true, de: true },
  "ika-pasti": { id: false, de: false },
  "kursus-bahasa": { id: false, de: false },
}

const BILLING_DAY: Readonly<Record<string, number | null>> = {
  "ausbildung-36": 5,
  "ausbildung-37": 5,
  "ausbildung-39-2": 20,
  "ausbildung-45": 20,
  "ika-pasti": 5,
  "kursus-bahasa": null,
}

export const PACKAGE_ROWS: readonly PackageRow[] = PACKAGES.map((pkg) => {
  const billingDay = BILLING_DAY[pkg.id] ?? null
  return {
    ...pkg,
    bridgingId: BRIDGING[pkg.id]?.id ?? false,
    bridgingDe: BRIDGING[pkg.id]?.de ?? false,
    monthly: billingDay === null ? null : monthlyEstimate(pkg),
    billingDay,
  }
})

export const GATE_NAMES = [
  "Minimal DP",
  "A2",
  "B1",
  "B2",
  "Paspor",
  "Ujian Bahasa",
  "Workshop",
  "Cari Mitra",
  "Pengajuan Visa",
] as const

export type Gates = readonly (number | null)[]

const gates = (...values: (number | null)[]): Gates => values

export const GATES_BY_PACKAGE: Readonly<Record<string, Gates>> = {
  "ausbildung-45": gates(
    5_000_000,
    7_000_000,
    12_000_000,
    17_000_000,
    22_000_000,
    26_000_000,
    28_000_000,
    34_000_000,
    40_000_000,
  ),
  "ausbildung-36": gates(
    5_000_000,
    6_500_000,
    10_000_000,
    14_000_000,
    18_000_000,
    22_000_000,
    24_000_000,
    29_000_000,
    34_000_000,
  ),
  "ausbildung-37": gates(
    4_500_000,
    6_000_000,
    10_000_000,
    14_000_000,
    18_000_000,
    21_500_000,
    23_500_000,
    28_500_000,
    33_000_000,
  ),
  "ausbildung-39-2": gates(
    4_500_000,
    6_500_000,
    10_500_000,
    15_000_000,
    19_000_000,
    22_500_000,
    24_500_000,
    29_500_000,
    34_500_000,
  ),
  "ika-pasti": gates(5_000_000, 0, 0, 0, 12_000_000, 0, 0, 18_000_000, 22_000_000),
  "kursus-bahasa": gates(3_000_000, 4_000_000, 7_000_000, 10_000_000, null, 0, null, null, null),
}

export const formatGate = (value: number | null): string =>
  value === null ? "—" : value === 0 ? "0" : formatMoney(idr(value))

export const DISCOUNT_TYPES = ["Persentase", "Nominal"] as const
export type DiscountType = (typeof DISCOUNT_TYPES)[number]

export const PROMO_STATUSES = ["AKTIF", "DRAFT", "KEDALUWARSA"] as const
export type PromoStatus = (typeof PROMO_STATUSES)[number]

export const PROMO_STATUS_BADGE: Readonly<Record<PromoStatus, string>> = {
  AKTIF: "badge-success",
  DRAFT: "badge-neutral",
  KEDALUWARSA: "badge-danger",
}

export type Promo = {
  readonly id: string
  readonly name: string
  readonly code: string
  readonly discountType: DiscountType
  readonly value: number
  readonly packageIds: readonly string[]
  readonly start: string
  readonly end: string
  readonly status: PromoStatus
  readonly used: number
}

export const PROMOS: readonly Promo[] = [
  {
    id: "promo-1",
    name: "Promo Awal Tahun 2026",
    code: "AWAL2026",
    discountType: "Persentase",
    value: 10,
    packageIds: ["ausbildung-36", "ausbildung-45"],
    start: "2026-01-01",
    end: "2026-01-31",
    status: "KEDALUWARSA",
    used: 142,
  },
  {
    id: "promo-2",
    name: "Diskon Cepat B1",
    code: "MAXIMER625",
    discountType: "Nominal",
    value: 1_500_000,
    packageIds: ["ausbildung-45"],
    start: "2026-02-15",
    end: "2026-12-31",
    status: "AKTIF",
    used: 58,
  },
  {
    id: "promo-3",
    name: "Promo Ramadan Berkah",
    code: "RAMADAN15",
    discountType: "Persentase",
    value: 15,
    packageIds: [],
    start: "2026-03-01",
    end: "2026-04-10",
    status: "DRAFT",
    used: 0,
  },
  {
    id: "promo-4",
    name: "Diskon Khusus Alumni 4.2",
    code: "ALUMNI42",
    discountType: "Nominal",
    value: 2_000_000,
    packageIds: ["ausbildung-36"],
    start: "2026-03-01",
    end: "2026-12-31",
    status: "AKTIF",
    used: 12,
  },
  {
    id: "promo-5",
    name: "Diskon Merdeka Maxima",
    code: "MERDEKA81",
    discountType: "Persentase",
    value: 17,
    packageIds: [],
    start: "2026-08-01",
    end: "2026-08-31",
    status: "DRAFT",
    used: 0,
  },
]

export const formatDiscount = (promo: Pick<Promo, "discountType" | "value">): string =>
  promo.discountType === "Persentase" ? `${promo.value}%` : formatMoney(idr(promo.value))

export const appliesToLabel = (promo: Promo): string =>
  promo.packageIds.length === 0
    ? "Semua Paket"
    : promo.packageIds.map((id) => PACKAGES.find((pkg) => pkg.id === id)?.name ?? id).join(", ")

export const usedLabel = (promo: Promo): string => `${promo.used} kali`
