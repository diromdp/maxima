import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { portalProfileQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { ChangeRequestForm } from "./ChangeRequestForm"

export default async function ChangeRequestPage() {
  const session = await requireSession("student")

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/portal/profile" className="text-muted" style={{ textDecoration: "none" }}>
            Profil
          </Link>{" "}
          / Ajukan perubahan
        </nav>

        <PageHeader
          title="Ajukan Perubahan Data"
          subtitle="Satu pengajuan untuk satu data. Data hanya berubah setelah cabang menyetujuinya."
        />
      </div>

      <Prefetched reads={[portalProfileQuery()]}>
        <ChangeRequestForm isOnLeave={session.status === "Cuti"} />
      </Prefetched>
    </div>
  )
}
