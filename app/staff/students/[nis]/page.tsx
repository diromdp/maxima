import { Breadcrumbs } from "@mantine/core"
import Link from "next/link"
import { notFound } from "next/navigation"

import { requirePermission } from "@/src/lib/auth/session"

import { findStudent } from "../sample"
import { ENROLLED_AT, PHASE } from "./sample"
import { StudentHeader } from "./StudentHeader"
import { StudentTabs } from "./StudentTabs"

const MONTH_YEAR = new Intl.DateTimeFormat("id-ID", {
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
})

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ nis: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const session = await requirePermission("students")
  const [{ nis }, { tab }] = await Promise.all([params, searchParams])
  const student = findStudent(nis)
  if (!student) notFound()

  return (
    <div className="stack stack-lg">
      <div className="stack">
        <Breadcrumbs separator="/">
          <Link href="/staff/students" className="body-sm text-muted">
            Daftar Siswa
          </Link>
          <span className="body-sm text-muted">{student.name}</span>
        </Breadcrumbs>

        <StudentHeader
          student={student}
          phase={PHASE}
          enrolled={MONTH_YEAR.format(new Date(ENROLLED_AT))}
        />
      </div>

      <StudentTabs nis={student.nis} role={session.role} initialTab={tab} />
    </div>
  )
}
