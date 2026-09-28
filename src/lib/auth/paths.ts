export type SessionKind = "student" | "staff"

export const STUDENT_LOGIN = "/"
export const STAFF_LOGIN = "/staff/login"

export const homePath = (kind: SessionKind): string =>
  kind === "student" ? "/portal/dashboard" : "/staff/dashboard"

export const loginPath = (kind: SessionKind): string =>
  kind === "student" ? STUDENT_LOGIN : STAFF_LOGIN

export const loginPathFor = (pathname: string): string =>
  pathname.startsWith("/staff") ? STAFF_LOGIN : STUDENT_LOGIN
