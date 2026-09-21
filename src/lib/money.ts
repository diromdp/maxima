export type Currency = "IDR" | "EUR"

export type Money = {
  readonly amount: number
  readonly currency: Currency
}

export const idr = (amount: number): Money => ({ amount: Math.round(amount), currency: "IDR" })
export const eur = (amount: number): Money => ({ amount: Math.round(amount), currency: "EUR" })

export const ZERO_IDR = idr(0)
export const ZERO_EUR = eur(0)

function assertSame(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Tidak boleh menggabungkan ${a.currency} dengan ${b.currency}`)
  }
}

export function add(a: Money, b: Money): Money {
  assertSame(a, b)
  return { amount: a.amount + b.amount, currency: a.currency }
}

export function subtract(a: Money, b: Money): Money {
  assertSame(a, b)
  return { amount: a.amount - b.amount, currency: a.currency }
}

export function sum(values: readonly Money[], currency: Currency): Money {
  return values.reduce<Money>((acc, v) => add(acc, v), { amount: 0, currency })
}

export function isZero(m: Money): boolean {
  return m.amount === 0
}

export function isNegative(m: Money): boolean {
  return m.amount < 0
}

export function compare(a: Money, b: Money): number {
  assertSame(a, b)
  return a.amount - b.amount
}

export function gte(a: Money, b: Money): boolean {
  return compare(a, b) >= 0
}

export function shortfall(target: Money, current: Money): Money {
  const diff = subtract(target, current)
  return isNegative(diff) ? { amount: 0, currency: diff.currency } : diff
}

const RUPIAH = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })
const EURO = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 })

export function formatMoney(m: Money): string {
  return m.currency === "IDR"
    ? `Rp ${RUPIAH.format(m.amount)}`
    : `€ ${EURO.format(Math.round(m.amount / 100))}`
}
