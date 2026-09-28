export const PER_PAGE_OPTIONS = [10, 25, 50] as const
export const DEFAULT_PER_PAGE = 25
export const SEARCH_DELAY_MS = 300

export type SortOrder = "asc" | "desc"

export type ListParams<Filter extends string = never> = {
  page: number
  perPage: number
  search?: string
  sort?: string
  order?: SortOrder
} & Partial<Record<Filter, string>>

type ParamSource = { get(name: string): string | null }

const positive = (value: string | null, fallback: number): number => {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : fallback
}

export function listParamsOf<Filter extends string = never>(
  source: ParamSource,
  filters: readonly Filter[] = [],
): ListParams<Filter> {
  const perPage = positive(source.get("perPage"), DEFAULT_PER_PAGE)
  const order = source.get("order")
  const params: Record<string, string | number | undefined> = {
    page: positive(source.get("page"), 1),
    perPage: PER_PAGE_OPTIONS.some((option) => option === perPage) ? perPage : DEFAULT_PER_PAGE,
    search: source.get("search") ?? undefined,
    sort: source.get("sort") ?? undefined,
    order: order === "asc" || order === "desc" ? order : undefined,
  }
  for (const filter of filters) params[filter] = source.get(filter) ?? undefined
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  ) as ListParams<Filter>
}

export function searchParamsSource(record: Record<string, string | string[] | undefined>) {
  return {
    get: (name: string): string | null => {
      const value = record[name]
      return (Array.isArray(value) ? value[0] : value) ?? null
    },
  }
}
