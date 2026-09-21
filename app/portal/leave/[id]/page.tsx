import Link from "next/link"
import { notFound } from "next/navigation"

import { PageHeader } from "@/src/components/layout/PageHeader"
import { requireSession } from "@/src/lib/auth/session"
import { Notice } from "@/src/components/ui/Notice"

import { ApplicationSummary } from "../ApplicationSummary"
import { ApprovalCard } from "../ApprovalCard"
import { FinanceSummary } from "../FinanceSummary"
import { applicationInState, findApplication, stateHeading, type LeaveState } from "../leave"
import { PaymentConfirmed } from "../PaymentConfirmed"
import { RejectionCard } from "../RejectionCard"
import { StageProgress } from "../StageProgress"
import { TermsAside } from "../TermsAside"

const PREVIEW_STATES: Readonly<Record<string, LeaveState>> = {
  "awaiting-finance": { kind: "awaiting-finance" },
  "payment-set": { kind: "payment-set" },
  "awaiting-payment-check": { kind: "awaiting-payment-check" },
  processing: { kind: "processing" },
  rejected: { kind: "rejected", atStage: 6 },
  approved: { kind: "approved" },
}

export default async function LeaveDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string }>
}) {
  await requireSession("student")

  const [{ id }, { status }] = await Promise.all([params, searchParams])
  const preview = status ? PREVIEW_STATES[status] : undefined
  const stored = findApplication(id)
  if (!stored && !preview) notFound()

  const application = preview
    ? { ...(stored ?? applicationInState(preview)), state: preview }
    : stored!
  const state = application.state
  const heading = stateHeading(state)

  return (
    <div className="stack stack-lg">
      <div className="stack stack-sm">
        <nav aria-label="Remah" className="caption text-muted">
          <Link href="/portal/leave" className="text-muted" style={{ textDecoration: "none" }}>
            Riwayat Cuti
          </Link>{" "}
          / {application.id}
        </nav>

        <PageHeader
          title={heading.title}
          subtitle={heading.description}
          actions={<span className={`badge badge-${heading.tone}`}>{heading.badge}</span>}
        />
      </div>

      <div className="grid-main-aside">
        <div className="stack stack-lg">
          {state.kind === "awaiting-finance" && (
            <Notice tone="info">
              Finance akan menilai riwayat pembayaran terlebih dahulu. Belum ada nominal pembayaran
              pada tahap ini. Estimasi maksimal 2 × 24 jam hari kerja.
            </Notice>
          )}

          {state.kind === "payment-set" && application.finance && (
            <FinanceSummary finance={application.finance} />
          )}

          {state.kind === "awaiting-payment-check" && application.finance && (
            <FinanceSummary finance={application.finance} proof={application.proof} />
          )}

          {state.kind === "processing" && application.verifiedAt && (
            <PaymentConfirmed verifiedAt={application.verifiedAt} />
          )}

          {state.kind === "rejected" && application.rejection && (
            <RejectionCard rejection={application.rejection} />
          )}

          {(state.kind === "approved" ||
            state.kind === "on-leave" ||
            state.kind === "completed") && <ApprovalCard application={application} />}

          <ApplicationSummary application={application} />
        </div>

        <div className="stack stack-lg" style={{ alignSelf: "start" }}>
          <StageProgress state={state} />
          <TermsAside />
        </div>
      </div>
    </div>
  )
}
