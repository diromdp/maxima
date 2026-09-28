"use client"

import { Skeleton } from "@mantine/core"

import { QueryError } from "@/src/components/data/QueryError"
import { Notice } from "@/src/components/ui/Notice"
import { ownPlacementQuery } from "@/src/entities/portal/queries"
import { useRead } from "@/src/lib/api/use-read"

import { DepartureChecklist } from "../admin-progress/DepartureChecklist"
import { DepartureFiles } from "./DepartureFiles"
import { ProposalForm } from "./ProposalForm"

export function AlumniFilesSkeleton() {
  return (
    <div className="stack stack-lg" aria-busy="true">
      <span className="sr-only" role="status">
        Memuat
      </span>
      <Skeleton height={56} radius="sm" aria-hidden />
      <Skeleton height={200} radius="md" aria-hidden />
      <Skeleton height={320} radius="md" aria-hidden />
      <div className="grid-2" aria-hidden>
        <Skeleton height={420} radius="md" />
        <Skeleton height={420} radius="md" />
      </div>
    </div>
  )
}

export function AlumniFilesView({ isOnLeave }: { isOnLeave: boolean }) {
  const placement = useRead(ownPlacementQuery())

  if (placement.isError) {
    return <QueryError message={placement.error.message} onRetry={() => void placement.refetch()} />
  }
  if (placement.isPending) return <AlumniFilesSkeleton />

  return (
    <div className="stack stack-lg">
      <Notice tone="info">
        Seluruh isian di halaman ini berstatus usulan sampai Admission memverifikasinya. Status
        Alumni menyala dari tanggal keberangkatan versi Admission, bukan yang Anda ketik.
      </Notice>

      <ProposalForm placement={placement.data} isOnLeave={isOnLeave} />

      <div className="grid-2">
        <DepartureChecklist title="Persiapan Keberangkatan" isOnLeave={isOnLeave} />
        <DepartureFiles files={placement.data.files} />
      </div>
    </div>
  )
}
