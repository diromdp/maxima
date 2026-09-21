import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { STUDENTS } from "../sample"
import { StudentDocuments } from "./StudentDocuments"

export default async function StudentDocumentsPage({
  params,
}: {
  params: Promise<{ nis: string }>
}) {
  const session = await requirePermission("documents")
  const { nis } = await params
  const student = STUDENTS.find((candidate) => candidate.nis === nis)
  if (!student) notFound()

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Skema Kelengkapan Berkas, ${student.name}`}
        subtitle="Empat rumpun berkas siswa ini. Verifikasi dan penolakan di sini langsung tampil di portal siswa."
        actions={
          <Link href="/staff/documents" className="btn btn-secondary">
            Kembali ke Dokumen
          </Link>
        }
      />

      <StudentDocuments initial={student} readOnly={!canEdit(session.role, "documents")} />
    </div>
  )
}
