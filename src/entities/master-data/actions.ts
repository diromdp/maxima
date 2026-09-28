"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type {
  ContentForm,
  DocumentTypeForm,
  HolidayForm,
  MasterItemForm,
  MasterStatus,
  MasterType,
} from "./schema"

export type MasterResource = "master-items" | "document-types" | "academic-holidays" | "contents"

const RESOURCES: ReadonlySet<string> = new Set<MasterResource>([
  "master-items",
  "document-types",
  "academic-holidays",
  "contents",
])

async function call(
  resource: MasterResource,
  id: string | null,
  method: "POST" | "PATCH" | "DELETE",
  body?: Record<string, unknown>,
): Promise<ActionResult> {
  await requireSession("staff")
  if (!RESOURCES.has(resource)) throw new Error("Unknown master resource")
  return actionOf(async () => {
    await api(id ? `/${resource}/${id}` : `/${resource}`, { method, body })
    return null
  })
}

const save = (resource: MasterResource, id: string | null, body: Record<string, unknown>) =>
  call(resource, id, id ? "PATCH" : "POST", body)

function branchFields(form: MasterItemForm, initialCode: string | null) {
  return {
    ...(form.code === initialCode ? {} : { code: form.code }),
    contactEmail: form.contactEmail || null,
    contactPhone: form.contactPhone || null,
  }
}

export async function saveMasterItem(
  type: MasterType,
  id: string | null,
  form: MasterItemForm,
  initialCode: string | null,
): Promise<ActionResult> {
  return save("master-items", id, {
    ...(id ? {} : { type }),
    name: form.name,
    status: form.status,
    ...(type === "branch" ? branchFields(form, initialCode) : {}),
  })
}

export async function setMasterItemStatus(id: string, status: MasterStatus): Promise<ActionResult> {
  return save("master-items", id, { status })
}

export async function saveDocumentType(
  id: string | null,
  form: DocumentTypeForm,
): Promise<ActionResult> {
  return save("document-types", id, form)
}

export async function saveHoliday(id: string | null, form: HolidayForm): Promise<ActionResult> {
  return save("academic-holidays", id, form)
}

export async function saveContent(id: string | null, form: ContentForm): Promise<ActionResult> {
  return save("contents", id, form)
}

export async function removeMasterRecord(
  resource: MasterResource,
  id: string,
): Promise<ActionResult> {
  return call(resource, id, "DELETE")
}
