import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { canEdit, canView, type PageId } from "./permissions"

export const SESSION_COOKIE = "maxima_session"

export type SessionKind = "student" | "staff"

export type Session = {
  readonly kind: SessionKind
  readonly id: string
  readonly name: string
  readonly role: string
  readonly branches: readonly string[] | null
}

export const homePath = (kind: SessionKind): string =>
  kind === "student" ? "/portal/dashboard" : "/staff/dashboard"

export const STUDENT_LOGIN = "/"
export const STAFF_LOGIN = "/staff/login"

export const loginPath = (kind: SessionKind): string =>
  kind === "student" ? STUDENT_LOGIN : STAFF_LOGIN

export const loginPathFor = (pathname: string): string =>
  pathname.startsWith("/staff") ? STAFF_LOGIN : STUDENT_LOGIN

export function encodeSession(s: Session): string {
  return Buffer.from(JSON.stringify(s), "utf8").toString("base64url")
}

export function decodeSession(raw: string | undefined): Session | null {
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(Buffer.from(raw, "base64url").toString("utf8"))
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "kind" in parsed &&
      (parsed.kind === "student" || parsed.kind === "staff")
    ) {
      return parsed as Session
    }
    return null
  } catch {
    return null
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  return decodeSession(store.get(SESSION_COOKIE)?.value)
}

export const AUTH_BYPASS = process.env.AUTH_BYPASS === "1"

export const BYPASS_SESSION: Readonly<Record<SessionKind, Session>> = {
  staff: {
    kind: "staff",
    id: "admission-1",
    name: "Contoh Admission",
    role: "Admission",
    branches: null,
  },
  student: {
    kind: "student",
    id: "20250233",
    name: "Andi Nugroho",
    role: "",
    branches: ["Bandung"],
  },
}

export async function getSessionOrBypass(kind: SessionKind): Promise<Session | null> {
  const session = await getSession()
  if (session) return session
  return AUTH_BYPASS ? BYPASS_SESSION[kind] : null
}

export async function requireSession(kind?: SessionKind): Promise<Session> {
  if (AUTH_BYPASS) return BYPASS_SESSION[kind ?? "student"]

  const session = await getSession()
  if (!session) throw new Error("Tidak ada sesi")
  if (kind && session.kind !== kind) throw new Error("Jenis pengguna tidak sesuai")
  return session
}

export async function requirePermission(page: PageId, level: "view" | "edit" = "view") {
  if (AUTH_BYPASS) return BYPASS_SESSION.staff
  const session = await requireSession("staff")
  const allowed = level === "edit" ? canEdit(session.role, page) : canView(session.role, page)
  if (!allowed) redirect("/staff/dashboard")
  return session
}
