import type { Page } from "@/src/lib/api/errors"
import { readQuery, type ReadQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type {
  DOCUMENT_FILTERS,
  DocumentDetail,
  DocumentIndexRow,
  DocumentIndexSummary,
} from "./schema"

export type DocumentListParams = ListParams<(typeof DOCUMENT_FILTERS)[number]>

export const documentsQuery = (params: DocumentListParams) =>
  readQuery<Page<DocumentIndexRow> & { summary: DocumentIndexSummary }>(
    "documents",
    "/documents",
    params,
  )

export const documentDetailQuery = (nis: string): ReadQuery<DocumentDetail> => ({
  queryKey: ["documents", nis],
  path: `/documents/students/${encodeURIComponent(nis)}`,
})

export const documentKeysOf = (nis: string) => [["documents"], ["students", nis]] as const

export const ownDocumentsQuery = () => readQuery<DocumentDetail>("own-documents", "/documents/me")
