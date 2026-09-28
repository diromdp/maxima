import { NextResponse, type NextRequest } from "next/server"

import {
  ACCESS_COOKIE,
  clientIp,
  homePath,
  loginPathFor,
  needsRefresh,
  readClaims,
  REFRESH_COOKIE,
  refreshOnce,
  tokenCookieOptions,
  type SessionKind,
  type TokenPair,
} from "@/src/lib/auth/tokens"

const PUBLIC_PATHS = ["/", "/staff/login", "/kit", "/forgot-password"]
const OPEN_PATHS = ["/reset-password", "/auth/signout", "/register"]
const DATA_PREFIX = "/api/"

const matches = (paths: readonly string[], path: string) =>
  paths.some((p) => path === p || path.startsWith(`${p}/`))

type Refreshed = { kind: SessionKind | null; pair: TokenPair | null; isCleared: boolean }

async function refreshed(request: NextRequest): Promise<Refreshed> {
  const claims = readClaims(request.cookies.get(ACCESS_COOKIE)?.value)
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value
  if (!needsRefresh(claims) || !refreshToken) {
    return { kind: claims?.kind ?? null, pair: null, isCleared: false }
  }
  const outcome = await refreshOnce(refreshToken, clientIp(request.headers))
  if (outcome === "unavailable") return { kind: claims?.kind ?? null, pair: null, isCleared: false }
  if (outcome === "rejected") return { kind: null, pair: null, isCleared: true }
  request.cookies.set(ACCESS_COOKIE, outcome.accessToken)
  request.cookies.set(REFRESH_COOKIE, outcome.refreshToken)
  return { kind: readClaims(outcome.accessToken)?.kind ?? null, pair: outcome, isCleared: false }
}

function withCookies(response: NextResponse, state: Refreshed): NextResponse {
  if (state.pair) {
    response.cookies.set(ACCESS_COOKIE, state.pair.accessToken, tokenCookieOptions)
    response.cookies.set(REFRESH_COOKIE, state.pair.refreshToken, tokenCookieOptions)
  }
  if (state.isCleared) {
    response.cookies.delete(ACCESS_COOKIE)
    response.cookies.delete(REFRESH_COOKIE)
  }
  return response
}

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const state = await refreshed(request)
  const pass = () =>
    withCookies(NextResponse.next({ request: { headers: request.headers } }), state)
  const redirectTo = (url: URL) => withCookies(NextResponse.redirect(url), state)

  if (pathname.startsWith(DATA_PREFIX) || matches(OPEN_PATHS, pathname)) return pass()

  if (matches(PUBLIC_PATHS, pathname)) {
    return state.kind ? redirectTo(new URL(homePath(state.kind), request.url)) : pass()
  }

  if (!state.kind) {
    const login = new URL(loginPathFor(pathname), request.url)
    login.searchParams.set("next", pathname)
    return redirectTo(login)
  }

  const tree = pathname.startsWith("/staff")
    ? "staff"
    : pathname.startsWith("/portal")
      ? "student"
      : null
  if (tree && tree !== state.kind) return redirectTo(new URL(homePath(state.kind), request.url))

  return pass()
}

export const config = {
  matcher: [
    "/((?!api/(?!data|download)|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
