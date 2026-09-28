import { readQuery } from "@/src/lib/api/read"

import type {
  ApplicationFilters,
  ApplicationRow,
  PartnerFilters,
  PartnerRow,
  PracticeFilters,
  PracticeRow,
  Ref,
  StudentOption,
  TrackingRow,
} from "./schema"

export const APPLICATION_KEYS = [
  ["partner-applications"],
  ["partner-tracking"],
  ["partners"],
] as const

export const partnersQuery = (filters: PartnerFilters = {}) =>
  readQuery<{ data: PartnerRow[] }>("partners", "/partners", filters)

export const applicationsQuery = (filters: ApplicationFilters = {}) =>
  readQuery<{ data: ApplicationRow[] }>("partner-applications", "/partner-applications", filters)

export const trackingQuery = (filters: ApplicationFilters = {}) =>
  readQuery<{ data: TrackingRow[] }>("partner-tracking", "/partner-applications/tracking", filters)

export const requirementsQuery = (studentId: string) =>
  readQuery<{ missing: string[] }>("partner-requirements", "/partner-applications/requirements", {
    studentId,
  })

export const partnerStudentsQuery = (search: string) =>
  readQuery<{ data: StudentOption[] }>("partner-students", "/partner-applications/students", {
    search,
  })

export const practicesQuery = (filters: PracticeFilters = {}) =>
  readQuery<{ data: PracticeRow[] }>("interview-practices", "/interview-practices", filters)

export const trainersQuery = () =>
  readQuery<{ data: Ref[] }>("practice-trainers", "/interview-practices/trainers")
