import { cookies, headers } from "next/headers"

import { ACCESS_COOKIE, apiUrl, clientIp, forwardedFor } from "@/src/lib/auth/tokens"

import { ApiError, errorOf, FALLBACK_MESSAGE, queryString, type QueryValue } from "./errors"

export { ApiError, actionOf, errorOf, queryString } from "./errors"
export type { ActionResult, FieldError, Page } from "./errors"

export type ApiRequest = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  body?: unknown
  query?: Record<string, QueryValue>
  headers?: Record<string, string>
  isAnonymous?: boolean
}

async function authHeaders(isAnonymous: boolean): Promise<Record<string, string>> {
  const [store, incoming] = await Promise.all([cookies(), headers()])
  const token = isAnonymous ? undefined : store.get(ACCESS_COOKIE)?.value
  return {
    ...forwardedFor(clientIp(incoming)),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function apiResponse(path: string, request: ApiRequest = {}): Promise<Response> {
  const isJson = request.body !== undefined
  try {
    return await fetch(apiUrl(`${path}${queryString(request.query)}`), {
      method: request.method ?? "GET",
      headers: {
        ...(await authHeaders(request.isAnonymous ?? false)),
        ...(isJson ? { "Content-Type": "application/json" } : {}),
        ...request.headers,
      },
      body: isJson ? JSON.stringify(request.body) : undefined,
      cache: "no-store",
    })
  } catch {
    throw new ApiError(503, "Unavailable", FALLBACK_MESSAGE, [])
  }
}

export async function api<T>(path: string, request: ApiRequest = {}): Promise<T> {
  const response = await apiResponse(path, request)
  if (!response.ok) throw await errorOf(response)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}
