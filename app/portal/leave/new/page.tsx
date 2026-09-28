import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { ownLeavesQuery } from "@/src/entities/leave/queries"
import { Prefetched } from "@/src/lib/api/Prefetched"
import { requireSession } from "@/src/lib/auth/session"

import { PAGE_SUBTITLE } from "../leave"
import { LeaveForm } from "../LeaveForm"
import { StageProgress } from "../StageProgress"

const DRAFT = { state: "draft", stage: 1 } as const

export default async function NewLeavePage() {
  const session = await requireSession("student")

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/portal/leave" className="text-muted" style={{ textDecoration: "none" }}>
            Riwayat Cuti
          </Link>{" "}
          / Pengajuan baru
        </nav>

        <PageHeader title="Pengajuan Cuti" subtitle={PAGE_SUBTITLE} />
      </div>

      <div className="grid-main-aside">
        <Prefetched reads={[ownLeavesQuery()]}>
          <LeaveForm status={session.status} />
        </Prefetched>
        <div style={{ alignSelf: "start" }}>
          <StageProgress leave={DRAFT} />
        </div>
      </div>
    </div>
  )
}
