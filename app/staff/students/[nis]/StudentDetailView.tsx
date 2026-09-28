"use client"

import { Breadcrumbs, Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { studentQuery } from "@/src/entities/student/queries"
import { useRead } from "@/src/lib/api/use-read"

import { StudentHeader } from "./StudentHeader"
import { StudentTabs } from "./StudentTabs"

export function StudentDetailView({ nis, canEdit }: { nis: string; canEdit: boolean }) {
  const student = useRead(studentQuery(nis))

  return (
    <div className="stack stack-lg">
      <div className="stack">
        <Breadcrumbs separator="/">
          <Link href="/staff/students" className="body-sm text-muted">
            Daftar Siswa
          </Link>
          <span className="body-sm text-muted">{student.data?.name ?? nis}</span>
        </Breadcrumbs>

        {student.isError ? (
          <QueryError message={student.error.message} onRetry={() => void student.refetch()} />
        ) : student.isPending ? (
          <div aria-busy="true">
            <span className="sr-only" role="status">
              Memuat
            </span>
            <Skeleton height={112} radius="md" aria-hidden />
          </div>
        ) : (
          <StudentHeader student={student.data} canEdit={canEdit} />
        )}
      </div>

      {student.data && <StudentTabs student={student.data} canEdit={canEdit} />}
    </div>
  )
}
