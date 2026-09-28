"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type {
  AssessmentSheet,
  AttitudeSheetInput,
  ScoreSheetInput,
  TeacherNote,
  TeacherNoteInput,
} from "./schema"

export async function saveScoreSheet(
  tab: "chapters" | "exams",
  input: ScoreSheetInput,
): Promise<ActionResult<AssessmentSheet>> {
  await requireSession("staff")
  return actionOf(() =>
    api<AssessmentSheet>(`/assessments/sheet/${tab}`, { method: "PUT", body: input }),
  )
}

export async function saveAttitudeSheet(
  input: AttitudeSheetInput,
): Promise<ActionResult<AssessmentSheet>> {
  await requireSession("staff")
  return actionOf(() =>
    api<AssessmentSheet>("/assessments/sheet/attitudes", { method: "PUT", body: input }),
  )
}

export async function saveTeacherNote(
  studentId: string,
  input: TeacherNoteInput,
): Promise<ActionResult<TeacherNote>> {
  await requireSession("staff")
  return actionOf(() =>
    api<TeacherNote>(`/assessments/notes/${studentId}`, { method: "PUT", body: input }),
  )
}
