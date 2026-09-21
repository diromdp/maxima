import {
  DEFAULT_PACKAGE_ID,
  INITIAL_VALUES as PUBLIC_INITIAL_VALUES,
  PACKAGES,
  resolvePromo,
  type RegistrationValues as PublicRegistrationValues,
} from "../../(public)/register/data"
import { subtract, ZERO_IDR, type Money } from "../../../src/lib/money"

export type StaffProgram = "Ausbildung" | "FSJ" | "Studium"

export const STAFF_PROGRAMS: readonly {
  readonly value: StaffProgram
  readonly label: string
  readonly note: string
}[] = [
  { value: "Ausbildung", label: "Ausbildung", note: "Kursus bahasa lalu kerja sambil sekolah" },
  { value: "FSJ", label: "FSJ (Voluntary Work)", note: "Kerja sosial sukarela satu tahun" },
  { value: "Studium", label: "Studium (Kuliah Reguler)", note: "Kuliah di kampus Jerman" },
]

export const ENTRY_PATHS = ["Reguler", "Mandiri"] as const
export const PAYMENT_METHODS = ["Virtual Account", "QRIS", "Transfer Manual"] as const
export const LEAD_SOURCES = ["Instagram", "Website", "Referensi", "Pameran", "Walk-in"] as const
export const CONSULTANTS = ["Ratna Sari", "Hendra W.", "Andri W.", "Siti Rahma"] as const
export const BRANCHES = ["Bandung", "Jakarta", "Surabaya", "Medan"] as const

export type RegistrationValues = PublicRegistrationValues & {
  nickname: string
  entryPath: string
  notes: string
  paymentMethod: string
  downPayment: number | string
  agreeContract: boolean
  agreeSignature: boolean
}

export const INITIAL_VALUES: RegistrationValues = {
  ...PUBLIC_INITIAL_VALUES,
  program: "Ausbildung",
  nickname: "",
  entryPath: "",
  notes: "",
  paymentMethod: "",
  downPayment: "",
  agreeContract: false,
  agreeSignature: false,
}

export const STEPS = [
  { title: "Data Diri", short: "Data Diri" },
  { title: "Program", short: "Program" },
  { title: "Paket & Kontrak", short: "Paket & Kontrak" },
  { title: "Dokumen Pribadi", short: "Dokumen Pribadi" },
  { title: "Akun Admission", short: "Akun Admission" },
] as const

export const selectedPackage = (packageId: string) =>
  PACKAGES.find((p) => p.id === packageId) ?? PACKAGES.find((p) => p.id === DEFAULT_PACKAGE_ID)!

export function priceBreakdown(
  packageId: string,
  promoCode: string,
): {
  readonly price: Money
  readonly discount: Money
  readonly final: Money
  readonly promoValid: boolean
} {
  const pkg = selectedPackage(packageId)
  const promo = resolvePromo(promoCode)
  const discount = promo.valid ? promo.discount : ZERO_IDR
  return {
    price: pkg.price,
    discount,
    final: subtract(pkg.price, discount),
    promoValid: promo.valid,
  }
}
