"use client"

import { Group, Modal, Textarea } from "@mantine/core"
import { schemaResolver, useForm } from "@mantine/form"

import { Notice } from "@/src/components/ui/Notice"
import { removeClassMember } from "@/src/entities/class/actions"
import {
  reasonFormSchema,
  type ClassRow,
  type MemberRow,
  type ReasonForm,
} from "@/src/entities/class/schema"
import { useActionForm } from "@/src/lib/use-action-form"

import { MEMBER_INVALIDATIONS, TITLE_STYLE } from "./DialogParts"

export function RemoveMemberModal({
  room,
  student,
  onClose,
}: {
  room: ClassRow
  student: MemberRow
  onClose: () => void
}) {
  const form = useForm<ReasonForm>({
    initialValues: { reason: "" },
    validate: schemaResolver(reasonFormSchema, { sync: true }),
  })
  const { submit, isPending, formError } = useActionForm({
    form,
    action: (values) => removeClassMember(room.id, student.studentId, values.reason),
    successMessage: `${student.fullName} dikeluarkan dari ${room.name}.`,
    invalidates: MEMBER_INVALIDATIONS,
    onSuccess: onClose,
  })

  return (
    <Modal opened onClose={onClose} title={`Keluarkan ${student.fullName}?`} styles={TITLE_STYLE}>
      <form className="stack stack-lg" onSubmit={submit} noValidate>
        {formError && <Notice tone="danger">{formError}</Notice>}

        <p className="body-sm">
          {student.fullName} keluar dari {room.name} dan kursinya kembali kosong. Riwayat absensi
          dan nilainya tetap tersimpan.
        </p>

        <Textarea
          label="Alasan"
          description="Tercatat di log aktivitas kelas."
          autosize
          minRows={2}
          withAsterisk
          data-autofocus
          {...form.getInputProps("reason")}
        />

        <Group justify="flex-end">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Batal
          </button>
          <button type="submit" className="btn btn-danger" disabled={isPending}>
            {isPending ? "Menyimpan..." : "Keluarkan"}
          </button>
        </Group>
      </form>
    </Modal>
  )
}
