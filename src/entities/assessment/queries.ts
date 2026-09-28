import { readQuery } from "@/src/lib/api/read"

import type { AssessmentFilters, AssessmentSheet, SheetKey } from "./schema"

export const assessmentFiltersQuery = () =>
  readQuery<AssessmentFilters>("assessment-filters", "/assessments/filters")

export const assessmentSheetQuery = ({ classId, periodId }: SheetKey) =>
  readQuery<AssessmentSheet>("assessment-sheet", "/assessments/sheet", { classId, periodId })
