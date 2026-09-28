"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import {
  nullIfBlank,
  type ApplicationForm,
  type ApplicationUpdateForm,
  type PartnerForm,
  type PracticeForm,
  type PracticeResultForm,
} from "./schema"

async function send(path: string, method: "POST" | "PUT", body: unknown): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(path, { method, body })
    return null
  })
}

const notesOf = (form: { position: string; partnerNote: string; admissionNote: string }) => ({
  position: nullIfBlank(form.position),
  partnerNote: nullIfBlank(form.partnerNote),
  admissionNote: nullIfBlank(form.admissionNote),
})

export async function savePartner(id: string | null, form: PartnerForm): Promise<ActionResult> {
  return send(id ? `/partners/${id}` : "/partners", id ? "PUT" : "POST", {
    name: form.name,
    city: nullIfBlank(form.city),
    categoryId: form.categoryId,
    openPositions: form.openPositions,
    status: form.status,
    contactName: nullIfBlank(form.contactName),
    contactEmail: nullIfBlank(form.contactEmail),
    contactPhone: nullIfBlank(form.contactPhone),
  })
}

export async function createApplication(form: ApplicationForm): Promise<ActionResult> {
  return send("/partner-applications", "POST", {
    studentId: form.studentId,
    partnerId: form.partnerId,
    status: form.status,
    ...notesOf(form),
  })
}

export async function updateApplication(
  id: string,
  form: ApplicationUpdateForm,
): Promise<ActionResult> {
  return send(`/partner-applications/${id}`, "PUT", {
    status: form.status,
    reason: nullIfBlank(form.reason),
    ...notesOf(form),
  })
}

export async function schedulePractice(form: PracticeForm): Promise<ActionResult> {
  return send("/interview-practices", "POST", {
    studentId: form.studentId,
    partnerId: form.partnerId,
    position: nullIfBlank(form.position),
    date: form.date,
    startsAt: form.startsAt,
    round: form.round,
    trainerUserId: form.trainerUserId,
  })
}

export async function recordPracticeResult(
  id: string,
  form: PracticeResultForm,
): Promise<ActionResult> {
  return send(`/interview-practices/${id}/result`, "PUT", {
    status: form.status,
    result: form.status === "Selesai" ? form.result : null,
    evaluation: nullIfBlank(form.evaluation),
  })
}
