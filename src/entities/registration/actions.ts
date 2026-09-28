"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { storeTokens } from "@/src/lib/auth/actions"
import { requireSession } from "@/src/lib/auth/session"
import type { TokenPair } from "@/src/lib/auth/tokens"
import type { UploadTarget } from "@/src/lib/upload"

import type { RegistrationSection, RegistrationView } from "./schema"

const UUID = /^[0-9a-f-]{36}$/i
const SECTIONS: ReadonlySet<string> = new Set<RegistrationSection>([
  "identity",
  "program",
  "contact",
  "education",
  "admission-account",
  "consent",
])

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

const draftPath = (studentId: string) => {
  if (!UUID.test(studentId)) throw new Error("Invalid registration id")
  return `/registrations/${studentId}`
}

const studentPath = (nis: string) => `/registrations/students/${encodeURIComponent(nis)}`

export async function startRegistration(
  body: Record<string, unknown>,
): Promise<ActionResult<RegistrationView>> {
  return call(() => api<RegistrationView>("/registrations", { method: "POST", body }))
}

export async function saveRegistrationSection(
  studentId: string,
  section: RegistrationSection,
  body: Record<string, unknown>,
): Promise<ActionResult<RegistrationView>> {
  if (!SECTIONS.has(section)) throw new Error("Unknown registration section")
  return call(() =>
    api<RegistrationView>(`${draftPath(studentId)}/${section}`, { method: "PUT", body }),
  )
}

export async function presignRegistrationDocument(
  studentId: string,
  documentType: string,
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<UploadTarget>> {
  return call(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId, purpose: { kind: "document", documentType }, mimeType, sizeBytes },
    }),
  )
}

export async function confirmRegistrationDocument(
  studentId: string,
  documentType: string,
  originalName: string,
): Promise<ActionResult<RegistrationView>> {
  return call(() =>
    api<RegistrationView>(`${draftPath(studentId)}/documents/${encodeURIComponent(documentType)}`, {
      method: "POST",
      body: { originalName },
    }),
  )
}

export async function submitRegistration(
  studentId: string,
): Promise<ActionResult<RegistrationView>> {
  return call(() => api<RegistrationView>(`${draftPath(studentId)}/submit`, { method: "POST" }))
}

export async function createContract(
  nis: string,
  packageId: string,
  promoCode: string | null,
): Promise<ActionResult<{ contractId: string }>> {
  return call(() =>
    api<{ contractId: string }>(`${studentPath(nis)}/contracts`, {
      method: "POST",
      body: { packageId, promoCode },
    }),
  )
}

export async function presignContractDocument(
  nis: string,
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<UploadTarget>> {
  return call(() =>
    api<UploadTarget>(`${studentPath(nis)}/contract-document/presign`, {
      method: "POST",
      body: { mimeType, sizeBytes },
    }),
  )
}

export async function confirmContractDocument(
  nis: string,
  originalName: string,
): Promise<ActionResult<{ contractNumber: string }>> {
  return call(() =>
    api<{ contractNumber: string }>(`${studentPath(nis)}/contract-document`, {
      method: "POST",
      body: { originalName },
    }),
  )
}

async function callAsCandidate<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("student")
  return actionOf(run)
}

export async function startPublicRegistration(
  body: { email: string; password: string } & Record<string, unknown>,
): Promise<ActionResult<RegistrationView>> {
  const started = await actionOf(() =>
    api<RegistrationView>("/registrations/public", { method: "POST", body, isAnonymous: true }),
  )
  if (!started.ok) return started
  const signedIn = await actionOf(() =>
    api<TokenPair>("/auth/login/student", {
      method: "POST",
      body: { email: body.email, password: body.password },
      isAnonymous: true,
    }),
  )
  if (!signedIn.ok) return signedIn
  await storeTokens(signedIn.data)
  return started
}

export async function saveMySection(
  section: RegistrationSection,
  body: Record<string, unknown>,
): Promise<ActionResult<RegistrationView>> {
  if (!SECTIONS.has(section)) throw new Error("Unknown registration section")
  return callAsCandidate(() =>
    api<RegistrationView>(`/registrations/me/${section}`, { method: "PUT", body }),
  )
}

export async function presignMyDocument(
  studentId: string,
  documentType: string,
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<UploadTarget>> {
  return callAsCandidate(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId, purpose: { kind: "document", documentType }, mimeType, sizeBytes },
    }),
  )
}

export async function confirmMyDocument(
  documentType: string,
  originalName: string,
): Promise<ActionResult<RegistrationView>> {
  return callAsCandidate(() =>
    api<RegistrationView>(`/registrations/me/documents/${encodeURIComponent(documentType)}`, {
      method: "POST",
      body: { originalName },
    }),
  )
}

export async function submitMyRegistration(): Promise<ActionResult<RegistrationView>> {
  return callAsCandidate(() =>
    api<RegistrationView>("/registrations/me/submit", { method: "POST" }),
  )
}
