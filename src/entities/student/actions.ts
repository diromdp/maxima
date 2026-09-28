"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { ImportReport, ImportStep } from "@/src/lib/import-file"

import type { ChangeStatusForm, IdentityValues } from "./schema"

const studentPath = (nis: string) => `/students/${encodeURIComponent(nis)}`

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

export async function updateIdentity(
  nis: string,
  changes: Partial<IdentityValues>,
): Promise<ActionResult> {
  return call(async () => {
    await api(`${studentPath(nis)}/identity`, { method: "PATCH", body: changes })
    return null
  })
}

export type EvidenceUpload = {
  url: string
  headers: { "Content-Type": string }
  evidenceId: string
}

export async function presignStatusEvidence(
  nis: string,
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<EvidenceUpload>> {
  return call(() =>
    api<EvidenceUpload>(`${studentPath(nis)}/status/evidence`, {
      method: "POST",
      body: { mimeType, sizeBytes },
    }),
  )
}

export async function changeStatus(
  nis: string,
  form: ChangeStatusForm,
  evidenceId: string | null,
): Promise<ActionResult> {
  return call(async () => {
    await api(`${studentPath(nis)}/status`, {
      method: "POST",
      body: { ...form, ...(evidenceId ? { evidenceId } : {}) },
    })
    return null
  })
}

export async function approveChangeRequest(nis: string, id: string): Promise<ActionResult> {
  return call(async () => {
    await api(`${studentPath(nis)}/change-requests/${id}/approve`, { method: "POST" })
    return null
  })
}

export async function rejectChangeRequest(
  nis: string,
  id: string,
  reason: string,
): Promise<ActionResult> {
  return call(async () => {
    await api(`${studentPath(nis)}/change-requests/${id}/reject`, {
      method: "POST",
      body: { reason },
    })
    return null
  })
}

export async function importStudents(
  xlsx: string,
  step: ImportStep,
): Promise<ActionResult<ImportReport>> {
  return call(() =>
    api<ImportReport>(`/registrations/import/students/${step}`, { method: "POST", body: { xlsx } }),
  )
}
