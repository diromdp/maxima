"use client"

import { Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { modals } from "@mantine/modals"
import { useQueryClient } from "@tanstack/react-query"
import { useState } from "react"

import { QueryError } from "@/src/components/data/QueryError"
import { FormModal } from "@/src/components/ui/FormModal"
import { approveChangeRequest, rejectChangeRequest } from "@/src/entities/student/actions"
import { changeRequestsQuery } from "@/src/entities/student/queries"
import {
  rejectFormSchema,
  type ChangeRequest,
  type RejectForm,
} from "@/src/entities/student/schema"
import { openPresigned } from "@/src/lib/api/download"
import { ApiError } from "@/src/lib/api/errors"
import { useRead } from "@/src/lib/api/use-read"
import { formatDate } from "@/src/lib/format"
import { notify } from "@/src/lib/notify"
import { useActionForm } from "@/src/lib/use-action-form"

import { Panel } from "./Panel"

const DASH = "-"

const STATUS_BADGE: Readonly<Record<ChangeRequest["status"], string>> = {
  Menunggu: "badge-berjalan",
  Disetujui: "badge-beres",
  Ditolak: "badge-tindakan",
}

export function ChangeRequestsPanel({ nis, canEdit }: { nis: string; canEdit: boolean }) {
  const requests = useRead(changeRequestsQuery(nis))
  const queryClient = useQueryClient()
  const [rejecting, setRejecting] = useState<ChangeRequest | null>(null)

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["students", nis] })

  const confirmApprove = (request: ChangeRequest) =>
    modals.openConfirmModal({
      title: `Setujui perubahan ${request.fieldLabel}?`,
      children: (
        <p className="body-sm">
          Nilai baru &quot;{request.proposedValue}&quot; langsung menggantikan data siswa.
        </p>
      ),
      labels: { confirm: "Setujui", cancel: "Batal" },
      onConfirm: async () => {
        const result = await approveChangeRequest(nis, request.id)
        if (!result.ok) return notify.error(result.message)
        notify.success(`Perubahan ${request.fieldLabel} disetujui.`)
        await refresh()
      },
    })

  const downloadEvidence = async (request: ChangeRequest) => {
    try {
      await openPresigned(
        `/students/${encodeURIComponent(nis)}/change-requests/${request.id}/evidence`,
      )
    } catch (error) {
      if (error instanceof ApiError) notify.error(error.message)
      else throw error
    }
  }

  if (requests.isError) {
    return <QueryError message={requests.error.message} onRetry={() => void requests.refetch()} />
  }
  if (!requests.data || requests.data.length === 0) return null

  return (
    <Panel title="Pengajuan Perubahan Data">
      <div className="table-scroll">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Diajukan</th>
              <th scope="col">Kolom</th>
              <th scope="col">Nilai Lama</th>
              <th scope="col">Nilai Baru</th>
              <th scope="col">Alasan</th>
              <th scope="col">Status</th>
              <th scope="col">Diputuskan</th>
              <th scope="col">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {requests.data.map((request) => (
              <tr key={request.id}>
                <td className="tabular">{formatDate(request.createdAt)}</td>
                <td>{request.fieldLabel}</td>
                <td className="wrap">{request.currentValue ?? DASH}</td>
                <td className="wrap text-ink">{request.proposedValue}</td>
                <td className="wrap">
                  <div className="stack" style={{ gap: 2 }}>
                    <span>{request.reason ?? DASH}</span>
                    {request.decisionReason && (
                      <span className="caption text-danger">Ditolak: {request.decisionReason}</span>
                    )}
                  </div>
                </td>
                <td>
                  <span className={`badge ${STATUS_BADGE[request.status]}`}>{request.status}</span>
                </td>
                <td>
                  {request.decidedAt ? (
                    <div className="stack" style={{ gap: 0 }}>
                      <span className="tabular">{formatDate(request.decidedAt)}</span>
                      <span className="caption text-muted">{request.decidedBy ?? DASH}</span>
                    </div>
                  ) : (
                    DASH
                  )}
                </td>
                <td>
                  <div className="row" style={{ gap: 4 }}>
                    {request.hasEvidence && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => void downloadEvidence(request)}
                      >
                        Unduh
                      </button>
                    )}
                    {canEdit && request.status === "Menunggu" && (
                      <>
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => confirmApprove(request)}
                        >
                          Setujui
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setRejecting(request)}
                        >
                          Tolak
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rejecting && (
        <RejectModal nis={nis} request={rejecting} onClose={() => setRejecting(null)} />
      )}
    </Panel>
  )
}

function RejectModal({
  nis,
  request,
  onClose,
}: {
  nis: string
  request: ChangeRequest
  onClose: () => void
}) {
  const form = useForm<RejectForm>({
    initialValues: { reason: "" },
    validate: schemaResolver(rejectFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => rejectChangeRequest(nis, request.id, values.reason),
    successMessage: `Pengajuan ${request.fieldLabel} ditolak.`,
    invalidates: [["students", nis]],
    onSuccess: onClose,
  })

  return (
    <FormModal
      title={`Tolak perubahan ${request.fieldLabel}`}
      submitLabel="Tolak Pengajuan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <Textarea
        label="Alasan"
        description="Alasan ini yang terbaca siswa di portal."
        autosize
        minRows={3}
        withAsterisk
        data-autofocus
        {...form.getInputProps("reason")}
      />
    </FormModal>
  )
}
