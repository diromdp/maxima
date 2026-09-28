"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"
import type { UploadTarget } from "@/src/lib/upload"

import type {
  CertificateRow,
  ExamScheduleRow,
  ModulesInput,
  RecommendationItem,
  RecommendationRow,
} from "./schema"

async function call<T>(run: () => Promise<T>): Promise<ActionResult<T>> {
  await requireSession("staff")
  return actionOf(run)
}

export async function presignCertificateFile(
  studentId: string,
  certificateType: string,
  level: string,
  file: { mimeType: string; sizeBytes: number },
): Promise<ActionResult<UploadTarget>> {
  return call(() =>
    api<UploadTarget>("/uploads/presign", {
      method: "POST",
      body: { studentId, purpose: { kind: "certificate", certificateType, level }, ...file },
    }),
  )
}

export async function createCertificate(input: {
  studentId: string
  kindId: string
  levelId: string
  modules: ModulesInput
}): Promise<ActionResult<CertificateRow>> {
  return call(() => api<CertificateRow>("/certificates", { method: "POST", body: input }))
}

export async function verifyCertificate(
  id: string,
  modules: ModulesInput | undefined,
): Promise<ActionResult<CertificateRow>> {
  return call(() =>
    api<CertificateRow>(`/certificates/${id}/verify`, { method: "POST", body: { modules } }),
  )
}

export async function rejectCertificate(
  id: string,
  reason: string,
): Promise<ActionResult<CertificateRow>> {
  return call(() =>
    api<CertificateRow>(`/certificates/${id}/reject`, { method: "POST", body: { reason } }),
  )
}

export async function saveExamRecommendations(
  items: RecommendationItem[],
): Promise<ActionResult<{ data: RecommendationRow[] }>> {
  return call(() =>
    api<{ data: RecommendationRow[] }>("/exam-recommendations", {
      method: "PUT",
      body: { items },
    }),
  )
}

export async function createExamSchedule(input: {
  kindId: string
  levelId: string
  date: string
  location: string
  capacity: number
}): Promise<ActionResult<ExamScheduleRow>> {
  return call(() => api<ExamScheduleRow>("/exam-schedules", { method: "POST", body: input }))
}

export async function registerExamStudents(
  scheduleId: string,
  studentIds: string[],
  isOverCapacityConfirmed: boolean,
): Promise<ActionResult<ExamScheduleRow>> {
  return call(() =>
    api<ExamScheduleRow>(`/exam-schedules/${scheduleId}/registrants`, {
      method: "POST",
      body: { studentIds, isOverCapacityConfirmed },
    }),
  )
}
