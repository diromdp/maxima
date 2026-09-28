import { readQuery } from "@/src/lib/api/read"

import type { PackageView, PromoView } from "./schema"

export const PROMO_FILTERS = ["status"] as const

export type PromoParams = { search?: string; status?: string }

export const packagesQuery = () => readQuery<{ data: PackageView[] }>("packages", "/packages")

export const promosQuery = ({ search, status }: PromoParams) =>
  readQuery<{ data: PromoView[] }>("promos", "/promos", { search, status })
