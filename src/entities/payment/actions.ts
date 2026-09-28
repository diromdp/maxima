"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { Currency } from "@/src/lib/money"

import type { PaymentDetail, PaymentKind, ProofUpload } from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

export async function presignPaymentProof(
  studentId: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<ProofUpload>> {
  return call(() =>
    api<ProofUpload>("/payments/proofs", { method: "POST", body: { studentId, ...file } }),
  )
}

export async function recordCashPayment(
  input: {
    studentId: string
    paidOn: string
    kind: PaymentKind
    currency: Currency
    amount: number
    receivedByName: string
    branchId: string
    note: string | null
    proofId: string
  },
  idempotencyKey: string,
): Promise<ActionResult<PaymentDetail>> {
  return call(() =>
    api<PaymentDetail>("/payments", {
      method: "POST",
      body: input,
      headers: { "Idempotency-Key": idempotencyKey },
    }),
  )
}

export async function ratifyPayment(id: string): Promise<ActionResult<PaymentDetail>> {
  return call(() => api<PaymentDetail>(`/payments/${id}/ratify`, { method: "POST" }))
}

export async function rejectPayment(
  id: string,
  reason: string,
): Promise<ActionResult<PaymentDetail>> {
  return call(() =>
    api<PaymentDetail>(`/payments/${id}/reject`, { method: "POST", body: { reason } }),
  )
}
