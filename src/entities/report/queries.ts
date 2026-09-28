import { readQuery } from "@/src/lib/api/read"

import type {
  GroupBy,
  GroupReport,
  GroupStudentRow,
  MonthlyReport,
  ReportPeriods,
  YearlyReport,
} from "./schema"

export const reportPeriodsQuery = () =>
  readQuery<ReportPeriods>("reports-periods", "/reports/periods")

export const monthlyReportQuery = (month: string) =>
  readQuery<MonthlyReport>("reports-monthly", "/reports/monthly", { month })

export const yearlyReportQuery = (year: number) =>
  readQuery<YearlyReport>("reports-yearly", "/reports/yearly", { year })

export const groupReportQuery = (by: GroupBy, search?: string) =>
  readQuery<GroupReport>("reports-groups", "/reports/groups", { by, search })

export const groupStudentsQuery = (by: GroupBy, id: string) =>
  readQuery<GroupStudentRow[]>("reports-group-students", "/reports/groups/students", { by, id })
