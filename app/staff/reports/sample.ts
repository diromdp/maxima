import { add, type Money, shortfall, ZERO_EUR, ZERO_IDR } from "@/src/lib/money"

import { BRANCHES } from "../classes/sample"
import {
  billingDates,
  ENROLLED_AT,
  isBillable,
  type Receivable,
  RECEIVABLES,
  targetAfter,
} from "../invoices/sample"
import { PACKAGE_ROWS } from "../packages-promos/sample"
import { isValid, type Payment, PAYMENTS } from "../payments/sample"

export const LAST_UPDATED = "2026-09-20T08:00:00+07:00"

export type Summary = {
  readonly key: string
  readonly label: string
  readonly students: number
  readonly billedIdr: Money
  readonly paidIdr: Money
  readonly dueIdr: Money
  readonly billedEur: Money
  readonly paidEur: Money
  readonly dueEur: Money
}

const sumMoney = (values: readonly Money[], zero: Money): Money => values.reduce(add, zero)

export const summarize = (key: string, label: string, rows: readonly Receivable[]): Summary => ({
  key,
  label,
  students: rows.length,
  billedIdr: sumMoney(
    rows.map((row) => row.priceIdr),
    ZERO_IDR,
  ),
  paidIdr: sumMoney(
    rows.map((row) => row.paidIdr),
    ZERO_IDR,
  ),
  dueIdr: sumMoney(
    rows.map((row) => row.dueIdr),
    ZERO_IDR,
  ),
  billedEur: sumMoney(
    rows.flatMap((row) => (row.priceEur ? [row.priceEur] : [])),
    ZERO_EUR,
  ),
  paidEur: sumMoney(
    rows.map((row) => row.paidEur),
    ZERO_EUR,
  ),
  dueEur: sumMoney(
    rows.flatMap((row) => (row.dueEur ? [row.dueEur] : [])),
    ZERO_EUR,
  ),
})

export const collectibility = (summary: Summary): number =>
  summary.billedIdr.amount === 0 ? 0 : summary.paidIdr.amount / summary.billedIdr.amount

export const TOTAL: Summary = summarize("total", "TOTAL KESELURUHAN", RECEIVABLES)

export const BY_PACKAGE: readonly Summary[] = PACKAGE_ROWS.map((pkg) =>
  summarize(
    pkg.id,
    pkg.name,
    RECEIVABLES.filter((row) => row.pkg.id === pkg.id),
  ),
).filter((summary) => summary.students > 0)

export const BY_BRANCH: readonly Summary[] = BRANCHES.map((branch) =>
  summarize(
    branch,
    branch,
    RECEIVABLES.filter((row) => row.student.branch === branch),
  ),
)

const PICS = Array.from(new Set(RECEIVABLES.map((row) => row.student.pic)))

export const BY_PIC: readonly Summary[] = PICS.map((pic) =>
  summarize(
    pic,
    pic,
    RECEIVABLES.filter((row) => row.student.pic === pic),
  ),
)

export const monthKey = (date: string): string => date.slice(0, 7)

export const MONTHS: readonly string[] = Array.from(
  new Set(PAYMENTS.filter(isValid).map((row) => monthKey(row.date))),
).sort()

export const DEFAULT_MONTH = MONTHS.at(-1) ?? monthKey(LAST_UPDATED)

export const MONTH_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export const monthLabel = (key: string): string => {
  const [year, month] = key.split("-").map(Number)
  return `${MONTH_NAMES[(month ?? 1) - 1]} ${year}`
}

export const paymentsIn = (month: string): readonly Payment[] =>
  PAYMENTS.filter((row) => isValid(row) && monthKey(row.date) === month)

export type MonthlySummary = {
  readonly paidIdr: Money
  readonly payersIdr: number
  readonly averageIdr: Money
  readonly paidEur: Money
  readonly payersEur: number
  readonly averageEur: Money
}

const average = (total: Money, count: number): Money => ({
  amount: count === 0 ? 0 : Math.round(total.amount / count),
  currency: total.currency,
})

const summarizePayments = (rows: readonly Payment[]): MonthlySummary => {
  const idr = rows.filter((row) => row.amount.currency === "IDR")
  const eur = rows.filter((row) => row.amount.currency === "EUR")
  const paidIdr = sumMoney(
    idr.map((row) => row.amount),
    ZERO_IDR,
  )
  const paidEur = sumMoney(
    eur.map((row) => row.amount),
    ZERO_EUR,
  )
  const payersIdr = new Set(idr.map((row) => row.nis)).size
  const payersEur = new Set(eur.map((row) => row.nis)).size
  return {
    paidIdr,
    payersIdr,
    averageIdr: average(paidIdr, payersIdr),
    paidEur,
    payersEur,
    averageEur: average(paidEur, payersEur),
  }
}

export type PeriodRow = {
  readonly key: string
  readonly label: string
  readonly count: number
  readonly topMethod: string
  readonly totalIdr: Money
  readonly totalEur: Money
  readonly debtIdr: Money | null
}

const periodRow = (key: string, label: string, rows: readonly Payment[]): PeriodRow => {
  const counts = new Map<string, number>()
  for (const row of rows) counts.set(row.method, (counts.get(row.method) ?? 0) + 1)
  return {
    key,
    label,
    count: rows.length,
    topMethod: [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-",
    totalIdr: sumMoney(
      rows.filter((row) => row.amount.currency === "IDR").map((row) => row.amount),
      ZERO_IDR,
    ),
    totalEur: sumMoney(
      rows.filter((row) => row.amount.currency === "EUR").map((row) => row.amount),
      ZERO_EUR,
    ),
    debtIdr: null,
  }
}

export const weekOf = (date: string): number =>
  Math.min(4, Math.ceil(Number(date.slice(8, 10)) / 7))

export const weeklyRows = (month: string): readonly PeriodRow[] =>
  [1, 2, 3, 4].map((week) =>
    periodRow(
      String(week),
      `Minggu ${week}`,
      paymentsIn(month).filter((row) => weekOf(row.date) === week),
    ),
  )

export const yearOf = (date: string): string => date.slice(0, 4)

export const YEARS: readonly string[] = Array.from(
  new Set(PAYMENTS.filter(isValid).map((row) => yearOf(row.date))),
).sort()

export const DEFAULT_YEAR = YEARS.at(-1) ?? yearOf(LAST_UPDATED)

export const MIN_MONTH = MONTHS[0] ?? DEFAULT_MONTH
export const MAX_MONTH = monthKey(LAST_UPDATED)

export const endOfMonth = (month: string): string => {
  const [year, index] = month.split("-").map(Number)
  return new Date(Date.UTC(year ?? 2026, index ?? 1, 0)).toISOString().slice(0, 10)
}

const paidUntil = (nis: string, until: string): Money =>
  sumMoney(
    PAYMENTS.filter(
      (row) =>
        row.nis === nis && isValid(row) && row.amount.currency === "IDR" && row.date <= until,
    ).map((row) => row.amount),
    ZERO_IDR,
  )

export type DebtRow = {
  readonly receivable: Receivable
  readonly targetIdr: Money
  readonly paidIdr: Money
  readonly dueIdr: Money
}

export const debtRowsAt = (until: string): readonly DebtRow[] =>
  RECEIVABLES.flatMap((receivable) => {
    const { student, pkg } = receivable
    const enrolledAt = ENROLLED_AT[student.nis]
    if (!enrolledAt || !isBillable(student, pkg) || pkg.billingDay === null) return []
    if (enrolledAt > until) return []
    const targetIdr = targetAfter(pkg, billingDates(enrolledAt, pkg.billingDay, until).length)
    const paidIdr = paidUntil(student.nis, until)
    const dueIdr = shortfall(targetIdr, paidIdr)
    return dueIdr.amount > 0 ? [{ receivable, targetIdr, paidIdr, dueIdr }] : []
  })

export const debtTotal = (rows: readonly DebtRow[]): Money =>
  sumMoney(
    rows.map((row) => row.dueIdr),
    ZERO_IDR,
  )

export const monthlyRows = (year: string): readonly PeriodRow[] =>
  MONTH_NAMES.map((name, index) => {
    const key = `${year}-${String(index + 1).padStart(2, "0")}`
    return {
      ...periodRow(key, name, paymentsIn(key)),
      debtIdr: key > MAX_MONTH ? null : debtTotal(debtRowsAt(endOfMonth(key))),
    }
  })

export const monthlySummary = (month: string): MonthlySummary =>
  summarizePayments(paymentsIn(month))

export const yearlySummary = (year: string): MonthlySummary =>
  summarizePayments(PAYMENTS.filter((row) => isValid(row) && yearOf(row.date) === year))

export const shiftMonth = (month: string, delta: number): string => {
  const [year, index] = month.split("-").map(Number)
  const date = new Date(Date.UTC(year ?? 2026, (index ?? 1) - 1 + delta, 1))
  return date.toISOString().slice(0, 7)
}
