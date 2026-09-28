"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

export async function remindContract(contractId: string): Promise<ActionResult<{ sent: number }>> {
  await requireSession("staff")
  return actionOf(() =>
    api<{ sent: number }>(`/invoices/due/${contractId}/remind`, { method: "POST" }),
  )
}

export async function remindAllDue(filter: {
  branch?: string
  search?: string
}): Promise<ActionResult<{ sent: number }>> {
  await requireSession("staff")
  return actionOf(() =>
    api<{ sent: number }>("/invoices/due/remind", { method: "POST", body: filter }),
  )
}
