"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type { ServiceDetail } from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

const studentPath = (nis: string) => `/services/students/${encodeURIComponent(nis)}`

export async function saveServiceWork(
  nis: string,
  code: string,
  input: {
    picUserId: string
    progressNote: string | null
    startedOn: string | null
    finishedOn: string | null
    note: string | null
    lastUpdatedAt: string | null
  },
): Promise<ActionResult<ServiceDetail>> {
  return call(() =>
    api<ServiceDetail>(`${studentPath(nis)}/${code}`, { method: "PUT", body: input }),
  )
}

export async function saveDossierStep(
  nis: string,
  step: number,
  input: { startedOn: string | null; finishedOn: string | null; note: string | null },
): Promise<ActionResult<ServiceDetail>> {
  return call(() =>
    api<ServiceDetail>(`${studentPath(nis)}/dossier/steps/${step}`, {
      method: "PUT",
      body: input,
    }),
  )
}

export async function presignServiceResult(
  studentId: string,
  documentType: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<UploadTarget>> {
  return call(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId, purpose: { kind: "document", documentType }, ...file },
    }),
  )
}

export async function registerServiceResult(
  nis: string,
  code: string,
  input: { documentType: string; originalName: string },
): Promise<ActionResult<ServiceDetail>> {
  return call(() =>
    api<ServiceDetail>(`${studentPath(nis)}/${code}/results`, { method: "POST", body: input }),
  )
}
