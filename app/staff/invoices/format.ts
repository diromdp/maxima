import { DASH } from "@/src/lib/format"
import { eur, formatMoney, idr } from "@/src/lib/money"

export const rupiah = (amount: number) => formatMoney(idr(amount))

export const euro = (cents: number | null) => (cents === null ? DASH : formatMoney(eur(cents)))
