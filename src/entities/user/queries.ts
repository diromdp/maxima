import type { Page } from "@/src/lib/api/errors"
import { readQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type { BranchRow, PageRow, RoleRow, UserRow } from "./schema"

export const USER_FILTERS = ["role", "branch"] as const

export type UserListParams = ListParams<(typeof USER_FILTERS)[number]>

const ALL_ROLES = 100

export const usersQuery = (params: UserListParams) =>
  readQuery<Page<UserRow>>("users", "/users", params)

export const rolesQuery = () => readQuery<Page<RoleRow>>("roles", "/roles", { perPage: ALL_ROLES })

export const pagesQuery = () => readQuery<{ data: PageRow[] }>("pages", "/pages")

export const branchesQuery = () =>
  readQuery<{ data: BranchRow[] }>("master-items", "/master-items", { type: "branch" })
