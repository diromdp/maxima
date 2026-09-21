import Link from "next/link"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"

import { PAGE_SUBTITLE } from "../leave"
import { LeaveForm } from "../LeaveForm"
import { StageProgress } from "../StageProgress"

export default async function NewLeavePage() {
  await requireSession("student")

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
        <LeaveForm />
        <div style={{ alignSelf: "start" }}>
          <StageProgress state={{ kind: "draft" }} />
        </div>
      </div>
    </div>
  )
}
