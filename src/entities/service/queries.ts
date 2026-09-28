import type { Page } from "@/src/lib/api/errors"
import { readQuery, type ReadQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type { BoardRow, SERVICE_FILTERS, ServiceDetail, ServiceOptions } from "./schema"

export type ServiceBoardParams = ListParams<(typeof SERVICE_FILTERS)[number]>

export const serviceBoardQuery = (params: ServiceBoardParams) =>
  readQuery<Page<BoardRow>>("services-board", "/services/board", params)

export const serviceOptionsQuery = () =>
  readQuery<ServiceOptions>("service-options", "/services/options")

export const serviceDetailQuery = (nis: string): ReadQuery<ServiceDetail> => ({
  queryKey: ["services", nis],
  path: `/services/students/${encodeURIComponent(nis)}`,
})
