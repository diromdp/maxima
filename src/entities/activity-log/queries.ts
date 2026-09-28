import type { Page } from "@/src/lib/api/errors"
import { readQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type { ActivityLogRow, LogActor } from "./schema"

export const ACTIVITY_LOG_FILTERS = ["user", "module"] as const

export type ActivityLogParams = ListParams<(typeof ACTIVITY_LOG_FILTERS)[number]>

export const activityLogsQuery = (params: ActivityLogParams) =>
  readQuery<Page<ActivityLogRow>>("activity-logs", "/activity-logs", params)

export const logActorsQuery = () =>
  readQuery<{ data: LogActor[] }>("activity-log-users", "/activity-logs/users")
