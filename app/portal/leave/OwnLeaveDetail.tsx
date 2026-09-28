"use client"

import { Skeleton } from "@mantine/core"
import Link from "next/link"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { Notice } from "@/src/components/ui/Notice"
import { ownLeaveQuery, ownLeavesQuery } from "@/src/entities/leave/queries"
import { type LeaveDetail, STATE_BADGE } from "@/src/entities/leave/schema"
import { useRead } from "@/src/lib/api/use-read"
import type { PortalStatus } from "@/src/lib/auth/session"

import { ApplicationSummary } from "./ApplicationSummary"
import { ApprovalCard } from "./ApprovalCard"
import { FinanceSummary } from "./FinanceSummary"
import { applyBlockOf, headingOf } from "./leave"
import { PaymentConfirmed } from "./PaymentConfirmed"
import { RejectionCard } from "./RejectionCard"
import { StageProgress } from "./StageProgress"
import { TermsAside } from "./TermsAside"

function StateCard({ leave, status }: { leave: LeaveDetail; status: PortalStatus }) {
  const history = useRead(ownLeavesQuery())

  switch (leave.state) {
    case "awaiting-finance":
      return (
        <Notice tone="info">
          Pengajuan sudah diterima dan sedang diperiksa Finance. Biasanya maksimal 1 x 24 jam kerja.
        </Notice>
      )
    case "payment-set":
    case "awaiting-payment-check":
      return <FinanceSummary leave={leave} />
    case "processing":
      return <PaymentConfirmed leave={leave} />
    case "rejected":
    case "expired":
      return (
        <RejectionCard
          leave={leave}
          applyBlock={history.data ? applyBlockOf(history.data.data, status) : null}
        />
      )
    case "approved":
    case "on-leave":
    case "completed":
      return <ApprovalCard leave={leave} />
    default:
      return null
  }
}

export function OwnLeaveDetail({ id, status }: { id: string; status: PortalStatus }) {
  const leave = useRead(ownLeaveQuery(id))
  const heading = leave.data ? headingOf(leave.data) : null
  const badge = leave.data ? STATE_BADGE[leave.data.state] : null

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/portal/leave" className="text-muted" style={{ textDecoration: "none" }}>
            Riwayat Cuti
          </Link>{" "}
          / {leave.data?.number ?? "Detail"}
        </nav>
        <PageHeader
          title={heading?.title ?? "Pengajuan Cuti"}
          subtitle={heading?.description}
          actions={badge && <span className={`badge badge-${badge.tone}`}>{badge.label}</span>}
        />
      </div>

      {leave.isError ? (
        <QueryError message={leave.error.message} onRetry={() => void leave.refetch()} />
      ) : leave.isPending ? (
        <OwnLeaveDetailSkeleton />
      ) : (
        <div className="grid-main-aside">
          <div className="stack stack-lg">
            <StateCard leave={leave.data} status={status} />
            <ApplicationSummary leave={leave.data} />
          </div>
          <div className="stack stack-lg" style={{ alignSelf: "start" }}>
            <StageProgress leave={leave.data} />
            <TermsAside />
          </div>
        </div>
      )}
    </div>
  )
}

export function OwnLeaveDetailSkeleton() {
  return (
    <div className="grid-main-aside" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <div className="stack stack-lg" aria-hidden>
        <Skeleton height={220} radius="md" />
        <Skeleton height={200} radius="md" />
      </div>
      <div className="stack stack-lg" aria-hidden>
        <Skeleton height={320} radius="md" />
        <Skeleton height={96} radius="md" />
      </div>
    </div>
  )
}
