import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { studentFilterOptionsQuery, studentsQuery } from "@/src/entities/student/queries"
import { STUDENT_FILTERS } from "@/src/entities/student/schema"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { queryString } from "@/src/lib/api/errors"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"
import { listParamsOf, searchParamsSource } from "@/src/lib/list-query"

import { ImportStudentsButton } from "./ImportStudentsButton"
import { StudentsTable } from "./StudentsTable"

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await requirePermission("students")
  const params = listParamsOf(searchParamsSource(await searchParams), STUDENT_FILTERS)
  const exportQuery = queryString({ ...params, page: undefined, perPage: undefined })
  const canRegister = canEdit(session.permissions, "registrations")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Siswa"
        subtitle="Siswa ber-NIS dalam cakupan peran Anda. Buka nama siswa untuk melihat seluruh keadaannya."
        actions={
          <div className="row row-wrap" style={{ gap: 8 }}>
            {canRegister && <ImportStudentsButton />}
            <a href={`/api/download/students/export${exportQuery}`} className="btn btn-secondary">
              Ekspor Data
            </a>
            {canRegister && (
              <Link href="/staff/registrations" className="btn btn-primary">
                + Tambah Siswa
              </Link>
            )}
          </div>
        }
      />

      <Prefetched reads={[studentsQuery(params), studentFilterOptionsQuery()]}>
        <StudentsTable />
      </Prefetched>
    </div>
  )
}
