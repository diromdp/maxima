import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { cache } from "react"

import { api, ApiError } from "@/src/lib/api/client"

import { canEdit, canView, type PageId, type Permissions } from "./permissions"
import { ACCESS_COOKIE, homePath, readClaims, type SessionKind } from "./tokens"

export type StaffSession = {
  readonly kind: "staff"
  readonly id: string
  readonly name: string
  readonly email: string
  readonly role: string
  readonly roleId: string | null
  readonly isSuperAdmin: boolean
  readonly branches: readonly string[] | null
  readonly permissions: Permissions
  readonly capabilities: readonly string[]
}

export type StudentStatus = "Aktif" | "Cuti" | "Alumni" | "Mengundurkan Diri" | "Selesai Kursus"

export const CANDIDATE_STATUS = "Calon Siswa"
export type PortalStatus = StudentStatus | typeof CANDIDATE_STATUS

export type PortalPageCode =
  | "dashboard"
  | "payments"
  | "progress"
  | "learning"
  | "certificates"
  | "documents"
  | "alumni"
  | "profile"
  | "leave"
  | "leave-history"

export type PortalPage = {
  readonly code: PortalPageCode
  readonly isVisible: boolean
  readonly lockReason: string | null
}

export type StudentSession = {
  readonly kind: "student"
  readonly id: string
  readonly name: string
  readonly nis: string | null
  readonly status: PortalStatus
  readonly packageName: string | null
  readonly pages: readonly PortalPage[]
}

export type Session = StaffSession | StudentSession

type StaffAccess = {
  userId: string
  roleId: string | null
  superAdmin: boolean
  permissions: Permissions
  capabilities: string[]
  profile: { name: string; email: string; roleName: string | null; branchNames: string[] }
}

type PortalMe = {
  head: {
    student: { id: string; nis: string | null; name: string; status: PortalStatus }
    contract: { package: { name: string } } | null
  }
  pages: PortalPage[]
}

async function loadSession(kind: SessionKind): Promise<Session> {
  if (kind === "staff") {
    const access = await api<StaffAccess>("/me/access")
    return {
      kind,
      id: access.userId,
      name: access.profile.name,
      email: access.profile.email,
      role: access.profile.roleName ?? "",
      roleId: access.roleId,
      isSuperAdmin: access.superAdmin,
      branches: access.profile.branchNames.length > 0 ? access.profile.branchNames : null,
      permissions: access.permissions,
      capabilities: access.capabilities,
    }
  }
  const me = await api<PortalMe>("/portal/me")
  return {
    kind,
    id: me.head.student.id,
    name: me.head.student.name,
    nis: me.head.student.nis,
    status: me.head.student.status,
    packageName: me.head.contract?.package.name ?? null,
    pages: me.pages,
  }
}

export const getSession = cache(async (): Promise<Session | null> => {
  const store = await cookies()
  const claims = readClaims(store.get(ACCESS_COOKIE)?.value)
  if (!claims) return null
  try {
    return await loadSession(claims.kind)
  } catch (error) {
    if (error instanceof ApiError && [401, 403, 404].includes(error.status)) return null
    throw error
  }
})

const SIGN_OUT = "/auth/signout"

export async function requireSession(kind: "staff"): Promise<StaffSession>
export async function requireSession(kind: "student"): Promise<StudentSession>
export async function requireSession(kind: SessionKind): Promise<Session> {
  const session = await getSession()
  if (!session) redirect(`${SIGN_OUT}?kind=${kind}`)
  if (session.kind !== kind) redirect(homePath(session.kind))
  return session
}

export async function requirePermission(
  page: PageId,
  level: "view" | "edit" = "view",
): Promise<StaffSession> {
  const session = await requireSession("staff")
  const isAllowed =
    level === "edit" ? canEdit(session.permissions, page) : canView(session.permissions, page)
  if (!isAllowed) redirect("/staff/dashboard")
  return session
}

export const hasCapability = (session: StaffSession, capability: string): boolean =>
  session.capabilities.includes(capability)
