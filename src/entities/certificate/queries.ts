import { readQuery, type ReadQuery } from "@/src/lib/api/read"

import type {
  CertificateFilters,
  CertificateRow,
  ExamCandidateRow,
  ExamRegistrantRow,
  ExamScheduleRow,
  OwnCertificateOptions,
  ReadinessCandidate,
  RecommendationFilters,
  RecommendationRow,
  StudentOption,
} from "./schema"

export const RECOMMENDATION_KEYS = [
  ["exam-recommendations"],
  ["exam-recommendation-candidates"],
  ["exam-candidates"],
] as const

export const SCHEDULE_KEYS = [
  ["exam-schedules"],
  ["exam-registrants"],
  ["exam-candidates"],
] as const

export const certificatesQuery = (filters: CertificateFilters = {}) =>
  readQuery<{ data: CertificateRow[] }>("certificates", "/certificates", filters)

export const certificateStudentsQuery = (search: string) =>
  readQuery<{ data: StudentOption[] }>("certificate-students", "/certificates/students", {
    search,
  })

export const examRecommendationsQuery = (filters: RecommendationFilters = {}) =>
  readQuery<{ data: RecommendationRow[] }>("exam-recommendations", "/exam-recommendations", filters)

export const recommendationCandidatesQuery = () =>
  readQuery<{ data: ReadinessCandidate[] }>(
    "exam-recommendation-candidates",
    "/exam-recommendations/candidates",
  )

export const examSchedulesQuery = () =>
  readQuery<{ data: ExamScheduleRow[] }>("exam-schedules", "/exam-schedules")

export const examRegistrantsQuery = (
  scheduleId: string,
): ReadQuery<{ data: ExamRegistrantRow[] }> => ({
  queryKey: ["exam-registrants", scheduleId],
  path: `/exam-schedules/${scheduleId}/registrants`,
})

export const examCandidatesQuery = (
  scheduleId: string,
): ReadQuery<{ data: ExamCandidateRow[] }> => ({
  queryKey: ["exam-candidates", scheduleId],
  path: `/exam-schedules/${scheduleId}/candidates`,
})

export const ownCertificatesQuery = () =>
  readQuery<{ data: CertificateRow[] }>("own-certificates", "/certificates/me")

export const ownCertificateOptionsQuery = () =>
  readQuery<OwnCertificateOptions>("own-certificate-options", "/certificates/me/options")
