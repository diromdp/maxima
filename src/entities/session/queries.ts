import { readQuery, type ReadQuery } from "@/src/lib/api/read"

import type { SessionDetail, SessionOnDate } from "./schema"

export const sessionDatesQuery = (month: string) =>
  readQuery<{ dates: string[] }>("class-session-dates", "/class-sessions/dates", { month })

export const sessionsOnDateQuery = (date: string) =>
  readQuery<SessionOnDate[]>("class-sessions", "/class-sessions", { date })

export const sessionDetailQuery = (id: string): ReadQuery<SessionDetail> => ({
  queryKey: ["class-session", id],
  path: `/class-sessions/${id}`,
})
