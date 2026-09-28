import { readQuery } from "@/src/lib/api/read"

import type {
  AtRiskFilters,
  AtRiskReport,
  Listing,
  MonitoringClassRow,
  MonitoringTeacherRow,
} from "./schema"

export const monitoringTeachersQuery = () =>
  readQuery<Listing<MonitoringTeacherRow>>("monitoring-teachers", "/monitoring/teachers")

export const monitoringClassesQuery = () =>
  readQuery<Listing<MonitoringClassRow>>("monitoring-classes", "/monitoring/classes")

export const atRiskQuery = (filters: AtRiskFilters = {}) =>
  readQuery<AtRiskReport>("monitoring-at-risk", "/monitoring/at-risk", filters)
