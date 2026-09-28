"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { ImportReport, ImportStep } from "@/src/lib/import-file"

import type { ClassForm, PeriodForm, TransferForm } from "./schema"

async function send(
  path: string,
  method: "POST" | "PATCH" | "PUT" | "DELETE",
  body?: Record<string, unknown>,
): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(path, { method, body })
    return null
  })
}

export async function saveClass(id: string | null, form: ClassForm): Promise<ActionResult> {
  return send(id ? `/classes/${id}` : "/classes", id ? "PATCH" : "POST", form)
}

export async function removeClass(id: string): Promise<ActionResult> {
  return send(`/classes/${id}`, "DELETE")
}

export async function addClassMembers(
  classId: string,
  studentIds: readonly string[],
  isOverCapacityConfirmed: boolean,
): Promise<ActionResult> {
  return send(`/classes/${classId}/members`, "POST", { studentIds, isOverCapacityConfirmed })
}

export async function transferClassMembers(
  classId: string,
  form: TransferForm,
): Promise<ActionResult> {
  return send(`/classes/${classId}/members/transfer`, "POST", form)
}

export async function removeClassMember(
  classId: string,
  studentId: string,
  reason: string,
): Promise<ActionResult> {
  return send(`/classes/${classId}/members/${studentId}/remove`, "POST", { reason })
}

export async function saveKkmStandards(values: Record<string, number>): Promise<ActionResult> {
  return send("/kkm-standards", "PUT", { values })
}

export async function savePeriod(id: string | null, form: PeriodForm): Promise<ActionResult> {
  return send(id ? `/academic-periods/${id}` : "/academic-periods", id ? "PATCH" : "POST", form)
}

export async function importClassData(
  resource: "classes" | "class-members",
  xlsx: string,
  step: ImportStep,
): Promise<ActionResult<ImportReport>> {
  await requireSession("staff")
  return actionOf(() =>
    api<ImportReport>(`/classes/import/${resource}/${step}`, { method: "POST", body: { xlsx } }),
  )
}
