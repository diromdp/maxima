"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  BYPASS_SESSION,
  decodeSession,
  encodeSession,
  homePath,
  loginPath,
  SESSION_COOKIE,
  type SessionKind,
} from "./session"

export type LoginResult = { error: string } | undefined

export async function login(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const kind: SessionKind = formData.get("kind") === "staff" ? "staff" : "student"
  const next = String(formData.get("next") ?? "")

  const store = await cookies()
  store.set(SESSION_COOKIE, encodeSession(BYPASS_SESSION[kind]), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  })

  const target = next.startsWith("/") && !next.startsWith("//") ? next : homePath(kind)
  redirect(target)
}

export async function logout(): Promise<void> {
  const store = await cookies()
  const session = decodeSession(store.get(SESSION_COOKIE)?.value)
  store.delete(SESSION_COOKIE)
  redirect(session ? loginPath(session.kind) : "/")
}
