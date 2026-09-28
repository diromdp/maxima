import { env } from "@/src/lib/env"

import type { SessionKind } from "./paths"

export {
  homePath,
  loginPath,
  loginPathFor,
  STAFF_LOGIN,
  STUDENT_LOGIN,
  type SessionKind,
} from "./paths"

export const ACCESS_COOKIE = "maxima_access"
export const REFRESH_COOKIE = "maxima_refresh"

export type TokenPair = { accessToken: string; refreshToken: string; expiresIn: number }

export type TokenClaims = { kind: SessionKind; sub: string; exp: number }

const REFRESH_MARGIN_SECONDS = 60
const REFRESH_LIFETIME_SECONDS = 30 * 24 * 60 * 60
const SETTLED_REFRESH_TTL_MS = 30_000

export const apiUrl = (path: string): string => `${env.API_URL}/api/v1${path}`

export const tokenCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: env.NODE_ENV === "production",
  path: "/",
  maxAge: REFRESH_LIFETIME_SECONDS,
} as const

export function readClaims(token: string | undefined): TokenClaims | null {
  const body = token?.split(".")[1]
  if (!body) return null
  try {
    const claims: unknown = JSON.parse(Buffer.from(body, "base64url").toString("utf8"))
    if (
      typeof claims === "object" &&
      claims !== null &&
      "kind" in claims &&
      (claims.kind === "staff" || claims.kind === "student") &&
      "sub" in claims &&
      typeof claims.sub === "string" &&
      "exp" in claims &&
      typeof claims.exp === "number"
    ) {
      return { kind: claims.kind, sub: claims.sub, exp: claims.exp }
    }
    return null
  } catch {
    return null
  }
}

export const secondsLeft = (claims: TokenClaims): number =>
  claims.exp - Math.floor(Date.now() / 1000)

export const needsRefresh = (claims: TokenClaims | null): boolean =>
  claims === null || secondsLeft(claims) < REFRESH_MARGIN_SECONDS

export function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim()
  return forwarded || headers.get("x-real-ip") || null
}

export const forwardedFor = (ip: string | null): Record<string, string> =>
  ip ? { "X-Forwarded-For": ip } : {}

export type RefreshOutcome = TokenPair | "rejected" | "unavailable"

const refreshesInFlight = new Map<string, Promise<RefreshOutcome>>()

async function requestRefresh(refreshToken: string, ip: string | null): Promise<RefreshOutcome> {
  try {
    const response = await fetch(apiUrl("/auth/refresh"), {
      method: "POST",
      headers: { "Content-Type": "application/json", ...forwardedFor(ip) },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    })
    if (response.ok) return (await response.json()) as TokenPair
    return response.status >= 500 ? "unavailable" : "rejected"
  } catch {
    return "unavailable"
  }
}

export function refreshOnce(refreshToken: string, ip: string | null): Promise<RefreshOutcome> {
  const pending = refreshesInFlight.get(refreshToken)
  if (pending) return pending

  const outcome = requestRefresh(refreshToken, ip)
  refreshesInFlight.set(refreshToken, outcome)
  void outcome.finally(() =>
    setTimeout(() => refreshesInFlight.delete(refreshToken), SETTLED_REFRESH_TTL_MS),
  )
  return outcome
}
