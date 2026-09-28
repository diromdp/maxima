"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type { DocumentDetail, RejectDocumentForm } from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

export async function verifyDocument(
  id: string,
  uploadedAt: string,
): Promise<ActionResult<DocumentDetail>> {
  return call(() =>
    api<DocumentDetail>(`/documents/${encodeURIComponent(id)}/verify`, {
      method: "POST",
      body: { uploadedAt },
    }),
  )
}

export async function rejectDocument(
  id: string,
  uploadedAt: string,
  input: RejectDocumentForm,
): Promise<ActionResult<DocumentDetail>> {
  return call(() =>
    api<DocumentDetail>(`/documents/${encodeURIComponent(id)}/reject`, {
      method: "POST",
      body: { uploadedAt, ...input },
    }),
  )
}

export async function presignStudentDocument(
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

export async function uploadStudentDocument(
  nis: string,
  documentType: string,
  originalName: string,
): Promise<ActionResult<DocumentDetail>> {
  return call(() =>
    api<DocumentDetail>(
      `/documents/students/${encodeURIComponent(nis)}/files/${encodeURIComponent(documentType)}`,
      { method: "PUT", body: { originalName } },
    ),
  )
}

export async function remindDocument(nis: string, documentType: string): Promise<ActionResult> {
  return call(async () => {
    await api(`/documents/students/${encodeURIComponent(nis)}/remind`, {
      method: "POST",
      body: { documentType },
    })
    return null
  })
}
