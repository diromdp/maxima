import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

import { ACCESS_COOKIE, loginPath, readClaims, REFRESH_COOKIE } from "@/src/lib/auth/tokens"

export async function GET(request: NextRequest): Promise<Response> {
  const store = await cookies()
  const asked = request.nextUrl.searchParams.get("kind")
  const kind =
    asked === "staff" || asked === "student"
      ? asked
      : (readClaims(store.get(ACCESS_COOKIE)?.value)?.kind ?? "student")
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  return NextResponse.redirect(new URL(loginPath(kind), request.url))
}
