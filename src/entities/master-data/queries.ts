import { readQuery } from "@/src/lib/api/read"

import type { ContentRow, DocumentTypeRow, HolidayRow, MasterItemRow } from "./schema"

export const masterItemsQuery = () =>
  readQuery<{ data: MasterItemRow[] }>("master-items", "/master-items")

export const documentTypesQuery = () =>
  readQuery<{ data: DocumentTypeRow[] }>("document-types", "/document-types")

export const holidaysQuery = () =>
  readQuery<{ data: HolidayRow[] }>("academic-holidays", "/academic-holidays")

export const contentsQuery = () => readQuery<{ data: ContentRow[] }>("contents", "/contents")
