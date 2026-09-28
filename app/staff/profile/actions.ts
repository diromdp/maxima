"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type { ProfileForm } from "./forms"

export async function saveOwnProfile(form: ProfileForm): Promise<ActionResult<{ name: string }>> {
  await requireSession("staff")
  return actionOf(() =>
    api<{ name: string }>("/me/profile", { method: "PATCH", body: { name: form.name } }),
  )
}
