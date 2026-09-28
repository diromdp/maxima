import { readQuery, type ReadQuery } from "@/src/lib/api/read"

import type {
  CalendarEntry,
  Candidates,
  ClassFilters,
  ClassRow,
  KkmRow,
  MemberRow,
  PeriodRow,
  Ref,
} from "./schema"

export const classesQuery = (filters: ClassFilters = {}) =>
  readQuery<{ data: ClassRow[] }>("classes", "/classes", filters)

export const activeClassesQuery = () => classesQuery({ status: "Aktif" })

export const teachersQuery = () => readQuery<{ data: Ref[] }>("class-teachers", "/classes/teachers")

export const classMembersQuery = (classId: string): ReadQuery<{ data: MemberRow[] }> => ({
  queryKey: ["class-members", classId],
  path: `/classes/${classId}/members`,
})

export const classCandidatesQuery = (classId: string): ReadQuery<Candidates> => ({
  queryKey: ["class-candidates", classId],
  path: `/classes/${classId}/candidates`,
})

export const classCalendarQuery = (from: string, to: string) =>
  readQuery<{ data: CalendarEntry[] }>("class-calendar", "/classes/calendar", { from, to })

export const kkmStandardsQuery = () =>
  readQuery<{ data: KkmRow[] }>("kkm-standards", "/kkm-standards")

export const academicPeriodsQuery = () =>
  readQuery<{ data: PeriodRow[] }>("academic-periods", "/academic-periods")
