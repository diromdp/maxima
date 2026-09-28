import { readQuery, type ReadQuery } from "@/src/lib/api/read"

import type { LeaveDetail, LeaveOverview, OwnLeaves, ReturnClass } from "./schema"

export const leaveOverviewQuery = () => readQuery<LeaveOverview>("leaves", "/leaves")

export const leaveQuery = (id: string): ReadQuery<LeaveDetail> => ({
  queryKey: ["leaves", id],
  path: `/leaves/${encodeURIComponent(id)}`,
})

export const returnClassesQuery = () =>
  readQuery<{ data: ReturnClass[] }>("classes", "/classes", { status: "Aktif" })

export const ownLeavesQuery = (): ReadQuery<OwnLeaves> => ({
  queryKey: ["leaves", "me"],
  path: "/leaves/me",
})

export const ownLeaveQuery = (id: string): ReadQuery<LeaveDetail> => ({
  queryKey: ["leaves", "me", id],
  path: `/leaves/me/${encodeURIComponent(id)}`,
})
