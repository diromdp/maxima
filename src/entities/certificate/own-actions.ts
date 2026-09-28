"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type { CertificateRow, ModulesInput } from "./schema"

export async function presignOwnCertificateFile(
  certificateType: string,
  level: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<UploadTarget>> {
  const session = await requireSession("student")
  return actionOf(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: {
        studentId: session.id,
        purpose: { kind: "certificate", certificateType, level },
        ...file,
      },
    }),
  )
}

export async function proposeCertificate(input: {
  kindId: string
  levelId: string
  modules: ModulesInput
}): Promise<ActionResult<CertificateRow>> {
  await requireSession("student")
  return actionOf(() => api<CertificateRow>("/certificates/me", { method: "POST", body: input }))
}

export async function removeOwnCertificate(id: string): Promise<ActionResult> {
  await requireSession("student")
  return actionOf(async () => {
    await api(`/certificates/me/${id}`, { method: "DELETE" })
    return null
  })
}
