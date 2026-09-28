"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type { SessionDetail, SessionInput } from "./schema"

export async function saveSession(
  id: string,
  input: SessionInput,
): Promise<ActionResult<SessionDetail>> {
  await requireSession("staff")
  return actionOf(() => api<SessionDetail>(`/class-sessions/${id}`, { method: "PUT", body: input }))
}
