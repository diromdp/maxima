"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type { SystemSettings } from "./schema"

export async function setPaymentGatewayEnabled(
  paymentGatewayEnabled: boolean,
): Promise<ActionResult<SystemSettings>> {
  await requireSession("staff")
  return actionOf(() =>
    api<SystemSettings>("/settings", { method: "PATCH", body: { paymentGatewayEnabled } }),
  )
}
