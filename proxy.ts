import { NextResponse, type NextRequest } from "next/server"

import {
  AUTH_BYPASS,
  decodeSession,
  homePath,
  loginPathFor,
  SESSION_COOKIE,
} from "@/src/lib/auth/session"

const PUBLIC_PATHS = ["/", "/staff/login", "/register", "/kit"]

const isPublic = (path: string) => PUBLIC_PATHS.some((p) => path === p || path.startsWith(`${p}/`))

export default function proxy(request: NextRequest) {
  if (AUTH_BYPASS) return NextResponse.next()

  const { pathname } = request.nextUrl
  const session = decodeSession(request.cookies.get(SESSION_COOKIE)?.value)

  if (session && isPublic(pathname)) {
    return NextResponse.redirect(new URL(homePath(session.kind), request.url))
  }

  if (isPublic(pathname)) return NextResponse.next()

  if (!session) {
    const login = new URL(loginPathFor(pathname), request.url)
    login.searchParams.set("next", pathname)
    return NextResponse.redirect(login)
  }

  const tree = pathname.startsWith("/staff")
    ? "staff"
    : pathname.startsWith("/portal")
      ? "student"
      : null
  if (tree && tree !== session.kind) {
    return NextResponse.redirect(new URL(homePath(session.kind), request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
