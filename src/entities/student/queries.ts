import type { Page } from "@/src/lib/api/errors"
import { readQuery, type ReadQuery } from "@/src/lib/api/read"
import type { ListParams } from "@/src/lib/list-query"

import type {
  ChangeRequest,
  STUDENT_FILTERS,
  StudentAcademic,
  StudentAdmission,
  StudentDetail,
  StudentDocuments,
  StudentFilterOptions,
  StudentFinance,
  StudentHistory,
  StudentListRow,
} from "./schema"

export type StudentListParams = ListParams<(typeof STUDENT_FILTERS)[number]>

export const studentsQuery = (params: StudentListParams) =>
  readQuery<Page<StudentListRow>>("students", "/students", params)

export const studentFilterOptionsQuery = () =>
  readQuery<StudentFilterOptions>("student-filter-options", "/students/filter-options")

const studentPart = <T>(nis: string, part?: string): ReadQuery<T> => ({
  queryKey: part ? ["students", nis, part] : ["students", nis],
  path: part
    ? `/students/${encodeURIComponent(nis)}/${part}`
    : `/students/${encodeURIComponent(nis)}`,
})

export const studentQuery = (nis: string) => studentPart<StudentDetail>(nis)
export const studentFinanceQuery = (nis: string) => studentPart<StudentFinance>(nis, "finance")
export const studentAcademicQuery = (nis: string) => studentPart<StudentAcademic>(nis, "academic")
export const studentDocumentsQuery = (nis: string) =>
  studentPart<StudentDocuments>(nis, "documents")
export const studentAdmissionQuery = (nis: string) =>
  studentPart<StudentAdmission>(nis, "admission")
export const studentHistoryQuery = (nis: string) => studentPart<StudentHistory>(nis, "history")
export const changeRequestsQuery = (nis: string) =>
  studentPart<ChangeRequest[]>(nis, "change-requests")
export const admissionAccountQuery = (nis: string) =>
  studentPart<{ email: string; password: string }>(nis, "admission-account")
