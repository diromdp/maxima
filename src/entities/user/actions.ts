"use server"

import { actionOf, api, type ActionResult } from "@/src/lib/api/client"
import { requireSession } from "@/src/lib/auth/session"

import type { RoleForm, RoleRow, UserForm, UserRow } from "./schema"

const userBody = (form: UserForm) => ({
  name: form.name,
  email: form.email,
  ...(form.password ? { password: form.password } : {}),
  roleId: form.roleId,
  status: form.isActive ? "Aktif" : "Nonaktif",
  branchIds: form.branchIds,
})

const roleBody = (form: RoleForm) => ({
  name: form.name,
  description: form.description || null,
  homeArea: form.homeArea,
  scope: form.scope,
  status: form.isActive ? "Aktif" : "Nonaktif",
  permissions: Object.fromEntries(
    Object.entries(form.permissions).map(([page, access]) => [
      page,
      { view: true, edit: access === "edit" },
    ]),
  ),
  capabilities: form.capabilities,
})

const sameList = (left: readonly string[], right: readonly string[]) =>
  left.length === right.length && [...left].sort().join() === [...right].sort().join()

function changedUserBody(form: UserForm, initial: UserForm): Record<string, unknown> {
  const body = userBody(form)
  const before = userBody(initial)
  return Object.fromEntries(
    Object.entries(body).filter(([key, value]) =>
      Array.isArray(value)
        ? !sameList(value, before[key as keyof typeof before] as string[])
        : value !== before[key as keyof typeof before],
    ),
  )
}

export async function saveUser(
  id: string | null,
  form: UserForm,
  initial: UserForm | null,
): Promise<ActionResult<UserRow>> {
  await requireSession("staff")
  return actionOf(() =>
    api<UserRow>(id ? `/users/${id}` : "/users", {
      method: id ? "PATCH" : "POST",
      body: id && initial ? changedUserBody(form, initial) : userBody(form),
    }),
  )
}

export async function saveRole(id: string | null, form: RoleForm): Promise<ActionResult<RoleRow>> {
  await requireSession("staff")
  return actionOf(() =>
    api<RoleRow>(id ? `/roles/${id}` : "/roles", {
      method: id ? "PATCH" : "POST",
      body: roleBody(form),
    }),
  )
}

export async function deleteRole(id: string): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/roles/${id}`, { method: "DELETE" })
    return null
  })
}

export async function deleteUser(id: string): Promise<ActionResult> {
  await requireSession("staff")
  return actionOf(async () => {
    await api(`/users/${id}`, { method: "DELETE" })
    return null
  })
}
