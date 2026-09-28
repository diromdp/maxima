import type { Page } from "@/src/lib/api/errors"
import { readQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type {
  DUE_FILTERS,
  DueRow,
  DueSummary,
  RECEIVABLE_FILTERS,
  ReceivableRow,
  REMINDER_FILTERS,
  ReminderRow,
} from "./schema"

export type ReceivableParams = ListParams<(typeof RECEIVABLE_FILTERS)[number]>
export type DueParams = ListParams<(typeof DUE_FILTERS)[number]>
export type ReminderParams = ListParams<(typeof REMINDER_FILTERS)[number]>

export const receivablesQuery = (params: ReceivableParams) =>
  readQuery<Page<ReceivableRow>>("invoice-receivables", "/invoices/receivables", params)

export const dueQuery = (params: DueParams) =>
  readQuery<Page<DueRow> & { summary: DueSummary }>("invoice-due", "/invoices/due", params)

export const remindersQuery = (params: ReminderParams) =>
  readQuery<Page<ReminderRow> & { summary: { total: number; failed: number } }>(
    "invoice-reminders",
    "/invoices/reminders",
    params,
  )
