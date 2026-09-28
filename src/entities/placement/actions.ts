"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type { PlacementDetail, PlacementField, VisaField } from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

const placementPath = (nis: string) => `/visa-placements/${encodeURIComponent(nis)}`

export async function saveVisa(
  nis: string,
  input: Record<VisaField, string | null>,
): Promise<ActionResult<PlacementDetail>> {
  return call(() =>
    api<PlacementDetail>(`${placementPath(nis)}/visa`, { method: "PUT", body: input }),
  )
}

export async function savePlacement(
  nis: string,
  input: Record<PlacementField, string | null>,
): Promise<ActionResult<PlacementDetail>> {
  return call(() =>
    api<PlacementDetail>(`${placementPath(nis)}/placement`, { method: "PUT", body: input }),
  )
}

export async function presignDepartureFile(
  studentId: string,
  code: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<UploadTarget>> {
  return call(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId, purpose: { kind: "document", documentType: code }, ...file },
    }),
  )
}

export async function registerDepartureFile(
  nis: string,
  code: string,
  originalName: string,
): Promise<ActionResult<PlacementDetail>> {
  return call(() =>
    api<PlacementDetail>(`${placementPath(nis)}/files/${encodeURIComponent(code)}`, {
      method: "PUT",
      body: { originalName },
    }),
  )
}
