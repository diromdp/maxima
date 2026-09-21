import Link from "next/link"

import { formatDateTime } from "@/src/lib/format"
import { Notice } from "@/src/components/ui/Notice"

import { CardHeader } from "./CardHeader"
import type { Rejection } from "./leave"
import { SpecList } from "./SpecList"

export function RejectionCard({ rejection }: { rejection: Rejection }) {
  return (
    <section className="card stack">
      <CardHeader title="Alasan Penolakan" />

      <SpecList
        items={[
          { name: "Tahap Penolakan", value: rejection.stageLabel },
          { name: "Diputuskan pada", value: formatDateTime(rejection.decidedAt) },
        ]}
      />

      <Notice tone="danger" title={rejection.headline}>
        {rejection.reason}
      </Notice>

      <div className="row">
        <Link className="btn btn-primary" href="/portal/leave/new">
          Ajukan Kembali
        </Link>
      </div>
    </section>
  )
}
