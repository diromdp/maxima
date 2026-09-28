import { PageHeader } from "@/src/components/layout/PageHeader"
import { departureChecklistQuery, ownPlacementQuery } from "@/src/entities/portal/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { AlumniFilesView } from "./AlumniFilesView"

export default async function AlumniFilesPage() {
  const session = await requireSession("student")

  return (
    <div className="stack stack-lg">
      <PageHeader
        title="Pemberkasan Alumni"
        subtitle="Lengkapi data untuk proses keberangkatan Anda ke Jerman."
      />

      <Prefetched reads={[ownPlacementQuery(), departureChecklistQuery()]}>
        <AlumniFilesView isOnLeave={session.status === "Cuti"} />
      </Prefetched>
    </div>
  )
}
