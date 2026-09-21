import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { BOARD } from "../sample"
import { ServiceDetail } from "../ServiceDetail"

export default async function ServiceDetailPage({ params }: { params: Promise<{ nis: string }> }) {
  const session = await requirePermission("services")
  const { nis } = await params
  const student = BOARD.find((candidate) => candidate.nis === nis)
  if (!student) notFound()

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Detail Layanan, ${student.name}`}
        badge={student.onLeave ? <span className="badge badge-berjalan">Cuti</span> : undefined}
        subtitle="Sembilan layanan siswa ini. Status gerbang mengikuti pembayaran; yang diisi di sini progres, PIC, tanggal, catatan, dan hasil."
        actions={
          <Link href="/staff/services" className="btn btn-secondary">
            Kembali ke Papan Layanan
          </Link>
        }
      />

      <ServiceDetail student={student} readOnly={!canEdit(session.role, "services")} />
    </div>
  )
}
