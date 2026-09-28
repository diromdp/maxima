import type { Page } from "@/src/lib/api/errors"
import { readQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type {
  DECISION_FILTERS,
  DecisionRow,
  QueueRow,
  Recommendation,
  REPORT_CARD_FILTERS,
  ReportCardDetail,
} from "./schema"

export type ReportQueueParams = ListParams<(typeof REPORT_CARD_FILTERS)[number]>

export const reportQueueQuery = (params: ReportQueueParams) =>
  readQuery<Page<QueueRow> & { readyCount: number }>("report-cards", "/report-cards", params)

export const reportCardQuery = (nis: string, query: { level?: string; period?: string }) =>
  readQuery<ReportCardDetail>("report-card", `/report-cards/students/${encodeURIComponent(nis)}`, {
    level: query.level,
    period: query.period,
  })

export type DecisionParams = ListParams<(typeof DECISION_FILTERS)[number]>

export const decisionsQuery = (params: DecisionParams) =>
  readQuery<Page<DecisionRow> & { summary: Record<Recommendation, number> }>(
    "report-card-decisions",
    "/report-cards/decisions",
    params,
  )
