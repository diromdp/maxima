"use client"

import { Checkbox, Select, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"
import { useState } from "react"

import { FormModal } from "@/src/components/ui/FormModal"
import { confirmReturn, markReturned, withdrawLeave } from "@/src/entities/leave/actions"
import { returnClassesQuery } from "@/src/entities/leave/queries"
import {
  type LeaveDetail,
  positionLabel,
  RETURN_TONE,
  returnFormSchema,
  withdrawFormSchema,
} from "@/src/entities/leave/schema"
import { useRead } from "@/src/lib/api/use-read"
import { useActionForm } from "@/src/lib/use-action-form"

import { Field, Panel } from "./LeavePanels"

type Dialog = "follow-up" | "confirm" | "return" | "withdraw" | null

type ReturnValues = { classId: string | null; isOverCapacityConfirmed: boolean }

const RETURN_INVALIDATES = [["leaves"], ["students"], ["classes"]]

function ReturnClassModal({
  leave,
  mode,
  onClose,
}: {
  leave: LeaveDetail
  mode: "confirm" | "return"
  onClose: () => void
}) {
  const classes = useRead(returnClassesQuery())
  const form = useForm<ReturnValues>({
    initialValues: { classId: leave.returnClass?.id ?? null, isOverCapacityConfirmed: false },
    validate: schemaResolver(returnFormSchema, { sync: true }),
  })
  const isConfirm = mode === "confirm"
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => {
      const input = returnFormSchema.parse(values)
      return isConfirm ? confirmReturn(leave.id, input.classId) : markReturned(leave.id, input)
    },
    successMessage: isConfirm
      ? `Kelas tujuan ${leave.student.name} dikonfirmasi. Status Kembali jadi Siap kembali.`
      : `${leave.student.name} kembali belajar. Statusnya Aktif dan ia masuk kelas tujuan.`,
    invalidates: isConfirm ? [["leaves"]] : RETURN_INVALIDATES,
    onSuccess: onClose,
  })
  const chosen = classes.data?.data.find((room) => room.id === form.values.classId)
  const isFull = chosen !== undefined && chosen.memberCount >= chosen.capacity

  return (
    <FormModal
      title={isConfirm ? "Konfirmasi Kembali" : "Tandai Kembali"}
      submitLabel={isConfirm ? "Konfirmasi Kelas Tujuan" : "Tandai Kembali"}
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <Field
        label="Posisi saat cuti"
        value={positionLabel(leave.frozenPosition ?? leave.position)}
      />
      <Select
        label="Kelas Tujuan"
        description="Hanya kelas berstatus Aktif. Kelas di bawah level terakhir menandai tagihan selisih untuk Finance."
        placeholder={classes.isPending ? "Memuat kelas..." : "Pilih kelas"}
        searchable
        withAsterisk
        disabled={classes.isPending}
        data={(classes.data?.data ?? []).map((room) => ({
          value: room.id,
          label: `${room.name} · ${room.level.name} · ${room.branch.name} (${room.memberCount}/${room.capacity})`,
        }))}
        {...form.getInputProps("classId")}
        error={form.errors.classId ?? (classes.isError ? classes.error.message : undefined)}
      />
      {!isConfirm && isFull && (
        <Checkbox
          label={`Kelas ${chosen.name} sudah penuh. Saya setuju menambah siswa melebihi kapasitas.`}
          {...form.getInputProps("isOverCapacityConfirmed", { type: "checkbox" })}
        />
      )}
    </FormModal>
  )
}

function WithdrawModal({ leave, onClose }: { leave: LeaveDetail; onClose: () => void }) {
  const form = useForm({
    initialValues: { reason: "" },
    validate: schemaResolver(withdrawFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => withdrawLeave(leave.id, values.reason),
    successMessage: `${leave.student.name} dikeluarkan. Statusnya Mengundurkan Diri.`,
    invalidates: RETURN_INVALIDATES,
    onSuccess: onClose,
  })

  return (
    <FormModal
      title="Keluarkan Siswa"
      submitLabel="Keluarkan"
      formError={formError}
      isPending={isPending}
      onSubmit={submit}
      onClose={onClose}
    >
      <span className="body-sm text-muted">
        Status {leave.student.name} jadi Mengundurkan Diri dan keanggotaan kelas lamanya jadi
        Keluar. Tercatat di Log Aktivitas.
      </span>
      <Textarea
        label="Alasan"
        autosize
        minRows={3}
        withAsterisk
        {...form.getInputProps("reason")}
      />
    </FormModal>
  )
}

function FollowUpModal({
  leave,
  onChoose,
  onClose,
}: {
  leave: LeaveDetail
  onChoose: (dialog: "return" | "withdraw") => void
  onClose: () => void
}) {
  const form = useForm({ initialValues: {} })

  return (
    <FormModal
      title="Putuskan Tindak Lanjut"
      submitLabel="Tandai Kembali"
      formError={null}
      isPending={false}
      onSubmit={form.onSubmit(() => onChoose("return"))}
      onClose={onClose}
    >
      <span className="body-sm text-muted">
        {leave.student.name} melewati tanggal kembali. Pilih satu: siswa kembali ke kelas dengan
        status Aktif, atau dikeluarkan dengan status Mengundurkan Diri beserta alasannya.
      </span>
      <div className="row row-between row-wrap">
        <span className="caption text-muted">Siswa tidak akan kembali?</span>
        <button
          type="button"
          className="btn btn-danger btn-sm"
          onClick={() => onChoose("withdraw")}
        >
          Keluarkan
        </button>
      </div>
    </FormModal>
  )
}

export function ReturnReview({ leave, canDecide }: { leave: LeaveDetail; canDecide: boolean }) {
  const [dialog, setDialog] = useState<Dialog>(null)
  const close = () => setDialog(null)
  const isOverdue = leave.returnStatus === "Lewat Batas"
  const { phone, emergencyContact, emergencyContactPhone } = leave.student

  return (
    <>
      <Panel
        title="Kesiapan Kembali & Kontak"
        aside={
          canDecide && isOverdue ? (
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => setDialog("follow-up")}
            >
              Putuskan Tindak Lanjut
            </button>
          ) : undefined
        }
      >
        <div className="grid-2">
          <Field
            label="Status Kembali"
            value={
              leave.returnStatus ? (
                <span className={`badge badge-${RETURN_TONE[leave.returnStatus]}`}>
                  {leave.returnStatus}
                </span>
              ) : (
                "-"
              )
            }
          />
          <Field label="Kelas Tujuan" value={leave.returnClass?.name ?? "Belum dipilih"} />
          <Field label="Kontak Siswa" value={phone ?? "-"} />
          <Field
            label="Kontak Darurat"
            value={
              emergencyContactPhone
                ? `${emergencyContactPhone}${emergencyContact ? ` (${emergencyContact})` : ""}`
                : (emergencyContact ?? "-")
            }
          />
        </div>
        {canDecide ? (
          <div className="row row-wrap" style={{ gap: 8 }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setDialog("confirm")}
            >
              Konfirmasi Kembali
            </button>
            <button type="button" className="btn btn-primary" onClick={() => setDialog("return")}>
              Tandai Kembali
            </button>
          </div>
        ) : (
          <span className="caption text-muted">Keputusan tahap ini dikerjakan Admission.</span>
        )}
      </Panel>

      {dialog === "follow-up" && (
        <FollowUpModal leave={leave} onChoose={setDialog} onClose={close} />
      )}
      {(dialog === "confirm" || dialog === "return") && (
        <ReturnClassModal leave={leave} mode={dialog} onClose={close} />
      )}
      {dialog === "withdraw" && <WithdrawModal leave={leave} onClose={close} />}
    </>
  )
}
