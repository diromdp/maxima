import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requirePermission } from "@/src/lib/auth/session"

import { STUDENTS } from "./sample"
import { StudentsTable } from "./StudentsTable"

export default async function StudentsPage() {
  await requirePermission("students")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Siswa"
        subtitle={`${STUDENTS.length} siswa terdaftar saat ini.`}
        actions={
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button type="button" className="btn btn-secondary">
              Impor Data (.csv)
            </button>
            <button type="button" className="btn btn-secondary">
              Ekspor Data
            </button>
            <Link href="/staff/registrations" className="btn btn-primary">
              + Tambah Siswa
            </Link>
          </div>
        }
      />

      <StudentsTable />
    </div>
  )
}
