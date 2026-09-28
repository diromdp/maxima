"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type { DocumentDetail } from "./schema"

export async function presignOwnDocument(
  documentType: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<UploadTarget>> {
  const session = await requireSession("student")
  return actionOf(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId: session.id, purpose: { kind: "document", documentType }, ...file },
    }),
  )
}

export async function confirmOwnDocument(
  code: string,
  originalName: string,
): Promise<ActionResult<DocumentDetail>> {
  await requireSession("student")
  return actionOf(() =>
    api<DocumentDetail>(`/documents/me/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: { originalName },
    }),
  )
}
