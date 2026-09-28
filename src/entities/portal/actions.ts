"use server"

import type { ProofUpload } from "@/src/entities/payment/schema"
import type { ProposalField } from "@/src/entities/placement/schema"
import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type {
  ChangeRequestForm,
  Checkout,
  DepartureChecklist,
  OwnPlacement,
  PortalProfile,
} from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("student")
  return actionOf(run)
}

export async function openCheckout(
  amountIdr: number,
  idempotencyKey: string,
): Promise<ActionResult<Checkout>> {
  return call(() =>
    api<Checkout>("/payments/me/checkout", {
      method: "POST",
      body: { amountIdr },
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  )
}

export async function presignOwnProof(file: {
  mimeType: string
  sizeBytes: number
}): Promise<ActionResult<ProofUpload>> {
  return call(() => api<ProofUpload>("/payments/me/proofs", { method: "POST", body: file }))
}

export async function submitCashPayment(
  amountIdr: number,
  proofId: string,
  idempotencyKey: string,
): Promise<ActionResult> {
  return call(async () => {
    await api("/payments/me/cash", {
      method: "POST",
      body: { amountIdr, proofId },
      headers: { "Idempotency-Key": idempotencyKey },
    })
    return null
  })
}

export async function saveDepartureChecklist(
  checkedCodes: string[],
): Promise<ActionResult<DepartureChecklist>> {
  return call(() =>
    api<DepartureChecklist>("/visa-placements/me/checklist", {
      method: "PUT",
      body: { checkedCodes },
    }),
  )
}

export async function presignProfileEvidence(file: {
  mimeType: string
  sizeBytes: number
}): Promise<ActionResult<UploadTarget & { evidenceId: string }>> {
  return call(() =>
    api<UploadTarget & { evidenceId: string }>("/portal/profile/change-requests/evidence", {
      method: "POST",
      body: file,
    }),
  )
}

export async function requestProfileChange(
  form: ChangeRequestForm,
  evidenceId: string | null,
): Promise<ActionResult<PortalProfile>> {
  return call(() =>
    api<PortalProfile>("/portal/profile/change-requests", {
      method: "POST",
      body: { ...form, ...(evidenceId ? { evidenceId } : {}) },
    }),
  )
}

export async function proposePlacement(
  input: Partial<Record<ProposalField, string>>,
): Promise<ActionResult<OwnPlacement>> {
  return call(() =>
    api<OwnPlacement>("/visa-placements/me/proposals", { method: "PUT", body: input }),
  )
}
