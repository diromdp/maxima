import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { canEdit } from "@/src/lib/auth/permissions"
import { requirePermission } from "@/src/lib/auth/session"

import { ALUMNI_STATUS_BADGE, alumnusStatus, findAlumnus } from "../sample"
import { AlumniDetail } from "./AlumniDetail"

export default async function AlumniDetailPage({ params }: { params: Promise<{ nis: string }> }) {
  const session = await requirePermission("visa-placement")
  const { nis } = await params
  const alumnus = findAlumnus(nis)
  if (!alumnus) notFound()
  const status = alumnusStatus(alumnus)

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`${alumnus.salutation} ${alumnus.name}`}
        badge={<span className={`badge ${ALUMNI_STATUS_BADGE[status]}`}>{status}</span>}
        subtitle="Detail visa, penempatan, berkas, dan checklist keberangkatan. Tanggal yang tersimpan di sini adalah versi yang berlaku."
        actions={
          <Link href="/staff/visa-placement" className="btn btn-secondary">
            Kembali ke Daftar
          </Link>
        }
      />

      <AlumniDetail initial={alumnus} readOnly={!canEdit(session.role, "visa-placement")} />
    </div>
  )
}
