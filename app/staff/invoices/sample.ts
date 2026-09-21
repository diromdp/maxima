import { add, idr, type Money, shortfall, ZERO_EUR, ZERO_IDR } from "@/src/lib/money"

import { PACKAGE_ROWS, type PackageRow } from "../packages-promos/sample"
import { isValid, PAYMENTS } from "../payments/sample"
import { type Student, STUDENTS } from "../students/sample"

export const TODAY = "2026-09-20"

export const DUE_SOON_DAYS = 7

const LEGACY_PACKAGE: Readonly<Record<string, string>> = {
  "Ausbildung 44": "ausbildung-36",
  "Ausbildung 43": "ausbildung-37",
  "Ausbildung 41": "ika-pasti",
  "Ausbildung 40": "ausbildung-39-2",
}

export const ENROLLED_AT: Readonly<Record<string, string>> = {
  "20250233": "2026-01-15",
  "20250241": "2026-02-03",
  "20250258": "2026-03-10",
  "20250190": "2025-11-20",
  "20240172": "2024-08-12",
  "20240187": "2024-09-30",
  "20250254": "2026-04-06",
  "20240188": "2024-07-01",
  "20240199": "2024-10-14",
}

export const packageOf = (student: Student): PackageRow | undefined =>
  PACKAGE_ROWS.find(
    (pkg) => pkg.name === student.packageName || pkg.id === LEGACY_PACKAGE[student.packageName],
  )

const paidOf = (nis: string, currency: Money["currency"]): Money =>
  PAYMENTS.filter((row) => row.nis === nis && isValid(row) && row.amount.currency === currency)
    .map((row) => row.amount)
    .reduce(add, currency === "IDR" ? ZERO_IDR : ZERO_EUR)

const lastPaymentOf = (nis: string): string | null =>
  PAYMENTS.filter((row) => row.nis === nis && isValid(row))
    .map((row) => row.date)
    .sort()
    .at(-1) ?? null

export type Receivable = {
  readonly student: Student
  readonly pkg: PackageRow
  readonly priceIdr: Money
  readonly paidIdr: Money
  readonly dueIdr: Money
  readonly priceEur: Money | null
  readonly paidEur: Money
  readonly dueEur: Money | null
  readonly lastPaid: string | null
  readonly transactionCount: number
}

export const receivableOf = (student: Student): Receivable | null => {
  const pkg = packageOf(student)
  if (!pkg) return null
  const paidIdr = paidOf(student.nis, "IDR")
  const paidEur = paidOf(student.nis, "EUR")
  return {
    student,
    pkg,
    priceIdr: pkg.price,
    paidIdr,
    dueIdr: shortfall(pkg.price, paidIdr),
    priceEur: pkg.serviceFeeEur,
    paidEur,
    dueEur: pkg.serviceFeeEur ? shortfall(pkg.serviceFeeEur, paidEur) : null,
    lastPaid: lastPaymentOf(student.nis),
    transactionCount: PAYMENTS.filter((row) => row.nis === student.nis && isValid(row)).length,
  }
}

export const RECEIVABLES: readonly Receivable[] = STUDENTS.flatMap((student) => {
  const row = receivableOf(student)
  return row ? [row] : []
})

const dateOf = (iso: string): Date => new Date(`${iso}T00:00:00Z`)

const isoOf = (date: Date): string => date.toISOString().slice(0, 10)

export const daysBetween = (from: string, to: string): number =>
  Math.round((dateOf(to).getTime() - dateOf(from).getTime()) / 86_400_000)

export const billingDates = (enrolledAt: string, billingDay: number, until: string): string[] => {
  const dates: string[] = []
  const start = dateOf(enrolledAt)
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), billingDay))
  if (cursor <= start) cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  while (isoOf(cursor) <= until) {
    dates.push(isoOf(cursor))
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }
  return dates
}

export const nextBillingDate = (billingDay: number, after: string): string => {
  const base = dateOf(after)
  const sameMonth = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), billingDay))
  if (sameMonth > base) return isoOf(sameMonth)
  return isoOf(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth() + 1, billingDay)))
}

export const targetAfter = (pkg: PackageRow, installmentsDue: number): Money => {
  const monthly = pkg.monthly ?? ZERO_IDR
  const target = idr(pkg.dp.amount + monthly.amount * installmentsDue)
  return target.amount > pkg.price.amount ? pkg.price : target
}

export type DueStatus = "TERLAMBAT" | "HAMPIR JATUH"

export const DUE_STATUS_BADGE: Readonly<Record<DueStatus, string>> = {
  TERLAMBAT: "badge-danger",
  "HAMPIR JATUH": "badge-warning",
}

export type DueRow = {
  readonly student: Student
  readonly pkg: PackageRow
  readonly shortfallIdr: Money
  readonly targetIdr: Money
  readonly shortfallEur: Money | null
  readonly targetEur: Money | null
  readonly dueDate: string
  readonly daysLate: number
  readonly status: DueStatus
}

export const isBillable = (student: Student, pkg: PackageRow): boolean =>
  student.status === "Aktif" && pkg.billingDay !== null && pkg.monthly !== null

export const dueRowOf = (receivable: Receivable, today: string = TODAY): DueRow | null => {
  const { student, pkg } = receivable
  const enrolledAt = ENROLLED_AT[student.nis]
  if (!enrolledAt || !isBillable(student, pkg) || pkg.billingDay === null) return null

  const passed = billingDates(enrolledAt, pkg.billingDay, today)
  const targetNow = targetAfter(pkg, passed.length)
  const shortNow = shortfall(targetNow, receivable.paidIdr)
  const eurPart = {
    shortfallEur: receivable.dueEur,
    targetEur: receivable.priceEur,
  }

  if (shortNow.amount > 0) {
    const dueDate = passed.at(-1) ?? enrolledAt
    return {
      student,
      pkg,
      shortfallIdr: shortNow,
      targetIdr: targetNow,
      ...eurPart,
      dueDate,
      daysLate: daysBetween(dueDate, today),
      status: "TERLAMBAT",
    }
  }

  const upcoming = nextBillingDate(pkg.billingDay, today)
  const targetNext = targetAfter(pkg, passed.length + 1)
  const shortNext = shortfall(targetNext, receivable.paidIdr)
  if (shortNext.amount > 0 && daysBetween(today, upcoming) <= DUE_SOON_DAYS) {
    return {
      student,
      pkg,
      shortfallIdr: shortNext,
      targetIdr: targetNext,
      ...eurPart,
      dueDate: upcoming,
      daysLate: 0,
      status: "HAMPIR JATUH",
    }
  }

  return null
}

export const DUE_ROWS: readonly DueRow[] = RECEIVABLES.flatMap((receivable) => {
  const row = dueRowOf(receivable)
  return row ? [row] : []
})

export const overdueTotal = (rows: readonly DueRow[]): Money =>
  rows
    .filter((row) => row.status === "TERLAMBAT")
    .map((row) => row.shortfallIdr)
    .reduce(add, ZERO_IDR)

export const overdueCount = (rows: readonly DueRow[]): number =>
  rows.filter((row) => row.status === "TERLAMBAT").length

export const averageDaysLate = (rows: readonly DueRow[]): number => {
  const late = rows.filter((row) => row.status === "TERLAMBAT")
  if (late.length === 0) return 0
  return Math.round(late.reduce((sum, row) => sum + row.daysLate, 0) / late.length)
}

export const REMINDER_STATUSES = ["TERKIRIM", "GAGAL"] as const
export type ReminderStatus = (typeof REMINDER_STATUSES)[number]

export const REMINDER_STATUS_BADGE: Readonly<Record<ReminderStatus, string>> = {
  TERKIRIM: "badge-success",
  GAGAL: "badge-danger",
}

export type Reminder = {
  readonly id: string
  readonly sentAt: string
  readonly nis: string
  readonly status: ReminderStatus
  readonly failure: string | null
}

export const REMINDERS: readonly Reminder[] = [
  {
    id: "rem-1",
    sentAt: "2026-09-13T08:00:00+07:00",
    nis: "20250233",
    status: "TERKIRIM",
    failure: null,
  },
  {
    id: "rem-2",
    sentAt: "2026-09-13T08:00:00+07:00",
    nis: "20250241",
    status: "TERKIRIM",
    failure: null,
  },
  {
    id: "rem-3",
    sentAt: "2026-09-13T08:00:00+07:00",
    nis: "20240199",
    status: "GAGAL",
    failure: "Alamat email memantul (bounce).",
  },
  {
    id: "rem-4",
    sentAt: "2026-09-11T08:00:00+07:00",
    nis: "20240187",
    status: "TERKIRIM",
    failure: null,
  },
  {
    id: "rem-5",
    sentAt: "2026-08-27T08:00:00+07:00",
    nis: "20250258",
    status: "TERKIRIM",
    failure: null,
  },
  {
    id: "rem-6",
    sentAt: "2026-08-20T08:00:00+07:00",
    nis: "20250233",
    status: "TERKIRIM",
    failure: null,
  },
  {
    id: "rem-7",
    sentAt: "2026-08-20T08:00:00+07:00",
    nis: "20240199",
    status: "GAGAL",
    failure: "Kotak masuk penuh.",
  },
  {
    id: "rem-8",
    sentAt: "2026-08-11T08:00:00+07:00",
    nis: "20250241",
    status: "TERKIRIM",
    failure: null,
  },
]

export const receivableByNis = (nis: string): Receivable | undefined =>
  RECEIVABLES.find((row) => row.student.nis === nis)

export const REMINDER_OFFSETS = ["H-9", "hari-H", "H+7"] as const
