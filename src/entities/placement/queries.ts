import { readQuery, type ReadQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type { PLACEMENT_FILTERS, PlacementDetail, PlacementPage } from "./schema"

export type PlacementListParams = ListParams<(typeof PLACEMENT_FILTERS)[number]>

export const placementsQuery = (params: PlacementListParams) =>
  readQuery<PlacementPage>("visa-placements", "/visa-placements", params)

export const placementQuery = (nis: string): ReadQuery<PlacementDetail> => ({
  queryKey: ["visa-placements", nis],
  path: `/visa-placements/${encodeURIComponent(nis)}`,
})
