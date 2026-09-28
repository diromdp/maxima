import { ApiError, errorOf, queryString, type QueryValue } from "./errors"

export type ReadQuery<T> = {
  readonly queryKey: readonly [string, ...unknown[]]
  readonly path: string
  readonly query?: Record<string, QueryValue>
  readonly _type?: T
}

export function readQuery<T>(
  resource: string,
  path: string,
  query?: Record<string, QueryValue>,
): ReadQuery<T> {
  return { queryKey: query ? [resource, query] : [resource], path, query }
}

export async function readApi<T>(read: ReadQuery<T>): Promise<T> {
  let response: Response
  try {
    response = await fetch(`/api/data${read.path}${queryString(read.query)}`)
  } catch {
    throw new ApiError(503, "Unavailable", "Koneksi terputus. Periksa jaringan lalu coba lagi.", [])
  }
  if (response.status === 401) window.location.reload()
  if (!response.ok) throw await errorOf(response)
  return (await response.json()) as T
}
