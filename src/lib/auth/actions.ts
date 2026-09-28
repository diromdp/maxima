"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { actionOf, api, ApiError, type ActionResult } from "@/src/lib/api/client"

import type { PasswordForm } from "./password"
import {
  ACCESS_COOKIE,
  homePath,
  loginPath,
  readClaims,
  REFRESH_COOKIE,
  tokenCookieOptions,
  type SessionKind,
  type TokenPair,
} from "./tokens"

const WRONG_PASSWORD = 400

export type FormResult = { error: string } | { done: true } | undefined

const kindOf = (value: FormDataEntryValue | null): SessionKind =>
  value === "staff" ? "staff" : "student"

const text = (formData: FormData, name: string): string => String(formData.get(name) ?? "").trim()

const safeNext = (next: string, kind: SessionKind): string =>
  next.startsWith(kind === "staff" ? "/staff" : "/portal") && !next.startsWith("//")
    ? next
    : homePath(kind)

export async function storeTokens(pair: TokenPair): Promise<void> {
  const store = await cookies()
  store.set(ACCESS_COOKIE, pair.accessToken, tokenCookieOptions)
  store.set(REFRESH_COOKIE, pair.refreshToken, tokenCookieOptions)
}

export async function login(_previous: FormResult, formData: FormData): Promise<FormResult> {
  const kind = kindOf(formData.get("kind"))
  const email = text(formData, "email")
  const password = String(formData.get("password") ?? "")
  if (!email || !password) return { error: "Isi email dan kata sandi." }

  try {
    await storeTokens(
      await api<TokenPair>(`/auth/login/${kind}`, {
        method: "POST",
        body: { email, password },
        isAnonymous: true,
      }),
    )
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message }
    throw error
  }
  redirect(safeNext(text(formData, "next"), kind))
}

export async function logout(): Promise<void> {
  const store = await cookies()
  const kind = readClaims(store.get(ACCESS_COOKIE)?.value)?.kind ?? "student"
  const refreshToken = store.get(REFRESH_COOKIE)?.value
  if (refreshToken) {
    await api("/auth/logout", { method: "POST", body: { refreshToken }, isAnonymous: true }).catch(
      () => undefined,
    )
  }
  store.delete(ACCESS_COOKIE)
  store.delete(REFRESH_COOKIE)
  redirect(loginPath(kind))
}

export async function requestPasswordReset(
  _previous: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const email = text(formData, "email")
  if (!email) return { error: "Isi email akun Anda." }
  try {
    await api("/auth/forgot-password", {
      method: "POST",
      body: { kind: kindOf(formData.get("kind")), email },
      isAnonymous: true,
    })
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message }
    throw error
  }
  return { done: true }
}

export async function resetPassword(
  _previous: FormResult,
  formData: FormData,
): Promise<FormResult> {
  const password = String(formData.get("password") ?? "")
  if (password !== String(formData.get("confirmation") ?? "")) {
    return { error: "Konfirmasi kata sandi tidak sama." }
  }
  try {
    await api("/auth/reset-password", {
      method: "POST",
      body: { token: text(formData, "token"), password },
      isAnonymous: true,
    })
  } catch (error) {
    if (error instanceof ApiError) return { error: error.message }
    throw error
  }
  return { done: true }
}

export async function changeOwnPassword(form: PasswordForm): Promise<ActionResult> {
  const result = await actionOf(async () => {
    await api("/auth/change-password", {
      method: "POST",
      body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
    })
    return null
  })
  if (!result.ok && result.status === WRONG_PASSWORD) {
    return { ...result, fieldErrors: { currentPassword: result.message } }
  }
  return result
}
