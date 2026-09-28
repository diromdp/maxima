"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type {
  LeaveDetail,
  LeaveRequestForm,
  ObligationForm,
  RejectionForm,
  ReturnForm,
} from "./schema"

type Rejection = RejectionForm & { decision: "reject" }

async function decide(id: string, step: string, body: unknown): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/leaves/${encodeURIComponent(id)}/${step}`, { method: "POST", body })
    return null
  })
}

export async function assessFinance(
  id: string,
  body:
    | (ObligationForm & { decision: "set-obligation" })
    | { decision: "sufficient"; note?: string }
    | Rejection,
): Promise<ActionResult> {
  return decide(id, "finance-assessment", body)
}

export async function checkPayment(
  id: string,
  body: { decision: "verify" } | { decision: "reject-proof"; reason: string } | Rejection,
): Promise<ActionResult> {
  return decide(id, "verify-payment", body)
}

export async function decideApproval(
  id: string,
  body: { decision: "approve" } | Rejection,
): Promise<ActionResult> {
  return decide(id, "approve", body)
}

export async function confirmReturn(id: string, classId: string): Promise<ActionResult> {
  return decide(id, "confirm-return", { classId })
}

export async function markReturned(id: string, body: ReturnForm): Promise<ActionResult> {
  return decide(id, "return", body)
}

export async function withdrawLeave(id: string, reason: string): Promise<ActionResult> {
  return decide(id, "withdraw", { reason })
}

export type UploadSlot<Key extends string> = {
  url: string
  headers: { "Content-Type": string }
} & Record<Key, string>

async function asStudent<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("student")
  return actionOf(run)
}

export async function presignLeaveEvidence(
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<UploadSlot<"evidenceId">>> {
  return asStudent(() =>
    api<UploadSlot<"evidenceId">>("/leaves/me/evidence", {
      method: "POST",
      body: { mimeType, sizeBytes },
    }),
  )
}

export async function submitLeave(
  form: LeaveRequestForm,
  evidenceId: string,
): Promise<ActionResult<LeaveDetail>> {
  return asStudent(() =>
    api<LeaveDetail>("/leaves/me", { method: "POST", body: { ...form, evidenceId } }),
  )
}

export async function presignLeaveProof(
  mimeType: string,
  sizeBytes: number,
): Promise<ActionResult<UploadSlot<"proofId">>> {
  return asStudent(() =>
    api<UploadSlot<"proofId">>("/payments/me/proofs", {
      method: "POST",
      body: { mimeType, sizeBytes },
    }),
  )
}

export async function submitLeaveProof(id: string, proofId: string): Promise<ActionResult> {
  return asStudent(async () => {
    await api(`/leaves/me/${encodeURIComponent(id)}/proof`, { method: "PUT", body: { proofId } })
    return null
  })
}
