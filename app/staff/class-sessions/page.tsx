import { PageHeader } from "@/src/components/layout/PageHeader"
import {
  sessionDatesQuery,
  sessionDetailQuery,
  sessionsOnDateQuery,
} from "@/src/entities/session/queries"
import { jakartaToday, monthOf, type SessionOnDate } from "@/src/entities/session/schema"
import { api } from "@/src/lib/api/client"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requirePermission } from "@/src/lib/auth/session"

import { ClassSessionForm } from "./ClassSessionForm"

export default async function ClassSessionsPage() {
  const session = await requirePermission("class-sessions")
  const today = jakartaToday()
  const onToday = await api<SessionOnDate[]>("/class-sessions", { query: { date: today } }).catch(
    () => [],
  )
  const first = onToday[0]

  return (
    <div className="stack stack-lg">
      <PageHeader title="Sesi Kelas" subtitle="Satu pertemuan, satu duduk." />

      <Prefetched
        reads={[
          sessionsOnDateQuery(today),
          sessionDatesQuery(monthOf(today)),
          ...(first ? [sessionDetailQuery(first.sessionId)] : []),
        ]}
      >
        <ClassSessionForm roleName={session.role} />
      </Prefetched>
    </div>
  )
}
