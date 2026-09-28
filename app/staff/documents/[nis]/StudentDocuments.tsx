"use client"

import { Skeleton } from "@mantine/core"
import Link from "next/link"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { PageHeader } from "@/src/components/layout/PageHeader"
import { documentDetailQuery } from "@/src/entities/document/queries"
import type { DocumentDetail, DocumentItem } from "@/src/entities/document/schema"
import { useRead } from "@/src/lib/api/use-read"
import { DASH } from "@/src/lib/format"

import { CompletenessScheme } from "../CompletenessScheme"
import { RejectModal } from "../RejectModal"
import { StaffUploadModal } from "../StaffUploadModal"
import { VerifyModal } from "../VerifyModal"

type Decision = { kind: "verify" | "reject" | "upload"; item: DocumentItem } | null

function SummaryCard({ summary }: { summary: DocumentDetail["summary"] }) {
  const facts = [
    { label: "NIS", value: summary.nis },
    { label: "Paket", value: summary.package?.name ?? DASH },
    { label: "Cabang", value: summary.branch?.name ?? DASH },
    { label: "Program", value: summary.program?.name ?? DASH },
    { label: "Berkas lengkap", value: `${summary.complete} dari ${summary.total}` },
    {
      label: "Menunggu verifikasi",
      value: summary.pending > 0 ? `${summary.pending} berkas` : "Tidak ada",
    },
  ]

  return (
    <section className="card">
      <dl className="row row-wrap" style={{ gap: 24, margin: 0 }}>
        {facts.map(({ label, value }) => (
          <div key={label} className="stack" style={{ gap: 2 }}>
            <dt className="caption text-muted">{label}</dt>
            <dd className="body-sm" style={{ fontWeight: 600, margin: 0 }}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

function DetailSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={68} radius="md" aria-hidden />
      <div className="grid-2" aria-hidden>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={360} radius="md" />
        ))}
      </div>
    </div>
  )
}

export function StudentDocuments({
  nis,
  canDecide,
  canUploadResults,
}: {
  nis: string
  canDecide: boolean
  canUploadResults: boolean
}) {
  const detail = useRead(documentDetailQuery(nis))
  const [decision, setDecision] = useState<Decision>(null)
  const close = () => setDecision(null)
  const studentName = detail.data?.summary.name

  return (
    <div className="stack stack-lg">
      <PageHeader
        title={`Skema Kelengkapan Berkas, ${studentName ?? nis}`}
        subtitle="Empat rumpun berkas siswa ini. Verifikasi dan penolakan di sini langsung tampil di portal siswa."
        actions={
          <Link href="/staff/documents" className="btn btn-secondary">
            Kembali ke Dokumen
          </Link>
        }
      />

      {detail.isError ? (
        <QueryError message={detail.error.message} onRetry={() => void detail.refetch()} />
      ) : detail.isPending ? (
        <DetailSkeleton />
      ) : (
        <>
          <SummaryCard summary={detail.data.summary} />
          <CompletenessScheme
            detail={detail.data}
            canDecide={canDecide}
            canUploadResults={canUploadResults}
            onVerify={(item) => setDecision({ kind: "verify", item })}
            onReject={(item) => setDecision({ kind: "reject", item })}
            onUpload={(item) => setDecision({ kind: "upload", item })}
          />
          {decision?.kind === "upload" && (
            <StaffUploadModal student={detail.data.summary} item={decision.item} onClose={close} />
          )}
        </>
      )}

      {decision?.kind === "verify" && studentName && (
        <VerifyModal nis={nis} studentName={studentName} item={decision.item} onClose={close} />
      )}
      {decision?.kind === "reject" && studentName && (
        <RejectModal nis={nis} studentName={studentName} item={decision.item} onClose={close} />
      )}
    </div>
  )
}
