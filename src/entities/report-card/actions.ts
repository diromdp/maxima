"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type { Recommendation } from "./schema"

export async function issueReportCard(input: {
  nis: string
  levelId: string
  periodId: string
}): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api("/report-cards", { method: "POST", body: input })
    return null
  })
}

export async function sendReportCard(id: string): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/report-cards/${id}/send`, { method: "POST" })
    return null
  })
}

export async function decideReportCard(
  id: string,
  decision: Recommendation,
): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/report-cards/${id}/decision`, { method: "POST", body: { decision } })
    return null
  })
}
